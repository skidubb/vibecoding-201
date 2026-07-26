"use client";

import { useEffect, useRef } from "react";
import { useDeck } from "@/lib/deck-context";

/**
 * Every section is wrapped in this. It owns three things:
 *  - the anchor id presenter keys scroll to
 *  - the [data-theme] flip that restyles all neumorphic children beneath it
 *  - the observer that reports which section is centered, for the rail
 */
export function SectionShell({
  id,
  index,
  theme,
  children,
  className = "",
  tall = false,
}: {
  id: string;
  index: number;
  theme: "dark" | "light";
  children: React.ReactNode;
  className?: string;
  /** Tall sections host sticky scroll-driven charts. */
  tall?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { setActiveIndex } = useDeck();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActiveIndex(index);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index, setActiveIndex]);

  return (
    <section
      ref={ref}
      id={id}
      data-theme={theme}
      // No `overflow-hidden` on tall sections: it would make this the scroll
      // container and silently break the sticky chart stage inside. Those
      // sections clip on their own inner stage instead.
      className={`relative isolate w-full grain ${
        tall
          ? ""
          : "flex min-h-screen items-center overflow-hidden py-20 md:py-24"
      } ${className}`}
      style={{ background: "var(--surface)", color: "var(--text)" }}
    >
      {children}
    </section>
  );
}
