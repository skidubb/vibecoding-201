"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { CONTAINER, SectionBackdrop, SectionHeader, SectionTail, type LayoutProps } from "./shared";
import { JobPicker } from "@/components/interactive/JobPicker";

/**
 * The six jobs, and the one the attendee takes through the hour.
 *
 * A layout of its own rather than `cards` with a flag: the cards here are
 * controls that write to a profile, and a grid of six selectable panels is a
 * genuinely different shape from the read-only card grids elsewhere. Adding a
 * selection mode to `CardsLayout` would have put a write path inside the
 * component eight other sections render through.
 */
export function JobsLayout({ section }: LayoutProps) {
  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="left-[-14vw] bottom-[-10vh]" tone="magenta" size={46} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />
        {section.jobs && section.jobs.length > 0 && <JobPicker jobs={section.jobs} />}
        <SectionTail section={section} />
      </div>
    </>
  );
}
