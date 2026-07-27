/**
 * Scene registry for every generated asset in the deck.
 *
 * Each entry supplies only blocks 1–4 of the 11-block prompt — intent,
 * subject, environment, composition — plus where the brand colours land.
 * Everything that carries brand coherence (camera, lighting, style, texture,
 * posture, negatives) comes from `brand-prompt.mjs`, which reads the three
 * spec files. Nothing about the Pavilion look is written here.
 *
 *   ../../pavilion-brand.json
 *   ../../pavilion-design-syntax.json
 *   ../../pavilion-photographic-style.json
 *
 * The one rule to hold when editing a scene: **every colour must name the
 * object it colours.** A floating hex gives the model nothing to paint and it
 * invents a light source — which is how an earlier pass turned every frame
 * into a neon-lit boardroom.
 *
 * `notes` records what the Midjourney original depicts, so a regenerated
 * asset can be judged against the thing it replaces.
 *
 *   images -> src/assets/generated/<name>.webp
 *   videos -> public/media/generated/<name>.mp4 + <name>-poster.jpg
 */
import { buildPrompt, COLOR, COUNCIL_CIRCLE } from "./brand-prompt.mjs";

/** White dominant, blush broad, midnight for weight, pink once. */
const surfaces = (pinkOn) => [
  `${COLOR.white} dominant across walls, table and shirts`,
  `${COLOR.blush} on a broad wall plane behind`,
  `${COLOR.midnight} confined to one element — a jacket, a dark screen`,
  `${COLOR.pink} used once only: ${pinkOn}`,
];

const SCENES = [
  {
    name: "threshold",
    notes: "Original: lone operator mid-step at a doorway, warm golden light.",
    people: true,
    intent: "Opening backdrop for the title slide — the moment before committing.",
    subject:
      "One operator paused in an open doorway, mid-step, hand still on the frame, looking into the room ahead where a small group is already working.",
    environment: "The threshold between a quiet corridor and an occupied working room.",
    composition:
      "Eye-level from inside the room. Figure on the left third, the lit doorway framing them, wall above left empty.",
    surfaces: surfaces("a sharp pink stripe on the door frame edge"),
  },
  {
    name: "record-refresh-a",
    notes: "Original: a hand changing one record on screen — the demo.",
    people: true,
    intent: "Left half of a two-up comparison: the prototype that holds nothing.",
    subject:
      "A single pair of hands at a laptop on an otherwise bare table, one finger mid-keystroke, no one else in the room.",
    environment: "A small empty meeting room, chairs pushed in, nothing else on the table.",
    composition: "Close, eye-level across the table. Hands and laptop lower centre, empty wall above.",
    surfaces: surfaces("a thin pink line ruled across a single loose sheet beside the laptop"),
  },
  {
    name: "record-refresh-b",
    notes: "Original: same edit, but landing in something real — the tool.",
    people: true,
    intent: "Right half of the comparison: the same edit, now depended on.",
    subject:
      "The same hands at the same laptop, but three colleagues now lean in around the table watching the change land.",
    environment: "The same small meeting room, now occupied and active.",
    composition: "Same eye-level framing as its pair, so the two read as a set. Empty wall above.",
    surfaces: surfaces("a pink folder standing upright against the laptop"),
  },
  {
    name: "ops-room-a",
    notes: "Original: woman working alone, deep magenta bokeh behind. Sunday, the build.",
    people: true,
    intent: "Backdrop for Sunday — the build, before anyone else is involved.",
    subject:
      "One operator working alone late, forward-leaning over a laptop and an open notebook, absorbed, jaw set.",
    environment: "A compressed working room after hours, empty desks visible through a glass partition behind.",
    composition: "Eye-level across the desk, subject centred in the lower two thirds, pale wall above left clear.",
    surfaces: surfaces("a pink sticky tab marking a page in the open notebook"),
  },
  {
    name: "ops-room-b",
    notes: "Original: the room occupied and energised. Monday, the applause.",
    people: true,
    intent: "Backdrop for Monday — the demo lands, the room approves.",
    subject:
      "Five people gathered close around one screen, one presenting with an open hand, the others reacting — genuine approval, not posed.",
    environment: "The same compressed room, now full, mid-morning.",
    composition: "Eye-level from just outside the group. Bodies fill the lower two thirds; wall above kept clear.",
    surfaces: surfaces("one pink notebook held against a chest"),
  },
  {
    name: "ops-room-c",
    notes: "Original: same room, colder, data gone. Wednesday, the reset.",
    people: true,
    intent: "Backdrop for Wednesday — the data is gone and the room has emptied.",
    subject:
      "One person alone facing a blank screen, hands flat on the table, chairs pushed back at odd angles around them.",
    environment: "The same room, later, the energy gone out of it.",
    composition: "Eye-level, subject small and off-centre, the disordered empty chairs carrying the frame.",
    surfaces: surfaces("a pink folder abandoned closed on the far end of the table"),
  },
  {
    name: "operators-group",
    notes: "Original: four operators around a table, candid, soft coral wall wash.",
    people: true,
    intent: "Backdrop for the five archetypes — different working modes at one table.",
    subject: `${COUNCIL_CIRCLE} — four operators each visibly in a different mode: one sketching, one typing, one auditing a printed page, one listening.`,
    environment: "A small working meeting room, glass partition onto an ordinary office behind.",
    composition:
      "Eye-level from just outside the circle. Group in the lower two thirds, blush wall above them empty.",
    surfaces: surfaces("a sharp angular pink folder edge on the table, catching the light"),
  },
  {
    name: "workflow-loop",
    notes: "Original: circular workflow rendered as architecture.",
    people: false,
    intent: "Abstract backdrop for the six-stage loop.",
    subject:
      "A continuous ring of six small working stations around an open centre, each with a chair and an open notebook, no people present.",
    environment: "An upper floor of an ordinary modern office, early morning, nobody in yet.",
    composition:
      "Elevated three-quarter view looking down so the ring reads clearly as a closed loop. Empty floor across the top third.",
    camera:
      "Shot on a 35mm lens at f/5.6 from above, architectural framing, corrected verticals, everything legible.",
    surfaces: surfaces("a thin pink line painted continuously around the inner edge of the ring"),
    texture: "Pale oak desktops, matte grey carpet, white walls.",
  },
  {
    name: "agent-a",
    notes: "Original: unattended desk, work progressing alone at night.",
    people: false,
    intent: "Backdrop for autonomous work — something running with nobody watching.",
    subject:
      "An empty chair pushed back from a desk where a laptop is open and clearly mid-task, a notebook beside it, no one present.",
    environment: "An ordinary office at night, the rest of the floor dark behind a glass partition.",
    composition: "Eye-level across the desk, the empty chair reading as deliberate. Wall above left clear.",
    surfaces: surfaces("a pink sticky note stuck to the edge of the laptop"),
  },
  {
    name: "agent-b",
    notes: "Original: corridor of rooms, one lit, nobody present.",
    people: false,
    intent: "Second autonomous-work backdrop — activity without attendance.",
    subject:
      "A corridor of closed meeting rooms at night, one room lit from within with a screen still running, the corridor completely empty.",
    environment: "An ordinary office corridor after hours.",
    composition:
      "Eye-level down the corridor, one-point perspective, the lit doorway two thirds along. Ceiling and near walls dark.",
    surfaces: surfaces("a pink room-number plate beside the lit door"),
  },
  {
    name: "failure-a",
    notes: "Original: operator deliberately triggering a controlled failure.",
    people: true,
    intent: "Backdrop for deliberately breaking a working system on purpose.",
    subject:
      "Two operators at a laptop, one reaching to press a key with deliberate care while the other watches a second screen — rehearsed, unhurried, entirely calm.",
    environment: "A compressed working room, the rest of the floor visible and unbothered behind glass.",
    composition: "Close eye-level, both faces readable, hands and screens in frame. Wall above clear.",
    surfaces: surfaces("a pink printed checklist lying flat between them"),
  },
  {
    name: "failure-b",
    notes: "Original: aftermath — reading the log where one thread went red.",
    people: true,
    intent: "Backdrop for reading the results of a controlled failure without alarm.",
    subject:
      "Two operators standing at a wall-mounted screen reading a list of results, one pointing at a single failed row, both composed.",
    environment: "A small room off an ordinary office floor.",
    composition: "Eye-level from behind and to one side, screen glow on their faces. Wall above kept clear.",
    surfaces: surfaces("a single pink row highlighted on the printed page one of them is holding"),
  },
];

/** @type {{name: string, prompt: string, aspectRatio: string, notes: string}[]} */
export const IMAGES = SCENES.map((s) => ({
  name: s.name,
  notes: s.notes,
  aspectRatio: "16:9",
  model: s.model,
  prompt: buildPrompt({ ...s, aspectRatio: "16:9" }),
}));

/**
 * Video scenes. Gemini Omni Flash reads duration and framing from the prompt
 * text rather than parameters, so those are stated in words.
 */
const CLIPS = [
  {
    name: "three-environments",
    notes: "Backs the ladder section: belief, then work, then the business.",
    people: true,
    duration: 6,
    intent: "Slow-moving backdrop for a slide about three levels of operational maturity.",
    subject:
      "A continuous lateral camera drift past three adjacent working spaces: one person alone at a desk, then a pair mid-discussion, then a full room in session.",
    environment: "One ordinary office floor, the three spaces adjacent and visible in sequence.",
    composition: "Eye-level, unbroken lateral move, no cuts, subjects passing through frame.",
    surfaces: surfaces("one pink folder visible on a desk as the camera passes"),
  },
  {
    name: "gap-platforms",
    notes: "Backs the-gap: the builder's chasm.",
    people: false,
    duration: 8,
    intent: "Backdrop for a slide about the distance between a prototype and a real system.",
    subject:
      "Two working floors separated by an open stairwell void between them — the near one small and finished, the far one much larger and busier.",
    environment: "An ordinary modern office building, both levels visible across the gap.",
    composition: "Slow push forward toward the edge of the void, no cuts.",
    camera: "35mm at f/5.6, architectural framing, corrected verticals, slow dolly forward.",
    surfaces: surfaces("a pink handrail marking the near edge of the void"),
  },
  {
    name: "workflow-loop",
    notes: "Backs the-loop: spec, plan, build, test, ship, run.",
    people: false,
    duration: 6,
    intent: "Looping backdrop for the six-stage working loop.",
    subject:
      "A slow orbit around a ring of six small working stations, returning to where it began so the motion reads as a closed circuit.",
    environment: "An upper office floor early in the morning, nobody present.",
    composition: "Elevated three-quarter orbit, seamless loop, no cuts.",
    camera: "35mm at f/5.6 on a slow circular dolly, corrected verticals.",
    surfaces: surfaces("a thin pink line running continuously around the inner edge of the ring"),
  },
];

/** @type {{name: string, prompt: string, duration: number, aspectRatio: string, notes: string}[]} */
export const VIDEOS = CLIPS.map((s) => ({
  name: s.name,
  notes: s.notes,
  duration: s.duration,
  aspectRatio: "16:9",
  model: s.model,
  prompt: buildPrompt({ ...s, aspectRatio: "16:9" }),
}));
