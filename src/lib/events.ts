"use client";

import { supabase } from "@/lib/supabase/client";

/**
 * The site's own telemetry, which slide 33 argues every tool needs.
 *
 * Fire and forget, and deliberately unawaited: an analytics write must never
 * be able to delay or fail the thing the reader actually asked for. Errors are
 * swallowed here and nowhere else — a failed *vote* is surfaced loudly, because
 * the reader is owed an answer about that one.
 *
 * Throttled client-side. On a public URL with anonymous sign-in, an unbounded
 * insert path is a way to fill a 500 MB database with rows nobody reads.
 */
const WINDOW_MS = 10_000;
const MAX_PER_WINDOW = 10;

let windowStart = 0;
let sent = 0;

export type EventName =
  | "poll_voted"
  | "prompt_copied"
  | "link_clicked"
  | "signup_completed"
  | "kit_requested";

export function logEvent(
  name: EventName,
  sectionId?: string,
  props: Record<string, unknown> = {},
): void {
  const client = supabase();
  if (!client) return;

  const now = Date.now();
  if (now - windowStart > WINDOW_MS) {
    windowStart = now;
    sent = 0;
  }
  if (sent >= MAX_PER_WINDOW) return;
  sent += 1;

  void client
    .from("events")
    .insert({ name, section_id: sectionId ?? null, props })
    .then(undefined, () => {});
}
