"use client";

import { Glow } from "@/components/core/ParallaxLayer";
import { SurfacedPanel } from "@/components/interactive/SurfacedPanel";
import { CONTAINER, SectionBackdrop, SectionHeader, SectionTail, type LayoutProps } from "./shared";

/**
 * The room's own work, read back to it.
 *
 * Its own slide rather than a panel on the exercise, because by the time the
 * presenter is reading two specs aloud the room has scrolled past the box they
 * wrote them in — and because a slide is a place to stand. It renders no control
 * that writes; see `SurfacedPanel`.
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
