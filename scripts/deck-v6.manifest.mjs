/**
 * Image set for Vibecoding-201-Production-GTM-Tools-v6.pptx (40 slides).
 *
 * Each entry supplies only blocks 1–4 of the 11-block prompt plus where the
 * palette lands. Camera, lighting, style, texture, posture and negatives come
 * from `brand-prompt.mjs`, which reads the three spec files. Nothing about the
 * Pavilion look is written here.
 *
 * TWO RULES, both learned the hard way earlier in this project:
 *
 *   1. Every colour names the object it colours. A floating hex gives the
 *      model nothing to paint, so it invents a light source — which is how an
 *      earlier pass turned every frame into a neon-lit boardroom.
 *   2. Evocative, not on the nose. Abstract slides get an object or a moment,
 *      never a diagram of the idea. Secrets is a sealed envelope and an empty
 *      key hook, not a padlock.
 *
 * `slide` and `serves` record where each image belongs and which line it
 * carries, so a render can be judged against the thing it is for. Names sort
 * into slide order; `b` suffix is an alternate for the same slide.
 *
 * The deck is 16:9, so no cropping is needed downstream.
 */
import { buildPrompt, COLOR, COUNCIL_CIRCLE } from "./brand-prompt.mjs";

/** White dominant, blush broad, midnight for weight, pink exactly once. */
const surf = (pinkOn, midnightOn = "one jacket or a dark screen") => [
  `${COLOR.white} dominant across walls, surfaces and clothing`,
  `${COLOR.blush} on a broad wall plane behind the subject`,
  `${COLOR.midnight} confined to ${midnightOn}`,
  `${COLOR.pink} used once only: ${pinkOn}`,
];

/**
 * The six midnight-background slides (8, 12, 19, 21, 27, 32, 38) earn a
 * darker, more compressed frame — `adaptive_rules` reserves dark bands for
 * urgency and consequence. Still white-led, just less of it.
 */
const surfDark = (pinkOn) => [
  `${COLOR.midnight} dominant in the room, deep and enveloping`,
  `${COLOR.white} reduced to a few lit surfaces — a shirt, a page, a doorway`,
  `${COLOR.blush} only where warm light grazes a wall`,
  `${COLOR.pink} used once only: ${pinkOn}`,
];

/** Flat-lay / object framing: overhead, everything sharp. */
const FLATLAY =
  "Shot on a 35mm lens at f/5.6 directly overhead, everything in focus, no perspective distortion.";
/** Architectural framing for rooms and structures. */
const ARCH =
  "Shot on a 35mm lens at f/5.6, architectural framing with corrected verticals, the space legible.";

const SCENES = [
  // ---------------------------------------------------------------- OPEN
  {
    name: "s01-doorway", slide: 1, serves: "Title — from a chat window to a tool your team depends on",
    people: true,
    intent: "Title-slide image: the moment before committing to build something real.",
    subject: "A hand on the handle of a glass door, pushing it open into a small working room where three people are already mid-discussion.",
    environment: "The threshold between a quiet corridor and an occupied meeting room.",
    composition: "Eye-level from the corridor side, door frame splitting the frame, the lit room occupying the right two thirds.",
    surfaces: surf("a pink strip of tape marking the door frame edge"),
  },
  {
    name: "s01b-crossing", slide: 1, serves: "Title, alternate",
    people: true,
    intent: "Title-slide alternate: the distance between where you are and where the work is.",
    subject: "One person walking alone across a bright empty floor toward a lit room at the far end where others are working.",
    environment: "An ordinary office floor early in the morning, chairs still pushed in.",
    composition: "Wide, eye-level, figure small and off-centre in the lower third, the lit doorway ahead.",
    camera: ARCH,
    surfaces: surf("a pink line painted across the floor the figure is about to cross"),
  },
  {
    name: "s02-two-laptops", slide: 2, serves: "Cold open — two identical screens, radically different value",
    people: false,
    intent: "Cold-open image: two things that look identical and are not.",
    subject: "Two identical closed laptops placed side by side on a white table, perfectly aligned, one with a small pink tab stuck to its edge.",
    environment: "A plain white meeting table, nothing else on it.",
    composition: "Overhead flat-lay, both laptops centred with generous empty table around them.",
    camera: FLATLAY,
    surfaces: surf("a single pink tab on the edge of the right-hand laptop", "the laptop lids"),
    texture: "Matte white laminate, brushed aluminium, no reflections.",
  },
  {
    name: "s02b-two-doors", slide: 2, serves: "Cold open, alternate",
    people: true,
    intent: "Cold-open alternate: identical entrances, different consequences.",
    subject: "Two adjacent identical doorways in one wall — the left opening onto an empty room, the right onto a room full of people working.",
    environment: "An ordinary office corridor.",
    composition: "Straight-on, eye-level, both doorways symmetrical in frame, wall above them empty.",
    camera: ARCH,
    surfaces: surf("a pink room marker beside the right-hand door"),
  },
  {
    name: "s03-under-the-desk", slide: 3, serves: "Governing claim — the visible part is cheap; value sits underneath",
    people: false,
    intent: "Image for the claim that the valuable part of software is the invisible part.",
    subject: "A pristine empty glass-topped desk seen from above, and visible through the glass beneath it, a dense tangle of cabling and power bricks.",
    environment: "A clean modern office, nothing on the desk surface.",
    composition: "Overhead, the immaculate surface reading first, the tangle underneath registering a beat later.",
    camera: FLATLAY,
    surfaces: surf("a single pink cable among the grey ones below the glass", "the cabling"),
    texture: "Clear glass, matte cable sheathing, pale oak legs.",
  },
  {
    name: "s03b-service-corridor", slide: 3, serves: "Governing claim, alternate",
    people: false,
    intent: "Alternate: the polished front and the working infrastructure behind it.",
    subject: "A bright finished building lobby with a half-open service door revealing a raw utility corridor of pipes and conduit behind it.",
    environment: "A modern office lobby, empty.",
    composition: "Eye-level, lobby filling the left two thirds, the open service door on the right.",
    camera: ARCH,
    surfaces: surf("a pink safety marking on the service door frame"),
  },

  // -------------------------------------------------- THE RUNNING CASE
  {
    name: "s04-monday", slide: 4, serves: "Jordan's week — Monday, leadership loves it",
    people: true,
    intent: "The high point of the running case: a demo that lands.",
    subject: "Five people leaning in around one laptop, genuine approval on their faces, one presenting with an open hand.",
    environment: "A compressed meeting room mid-morning, glass partition onto an ordinary office behind.",
    composition: "Eye-level from just outside the group, bodies filling the lower two thirds, blush wall above kept clear.",
    surfaces: surf("one pink notebook held against a chest"),
  },
  {
    name: "s04b-friday", slide: 4, serves: "Jordan's week — Friday, the spreadsheet returns",
    people: false,
    intent: "The low point: the workaround comes back.",
    subject: "A thick printed spreadsheet, dog-eared and annotated, lying alone on an otherwise empty desk beside a cold cup of coffee.",
    environment: "An empty meeting room at the end of the day, chairs pushed back at odd angles.",
    composition: "Overhead flat-lay, the printout off-centre, a lot of empty desk around it.",
    camera: FLATLAY,
    surfaces: surf("a pink highlighter lying across the printout", "the desk chair backs"),
  },
  {
    name: "s05-six-notes", slide: 5, serves: "The six defects we will repair",
    people: false,
    intent: "Image for six specific, nameable failures.",
    subject: "Six sticky notes in a precise row on a white wall, one of them pink, the last three curling away at the corners.",
    environment: "A plain white meeting-room wall.",
    composition: "Straight-on, the row centred low in the frame, generous white wall above.",
    camera: ARCH,
    surfaces: surf("the fourth sticky note, pink among five pale ones", "a dark marker resting on the ledge"),
    negatives: ["handwriting", "readable notes"],
  },
  {
    name: "s06-three-objects", slide: 6, serves: "Prototype, tool, system — increasing solidity",
    people: false,
    intent: "Image for three stages of durability.",
    subject: "Three objects in a row on a white surface: a folded paper model, a sanded wooden block, and a machined steel fixture — each the same shape, each more substantial than the last.",
    environment: "A plain studio table.",
    composition: "Straight-on at table height, the three evenly spaced, empty space above.",
    camera: "Shot on a 50mm lens at f/8, product framing, all three sharp.",
    surfaces: surf("a thin pink line scored across the steel fixture", "the steel"),
    texture: "Folded paper, raw oak, brushed steel. Matte throughout.",
  },
  {
    name: "s07-turnstile", slide: 7, serves: "The production gate — four questions before you invest further",
    people: true,
    intent: "Image for a deliberate decision point that most things should not pass.",
    subject: "One person standing at a turnstile in a bright lobby, hand resting on the bar, visibly deciding rather than moving.",
    environment: "A modern office lobby, otherwise empty.",
    composition: "Eye-level, figure on the left third, the turnstile and empty lobby beyond filling the rest.",
    camera: ARCH,
    surfaces: surf("a pink floor marking on the near side of the turnstile"),
  },
  {
    name: "s08-lights-out", slide: 8, serves: "Most prototypes should die at the gate (midnight slide)",
    people: true,
    intent: "Image for killing a project on purpose, and that being the system working.",
    subject: "A hand on a light switch, turning off the light in one small meeting room while the wider floor beyond stays lit and occupied.",
    environment: "A dark small room at the edge of a working office floor at night.",
    composition: "Eye-level from inside the darkening room, the lit floor visible through glass beyond.",
    surfaces: surfDark("a pink room-number plate beside the switch"),
  },
  {
    name: "s08b-box-out", slide: 8, serves: "Die at the gate, alternate",
    people: true,
    intent: "Alternate: carrying something unopened back out.",
    subject: "One person carrying a sealed, unopened box back out through a door, unhurried, entirely matter-of-fact.",
    environment: "A dim corridor at the edge of a lit office floor.",
    composition: "Eye-level, figure mid-stride toward camera, the lit room receding behind them.",
    surfaces: surfDark("a pink label on the side of the box"),
  },
  {
    name: "s09-ring", slide: 9, serves: "The 201 loop — spec, plan, build, test, ship, run",
    people: false,
    intent: "Image for a six-stage loop that closes on itself.",
    subject: "Six small identical working stations arranged in a precise ring around an open centre, each with a chair and a closed notebook, nobody present.",
    environment: "An upper office floor early in the morning, nobody in yet.",
    composition: "Elevated three-quarter view looking down so the ring reads unmistakably as a closed circuit, empty floor across the top third.",
    camera: ARCH,
    surfaces: surf("a thin pink line painted continuously around the inner edge of the ring"),
    texture: "Pale oak desktops, matte grey carpet, white walls.",
  },

  // ---------------------------------------------------------------- SPEC
  {
    name: "s10-page-passed", slide: 10, serves: "What makes it a spec — an artifact, not a message",
    people: true,
    intent: "Image for a written artifact that outlives the conversation.",
    subject: "A single printed page, heavily annotated in pen, being handed from one pair of hands to another across a table.",
    environment: "A compressed meeting room, both people cropped at the shoulder.",
    composition: "Close, eye-level, the page centred and sharp, hands framing it, faces out of frame.",
    camera: "Shot on a 50mm lens at f/2.8, close framing, the page tack sharp.",
    surfaces: surf("a pink margin line ruled down the side of the page", "a pen"),
    negatives: ["readable handwriting", "legible words"],
  },
  {
    name: "s11-two-sheets", slide: 11, serves: "Vague vs testable — say how you will check it",
    people: false,
    intent: "Image for the difference between a wish and a checkable statement.",
    subject: "Two sheets side by side on a white desk — the left nearly blank with a single loose scrawl, the right a dense checklist with every box ticked.",
    environment: "A plain white desk, nothing else in frame.",
    composition: "Overhead flat-lay, the two sheets symmetrical, empty desk around them.",
    camera: FLATLAY,
    surfaces: surf("pink ticks running down the right-hand sheet", "a pen between them"),
    negatives: ["readable handwriting", "legible words", "numbers"],
  },
  {
    name: "s12-timer", slide: 12, serves: "Hands on — write your three-line spec, 120 seconds (midnight)",
    people: true,
    intent: "Image for a short, pressured, collective writing exercise.",
    subject: "A mechanical kitchen timer standing on a meeting table with four people around it writing fast, heads down, none looking up.",
    environment: "A compressed meeting room, warm lamp light.",
    composition: "Low eye-level across the table, timer sharp in the foreground, the writers behind it.",
    camera: "Shot on a 50mm lens at f/2, timer sharp, the group softly separated behind.",
    surfaces: surfDark("the pink dial face of the timer"),
    negatives: ["numbers on the timer", "clock face digits"],
  },

  // ---------------------------------------------------------------- PLAN
  {
    name: "s13-hovering-pen", slide: 13, serves: "Approve the plan before any code changes",
    people: true,
    intent: "Image for the deliberate pause before authorising work.",
    subject: "A large plan spread across a table with a hand holding a pen hovering just above it, not yet signing.",
    environment: "A compressed meeting room, one other person waiting across the table.",
    composition: "Eye-level close over the table, the plan and hovering pen occupying the lower two thirds.",
    camera: "Shot on a 50mm lens at f/2.8, the pen tip and paper sharp.",
    surfaces: surf("a pink approval box printed at the corner of the plan, still empty"),
    negatives: ["readable text on the plan", "legible words"],
  },
  {
    name: "s14-the-question", slide: 14, serves: "Five questions to ask of any plan",
    people: true,
    intent: "Image for interrogating a proposal rather than accepting it.",
    subject: "One person across a table mid-question, hand open, the other listening with a pen paused over an open notebook.",
    environment: "A small compressed meeting room, glass partition behind.",
    composition: "Eye-level, both figures in the lower two thirds, blush wall above kept clear.",
    surfaces: surf("a pink tab marking a page in the open notebook"),
  },

  // --------------------------------------------------------------- BUILD
  {
    name: "s15-relay", slide: 15, serves: "The build stack — Lovable to GitHub to Supabase to Vercel",
    people: true,
    intent: "Image for a chain of handoffs where each stage feeds the next.",
    subject: "Six people at a connected row of workstations, one folder being passed hand to hand down the line, three already holding it and three waiting.",
    environment: "One long working bench in an ordinary office.",
    composition: "Straight-on from the side, the row filling the lower two thirds, wall above clear.",
    camera: ARCH,
    surfaces: surf("the pink folder being passed along the line"),
  },
  {
    name: "s16-three-drawers", slide: 16, serves: "What GitHub, Supabase and Vercel each do",
    people: false,
    intent: "Image for three distinct kinds of storage doing three distinct jobs.",
    subject: "Three open drawers in a plan chest, each holding a visibly different kind of material — flat drawings, stacked cards, coiled cable.",
    environment: "A plain studio wall, the chest square to camera.",
    composition: "Straight-on, all three drawers open to different depths, empty wall above.",
    camera: ARCH,
    surfaces: surf("a pink divider standing in the middle drawer", "the chest carcass"),
  },
  {
    name: "s17-over-shoulder", slide: 17, serves: "Demonstration window 1 — the agent reads the project before acting",
    people: true,
    intent: "Image for watching work happen and narrating the evidence.",
    subject: "Over the shoulder of a colleague working at a laptop, a second person leaning in beside them pointing at something, both absorbed.",
    environment: "A compressed working room, warm light from the left.",
    composition: "From behind and to one side, screen deliberately out of focus, faces in three-quarter profile.",
    camera: "Shot on a 50mm lens at f/2, subjects sharp and the screen thrown out of focus.",
    surfaces: surf("a pink sticky note on the edge of the laptop"),
    negatives: ["readable screen content", "user interface", "legible words"],
  },
  {
    name: "s18-six-binders", slide: 18, serves: "The harness — six files to keep in the repository",
    people: false,
    intent: "Image for a small fixed set of documents that ground everything.",
    subject: "Six identical unlabelled binders standing in a row on a shelf, one pulled half out.",
    environment: "A plain white shelf against a plain wall.",
    composition: "Straight-on, the row centred, empty wall above and below.",
    camera: ARCH,
    surfaces: surf("a pink spine label on the binder pulled half out", "the binder spines"),
    negatives: ["text on spines", "lettering", "labels with words"],
  },
  {
    name: "s19-hands-up", slide: 19, serves: "Poll 1 — the highest-leverage next move (midnight)",
    people: true,
    intent: "Image for a room committing to an answer.",
    subject: "Seven or eight people in a compressed room with most hands raised, a few still down, faces considering rather than certain.",
    environment: "A small full meeting room, warm lamp light, dark beyond.",
    composition: "Eye-level from the front of the room, hands and faces filling the middle band.",
    surfaces: surfDark("one pink sleeve among the raised arms"),
  },
  {
    name: "s20-badge", slide: 20, serves: "Identity — authentication, who is the user",
    people: true,
    intent: "Image for proving who you are at a door.",
    subject: "A hand holding a plain white badge against a reader beside a door, the small indicator just lit.",
    environment: "An ordinary office doorway, corridor beyond.",
    composition: "Close, eye-level, hand and reader in the lower third, door plane filling the rest.",
    camera: "Shot on a 50mm lens at f/2.8, badge and reader sharp.",
    surfaces: surf("the pink indicator light on the reader", "the door"),
    negatives: ["text on the badge", "photograph on the badge"],
  },
  {
    name: "s20b-one-key", slide: 20, serves: "Identity — authorization, what can that user change",
    people: false,
    intent: "Image for having access to some things and not others.",
    subject: "A keyring holding six keys lying on a white surface beside a single lock, only one key visibly matching it.",
    environment: "A plain white desk.",
    composition: "Overhead flat-lay, keyring and lock separated by empty surface.",
    camera: FLATLAY,
    surfaces: surf("a pink tag on the one key that fits", "the lock body"),
  },
  {
    name: "s21-wrong-side", slide: 21, serves: "Request a record from B. The request must fail. (midnight)",
    people: true,
    intent: "Image for an access attempt that correctly does not succeed.",
    subject: "A hand gripping a door handle and pulling, the door plainly not moving, the frame tight around it.",
    environment: "A dark corridor, light visible only in the seam around the door.",
    composition: "Close, eye-level, hand and handle centred, the door filling the frame.",
    camera: "Shot on a 50mm lens at f/2.8, handle and knuckles sharp.",
    surfaces: surfDark("a pink strike plate beside the handle"),
  },
  {
    name: "s22-sealed-envelope", slide: 22, serves: "Secrets — credentials belong outside the code",
    people: false,
    intent: "Image for something deliberately kept out of the room.",
    subject: "A sealed unmarked envelope lying on a white desk beside a wall-mounted key hook that is empty.",
    environment: "A plain office wall and desk, nothing else present.",
    composition: "Straight-on at desk height, envelope lower left, the empty hook upper right, space between them.",
    camera: "Shot on a 50mm lens at f/4, both elements sharp.",
    surfaces: surf("a pink wax seal on the envelope", "the key hook"),
    negatives: ["writing on the envelope", "address", "lettering"],
  },
  {
    name: "s23-five-entrances", slide: 23, serves: "The data door — five ways to connect",
    people: false,
    intent: "Image for five options of very different scale and proportionality.",
    subject: "One long wall with five entrances of wildly different size along it: a small hatch, a side door, a wide loading bay, a revolving door, and an open service stair.",
    environment: "The outside of a plain modern building, overcast even light.",
    composition: "Straight-on, all five visible in one wide frame, sky and wall above kept empty.",
    camera: ARCH,
    surfaces: surf("a pink line painted across the threshold of the loading bay", "the door recesses"),
  },
  {
    name: "s24-status-board", slide: 24, serves: "Live data — what a connection must show on screen",
    people: false,
    intent: "Image for freshness being visible rather than assumed.",
    subject: "A mechanical split-flap departures board mid-flip, one row caught halfway through changing while the rest sit still.",
    environment: "A plain concourse wall.",
    composition: "Straight-on, board filling the lower two thirds, wall above empty.",
    camera: ARCH,
    surfaces: surf("one pink flap in the row that is changing", "the board casing"),
    negatives: ["readable letters", "words", "numbers", "destinations"],
  },
  {
    name: "s25-two-parcels", slide: 25, serves: "Idempotency — what happens if this runs twice",
    people: false,
    intent: "Image for an accidental duplicate that nobody notices.",
    subject: "Two identical parcels, same size, same plain wrapping, delivered side by side to the same white desk.",
    environment: "An empty office reception desk.",
    composition: "Overhead flat-lay, the two parcels perfectly matched and adjacent, empty desk around.",
    camera: FLATLAY,
    surfaces: surf("an identical pink label on each parcel, giving away that they are the same", "the desk edge"),
    negatives: ["readable labels", "addresses", "barcodes", "lettering"],
  },
  {
    name: "s26-ledger-and-note", slide: 26, serves: "The AI insight rule — code calculates, the model explains",
    people: true,
    intent: "Image for the division between what is computed and what is interpreted.",
    subject: "A desk split down the middle: a calculator and a ruled ledger on the left, a handwritten note on the right, one hand resting on each side.",
    environment: "A plain white desk, warm light from the left.",
    composition: "Overhead flat-lay, the two halves clearly separated, a visible gap down the centre.",
    camera: FLATLAY,
    surfaces: surf("a pink line ruled down the centre of the desk between the two halves", "the calculator"),
    negatives: ["readable handwriting", "numbers", "legible words"],
  },
  {
    name: "s27-hands-up-2", slide: 27, serves: "Poll 2 — the most proportionate starting approach (midnight)",
    people: true,
    intent: "Image for a second, more considered collective decision.",
    subject: "A compressed room seen from the side, about six people, roughly half with hands raised, one mid-way up and hesitating.",
    environment: "A small full meeting room at night, warm lamp light.",
    composition: "Side-on eye-level, the row of figures across the middle band, dark above.",
    surfaces: surfDark("a pink folder on the table in front of the hesitating person"),
  },

  // ---------------------------------------------------------------- TEST
  {
    name: "s28-green-lights", slide: 28, serves: "A model reporting all tests pass is not verification",
    people: true,
    intent: "Image for not trusting a self-report.",
    subject: "A row of small green indicator lights all lit on a plain panel, with a person underneath still checking something by hand, unconvinced.",
    environment: "A compressed utility room off an office floor.",
    composition: "Eye-level, the lit panel across the upper middle, the person below it in the lower third.",
    surfaces: surf("one pink indicator among the green ones", "the panel housing"),
  },
  {
    name: "s29-relay-hands", slide: 29, serves: "The build loop — who does what",
    people: true,
    intent: "Image for alternating responsibility around a table.",
    subject: "Six pairs of hands around a round table, a single small object being passed between them, only hands and forearms in frame.",
    environment: "A pale oak round table in a compressed room.",
    composition: "Overhead, the table filling the frame, hands entering from all sides.",
    camera: FLATLAY,
    surfaces: surf("the pink object being passed between the hands", "the sleeves"),
  },
  {
    name: "s30-unplugging", slide: 30, serves: "Demonstration window 2 — prove it fails the way you said it would",
    people: true,
    intent: "Image for breaking something deliberately and calmly.",
    subject: "One person deliberately pulling a cable out of a wall port, entirely unhurried, while a colleague watches a panel to see what happens.",
    environment: "A compressed room off an office floor.",
    composition: "Eye-level, the hand on the cable sharp in the near third, the watching colleague beyond.",
    camera: "Shot on a 50mm lens at f/2.8, the cable and hand sharp.",
    surfaces: surf("a pink band marking the cable being pulled"),
  },

  // ---------------------------------------------------------------- SHIP
  {
    name: "s31-three-doors", slide: 31, serves: "Local, preview, production — increasing consequence",
    people: false,
    intent: "Image for three stages of increasing seriousness.",
    subject: "Three doorways in receding sequence along one corridor, each heavier than the last — a hanging curtain, a plain office door, then a heavy steel fire door.",
    environment: "A plain corridor, even light.",
    composition: "One-point perspective straight down the corridor, all three thresholds visible in depth.",
    camera: ARCH,
    surfaces: surf("a pink push-bar on the final steel door", "the fire door"),
  },
  {
    name: "s32-many-phones", slide: 32, serves: "Open the link in the chat. All of you. (midnight)",
    people: true,
    intent: "Image for a real thing going live to real people at once.",
    subject: "A dozen hands holding phones raised at different heights, every screen blank and brightly lit, faces out of frame above.",
    environment: "A dark room, the phone screens the only light source.",
    composition: "Close, hands and phones filling the frame, dark above.",
    camera: "Shot on a 50mm lens at f/2.8, the nearest phones sharp.",
    surfaces: surfDark("one pink phone case among the plain ones"),
    negatives: ["screen content", "user interface", "app icons", "lettering"],
  },

  // ----------------------------------------------------------------- RUN
  {
    name: "s33-wall-display", slide: 33, serves: "Analytics, logs and alerts",
    people: true,
    intent: "Image for reading what actually happened.",
    subject: "One person standing close to a large wall-mounted display of running rows, reading it carefully with arms folded.",
    environment: "A compressed room off an office floor, dim except for the display.",
    composition: "From behind and to one side, the display filling the upper two thirds, the figure small against it.",
    surfaces: surf("a single pink row on the display", "the display bezel"),
    negatives: ["readable data", "numbers", "words", "charts"],
  },
  {
    name: "s34-nameplate", slide: 34, serves: "Ownership — the tool survives the person who built it",
    people: true,
    intent: "Image for a named human taking responsibility.",
    subject: "A hand sliding a blank nameplate into a bracket beside an office door.",
    environment: "An ordinary office corridor.",
    composition: "Close, eye-level, the bracket and hand in the centre, door plane filling the rest.",
    camera: "Shot on a 50mm lens at f/2.8, the nameplate sharp.",
    surfaces: surf("a pink edge on the nameplate bracket", "the door"),
    negatives: ["name on the plate", "lettering", "text"],
  },
  {
    name: "s34b-handover", slide: 34, serves: "Ownership, alternate — a backup owner",
    people: true,
    intent: "Alternate: responsibility passing to a second person.",
    subject: "Two hands meeting mid-air as a small set of keys passes from one to the other, both people cropped at the wrist.",
    environment: "A plain office interior, warm light.",
    composition: "Close, the exchange dead centre, generous space around it.",
    camera: "Shot on a 50mm lens at f/2.8, the keys sharp at the moment of transfer.",
    surfaces: surf("a pink fob on the keyring", "a cuff"),
  },
  {
    name: "s35-ring-with-gate", slide: 35, serves: "The decision rule — the gate, then the loop",
    people: false,
    intent: "Image for a decision that precedes the whole cycle.",
    subject: "The same ring of six working stations, seen wider, with a single freestanding gate marking the one entry point into the circle.",
    environment: "An upper office floor, early, nobody present.",
    composition: "Elevated three-quarter, the ring and its single entry both legible, empty floor above.",
    camera: ARCH,
    surfaces: surf("a pink bar across the gate at the ring's entry point"),
  },

  // --------------------------------------------------------------- CLOSE
  {
    name: "s36-three-lines", slide: 36, serves: "Homework — your three-line specification",
    people: false,
    intent: "Image for a very small, very specific deliverable.",
    subject: "A single sheet of paper bearing three ruled empty lines, a pen resting across it.",
    environment: "A plain white desk, nothing else.",
    composition: "Overhead flat-lay, the sheet centred small in a large field of empty desk.",
    camera: FLATLAY,
    surfaces: surf("the third line ruled in pink, the other two grey", "the pen"),
    negatives: ["handwriting", "words", "lettering"],
  },
  {
    name: "s37-one-object", slide: 37, serves: "Ship something small. Make sure it gets used. (midnight)",
    people: false,
    intent: "Closing image: something modest, finished, and deliberately placed.",
    subject: "One small plain object placed exactly in the centre of a very large empty meeting table.",
    environment: "A large dim meeting room, one warm light directly above the table.",
    composition: "Eye-level from the end of the table, the object small and centred, the table running away from camera.",
    camera: ARCH,
    surfaces: surfDark("a pink mark on the small object, the only saturated point in the frame"),
  },
  {
    name: "s38-about-to-send", slide: 38, serves: "Q&A opener — Priya wants to send the link to 40 partners (midnight)",
    people: true,
    intent: "Image for the moment before an irreversible external action.",
    subject: "One person paused with a phone in hand, thumb hovering, four expectant colleagues visible beyond waiting for her to send it.",
    environment: "A compressed room, warm light, dark beyond the group.",
    composition: "Eye-level, the phone and hovering thumb sharp in the near third, faces beyond.",
    camera: "Shot on a 50mm lens at f/2, the hand sharp and the group softly behind.",
    surfaces: surfDark("a pink phone case"),
    negatives: ["screen content", "user interface", "lettering"],
  },
  {
    name: "s39-nine-items", slide: 39, serves: "The bar — nine items of a production standard",
    people: false,
    intent: "Image for a fixed checklist where every item must be present.",
    subject: "Nine small identical plain objects laid out in a precise three-by-three grid on a white surface, evenly spaced.",
    environment: "A plain white studio surface, even light.",
    composition: "Overhead flat-lay, the grid centred, generous margin on all sides.",
    camera: FLATLAY,
    surfaces: surf("one of the nine objects pink, the other eight white", "the shadows beneath them"),
  },
  {
    name: "s40-council", slide: 40, serves: "Questions — 30 minutes",
    people: true,
    intent: "Closing image: the room opening up for discussion.",
    subject: `${COUNCIL_CIRCLE} — five people, chairs pulled in close, one speaking with an open hand and the rest genuinely engaged.`,
    environment: "A small working meeting room, glass partition onto an ordinary office behind.",
    composition: "Eye-level from just outside the circle, the group in the lower two thirds, blush wall above kept clear.",
    surfaces: surf("a sharp angular pink folder edge on the table, catching the light"),
  },
];

/** @type {{name: string, slide: number, serves: string, prompt: string, aspectRatio: string}[]} */
export const IMAGES = SCENES.map((s) => ({
  name: s.name,
  slide: s.slide,
  serves: s.serves,
  aspectRatio: "16:9",
  model: s.model,
  prompt: buildPrompt({ ...s, aspectRatio: "16:9" }),
}));

/** No video in this set. */
export const VIDEOS = [];
