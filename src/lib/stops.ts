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
    // Stops are derived from the *overshoot* — how far a section can actually
    // scroll — not its raw height. Deriving them from height gave any section
    // one viewport tall two stops that both resolved to the same scrollTop,
    // because there was nothing to travel between them: the presenter pressed
    // right, nothing moved, and they pressed again. One dead press per
    // full-height section, live, all the way down the deck.
    const overshoot = Math.max(0, height - vh);
    // Anything past SLACK is content, and content gets a stop that reveals it.
    //
    // This used to divide by half a viewport and floor, which granted a second
    // stop only after a section overran by 50% of the screen. Sections that
    // overran by less got exactly one stop at their top and everything below
    // the fold was unreachable by any key — on a 1280x720 laptop that was 22 of
    // 40 sections, hiding as much as 324px of a section nobody could scroll to
    // without abandoning the arrow keys mid-sentence. Ceiling, so one pixel of
    // real overflow is still worth a press.
    // One section's bottom padding (`md:py-24`). A section overrunning by less
    // than this is spilling empty padding, not copy — the room has already seen
    // everything it says, and spending a whole key press to travel 40px reads
    // as a broken remote. Past it, real copy is below the fold.
    const SLACK = 96;
    const count =
      overshoot <= SLACK ? 1 : 1 + Math.min(3, Math.ceil(overshoot / (vh * 0.75)));
    return Array.from({ length: count }, (_, i) => ({
      sectionIndex,
      sectionId: section.id,
      // The first stop nudges off the very top so a section's entrance
      // animations have played; the last lands flush with the bottom, because
      // stopping 8% short of it is how the tail goes missing.
      fraction: count === 1 ? 0 : 0.02 + (i / (count - 1)) * 0.98,
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
