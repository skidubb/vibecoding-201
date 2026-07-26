import { sections } from "@/content/sections";

export type Stop = {
  sectionIndex: number;
  sectionId: string;
  /** How far into the section's scrollable overshoot to land, 0–1. */
  fraction: number;
};

/**
 * Presenter stops, measured from the live DOM.
 *
 * A section that fits the viewport is one stop. Anything taller gets enough
 * stops to walk through it — the scroll-drawn charts and the six-stop timeline
 * would otherwise force the presenter to scrub with the wheel mid-sentence.
 * Measuring rather than hardcoding means this stays correct at any window size.
 */
export function computeStops(): Stop[] {
  const vh = window.innerHeight;
  return sections.flatMap((section, sectionIndex) => {
    const el = document.getElementById(section.id);
    const height = el?.offsetHeight ?? vh;
    // 0.8 so a section only slightly taller than the viewport still gets a
    // second stop rather than leaving its last rows permanently below the fold.
    const count = Math.min(4, Math.max(1, Math.ceil(height / (vh * 0.8))));
    return Array.from({ length: count }, (_, i) => ({
      sectionIndex,
      sectionId: section.id,
      // Nudge off the very top so a section's entrance animations have played.
      fraction: count === 1 ? 0 : (i / (count - 1)) * 0.92 + 0.02,
    }));
  });
}

/** Absolute scroll position for a stop, measured at call time. */
export function stopScrollTop(stop: Stop): number {
  const el = document.getElementById(stop.sectionId);
  if (!el) return 0;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const overshoot = Math.max(0, el.offsetHeight - window.innerHeight);
  return top + overshoot * stop.fraction;
}

/** The stop nearest the current scroll position, to resync after wheeling. */
export function nearestStopIndex(list: Stop[]): number {
  const y = window.scrollY;
  let best = 0;
  let bestDist = Infinity;
  list.forEach((stop, i) => {
    const dist = Math.abs(stopScrollTop(stop) - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
}
