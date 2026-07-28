"use client";

import type { LinkRef } from "@/content/sections";
import { Reveal } from "@/components/neu/Neu";
import { logEvent } from "@/lib/events";

/**
 * Outbound references, rendered under any layout that carries `links`.
 *
 * CLI entries show their install command as a selectable monospace line rather
 * than a second copy button — one copy affordance per block is enough, and the
 * command is short enough to read and retype.
 */
export function LinkChips({ links, className = "mt-9" }: { links: LinkRef[]; className?: string }) {
  if (!links.length) return null;

  return (
    <Reveal delay={0.3}>
      <ul className={`flex flex-wrap gap-3 ${className}`} data-deck-keys="off">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              // A mail link in a new tab is a blank tab next to the mail app.
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer noopener"
              onClick={() => logEvent("link_clicked", undefined, { label: link.label })}
              className="neu-flat neu-edge group flex flex-col gap-1 rounded-2xl px-5 py-3 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span className="flex items-baseline gap-2">
                <span
                  className="font-display text-[0.95rem] font-medium"
                  style={{ color: "var(--text)" }}
                >
                  {link.label}
                </span>
                <span
                  aria-hidden
                  className="text-[0.8rem] transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ color: "var(--accent)" }}
                >
                  ↗
                </span>
              </span>

              {link.note && (
                <span className="text-[0.82rem]" style={{ color: "var(--text-dim)" }}>
                  {link.note}
                </span>
              )}

              {/* Body colour, not faint: an install command set dimmer than
                  the title beside it reads as a disabled control rather than
                  a line to type. */}
              {link.install && (
                <code
                  className="mt-1 font-mono text-[0.84rem]"
                  style={{ color: "var(--text-dim)" }}
                >
                  {link.install}
                </code>
              )}
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
