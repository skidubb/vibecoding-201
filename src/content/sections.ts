import type { StaticImageData } from "next/image";

import threshold from "@/assets/threshold.webp";
import recordRefreshA from "@/assets/record-refresh-a.webp";
import recordRefreshB from "@/assets/record-refresh-b.webp";
import opsRoomA from "@/assets/ops-room-a.webp";
import opsRoomB from "@/assets/ops-room-b.webp";
import opsRoomC from "@/assets/ops-room-c.webp";
import operatorsGroup from "@/assets/operators-group.webp";
import agentA from "@/assets/agent-a.webp";
import failureA from "@/assets/failure-a.webp";

export type LayoutKind =
  | "hero"
  | "split"
  | "claim"
  | "cards"
  | "timeline"
  | "chart"
  | "loop"
  | "cta";

export type Media = {
  image?: StaticImageData;
  video?: string;
  poster?: string;
  /** -1 … 1. Negative drifts up as you scroll down (further away). */
  speed?: number;
};

export type Card = {
  label?: string;
  title: string;
  body?: string;
  meta?: string;
};

export type TimelineStop = {
  day: string;
  title: string;
  body: string;
  image?: StaticImageData;
  tone?: "neutral" | "bad";
};

export type Section = {
  id: string;
  /** Display number in the rail — mirrors the source deck's slide numbering. */
  slide: string;
  theme: "dark" | "light";
  layout: LayoutKind;
  eyebrow?: string;
  title: string;
  /** Words to render in magenta inside the title. */
  accent?: string;
  lede?: string;
  kicker?: string;
  footnote?: string;
  media?: Media;
  cards?: Card[];
  timeline?: TimelineStop[];
  chart?: "ladder" | "scurve" | "gap";
  split?: { label: string; title: string; body: string; image: StaticImageData }[];
  loopSteps?: string[];
};

export const sections: Section[] = [
  {
    id: "title",
    slide: "01",
    theme: "dark",
    layout: "hero",
    eyebrow: "Vibecoding 201",
    title: "Crossing the Gap",
    lede: "Taking one GTM prototype from a chat window to a tool 40 people depend on.",
    kicker: "Scott Ewalt · Founder, Cardinal Element",
    footnote: "Pavilion AI in GTM School · 90 minutes: 60 content, 30 Q&A",
    media: { image: threshold, speed: -0.18 },
  },
  {
    id: "cold-open",
    slide: "02",
    theme: "dark",
    layout: "split",
    eyebrow: "Cold open",
    title: "Two identical screens. Radically different value.",
    accent: "Radically different value.",
    lede: "Which one would you trust to run Monday's retention meeting? Vote in the chat.",
    split: [
      {
        label: "Screen A",
        title: "The demo",
        body: "Built in 12 minutes. Sample data. Open link.",
        image: recordRefreshA,
      },
      {
        label: "Screen B",
        title: "The tool",
        body: "Stores real records, controls access, refreshes itself, logs failures.",
        image: recordRefreshB,
      },
    ],
  },
  {
    id: "claim",
    slide: "03",
    theme: "dark",
    layout: "claim",
    eyebrow: "The opening claim",
    title: "AI made the visible part of software cheap. Most of the value, and most of the risk, is invisible.",
    accent: "is invisible.",
    kicker: "Code is no longer the primary bottleneck. Judgment is.",
  },
  {
    id: "promise",
    slide: "04",
    theme: "light",
    layout: "cards",
    eyebrow: "The promise",
    title: "101 made you dangerous. 201 makes you useful.",
    accent: "201 makes you useful.",
    lede: "You do not need 101. Assume only that plain English can now produce working software. Today is everything required after the first impressive result.",
    kicker: "You will leave able to",
    cards: [
      { label: "01", title: "Diagnose why a prototype will die before you invest further" },
      { label: "02", title: "Write a spec precise enough to test, without writing code" },
      { label: "03", title: "Direct an agent through plan, build, debug, and verification" },
      { label: "04", title: "Choose the least complex reliable way to connect real data" },
      { label: "05", title: "Engineer the two loops that run without you" },
      { label: "06", title: "Place any tool on the curve and name your archetype" },
    ],
  },
  {
    id: "jordan",
    slide: "05",
    theme: "light",
    layout: "timeline",
    eyebrow: "The running case · Jordan, VP RevOps",
    title: "The week Jordan's prototype died",
    accent: "died",
    lede: "A prioritized view of accounts at risk, the evidence behind each flag, the owner, and the next action. The data lives in CRM, support, product usage, and a spreadsheet Customer Success keeps by hand.",
    timeline: [
      {
        day: "Sunday",
        title: "The build",
        body: "Built a polished dashboard with sample data.",
        image: opsRoomA,
      },
      {
        day: "Monday",
        title: "The applause",
        body: "Leadership loved the demo.",
        image: opsRoomB,
      },
      {
        day: "Tuesday",
        title: "The ask",
        body: "The team asked for logins and real accounts.",
        tone: "bad",
      },
      {
        day: "Wednesday",
        title: "The reset",
        body: "The data disappeared after a refresh.",
        tone: "bad",
        image: opsRoomC,
      },
      {
        day: "Thursday",
        title: "The black box",
        body: "Nobody could explain a risk score.",
        tone: "bad",
      },
      {
        day: "Friday",
        title: "The return",
        body: "The spreadsheet returned.",
        tone: "bad",
      },
    ],
  },
  {
    id: "ladder",
    slide: "06",
    theme: "dark",
    layout: "chart",
    chart: "ladder",
    eyebrow: "The ladder",
    title: "Belief, then work, then the business.",
    accent: "then the business.",
    kicker: "The rung is set by the observable test, never by the feature list.",
    media: {
      video: "/media/three-environments.mp4",
      poster: "/media/three-environments-poster.jpg",
      speed: -0.12,
    },
  },
  {
    id: "curve",
    slide: "07",
    theme: "light",
    layout: "chart",
    chart: "scurve",
    eyebrow: "The curve",
    title: "One shape underneath all of it: slow, fast, flat.",
    accent: "slow, fast, flat.",
    kicker:
      "Products climb it. Adoption follows it. Skills obey it. The Ladder is this curve at three-rung resolution.",
    footnote: "Diffusion curve: Rogers. Chasm: Moore, Crossing the Chasm.",
  },
  {
    id: "archetypes",
    slide: "08",
    theme: "light",
    layout: "cards",
    eyebrow: "The five archetypes",
    title: "Everyone can write code now, so teams sort by mindset.",
    accent: "mindset.",
    media: { image: operatorsGroup, speed: 0.1 },
    footnote: "Five archetypes: Boris Cherny, creator of Claude Code.",
    cards: [
      { label: "01", title: "Prototyper", body: "First idea, fast, cheap throwaways" },
      { label: "02", title: "Builder", body: "Actually build it, reach fit" },
      { label: "03", title: "Grower", body: "Scale it once it has fit" },
      { label: "04", title: "Sweeper", body: "Polish until you feel it" },
      { label: "05", title: "Maintainer", body: "Own it, secure and fast, for years" },
    ],
  },
  {
    id: "the-gap",
    slide: "10",
    theme: "dark",
    layout: "chart",
    chart: "gap",
    eyebrow: "The gap",
    title: "The Gap is the builder's chasm.",
    accent: "chasm.",
    lede: "Persistence. Identity and access. Real data. Deployment. Testing. Scheduled and event-driven work. Monitoring. Ownership. None of it shows up in the demo, and it holds most of the value and most of the risk.",
    footnote: "Adoption chasm: Moore. Diffusion curve: Rogers.",
    media: {
      video: "/media/gap-platforms.mp4",
      poster: "/media/gap-platforms-poster.jpg",
      speed: -0.2,
    },
  },
  {
    id: "killers",
    slide: "11",
    theme: "dark",
    layout: "cards",
    eyebrow: "The three killers",
    title: "Most prototypes die one of three ways.",
    accent: "one of three ways.",
    media: { image: failureA, speed: -0.14 },
    kicker:
      "A prototype creates option value. A tool creates labor or decision leverage. A system creates operating leverage, and recurring cost, risk, and ownership.",
    cards: [
      {
        label: "01",
        title: "No defined job",
        body: "The build begins before the workflow and the success criteria are clear.",
      },
      {
        label: "02",
        title: "No durable state",
        body: "Data, decisions, and user actions do not survive the session.",
      },
      {
        label: "03",
        title: "No path into work",
        body: "The right people cannot access, trust, or repeatedly use it.",
      },
    ],
  },
  {
    id: "the-loop",
    slide: "18",
    theme: "dark",
    layout: "loop",
    eyebrow: "The 201 loop",
    title: "This is how you work.",
    accent: "you",
    loopSteps: ["Spec", "Plan", "Build", "Test", "Ship", "Run"],
    lede: "It replaces “prompt until something looks right.” Every step has an artifact you can show someone.",
    kicker:
      "Two more loops live inside this one. The build loop runs while the agent builds. The run loop runs after you ship.",
    media: {
      video: "/media/workflow-loop.mp4",
      poster: "/media/workflow-loop-poster.jpg",
      speed: -0.1,
    },
  },
  {
    id: "close",
    slide: "43",
    theme: "dark",
    layout: "cta",
    eyebrow: "The assignment",
    title: "Small is fine. Ugly is survivable. Unused is failure.",
    accent: "Unused is failure.",
    lede: "Pick one workflow. Give it a job, a memory, and a way in. Ship it before the next session.",
    kicker: "Scott Ewalt · Cardinal Element",
    media: { image: agentA, speed: -0.16 },
  },
];
