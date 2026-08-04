import type { Metadata } from "next";
import { NeuBadge, NeuPanel } from "@/components/neu/Neu";

/**
 * The participant kit.
 *
 * Eight files, served as plain Markdown from `public/kit/` rather than rendered.
 * That is the point of them: they are meant to be dropped into a repository,
 * pasted into an agent, or printed — not read once on a website. A page that
 * only rendered them prettily would make the reader copy out of a browser.
 *
 * The deal set is a second list because its files are not ours to serve. They
 * are on a public GCS bucket, and a cross-origin `download` attribute is ignored
 * by every browser, so these entries open rather than download and carry their
 * absolute URL as the visible label. The endpoints are the ones verified in
 * `../../data/README.md`; the room reaches them with no account and no key.
 *
 * No sign-in. The class argues that a tool should ask for an account when it
 * needs one, and this needs nothing: gating a checklist behind an email would
 * be a lead-capture form wearing a lesson's clothes.
 */

export const metadata: Metadata = {
  title: "Participant kit · Vibecoding 201",
  description:
    "The eight artifacts from Building Production GTM Tools: readiness checklist, prompt pack, pre-generated plan, agent instructions, ownership card, CLI reference, route map. Plus the deal set the class builds against.",
};

const FILES = [
  {
    file: "production-readiness-checklist.md",
    title: "Production readiness checklist",
    use: "You are deciding whether a tool is safe for colleagues to depend on.",
  },
  {
    file: "prompt-pack.md",
    title: "Prompt pack",
    use: "You are directing an agent and want the request to produce something you can review.",
  },
  {
    file: "pregenerated-plan.md",
    title: "The pre-generated plan",
    use: "Your plan prompt returned nothing usable and the exercise clock is running.",
  },
  {
    file: "agent-instructions.md",
    title: "Agent instructions",
    use: "You are starting a repository and want the agent to know your rules from day one.",
  },
  {
    file: "ownership-card.md",
    title: "Ownership card",
    use: "A tool is about to go live and needs a human whose name is on it.",
  },
  {
    file: "cli-reference.md",
    title: "CLI reference",
    use: "You need to install the tools, or you have forgotten what a command does.",
  },
  {
    file: "four-ways-to-cross-the-gap.md",
    title: "Four ways to cross the Gap",
    use: "You are picking a route to production, or explaining why you chose this one.",
  },
  {
    file: "README.md",
    title: "Read me first",
    use: "You want the order to use the other seven in.",
  },
];

const BUCKET = "https://storage.googleapis.com/vibecoding-201-data";

/**
 * The data the room builds against, on the bucket that serves it.
 *
 * Every `use` line is quoted from `../../data/kit/README.md` or
 * `../../data/kit/schema.md`, the same way the deck's titles are quoted from
 * `deck-content-v13.md`. The two CSV entries carry their row count because
 * choosing between them is a decision about the reader's tool, not about the
 * data: one pastes into a chat window and the other does not.
 */
const DEAL_SET = [
  {
    file: "schema.md",
    title: "Schema",
    use: "You need the 36 columns, the values they hold, and the endpoint. Start here.",
  },
  {
    file: "jobs.md",
    title: "Six jobs you can spec against the deal set",
    use: "You want a job to spec against instead of inventing one.",
  },
  {
    file: "sample-200.csv",
    title: "Sample, 200 rows",
    use: "You are working in a chat assistant and want to paste the data in.",
  },
  {
    file: "deals-10k.csv",
    title: "The full set, 10,000 rows",
    use: "Fine for a coding agent that can read a file; too large to paste into a chat window.",
  },
];

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
          Eight files. Take them and use them.
        </h1>
        <p className="mt-4 leading-relaxed" style={{ color: "var(--text-dim)" }}>
          These are the artifacts the class is built on, not a summary of it.
          They are Markdown so they can go straight into a repository or an
          agent&rsquo;s context. Nothing here asks for your email.
        </p>

        <ul className="mt-10 space-y-4">
          {FILES.map((item) => (
            <li key={item.file}>
              <NeuPanel radius="rounded-[22px]" className="px-6 py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="font-display text-[1.1rem] font-semibold">
                    {item.title}
                  </h2>
                  <a
                    href={`/kit/${item.file}`}
                    download
                    className="font-sans text-[11px] uppercase tracking-[0.14em] underline-offset-4 hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    Download ↓
                  </a>
                </div>
                <p className="mt-2 text-[0.95rem]" style={{ color: "var(--text-dim)" }}>
                  {item.use}
                </p>
                <a
                  href={`/kit/${item.file}`}
                  className="mt-3 inline-block font-sans text-[12px] underline underline-offset-4"
                  style={{ color: "var(--text-faint)" }}
                >
                  {item.file}
                </a>
              </NeuPanel>
            </li>
          ))}
        </ul>

        <h2 className="mt-16 font-display text-[clamp(1.4rem,4vw,1.9rem)] font-semibold leading-tight">
          The deal set
        </h2>
        <p className="mt-4 leading-relaxed" style={{ color: "var(--text-dim)" }}>
          A synthetic set of 10,000 sales transactions to build against during
          class, so the fifteen minutes goes into writing a spec rather than into
          deciding what to build. Nobody needs an account, and nothing you run can
          change it.
        </p>

        <ul className="mt-8 space-y-4">
          {DEAL_SET.map((item) => (
            <li key={item.file}>
              <NeuPanel radius="rounded-[22px]" className="px-6 py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-[1.1rem] font-semibold">
                    {item.title}
                  </h3>
                  <a
                    href={`${BUCKET}/${item.file}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans text-[11px] uppercase tracking-[0.14em] underline-offset-4 hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    Open ↗
                  </a>
                </div>
                <p className="mt-2 text-[0.95rem]" style={{ color: "var(--text-dim)" }}>
                  {item.use}
                </p>
                <a
                  href={`${BUCKET}/${item.file}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block break-all font-sans text-[12px] underline underline-offset-4"
                  style={{ color: "var(--text-faint)" }}
                >
                  {`${BUCKET}/${item.file}`}
                </a>
              </NeuPanel>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex gap-6">
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
