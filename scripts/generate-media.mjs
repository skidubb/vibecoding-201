/**
 * Media pipeline, stage 1: prompts -> raw renders, via Vercel AI Gateway.
 *
 * One API key reaches both modalities. Stills go through `generateImage`
 * (Nano Banana Pro), clips through Gemini Omni Flash — same
 * gateway, same credential, one command. Prompts live in ./media.manifest.mjs.
 *
 * Output lands in ../IMAGES-REVIEW/0-raw-renders/ — a plain visible folder you
 * can open in Finder, deliberately NOT a dotfolder. Stage 2,
 * `optimize-assets.mjs`, compresses from there into src/assets/generated/ and
 * public/media/generated/.
 *
 * Run:  npm run gen:media                    # everything not already present
 *       npm run gen:media -- --only agent-a  # one asset
 *       npm run gen:media -- --images        # stills only
 *       npm run gen:media -- --force         # regenerate over existing files
 *
 * COST: video is the expensive half. A full --videos run is three Veo
 * generations and takes minutes, not seconds. Existing files are skipped by
 * default precisely so a stray re-run doesn't silently spend money. The gateway
 * also refuses video outright below a $10 account balance (402).
 */
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  createGateway,
  generateText,
  generateImage,
  experimental_generateVideo as generateVideo,
} from "ai";
// `fetch` must come from undici too, not Node's global. The global fetch is
// backed by Node's own bundled copy of undici, and handing it a dispatcher
// built by the installed undici package crosses two incompatible instances —
// which fails at request time with "invalid onRequestStart method".
import { fetch as undiciFetch, Agent } from "undici";
import sharp from "sharp";

/**
 * Which scene registry to run, and where its renders go.
 *
 *   (default)                      site assets   -> IMAGES-REVIEW/0-raw-renders/
 *   --manifest deck-v6             the v6 deck   -> IMAGES-REVIEW/deck-v6/
 *
 * Kept as an explicit map rather than an arbitrary path so a typo fails loudly
 * here instead of silently generating into a new empty directory.
 */
const MANIFESTS = {
  site: { file: "./media.manifest.mjs", out: "0-raw-renders" },
  "deck-v6": { file: "./deck-v6.manifest.mjs", out: "deck-v6" },
};

const manifestArg = (() => {
  const i = process.argv.indexOf("--manifest");
  return i === -1 ? "site" : process.argv[i + 1];
})();

const chosen = MANIFESTS[manifestArg];
if (!chosen) {
  console.error(
    `unknown manifest ${JSON.stringify(manifestArg)}\n` +
      `known: ${Object.keys(MANIFESTS).join(", ")}`,
  );
  process.exit(1);
}

const { IMAGES, VIDEOS } = await import(chosen.file);
const OUT = resolve(import.meta.dirname, "..", "IMAGES-REVIEW", chosen.out);

/**
 * Chosen by running the same brand-bound prompt through five models and
 * scoring adherence, not just looks — see `bakeoff.mjs`.
 *
 * - Seedream 5.0 Pro for stills. Only model that landed every binding: blush
 *   on the wall plane, midnight in both the jacket and the screen, the pink
 *   folder as a single angular wedge, a genuinely mixed group, a compressed
 *   room. Highest native resolution too. Costs ~200s per image and stamps an
 *   "AI generated" watermark bottom-right, which `cropWatermark` removes.
 * - Gemini Omni Flash for video. Clean full 1280x720 where Veo bakes in a
 *   2.34:1 letterbox, and it honours the duration asked for in the prompt.
 *
 * Rejected: Flux 1.1 Ultra photographs beautifully and ignores instructions —
 * it returned five men, no pink, and wrote text into a frame that excluded
 * text. Imagen 4 Ultra and Nano Banana Pro both follow direction but come out
 * lower-resolution and flatter.
 */
const IMAGE_MODEL = "bytedance/seedream-5.0-pro";
const VIDEO_MODEL = "google/gemini-omni-flash-preview";

/**
 * Models that stamp a visible watermark, and how much to trim.
 *
 * Seedream burns "AI generated" into the bottom-right corner. It sits over
 * empty floor, so dropping a bottom strip and re-cropping to the target ratio
 * removes it without touching the composition — 2816x1584 becomes 2567x1444,
 * still above the 2560px cap the optimize step applies.
 */
/*
 * 220, not 140. The badge occupies roughly the bottom 110px, so 140 looks
 * sufficient — and is, whenever the source arrives at 3:2 and re-fitting to
 * 16:9 removes 260px anyway. But when Seedream returns 2816x1584, already
 * 16:9, the ratio correction removes nothing and only the trim applies, so the
 * badge outline survived at the very bottom edge. The trim has to clear it
 * unaided.
 */
const WATERMARK_TRIM = { "bytedance/seedream-5.0-pro": 220 };

/**
 * Trim a watermark strip and restore the requested aspect ratio.
 *
 * Take the largest correctly-proportioned rectangle that fits inside the
 * trimmed frame — width first, then height derived from it. Deriving only the
 * width leaves the result too tall whenever the source is narrower than the
 * trimmed height implies, which silently produced 1.64:1 instead of 16:9.
 * Anchored to the top, since the watermark is always at the bottom.
 */
async function cropWatermark(bytes, trimPx, aspect) {
  const { width, height } = await sharp(bytes).metadata();
  const ratio = ratioOf(aspect) ?? width / height;
  const avail = height - trimPx;
  const w = Math.min(width, Math.round(avail * ratio));
  const h = Math.min(avail, Math.round(w / ratio));
  return sharp(bytes)
    .extract({ left: Math.round((width - w) / 2), top: 0, width: w, height: h })
    .toBuffer();
}

/**
 * Models invoked through `generateText`, returning media in `result.files`.
 * Anything not listed here uses the dedicated `generateImage` /
 * `experimental_generateVideo` call, so `model:` overrides in the manifest
 * keep working for Imagen, Veo, Flux and friends.
 */
const TEXT_SURFACE = new Set([
  "google/gemini-3-pro-image",
  "google/gemini-3.1-flash-image",
  "google/gemini-3.1-flash-image-preview",
  "google/gemini-3.1-flash-lite-image",
  "google/gemini-2.5-flash-image",
  "google/gemini-omni-flash-preview",
]);

/** Pull the first file of a given media type out of a generateText result. */
function fileOfType(files, prefix) {
  const f = (files ?? []).find((x) => x.mediaType?.startsWith(prefix));
  if (!f) throw new Error(`model returned no ${prefix}* file`);
  return { bytes: Buffer.from(f.uint8Array), mediaType: f.mediaType };
}

/** "16:9" -> 1.778, for verifying what a model actually returned. */
const ratioOf = (aspect) => {
  const [w, h] = String(aspect).split(":").map(Number);
  return w && h ? w / h : null;
};

/**
 * Pull the useful message out of an AI SDK failure.
 *
 * The retry wrapper reports "Failed after 3 attempts / Invalid error response
 * format", which hides the actual cause — the gateway answering 402 "video
 * generation requires a minimum balance of $10", say. Walk the cause chain and
 * return the most specific real message.
 */
function describe(err) {
  let best = err?.message ?? String(err);
  const seen = new Set();
  let node = err;
  while (node && !seen.has(node)) {
    seen.add(node);
    const msg = node.data?.error?.message ?? node.message;
    if (msg && !/^\[object|^Failed after|^Invalid error response/.test(msg)) best = msg;
    node = node.cause ?? node.lastError ?? node.errors?.[0];
  }
  return best.split("\n")[0];
}

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const force = has("--force");
const only = (() => {
  const i = args.indexOf("--only");
  return i === -1 ? null : new Set((args[i + 1] ?? "").split(",").filter(Boolean));
})();
// Neither --images nor --videos means both.
const wantImages = has("--images") || !has("--videos");
const wantVideos = has("--videos") || !has("--images");

if (!process.env.AI_GATEWAY_API_KEY) {
  console.error(
    "AI_GATEWAY_API_KEY is not set.\n" +
      "This script reads it from 1Password. Run it through the wrapper:\n\n" +
      "  npm run gen:media\n\n" +
      "If that fails, sign in first with `op signin`.",
  );
  process.exit(1);
}

/**
 * Video generation regularly runs past Undici's 5-minute default timeout, which
 * would kill the request while Veo is still working. A custom gateway with a
 * longer-lived dispatcher is the documented fix.
 */
const videoAgent = new Agent({
  headersTimeout: 15 * 60 * 1000,
  bodyTimeout: 15 * 60 * 1000,
});

const gateway = createGateway({
  fetch: (url, init) => undiciFetch(url, { ...init, dispatcher: videoAgent }),
});

const selected = (entry) => !only || only.has(entry.name);

await mkdir(OUT, { recursive: true });
const present = new Set(await readdir(OUT));

const failures = [];
let written = 0;
let skipped = 0;

/** Which extensions count as an already-generated file, per modality. */
const KIND_EXT = { image: /\.(png|jpe?g|webp)$/i, video: /\.mp4$/i };

/**
 * Writes one asset, reporting size. Failures are collected, never fatal — one
 * rate-limited model shouldn't discard the assets that already succeeded.
 *
 * `produce` returns `{ bytes, ext, note }`; the extension comes from the
 * response's media type rather than being assumed, because these models return
 * JPEG even when you ask for something else.
 *
 * The skip check is scoped by `kind`, not just by name: `workflow-loop` is both
 * a still and a clip, so an existing `workflow-loop.png` must not convince the
 * video stage that its work is already done.
 */
async function emit(name, kind, produce) {
  const existing = [...present].find(
    (f) => f.replace(/\.[^.]+$/, "") === name && KIND_EXT[kind].test(f),
  );
  if (!force && existing) {
    console.log(`  = ${name}  (${existing} exists, --force to replace)`);
    skipped += 1;
    return;
  }
  const started = Date.now();
  try {
    const { bytes, ext, note } = await produce();
    await writeFile(join(OUT, `${name}.${ext}`), bytes);
    const kb = Math.round(bytes.byteLength / 1024);
    const secs = Math.round((Date.now() - started) / 1000);
    console.log(`  + ${name}.${ext}  ${kb}KB  ${secs}s${note ? `  ${note}` : ""}`);
    written += 1;
  } catch (err) {
    console.warn(`  !! ${name} failed: ${describe(err)}`);
    failures.push(name);
  }
}

if (wantImages) {
  const batch = IMAGES.filter(selected);
  if (batch.length) console.log(`\nimages · ${IMAGE_MODEL}`);
  for (const entry of batch) {
    await emit(entry.name, "image", async () => {
      const model = entry.model ?? IMAGE_MODEL;
      let bytes, mediaType;

      if (TEXT_SURFACE.has(model)) {
        // Multimodal models take the aspect ratio as words, not a parameter.
        const { files } = await generateText({
          model,
          prompt: `${entry.prompt} Aspect ratio ${entry.aspectRatio}, widescreen.`,
        });
        ({ bytes, mediaType } = fileOfType(files, "image/"));
      } else {
        const { images } = await generateImage({
          model,
          prompt: entry.prompt,
          aspectRatio: entry.aspectRatio,
        });
        if (!images?.length) throw new Error("no image returned");
        bytes = Buffer.from(images[0].base64, "base64");
        mediaType = images[0].mediaType;
      }

      // Strip the provider watermark before anything else sees the file, so
      // what lands on disk is already usable.
      let note = "";
      const trim = WATERMARK_TRIM[model];
      if (trim) {
        bytes = await cropWatermark(bytes, trim, entry.aspectRatio);
        note = "watermark trimmed · ";
      }

      const { width, height } = await sharp(bytes).metadata();

      // Verify rather than trust — models silently ignore aspectRatio. The
      // 10% tolerance accepts provider-native buckets (Imagen's "16:9" is
      // 1408x768, 3% wide) while still catching a square masquerading as
      // widescreen, which is 44% off and the failure that actually happens.
      const want = ratioOf(entry.aspectRatio);
      note += `${width}x${height}`;
      if (want && Math.abs(width / height - want) / want > 0.1) {
        note += `  !! expected ${entry.aspectRatio}, got ${(width / height).toFixed(2)}:1`;
      }
      return { bytes, ext: mediaType?.split("/")[1] ?? "png", note };
    });
  }
}

if (wantVideos) {
  const batch = VIDEOS.filter(selected);
  if (batch.length) console.log(`\nvideos · ${VIDEO_MODEL}  (minutes per clip)`);
  for (const entry of batch) {
    await emit(entry.name, "video", async () => {
      const model = entry.model ?? VIDEO_MODEL;

      if (TEXT_SURFACE.has(model)) {
        // Duration and framing are expressed in words for these models. Any
        // audio track it returns is stripped by ffmpeg in stage 2 — the deck's
        // clips play muted behind text.
        const { files } = await generateText({
          model,
          prompt:
            `Generate a ${entry.duration} second video, ${entry.aspectRatio} widescreen. ` +
            entry.prompt,
        });
        return { bytes: fileOfType(files, "video/").bytes, ext: "mp4" };
      }

      const { videos } = await generateVideo({
        model: gateway.video(model),
        prompt: entry.prompt,
        duration: entry.duration,
        aspectRatio: entry.aspectRatio,
        generateAudio: false,
      });
      if (!videos?.length) throw new Error("no video returned");
      return { bytes: Buffer.from(videos[0].uint8Array), ext: "mp4" };
    });
  }
}

console.log(`\n${written} written, ${skipped} skipped -> ${OUT}`);
if (failures.length) {
  console.error(`${failures.length} failed: ${failures.join(", ")}`);
  process.exit(1);
}
if (written) console.log("next: npm run assets");
