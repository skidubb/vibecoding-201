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
};

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

  // Stops depend on measured heights, so they are built after mount and
  // rebuilt on resize (a presenter switching to a projector changes both).
  useEffect(() => {
    const rebuild = () => {
      stopsRef.current = computeStops();
    };
    rebuild();
    // Fonts and images settle after first paint and change section heights.
    const t = window.setTimeout(rebuild, 1200);
    window.addEventListener("resize", rebuild);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", rebuild);
    };
  }, []);

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
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 1.1, lock: true });
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

  const next = useCallback(() => goToStop(baseStop() + 1), [goToStop, baseStop]);
  const prev = useCallback(() => goToStop(baseStop() - 1), [goToStop, baseStop]);

  // Presenter keys. Space/arrows jump section to section for live delivery;
  // the rest of the time the page scrolls freely.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;

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
    }),
    [activeIndex, goToIndex, next, prev]
  );

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}
