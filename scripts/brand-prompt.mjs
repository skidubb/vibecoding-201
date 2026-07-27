/**
 * Brand → image prompt translation.
 *
 * Reads three spec files as the single source of truth. Nothing about the
 * Pavilion look is retyped here; this module only translates.
 *
 *   ../../pavilion-brand.json              essence — mood, purpose, palette, gender mix
 *   ../../pavilion-design-syntax.json      design system — colour roles, materiality, light
 *   ../../pavilion-photographic-style.json photography — the direction that governs images
 *
 * Structure is the 11-block framework from the `image-prompt` skill, with the
 * colour-binding rule from Stage 3 of `brand_embodiment_to_image_prompts`:
 *
 *   "Integrate each HEX into a tangible surface ... Do not list HEX codes at
 *    the end unattached to surfaces."
 *
 * Subject-agnostic. A chart, a car, a cartoon and a person share blocks 5–11;
 * only 1–4 change. That is what keeps unlike assets recognisably one family.
 *
 * ---------------------------------------------------------------------------
 * Corrections encoded here, each traceable to a line in the specs. Two earlier
 * attempts failed by violating these, so they are called out rather than left
 * implicit:
 *
 *   "replace private-club severity with brighter, welcoming solidarity"
 *      -> no wood-panelled clubs, no luxury styling
 *   "a working conference room rather than a polished private club"
 *      -> real rooms, real people, practical momentum
 *   "genuine rather than cinematic or overly exclusive"
 *      -> never use the word cinematic; this is documentary photography
 *   "make white dominant ... pink sparingly"
 *      -> white and blush carry the frame; pink is a signal, not a wash
 *   "reduce decorative grain and simulated luxury"
 *      -> no film grain
 *   "compressed rooms transform executive pressure into contained resolve"
 *      -> tight rooms are how Pressurized reads; open airy plans kill it
 *   "warm council circle pierced by a pink angular signal"
 *      -> the signature motif, available to any scene with a group
 * ---------------------------------------------------------------------------
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = (f) => resolve(import.meta.dirname, "..", "..", f);
const load = (f) => JSON.parse(readFileSync(root(f), "utf8"));

export const brand = load("pavilion-brand.json");
export const design = load("pavilion-design-syntax.json");
export const photo = load("pavilion-photographic-style.json").photographic_style;

const [WHITE, BLUSH, MIDNIGHT, INDIGO, PINK, VIOLET, NEAR_BLACK] =
  design.color_system.primary_palette;

/** Colour + hex, so a prompt can always name the thing being coloured. */
export const COLOR = {
  white: `clean white (${WHITE})`,
  blush: `pale blush pink (${BLUSH})`,
  midnight: `deep midnight blue (${MIDNIGHT})`,
  indigo: `strong indigo (${INDIGO})`,
  pink: `saturated pink (${PINK})`,
  violet: `dark violet (${VIOLET})`,
  black: `near-black charcoal (${NEAR_BLACK})`,
};

/**
 * Default surface bindings, following the design system's usage logic:
 * white dominant, blush for broad areas, midnight for weight, pink sparingly.
 */
const DEFAULT_SURFACES = [
  `${COLOR.white} dominant across walls, table surfaces and shirts`,
  `${COLOR.blush} on a broad wall plane or upholstery`,
  `${COLOR.midnight} confined to one consequential band — a dark screen, a jacket, deep shadow`,
  `${COLOR.pink} used once and only once, as a small angular signal: a folder edge, a lanyard, a chair back, a thin line on a page`,
];

/**
 * Applied to every prompt. `cinematic` and `film grain` are excluded on
 * purpose — the design system rejects both by name.
 */
const BASE_NEGATIVES = [
  "text", "lettering", "captions", "watermarks", "logos", "signage",
  "neon strips", "LED light bars", "film grain", "heavy vignette",
  "wood panelling", "leather club chairs", "luxury styling", "cinematic teal-orange grade",
];

/** Only meaningful when the frame has people; on a still life they invite some in. */
const PEOPLE_NEGATIVES = ["extra limbs", "distorted hands", "deformed faces"];
const EMPTY_NEGATIVES = ["people", "faces", "hands", "figures"];

/**
 * Compose an 11-block prompt as flowing prose.
 *
 * @param {object} scene
 * @param {string} scene.intent        1 — what this is for
 * @param {string} scene.subject       2 — who/what, 3-6 concrete anchors
 * @param {string} scene.environment   3 — where/when
 * @param {string} scene.composition   4 — framing, focal priority
 * @param {string} [scene.camera]      5 — override the house lens
 * @param {string} [scene.lighting]    6 — override (needed for non-photographic work)
 * @param {string} [scene.style]       7 — override for illustration/graphic subjects
 * @param {string[]} [scene.surfaces]  8 — where each brand colour lands
 * @param {string} [scene.texture]     9 — material cues
 * @param {string[]} [scene.negatives] 10 — extra exclusions
 * @param {boolean} [scene.people]     add posture, proximity and mix direction
 */
export function buildPrompt(scene) {
  const b = [];

  // 1-4 — content
  b.push(scene.intent, scene.subject, scene.environment, scene.composition);

  // 5 — camera. "human-scale proximity ... candid analytical restraint" means
  // in the room at eye level, not a long-lens portrait compressing it away.
  b.push(
    scene.camera ??
      "Shot on a 50mm lens at f/2 from eye level, standing distance — close enough to read expressions, " +
        "wide enough to keep the room legible. Subject sharp, background softly separated but still readable.",
  );

  // 6 — lighting. The spec's phrasing is about faces, so an object or an empty
  // room needs the same light described against what is actually in frame —
  // otherwise "warm light interrogates faces" invites a face into a flat-lay.
  b.push(
    scene.lighting ??
      (scene.people
        ? `Lighting: ${photo.light_behavior}. `
        : "Lighting: warm directional light rakes across the surfaces while controlled shadows " +
          "hold the edges of the frame. ") +
        `${design.light_shadow.contrast_profile} ${design.light_shadow.emotional_temperature.trim()}`,
  );

  // 7 — style. Documentary, emphatically not cinematic. Same reasoning: the
  // "real people, real skin" direction only belongs where there are people.
  b.push(
    scene.style ??
      (scene.people
        ? "Authentic documentary photography of real people, full colour, natural photographic depth, " +
          "clean and unstyled. Ordinary faces with real skin texture, no retouching, no styling gloss."
        : "Authentic documentary still-life photography, full colour, natural photographic depth, " +
          "clean and unstyled. Real worn objects with honest surface detail, no product-shot gloss."),
  );

  // 8 — colour, every hex bound to a surface.
  b.push(`Colour: ${(scene.surfaces ?? DEFAULT_SURFACES).join("; ")}.`);

  // 9 — materials, from the photographic spec's material_expression.
  b.push(
    scene.texture ??
      "Matte surfaces: pale oak, woven upholstery, printed paper and open notebooks. Nothing glossy, nothing opulent.",
  );

  // 10 — the human direction. This is where Pressurized actually lives.
  if (scene.people) {
    const m = Math.round(brand.gender_energy.masculine * 100);
    b.push(
      `The people are ${brand.posture_motion.toLowerCase()}, caught mid-decision rather than smiling at the camera — ` +
        `${photo.motion_symbolism}. ${photo.spatial_emotion}. ` +
        `Mixed ages and ethnicities, roughly ${m}% men and ${100 - m}% women, dressed in plain modern workwear.`,
    );
  }

  // 11
  const kindNegatives = scene.people ? PEOPLE_NEGATIVES : EMPTY_NEGATIVES;
  b.push(
    `Exclude: ${[...BASE_NEGATIVES, ...kindNegatives, ...(scene.negatives ?? [])].join(", ")}.`,
  );
  b.push("Ultra-high resolution, natural clean colour grading.");

  return b.join(" ");
}

/**
 * The brand's signature motif, for scenes built around a group.
 * "warm council circle pierced by a pink angular signal"
 */
export const COUNCIL_CIRCLE =
  "A tight circle of people gathered around a small round table, knees close, leaning in toward the centre";
