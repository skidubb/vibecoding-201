/**
 * The job this browser has picked, mirrored client-side.
 *
 * Postgres (`profiles.job`, written through `set_job()`) stays the source of
 * truth across reloads. This store exists for the one session where the picker
 * and the sections that depend on the pick are on the same page: every section
 * is mounted at once, and a component that reads the profile only in its mount
 * effect shows the old job until a full reload. Scott hit exactly that in QA —
 * changing the selection did not change the prompt further down the deck.
 *
 * `useSyncExternalStore(subscribeJob, currentJob, () => null)` in a consumer
 * re-renders it the moment `publishJob` runs. The server snapshot is null
 * because no job exists before the browser has a session.
 */

type Listener = () => void;

let job: string | null = null;
const listeners = new Set<Listener>();

export function publishJob(next: string | null) {
  if (job === next) return;
  job = next;
  for (const listener of listeners) listener();
}

export function subscribeJob(listener: Listener) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export function currentJob() {
  return job;
}
