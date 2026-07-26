/**
 * Asset pipeline, stage 2: raw renders -> optimized webp and mp4.
 *
 * Two sources feed this, and both still work:
 *   1. `../images/` — the original Midjourney exports, matched by filename
 *      fragment through MANIFEST below.
 *   2. `./.generated/` — output of `generate-media.mjs`, already named
 *      semantically, so it skips the fragment matching entirely.
 *
 * Source PNGs are ~1.3-1.5MB each at full resolution. These are used as
 * full-bleed parallax layers, so 2560w is the practical ceiling; next/image
 * handles per-request resizing from there.
 *
 * Run: node scripts/optimize-assets.mjs   (or: npm run assets)
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join, resolve } from "node:path";
import sharp from "sharp";

const run = promisify(execFile);

const SRC = resolve(process.cwd(), "..", "images");
const OUT = resolve(process.cwd(), "src", "assets");
const GENERATED = resolve(import.meta.dirname, ".generated");
const MEDIA = resolve(process.cwd(), "public", "media");

/** The single compression chain every still goes through, whatever its source. */
const toWebp = (src, dest) =>
  sharp(src)
    .resize({ width: 2560, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(dest);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/** Maps a distinctive fragment of each Midjourney filename to a semantic name. */
const MANIFEST = [
  ["A_hand_changes_one_record", "_1.png", "record-refresh-a"],
  ["A_hand_changes_one_record", "_2.png", "record-refresh-b"],
  ["A_quiet_operations_room_before_dawn", "_0.png", "ops-room-a"],
  ["A_quiet_operations_room_before_dawn", "_2.png", "ops-room-b"],
  ["A_quiet_operations_room_before_dawn", "_3.png", "ops-room-c"],
  ["A_small_group_of_experienced_operators", "_3.png", "operators-group"],
  ["A_sophisticated_circular_workflow", "_0.png", "workflow-loop"],
  ["An_autonomous_software_agent", "_1.png", "agent-a"],
  ["An_autonomous_software_agent", "_3.png", "agent-b"],
  ["An_experienced_operator_standing_at_a_threshold", "_3.png", "threshold"],
  ["An_operator_deliberately_triggering_a_controlled_failur", "_0.png", "failure-a"],
  ["An_operator_deliberately_triggering_a_controlled_failur", "_2.png", "failure-b"],
];

const files = await readdir(SRC);
await mkdir(OUT, { recursive: true });

let total = 0;
for (const [fragment, suffix, name] of MANIFEST) {
  const match = files.find((f) => f.includes(fragment) && f.endsWith(suffix));
  if (!match) {
    console.warn(`  !! no source for ${name} (${fragment}${suffix})`);
    continue;
  }
  const info = await toWebp(join(SRC, match), join(OUT, `${name}.webp`));
  const kb = Math.round(info.size / 1024);
  total += info.size;
  console.log(`  ${name}.webp  ${info.width}x${info.height}  ${kb}KB`);
}
console.log(`\ntotal ${Math.round(total / 1024 / 1024 * 10) / 10}MB across ${MANIFEST.length} images`);

/*
 * Generated assets. Everything below is a no-op on a machine that has never run
 * generate-media.mjs, so the Midjourney path above stays self-sufficient.
 */
if (!(await exists(GENERATED))) {
  console.log("\nno scripts/.generated/ — skipping generated assets");
  process.exit(0);
}

const generated = await readdir(GENERATED);
// Extension follows whatever the model returned — flux hands back JPEG even
// when asked otherwise — so match on type rather than assuming .png.
const stills = generated.filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
const clips = generated.filter((f) => /\.mp4$/i.test(f));

if (stills.length) {
  console.log("\ngenerated stills");
  for (const file of stills) {
    const name = file.replace(/\.[^.]+$/, "");
    const info = await toWebp(join(GENERATED, file), join(OUT, `${name}.webp`));
    console.log(`  ${name}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB`);
  }
}

if (clips.length) {
  await mkdir(MEDIA, { recursive: true });
  console.log("\ngenerated video");
  for (const file of clips) {
    const name = file.replace(/\.[^.]+$/, "");
    const src = join(GENERATED, file);
    const dest = join(MEDIA, `${name}.mp4`);
    const poster = join(MEDIA, `${name}-poster.jpg`);

    // Settings match the deck's existing clips, measured with ffprobe:
    // h264 / 1600w / 24fps / yuv420p / no audio track. crf 28 was derived by
    // re-encoding an original source and comparing — it reproduces the
    // existing 1453 kbps exactly, so new clips sit alongside the old ones at
    // the same weight and quality. They play muted behind text, so -an drops
    // the stream rather than encoding silence. +faststart puts the moov atom
    // first so playback can begin before the file finishes downloading.
    await run("ffmpeg", [
      "-y", "-i", src,
      "-vf", "scale=1600:-2",
      "-r", "24",
      "-c:v", "libx264",
      "-crf", "28",
      "-preset", "slow",
      "-pix_fmt", "yuv420p",
      "-an",
      "-movflags", "+faststart",
      dest,
    ]);
    await run("ffmpeg", [
      "-y", "-i", src,
      "-frames:v", "1",
      "-vf", "scale=1600:-2",
      "-q:v", "4",
      poster,
    ]);

    const [clip, still] = await Promise.all([stat(dest), stat(poster)]);
    console.log(
      `  ${name}.mp4  ${Math.round(clip.size / 1024)}KB` +
        `  (+ poster ${Math.round(still.size / 1024)}KB)`,
    );
  }
}
