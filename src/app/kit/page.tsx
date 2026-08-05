import type { Metadata } from "next";
import { NeuBadge, NeuPanel } from "@/components/neu/Neu";

/**
 * The participant kit, grouped by when a student needs each file.
 *
 * Three groups, in the order the need arrives: the hour itself (the CRM data
 * and the two fallbacks the deck names), the homework week (the artifacts that
 * work asks for), and reference (needed by some people, sometimes). A flat
 * list put "Four ways to cross the Gap" ahead of the README and left the two
 * class-critical fallbacks unserved entirely — Scott's 2026-08-04 kit review
 * is what produced this shape.
 *
 * Served files are plain Markdown from `public/kit/` rather than rendered.
 * That is the point of them: they are meant to be dropped into a repository,
 * pasted into an agent, or printed — not read once on a website.
 *
 * The CRM data entries are not ours to serve. They are on a public GCS bucket,
 * and a cross-origin `download` attribute is ignored by every browser, so
 * those entries open rather than download and carry their absolute URL as the
 * visible label. The endpoints are the ones verified in `../../data/README.md`;
 * the room reaches them with no account and no key.
 *
 * No sign-in. The class argues that a tool should ask for an account when it
 * needs one, and this needs nothing: gating a checklist behind an email would
 * be a lead-capture form wearing a lesson's clothes.
 */

export const metadata: Metadata = {
  title: "Participant kit · Vibecoding 201",
  description:
    "The artifacts from Building Production GTM Tools, grouped by when you need them: the CRM data and the class-day fallbacks, the homework artifacts, and the reference files. Nothing asks for your email.",
};

const BUCKET = "https://storage.googleapis.com/vibecoding-201-data";

type Entry = {
  /** Absolute URL for bucket files, `/kit/…` path for served ones. */
  href: string;
  title: string;
  use: string;
  /** Bucket files open in a new tab; served files download. */
  external?: boolean;
};

const served = (file: string) => `/kit/${file}`;

/**
 * The hour itself: the starter app the exercises run from, the data it
 * carries, then the two fallbacks the deck names — the pre-generated plan the
 * *Fire the plan prompt* slide promises, and the no-account path for the
 * attendee whose workspace blocks everything.
 *
 * The CSV entries carry their row count because choosing between them is a
 * decision about the reader's tool, not about the data: one pastes into a
 * chat window and the other does not.
 */
const DURING_CLASS: Entry[] = [
  {
    href: served("monday-gtm-dashboard-standalone.html"),
    title: "The starter app",
    use: "The app the hour works in: a working GTM dashboard with the CRM data baked into the file. Download it, double-click it, and it runs — no server, no account, no key.",
  },
  {
    href: served("the-bar-prompt.md"),
    title: "The evaluation prompt",
    use: "The first hands-on: your agent reads a project you built and returns a verdict — prototype, tool, or system — with the evidence that decided it.",
  },
  {
    href: `${BUCKET}/schema.md`,
    title: "The column guide",
    use: "You need the 36 columns, the values they hold, and where the data lives.",
    external: true,
  },
  {
    href: `${BUCKET}/sample-200.csv`,
    title: "Sample, 200 rows",
    use: "You are working in a chat assistant and want to paste the data in.",
    external: true,
  },
  {
    href: `${BUCKET}/deals-10k.csv`,
    title: "The full set, 10,000 rows",
    use: "Fine for a coding agent that can read a file; too large to paste into a chat window.",
    external: true,
  },
  {
    href: served("pregenerated-plan.md"),
    title: "The pre-generated plan",
    use: "Your plan prompt returned nothing usable and the exercise clock is running.",
  },
  {
    href: served("no-account-path.md"),
    title: "The no-account path",
    use: "Nothing installed and no accounts — the whole hour works with a browser and whatever assistant you already use.",
  },
];

/** The homework week: ship one narrow internal tool. */
const HOMEWORK: Entry[] = [
  {
    href: served("prompt-pack.md"),
    title: "Prompt pack",
    use: "You are directing an agent and want the request to produce something you can review.",
  },
  {
    href: served("tdd-prompt.md"),
    title: "The TDD prompt",
    use: "You are about to build and want the tests written first, seen failing, and turned green one at a time.",
  },
  {
    href: served("agent-instructions.md"),
    title: "Agent instructions",
    use: "You are starting a repository and want the agent to know your rules from day one.",
  },
  {
    href: served("example-context-files/README.md"),
    title: "Example context files",
    use: "Worked examples of the files the Build slide names — written for the starter app, with a generator prompt that produces the set for your own app.",
  },
  {
    href: served("production-readiness-checklist.md"),
    title: "Production readiness checklist",
    use: "You are deciding whether a tool is safe for colleagues to depend on.",
  },
  {
    href: served("ownership-card.md"),
    title: "Ownership card",
    use: "A tool is about to go live and needs a human whose name is on it.",
  },
];

/** Reference: needed by some people, sometimes. Nothing here gates the hour. */
const REFERENCE: Entry[] = [
  {
    href: served("cli-reference.md"),
    title: "CLI reference",
    use: "You are installing the tools, or you have forgotten what a command does. Do it the night before class, not during it.",
  },
  {
    href: `${BUCKET}/jobs.md`,
    title: "Jobs you can spec against the CRM data",
    use: "Homework variety: more jobs to spec against the same data. The class hour works the went-quiet list from the starter app.",
    external: true,
  },
  {
    href: served("four-ways-to-cross-the-gap.md"),
    title: "Four ways to cross the Gap",
    use: "You are choosing a route to production, or making the case to buy instead of build.",
  },
  {
    href: served("free-apis.md"),
    title: "Free APIs for GTM tools",
    use: "Your tool needs live data and you want an endpoint that costs nothing to start against.",
  },
];

function KitList({ entries }: { entries: Entry[] }) {
  return (
    <ul className="mt-8 space-y-4">
      {entries.map((item) => (
        <li key={item.href}>
          <NeuPanel radius="rounded-[22px]" className="px-6 py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-[1.1rem] font-semibold">
                {item.title}
              </h3>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-sans text-[11px] uppercase tracking-[0.14em] underline-offset-4 hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Open ↗
                </a>
              ) : (
                <a
                  href={item.href}
                  download
                  className="font-sans text-[11px] uppercase tracking-[0.14em] underline-offset-4 hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Download ↓
                </a>
              )}
            </div>
            <p className="mt-2 text-[0.95rem]" style={{ color: "var(--text-dim)" }}>
              {item.use}
            </p>
            <a
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className="mt-3 inline-block break-all font-sans text-[12px] underline underline-offset-4"
              style={{ color: "var(--text-faint)" }}
            >
              {item.href}
            </a>
          </NeuPanel>
        </li>
      ))}
    </ul>
  );
}

function TierHeading({ title, note }: { title: string; note: string }) {
  return (
    <>
      <h2 className="mt-16 font-display text-[clamp(1.4rem,4vw,1.9rem)] font-semibold leading-tight">
        {title}
      </h2>
      <p className="mt-4 leading-relaxed" style={{ color: "var(--text-dim)" }}>
        {note}
      </p>
    </>
  );
}

export default function KitPage() {
  return (
    <main
      data-theme="dark"
      className="min-h-screen px-5 py-14"
      style={{ background: "var(--surface)", color: "var(--text)" }}
    >
      <div className="mx-auto w-full max-w-3xl">
        <NeuBadge accent>Vibecoding 201 · participant kit</NeuBadge>

        <h1 className="mt-6 font-display text-[clamp(1.8rem,5vw,2.6rem)] font-semibold leading-tight">
          Take these and use them.
        </h1>
        <p className="mt-4 leading-relaxed" style={{ color: "var(--text-dim)" }}>
          These are the artifacts the class is built on, not a summary of it.
          They are Markdown so they can go straight into a repository or an
          agent&rsquo;s context, grouped here by when you will need them.
          Nothing here asks for your email.
        </p>

        <TierHeading
          title="During class"
          note="The starter app the exercises run from, the CRM data it carries — a synthetic set of 10,000 sales transactions, no account needed, and nothing you run can change it — plus the two fallbacks the deck names."
        />
        <KitList entries={DURING_CLASS} />

        <TierHeading
          title="This week — the homework"
          note="Ship one narrow internal tool. These are the artifacts that work asks for, in the order it asks for them."
        />
        <KitList entries={HOMEWORK} />

        <TierHeading
          title="When you need them"
          note="Reference. Nothing here is required for the hour."
        />
        <KitList entries={REFERENCE} />

        <p className="mt-12 text-[0.9rem]" style={{ color: "var(--text-faint)" }}>
          Taking the whole folder?{" "}
          <a
            href={served("README.md")}
            download
            className="underline underline-offset-4"
            style={{ color: "var(--text-dim)" }}
          >
            README.md
          </a>{" "}
          is its index.
        </p>

        <div className="mt-8 flex gap-6">
          <a
            href="/"
            className="text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--text-faint)" }}
          >
            Open the full deck
          </a>
          <a
            href="/admin"
            className="text-[0.9rem] underline underline-offset-4"
            style={{ color: "var(--text-faint)" }}
          >
            Presenter
          </a>
        </div>
      </div>
    </main>
  );
}
