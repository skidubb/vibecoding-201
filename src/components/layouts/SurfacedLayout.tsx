"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { SurfacedPanel } from "@/components/interactive/SurfacedPanel";
import { CONTAINER, SectionBackdrop, SectionHeader, SectionTail, type LayoutProps } from "./shared";

/**
 * The slide that shows the specs shared with the room.
 *
 * A separate slide rather than a panel on the exercise: by the time the presenter
 * reads two specs aloud, the room has scrolled past the box they were written in,
 * and the presenter needs a slide to stop on. It renders no control that writes.
 * See `SurfacedPanel`.
 */
export function SurfacedLayout({ section }: LayoutProps) {
  return (
    <>
      <SectionBackdrop section={section} />
      <Glow className="left-[-12vw] top-[-10vh]" tone="magenta" size={44} />

      <div className={CONTAINER}>
        <SectionHeader section={section} />
        {section.surfaced && (
          <SurfacedPanel
            exerciseId={section.surfaced.exerciseId}
            empty={section.surfaced.empty}
          />
        )}
        <SectionTail section={section} />
      </div>
    </>
  );
}
