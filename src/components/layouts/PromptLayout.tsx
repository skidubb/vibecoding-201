"use client";

import { CONTAINER, SectionBackdrop, SectionHeader, SectionTail, type LayoutProps } from "./shared";
import { LinkChips } from "./LinkChips";
import { PromptBlock } from "@/components/interactive/PromptBlock";
import { Reveal } from "@/components/neu/Neu";

/**
 * A section whose payload is text the reader is meant to take with them.
 *
 * Never tall. The blocks are fixed-height content in normal flow, so the
 * measured stop grid stays stable — an interactive section that grows after
 * mount is what stale stops are made of.
 */
export function PromptLayout({ section }: LayoutProps) {
  const prompts = section.prompts ?? [];

  return (
    <>
      <SectionBackdrop section={section} />
    <div className={CONTAINER}>
      <SectionHeader section={section} />

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {prompts.map((prompt, i) => (
          <Reveal key={prompt.id} delay={0.1 + i * 0.08}>
            <PromptBlock
              label={prompt.label}
              text={prompt.text}
              caption={prompt.caption}
            />
          </Reveal>
        ))}
      </div>

      {section.links && <LinkChips links={section.links} />}
      <SectionTail section={section} />
    </div>
    </>
  );
}
