import { createBrowserClient } from "@supabase/ssr";

/**
 * Whether a backend is configured at all.
 *
 * Read as two whole identifiers, never destructured from `process.env`. Next
 * inlines `process.env.NEXT_PUBLIC_*` at build time by literal substitution;
 * pulling them off a destructured object leaves `undefined` in the bundle and
 * the site would quietly render its offline state in production.
 */
export const backendConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) &&
  process.env.NEXT_PUBLIC_BACKEND_DISABLED !== "1";

let cached: ReturnType<typeof createBrowserClient> | null = null;

/**
 * The browser client, or null when no backend is configured.
 *
 * Null is a supported state, not an error path. The deck has to present from a
 * laptop with no network and read from a link months after the Supabase project
 * is gone, so every caller handles null and the page degrades to a static
 * reading experience rather than breaking.
 */
export function supabase() {
  if (!backendConfigured) return null;
  cached ??= createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
  return cached;
}
