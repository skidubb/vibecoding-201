"use client";

import { sections, type LayoutKind, type Section } from "@/content/sections";
import { DeckProvider } from "@/lib/deck-context";
import { SectionShell } from "@/components/core/SectionShell";
import { ProgressRail } from "@/components/core/ProgressRail";
import { HeroLayout } from "@/components/layouts/HeroLayout";
import { SplitLayout } from "@/components/layouts/SplitLayout";
import { ClaimLayout } from "@/components/layouts/ClaimLayout";
import { CardsLayout } from "@/components/layouts/CardsLayout";
import { TimelineLayout } from "@/components/layouts/TimelineLayout";
import { ChartLayout } from "@/components/layouts/ChartLayout";
import { LoopLayout } from "@/components/layouts/LoopLayout";
import { CtaLayout } from "@/components/layouts/CtaLayout";

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
};

export function Deck() {
  return (
    <DeckProvider>
      <ProgressRail />
      <main>
        {sections.map((section, index) => {
          const Layout = LAYOUTS[section.layout];
          // Chart sections manage their own tall/sticky geometry.
          const tall = section.layout === "chart";
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
