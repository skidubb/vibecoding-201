import type { Metadata } from "next";
import { NeuBadge, NeuPanel } from "@/components/neu/Neu";

/**
 * The participant kit.
 *
 * Six files, served as plain Markdown from `public/kit/` rather than rendered.
 * That is the point of them: they are meant to be dropped into a repository,
 * pasted into an agent, or printed — not read once on a website. A page that
 * only rendered them prettily would make the reader copy out of a browser.
 *
 * No sign-in. The class argues that a tool should ask for an account when it
 * needs one, and this needs nothing: gating a checklist behind an email would
 * be a lead-capture form wearing a lesson's clothes.
 */

export const metadata: Metadata = {
  title: "Participant kit · Vibecoding 201",
  description:
    "The six artifacts from Building Production GTM Tools: readiness checklist, prompt pack, agent instructions, ownership card, CLI reference.",
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
    file: "README.md",
    title: "Read me first",
    use: "You want the order to use the other five in.",
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
          Six files. Take them and use them.
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
