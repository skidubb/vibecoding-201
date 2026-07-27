import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server client, for the auth callback and the presenter routes.
 *
 * `cookies()` is awaited — it is async in this version of Next. The `setAll`
 * callback takes a second `headers` argument in @supabase/ssr 0.12; older
 * examples show a one-argument form and a deprecated get/set/remove shape,
 * and neither is what this version calls.
 */
export async function createClient() {
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              store.set(name, value, options);
            }
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Safe to ignore: the proxy refreshes the session on the way in.
          }
        },
      },
    },
  );
}
