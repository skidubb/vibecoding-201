/**
 * Prompt registry for every generated asset in the deck.
 *
 * This file is the reproducibility record. Before it existed, each still and
 * clip was a one-off Midjourney render whose prompt lived nowhere — revising
 * `agent-a` meant remembering what had been typed into a chat box months ago.
 *
 * CAVEAT ON THE SEED PROMPTS: these were reconstructed from the Midjourney
 * source filenames in `../images/`, which truncate the original prompt at ~60
 * characters (`An_operator_deliberately_triggering_a_controlled_failur...`).
 * They are a faithful reading of intent, not the verbatim originals. Refine
 * them as you regenerate — the point is that from here on the prompt and the
 * asset stay together.
 *
 * `name` must match the semantic filename the rest of the pipeline expects, so
 * `src/content/sections.ts` never has to change:
 *   images -> src/assets/<name>.webp
 *   videos -> public/media/<name>.mp4 + <name>-poster.jpg
 */

/**
 * Shared look. The deck's existing renders are desaturated cinematic
 * photography — cool blues and near-blacks under the dark theme, wide and
 * unpeopled enough to sit behind text at low opacity.
 */
const STYLE =
  "Cinematic editorial photography, desaturated cool palette of deep navy, " +
  "slate and near-black with a single warm accent light. Wide establishing " +
  "composition, shallow depth of field, soft volumetric haze, generous negative " +
  "space in the upper third for overlaid text. Faces indistinct or turned away. " +
  "No text, no logos, no watermarks, no user interface chrome.";

/** @type {{name: string, prompt: string, aspectRatio?: string, model?: string}[]} */
export const IMAGES = [
  {
    name: "threshold",
    prompt:
      "An experienced operator standing at a threshold between two rooms — a " +
      "dim workshop behind, a vast lit operations floor ahead — caught mid-step, " +
      "deciding whether to cross.",
  },
  {
    name: "record-refresh-a",
    prompt:
      "A hand changing a single record on a screen in a dim room, the change " +
      "sitting there unsaved and weightless. A demo: convincing to look at, " +
      "holding nothing.",
  },
  {
    name: "record-refresh-b",
    prompt:
      "The same hand changing a single record, but the room behind it is a real " +
      "operations floor — the edit landing in something durable that other people " +
      "depend on.",
  },
  {
    name: "ops-room-a",
    prompt:
      "A quiet operations room before dawn where a scheduled process is running " +
      "unattended. Empty chairs, cool monitor glow, the work happening without " +
      "anyone present. Sunday night: the build.",
  },
  {
    name: "ops-room-b",
    prompt:
      "The same operations room at mid-morning, occupied and energized — a group " +
      "gathered loosely around a large display, the moment a demo lands well. " +
      "Monday: the applause.",
  },
  {
    name: "ops-room-c",
    prompt:
      "The same operations room, later and colder. Screens blank or reset, one " +
      "figure alone looking at a display that has lost its data. Wednesday: the " +
      "reset.",
  },
  {
    name: "operators-group",
    prompt:
      "A small group of experienced operators gathered around a shared table, " +
      "each clearly working in a different mode — one sketching, one building, " +
      "one auditing. Distinct mindsets in one room.",
  },
  {
    name: "workflow-loop",
    prompt:
      "A sophisticated circular workflow rendered as physical architecture — a " +
      "continuous elevated ring walkway with six lit stations along it, seen from " +
      "above at an angle. The loop closes on itself.",
  },
  {
    name: "agent-a",
    prompt:
      "An autonomous software agent represented indirectly: an unattended " +
      "workstation at night, work visibly progressing on its own, a single desk " +
      "lamp lit, no operator in the chair.",
  },
  {
    name: "agent-b",
    prompt:
      "An autonomous software agent represented indirectly: a long dark corridor " +
      "of server racks with one aisle illuminated, activity moving down it " +
      "without a human anywhere in frame.",
  },
  {
    name: "failure-a",
    prompt:
      "An operator deliberately triggering a controlled failure — a hand on a " +
      "switch, one section of an otherwise steady system going dark on purpose. " +
      "Calm, intentional, rehearsed.",
  },
  {
    name: "failure-b",
    prompt:
      "The aftermath of a controlled failure: an operator reading a log wall " +
      "where one thread has gone red, unhurried, the system still standing around " +
      "the break.",
  },
].map((entry) => ({ aspectRatio: "16:9", ...entry, prompt: `${entry.prompt} ${STYLE}` }));

/** @type {{name: string, prompt: string, duration?: number, aspectRatio?: string, model?: string}[]} */
export const VIDEOS = [
  {
    name: "three-environments",
    // Backs the "ladder" section: belief, then work, then the business.
    prompt:
      "Three adjacent work environments showing increasing operational maturity, " +
      "revealed by a slow lateral camera drift: a single cluttered desk, then a " +
      "small working team, then a full operations floor. Continuous move, no cuts.",
    duration: 6,
  },
  {
    name: "gap-platforms",
    // Backs "the-gap": the builder's chasm.
    prompt:
      "Two elevated architectural platforms separated by a dark chasm, the near " +
      "one bright and finished, the far one larger and dimly lit. Slow push " +
      "forward toward the edge, haze drifting up out of the gap. No cuts.",
    duration: 8,
  },
  {
    name: "workflow-loop",
    // Backs "the-loop": spec, plan, build, test, ship, run.
    prompt:
      "A sophisticated circular workflow as physical architecture — a continuous " +
      "elevated ring walkway with six lit stations — with a slow orbiting camera " +
      "and a pulse of light travelling all the way around the ring. Seamless loop.",
    duration: 6,
  },
].map((entry) => ({
  aspectRatio: "16:9",
  ...entry,
  prompt: `${entry.prompt} ${STYLE}`,
}));
