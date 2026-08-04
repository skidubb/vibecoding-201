"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { sections } from "@/content/sections";
import {
  computeStops,
  stopScrollTop,
  nearestStopIndex,
  type Stop,
} from "@/lib/stops";

type DeckState = {
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  goToIndex: (i: number) => void;
  next: () => void;
  prev: () => void;
  total: number;
  /**
   * Re-measure the stop grid. Interactive sections change height after mount —
   * a poll's result bars appear, a sign-in card expands — and the stop *count*
   * is not otherwise recomputed, only each stop's scroll position.
   */
  recompute: () => void;
};

/** Surfaces that own every keystroke while focused. */
const TYPING_SELECTOR =
  "input, textarea, select, [contenteditable='true'], [data-deck-keys='off']";

/** Controls the browser activates with Space. */
const ACTIVATABLE_SELECTOR = "button, a, [role='button']";

const DeckContext = createContext<DeckState | null>(null);

export function useDeck() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error("useDeck must be used inside <DeckProvider>");
  return ctx;
}

/**
 * Owns the single scroll pipeline for the whole page.
 *
 * Lenis animates native scrollTop, which keeps Motion's useScroll values honest
 * and lets presenter-key jumps reuse the exact same mechanism as wheel input —
 * so nothing fights anything.
 */
export function DeckProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const stopRef = useRef(0);
  const stopsRef = useRef<Stop[]>([]);

  const rebuildRef = useRef<() => void>(() => {});

  // Stops depend on measured heights, so they are built after mount and
  // rebuilt on resize (a presenter switching to a projector changes both).
  useEffect(() => {
    const rebuild = () => {
      stopsRef.current = computeStops();
    };
    rebuildRef.current = rebuild;
    rebuild();
    // Fonts and images settle after first paint and change section heights.
    const t = window.setTimeout(rebuild, 1200);
    window.addEventListener("resize", rebuild);

    // Interactive sections grow and shrink long after load. Debounced, because
    // a spring animating a panel's height would otherwise re-measure every
    // section on every frame.
    let debounce = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(rebuild, 150);
    });
    observer.observe(document.body);

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(debounce);
      observer.disconnect();
      window.removeEventListener("resize", rebuild);
    };
  }, []);

  const recompute = useCallback(() => rebuildRef.current(), []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const goToStop = useCallback((i: number) => {
    const list = stopsRef.current;
    if (!list.length) return;
    const clamped = Math.max(0, Math.min(list.length - 1, i));
    stopRef.current = clamped;
    const target = stopScrollTop(list[clamped]);
    setActiveIndex(list[clamped].sectionIndex);
    // Release focus from whatever was clicked, so the next Space press advances
    // the deck instead of re-activating a rail tick.
    (document.activeElement as HTMLElement | null)?.blur?.();
    if (lenisRef.current) {
      // Long jumps land instantly; neighbouring stops keep the ease.
      //
      // An eased scroll travels through every section between here and there,
      // and each one it crosses fires its reveals, its parallax transforms and
      // its lazy media. Over one slide that is nothing. Over nineteen it is
      // every scroll-linked animation in the deck running inside 1.1s, which
      // saturates the main thread: the rail jumps measured 10 to 18 seconds of
      // black screen before the target painted, with no chrome and no counter,
      // while the wheel — which crosses the same distance gradually — stayed
      // smooth. `immediate` sets scrollTop without animating, so the sections
      // in between are never in view and never do the work.
      //
      // The threshold is a viewport and a half: far enough that adjacent stops,
      // including tall sections walked a beat at a time, keep the motion a
      // presenter navigates by.
      const far = Math.abs(target - window.scrollY) > window.innerHeight * 1.5;
      // `force` so a jump issued while the previous one is still easing is
      // honoured rather than swallowed by its own lock. Without it a presenter
      // pressing twice in quick succession loses the first move but keeps the
      // stop it consumed, which skips a beat — the deck arrives a slide ahead
      // of where they are in the talk.
      lenisRef.current.scrollTo(target, {
        duration: 1.1,
        lock: true,
        force: true,
        immediate: far,
      });
    } else {
      window.scrollTo({ top: target });
    }
  }, []);

  /** Jump to a section by index (used by the rail). Lands on its first stop. */
  const goToIndex = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(sections.length - 1, i));
      const idx = stopsRef.current.findIndex((s) => s.sectionIndex === clamped);
      goToStop(idx === -1 ? 0 : idx);
    },
    [goToStop]
  );

  /**
   * The stop to advance from. Normally the last one we jumped to — so quick
   * repeated presses queue up instead of all resolving to the same place while
   * a jump is still animating. If the presenter has wheeled away from it, fall
   * back to wherever they actually are.
   */
  const baseStop = useCallback(() => {
    const list = stopsRef.current;
    if (!list.length) return 0;
    const current = list[Math.min(stopRef.current, list.length - 1)];
    const drifted =
      Math.abs(window.scrollY - stopScrollTop(current)) > window.innerHeight * 0.6;
    return drifted ? nearestStopIndex(list) : stopRef.current;
  }, []);

  /**
   * Advance, against a grid measured now rather than whenever it was last
   * rebuilt.
   *
   * Stop *positions* were always read live, but the stop *count* came from the
   * cached grid, so a section that grew after the last rebuild kept the number
   * of stops it had when it was shorter. The result on stage is two different
   * faults from the same cause: a press that moves nothing, and a section
   * whose tail is skipped entirely because the stop that would have shown it
   * was never in the list. One measuring pass per key press costs nothing next
   * to a 1.1s scroll animation.
   */
  const step = useCallback(
    (delta: number) => {
      const intent = stopsRef.current[stopRef.current];
      rebuildRef.current();
      const list = stopsRef.current;
      if (!list.length) return;

      // A rebuild can renumber the grid, so the intent is carried across by
      // identity rather than by index — otherwise adding a stop mid-deck
      // silently reassigns every index after it, and the queueing that makes
      // two quick presses land two stops later would send the deck somewhere
      // else entirely.
      if (intent) {
        let best = -1;
        let bestDistance = Infinity;
        list.forEach((stop, i) => {
          if (stop.sectionId !== intent.sectionId) return;
          const distance = Math.abs(stop.fraction - intent.fraction);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = i;
          }
        });
        if (best >= 0) stopRef.current = best;
      }

      goToStop(baseStop() + delta);
    },
    [goToStop, baseStop],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  // Presenter keys. Space/arrows jump section to section for live delivery;
  // the rest of the time the page scrolls freely.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      // Typing surfaces own every key. Interactive islands (a poll widget, a
      // prompt block) opt out with data-deck-keys="off".
      if (target?.closest(TYPING_SELECTOR)) return;

      // Space is the only key the browser natively binds to a control, so it is
      // the only one a focused button gets to keep. Arrows must keep working —
      // the rail's ticks are buttons, and stealing arrows after a tick click
      // would strand the presenter until they clicked empty page.
      if (e.key === " " && target?.closest(ACTIVATABLE_SELECTOR)) return;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          prev();
          break;
        case "Home":
          e.preventDefault();
          goToIndex(0);
          break;
        case "End":
          e.preventDefault();
          goToIndex(sections.length - 1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goToIndex]);

  const value = useMemo(
    () => ({
      activeIndex,
      setActiveIndex,
      goToIndex,
      next,
      prev,
      total: sections.length,
      recompute,
    }),
    [activeIndex, goToIndex, next, prev, recompute]
  );

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}
