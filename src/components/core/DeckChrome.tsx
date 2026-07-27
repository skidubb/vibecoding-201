"use client";

import { sections } from "@/content/sections";
import { useDeck } from "@/lib/deck-context";

/**
 * Theme mirror for fixed UI.
 *
 * Sections carry their own `[data-theme]`, but anything `position: fixed` sits
 * outside them and inherits nothing — which is why the rail used to hardcode
 * lavender and magenta and only looked right on dark chapters. This wrapper
 * re-declares the active section's theme at the top of the tree, so every piece
 * of floating chrome can style itself from `var(--text)`, `var(--accent)` and
 * friends exactly like a panel inside a section does.
 *
 * `display: contents` keeps the wrapper from generating a box of its own — it
 * exists only to hold the theme attribute — while custom properties still
 * inherit through it. Each child positions itself.
 */
export function DeckChrome({ children }: { children: React.ReactNode }) {
  const { activeIndex } = useDeck();
  const theme = sections[activeIndex]?.theme ?? "dark";

  return (
    <div id="deck-chrome" data-theme={theme} className="contents">
      {children}
    </div>
  );
}
