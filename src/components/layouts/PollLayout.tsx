"use client";

import { CONTAINER, Footnote, Kicker, SectionHeader, type LayoutProps } from "./shared";
import { PollWidget } from "@/components/interactive/PollWidget";
import { NeuPanel, Reveal } from "@/components/neu/Neu";

/**
 * A poll section. Never tall: the widget reserves room for its own result bars
 * so the section's height does not change when the first vote lands, which
 * would otherwise invalidate the measured presenter stop grid mid-class.
 */
export function PollLayout({ section }: LayoutProps) {
  const poll = section.poll;
  if (!poll) return null;

  return (
    <div className={CONTAINER}>
      <SectionHeader section={section} />

      {section.footnote && (
        <Reveal delay={0.12}>
          <NeuPanel variant="flat" radius="rounded-2xl" className="mt-8 px-6 py-5">
            <p
              className="max-w-3xl text-[0.98rem] leading-relaxed"
              style={{ color: "var(--text-dim)" }}
            >
              {section.footnote}
            </p>
          </NeuPanel>
        </Reveal>
      )}

      <PollWidget
        slug={poll.slug}
        options={poll.options}
        sectionId={section.id}
        variant={poll.variant}
      />

      {section.kicker && <Kicker>{section.kicker}</Kicker>}
    </div>
  );
}
