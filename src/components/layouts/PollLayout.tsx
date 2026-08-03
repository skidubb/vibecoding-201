"use client";

import { CONTAINER, Footnote, Kicker, SectionBackdrop, SectionHeader, Strip, Deeper, type LayoutProps } from "./shared";
import { LinkChips } from "@/components/layouts/LinkChips";
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
    <>
      <SectionBackdrop section={section} />
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
        systemOptionId={poll.systemOptionId}
      />

      {/* Used by the Q&A slide for its four categories. A poll section may not
          carry a `kicker`: `registry-integrity` fails the build if it does, because
          a kicker under an open poll is commentary shown while the room is still
          voting. Without `strip`, this layout had nowhere to render content other
          than the question. */}
      {section.strip && <Strip {...section.strip} />}
      {/* The Q&A slide is the last one, so the contact line renders here. */}
      {section.links && <LinkChips links={section.links} />}
      {section.kicker && <Kicker>{section.kicker}</Kicker>}
      {section.deeper && <Deeper deeper={section.deeper} sectionId={section.id} />}
    </div>
    </>
  );
}
