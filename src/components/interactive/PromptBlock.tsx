"use client";

import { useEffect, useRef, useState } from "react";
import { NeuPanel } from "@/components/neu/Neu";
import { logEvent } from "@/lib/events";

type CopyState = "idle" | "copied" | "failed";

/**
 * A prompt the reader is meant to take away and run.
 *
 * `data-deck-keys="off"` opts the whole block out of the presenter shortcuts,
 * so a reader tabbing to the copy button and pressing Space copies the prompt
 * instead of advancing the deck under the presenter.
 *
 * The failure branch is not decoration. `navigator.clipboard` rejects on an
 * insecure origin and in some embedded browsers, and a copy button that
 * silently does nothing is precisely the "fails quietly" behaviour the class
 * spends a section arguing against. On failure the text is selected instead,
 * so ⌘C still works and the reader is told to use it.
 */
export function PromptBlock({
  label,
  text,
  caption,
  onCopy,
}: {
  label: string;
  text: string;
  caption?: string;
  onCopy?: (label: string) => void;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const bodyRef = useRef<HTMLPreElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function announce(next: CopyState) {
    setState(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2400);
  }

  function selectBody() {
    const node = bodyRef.current;
    if (!node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      announce("copied");
      logEvent("prompt_copied", undefined, { prompt: label });
      onCopy?.(label);
    } catch {
      selectBody();
      announce("failed");
    }
  }

  return (
    <div data-deck-keys="off">
      <NeuPanel variant="inset" radius="rounded-[22px]" className="overflow-hidden">
        <div
          className="flex items-center justify-between gap-4 border-b px-6 py-3"
          style={{ borderColor: "var(--edge)" }}
        >
          <span
            className="font-sans text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--text-dim)" }}
          >
            {label}
          </span>

          <button
            type="button"
            onClick={copy}
            className="rounded-full px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200"
            style={{
              color: state === "idle" ? "var(--text-dim)" : "var(--accent)",
              backgroundColor: "transparent",
            }}
          >
            {state === "copied" ? "Copied" : state === "failed" ? "Press ⌘C" : "Copy"}
          </button>
        </div>

        <pre
          ref={bodyRef}
          className="overflow-x-auto px-6 py-5 font-mono text-[clamp(0.8rem,1vw,0.92rem)] leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--text)" }}
        >
          {text}
        </pre>
      </NeuPanel>

      {/* Politely announced so a screen reader learns the copy succeeded; the
          button's own label changing is not enough on its own. */}
      <p aria-live="polite" className="sr-only">
        {state === "copied"
          ? `${label} copied to the clipboard`
          : state === "failed"
            ? `${label} selected. Copy it with Command or Control C.`
            : ""}
      </p>

      {caption && (
        <p
          className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed"
          style={{ color: "var(--text-dim)" }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
