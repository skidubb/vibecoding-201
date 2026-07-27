"use client";

import { sections, type LayoutKind, type Section } from "@/content/sections";
import { DeckProvider } from "@/lib/deck-context";
import { SectionShell } from "@/components/core/SectionShell";
import { ProgressRail } from "@/components/core/ProgressRail";
import { DeckChrome } from "@/components/core/DeckChrome";
import { PresenterBar } from "@/components/interactive/PresenterBar";
import { HeroLayout } from "@/components/layouts/HeroLayout";
import { SplitLayout } from "@/components/layouts/SplitLayout";
import { ClaimLayout } from "@/components/layouts/ClaimLayout";
import { CardsLayout } from "@/components/layouts/CardsLayout";
import { TimelineLayout } from "@/components/layouts/TimelineLayout";
import { ChartLayout } from "@/components/layouts/ChartLayout";
import { LoopLayout } from "@/components/layouts/LoopLayout";
import { CtaLayout } from "@/components/layouts/CtaLayout";
import { PromptLayout } from "@/components/layouts/PromptLayout";
import { PollLayout } from "@/components/layouts/PollLayout";
import { ExerciseLayout } from "@/components/layouts/ExerciseLayout";

type LayoutComponent = (props: { section: Section; index: number }) => React.ReactNode;

/** Adding a slide means adding a registry entry; only new shapes need code. */
const LAYOUTS: Record<LayoutKind, LayoutComponent> = {
  hero: HeroLayout,
  split: SplitLayout,
  claim: ClaimLayout,
  cards: CardsLayout,
  timeline: TimelineLayout,
  chart: ChartLayout,
  loop: LoopLayout,
  cta: CtaLayout,
  prompt: PromptLayout,
  poll: PollLayout,
  exercise: ExerciseLayout,
};

/**
 * Layouts that manage their own tall/sticky geometry.
 *
 * `tall` strips min-h-screen, vertical centering, padding and overflow-hidden
 * from the shell, so a layout only belongs here if it supplies all four itself.
 * Interactive layouts never do — they render in normal flow and reserve fixed
 * height for their output so the stop grid stays stable.
 */
const TALL_LAYOUTS: ReadonlySet<LayoutKind> = new Set<LayoutKind>(["chart"]);

export function Deck() {
  return (
    <DeckProvider>
      <DeckChrome>
        <ProgressRail />
        <PresenterBar />
      </DeckChrome>
      <main>
        {sections.map((section, index) => {
          const Layout = LAYOUTS[section.layout];
          const tall = TALL_LAYOUTS.has(section.layout);
          return (
            <SectionShell
              key={section.id}
              id={section.id}
              index={index}
              theme={section.theme}
              tall={tall}
            >
              <Layout section={section} index={index} />
            </SectionShell>
          );
        })}
      </main>
    </DeckProvider>
  );
}
