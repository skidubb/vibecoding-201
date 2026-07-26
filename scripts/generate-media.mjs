/**
 * Media pipeline, stage 1: prompts -> raw renders, via Vercel AI Gateway.
 *
 * One API key reaches both modalities. Stills go through `generateImage`
 * (Flux 2 Pro), clips through `experimental_generateVideo` (Veo 3.1) — same
 * gateway, same credential, one command. Prompts live in ./media.manifest.mjs.
 *
 * Output lands in ./.generated/ (gitignored) with semantic names. Stage 2,
 * `optimize-assets.mjs`, compresses from there into src/assets/ and
 * public/media/.
 *
 * Run:  npm run gen:media                    # everything not already present
 *       npm run gen:media -- --only agent-a  # one asset
 *       npm run gen:media -- --images        # stills only
 *       npm run gen:media -- --force         # regenerate over existing files
 *
 * COST: video is the expensive half. A full --videos run is three Veo
 * generations and takes minutes, not seconds. Existing files are skipped by
 * default precisely so a stray re-run doesn't silently spend money.
 */
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createGateway, generateImage, experimental_generateVideo as generateVideo } from "ai";
// `fetch` must come from undici too, not Node's global. The global fetch is
// backed by Node's own bundled copy of undici, and handing it a dispatcher
// built by the installed undici package crosses two incompatible instances —
// which fails at request time with "invalid onRequestStart method".
import { fetch as undiciFetch, Agent } from "undici";
import sharp from "sharp";
import { IMAGES, VIDEOS } from "./media.manifest.mjs";

const OUT = resolve(import.meta.dirname, ".generated");

/**
 * Imagen, not Flux, because Imagen actually honours `aspectRatio` through the
 * gateway. `bfl/flux-2-pro` accepts the parameter, emits no warning, and
 * returns 1024x1024 regardless — and its `width`/`height` provider options are
 * ignored too. A square backdrop behind a 16:9 hero is exactly the kind of
 * silent failure the check in `emit` exists to catch; the model choice is how
 * we avoid it in the first place.
 *
 * Imagen's 16:9 bucket is 1408x768, close to the 1456x816 of the deck's
 * original renders. These are full-bleed backdrops that CSS crops anyway.
 */
const IMAGE_MODEL = "google/imagen-4.0-generate-001";
const VIDEO_MODEL = "google/veo-3.1-generate-001";

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

/**
 * Writes one asset, reporting size. Failures are collected, never fatal — one
 * rate-limited model shouldn't discard the assets that already succeeded.
 *
 * `produce` returns `{ bytes, ext, note }`; the extension comes from the
 * response's media type rather than being assumed, because these models return
 * JPEG even when you ask for something else.
 */
async function emit(name, produce) {
  const existing = [...present].find((f) => f.replace(/\.[^.]+$/, "") === name);
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
    await emit(entry.name, async () => {
      const { images } = await generateImage({
        model: entry.model ?? IMAGE_MODEL,
        prompt: entry.prompt,
        aspectRatio: entry.aspectRatio,
      });
      if (!images?.length) throw new Error("no image returned");

      const bytes = Buffer.from(images[0].base64, "base64");
      const { width, height } = await sharp(bytes).metadata();

      // Verify rather than trust — models silently ignore aspectRatio. The
      // 10% tolerance accepts provider-native buckets (Imagen's "16:9" is
      // 1408x768, 3% wide) while still catching a square masquerading as
      // widescreen, which is 44% off and the failure that actually happens.
      const want = ratioOf(entry.aspectRatio);
      let note = `${width}x${height}`;
      if (want && Math.abs(width / height - want) / want > 0.1) {
        note += `  !! expected ${entry.aspectRatio}, got ${(width / height).toFixed(2)}:1`;
      }
      return { bytes, ext: images[0].mediaType?.split("/")[1] ?? "png", note };
    });
  }
}

if (wantVideos) {
  const batch = VIDEOS.filter(selected);
  if (batch.length) console.log(`\nvideos · ${VIDEO_MODEL}  (minutes per clip)`);
  for (const entry of batch) {
    await emit(entry.name, async () => {
      const { videos } = await generateVideo({
        model: gateway.video(entry.model ?? VIDEO_MODEL),
        prompt: entry.prompt,
        duration: entry.duration,
        aspectRatio: entry.aspectRatio,
        // The deck's existing clips carry no audio track and play muted behind
        // text. Generating audio would add weight nothing ever hears.
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
