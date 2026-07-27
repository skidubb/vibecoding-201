/**
 * Model bake-off — round 2: ADHERENCE, not just aesthetics.
 *
 * Round 1 compared photographic quality using a prompt with no constraints in
 * it, so it never tested whether a model does as it is told. Flux 1.1 Ultra won
 * on looks and then ignored the brand colour bindings, ignored the gender mix,
 * and wrote text into a frame that explicitly excluded text.
 *
 * This round runs the real brand-bound prompt and scores each model on whether
 * the instructions actually landed. Judged by eye against a fixed checklist:
 *
 *   1. pink appears ONCE, on the object it was assigned
 *   2. mixed gender group (spec says ~62/38, not a room of men)
 *   3. no text or lettering anywhere
 *   4. room reads compressed, not open-plan
 *   5. white dominant, warm-neutral, not cinematic
 *
 * Scratch tool. Writes nothing into the deck's assets.
 * Run: op run --env-file=.env.op -- node scripts/bakeoff.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { generateImage, generateText } from "ai";
import sharp from "sharp";
import { buildPrompt, COLOR, COUNCIL_CIRCLE } from "./brand-prompt.mjs";

const OUT = resolve(import.meta.dirname, "..", "IMAGES-REVIEW", "1-model-comparison");

/** `text` models return images in result.files via generateText. */
const TEXT_SURFACE = new Set(["google/gemini-3-pro-image"]);

const MODELS = [
  "bfl/flux-pro-1.1-ultra",
  "google/imagen-4.0-ultra-generate-001",
  "openai/gpt-image-2",
  "bytedance/seedream-5.0-pro",
  "google/gemini-3-pro-image",
];

/** The signature motif, fully brand-bound — the hardest thing to get right. */
const SCENE = {
  people: true,
  intent: "Editorial backdrop for a slide about peers giving candid judgement on a hard decision.",
  subject: `${COUNCIL_CIRCLE} — four operators mid-discussion, one speaking with an open hand, two listening hard, one writing.`,
  environment:
    "A small, plain working meeting room, walls close on either side, a glass partition behind showing an ordinary office.",
  composition:
    "Eye-level, taken from just outside the circle so the viewer feels adjacent to it. Group occupies the lower two thirds; the pale wall above them is left empty.",
  surfaces: [
    `${COLOR.white} dominant in the walls, table and shirts`,
    `${COLOR.blush} on the near wall plane`,
    `${COLOR.midnight} in one person's jacket and the dark screen behind`,
    `${COLOR.pink} once only, as a sharp angular wedge — the edge of a folder lying on the table, catching warm light`,
  ],
};

const PROMPT = buildPrompt(SCENE);
await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, "prompt.txt"), PROMPT);

console.log(`\nadherence test · ${MODELS.length} models · ${PROMPT.split(" ").length} word prompt\n`);

for (const model of MODELS) {
  const slug = model.replace(/[/.]/g, "_");
  const started = Date.now();
  try {
    let bytes, mediaType;
    if (TEXT_SURFACE.has(model)) {
      const { files } = await generateText({
        model,
        prompt: `${PROMPT} Aspect ratio 16:9, widescreen.`,
      });
      const f = (files ?? []).find((x) => x.mediaType?.startsWith("image/"));
      if (!f) throw new Error("no image file returned");
      ({ mediaType } = f);
      bytes = Buffer.from(f.uint8Array);
    } else {
      const { images } = await generateImage({ model, prompt: PROMPT, aspectRatio: "16:9" });
      if (!images?.length) throw new Error("no image returned");
      bytes = Buffer.from(images[0].base64, "base64");
      mediaType = images[0].mediaType;
    }
    const { width, height } = await sharp(bytes).metadata();
    await writeFile(join(OUT, `${slug}.${mediaType?.split("/")[1] ?? "png"}`), bytes);
    console.log(
      `  + ${model.padEnd(38)} ${`${width}x${height}`.padEnd(11)} ${Math.round((Date.now() - started) / 1000)}s`,
    );
  } catch (err) {
    const msg = (err.data?.error?.message ?? err.message ?? "").split("\n")[0];
    console.warn(`  !! ${model.padEnd(38)} ${msg.slice(0, 80)}`);
  }
}
console.log(`\n-> ${OUT}`);
