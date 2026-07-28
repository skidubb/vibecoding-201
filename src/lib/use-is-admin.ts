"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

/**
 * One is_admin() ask per page load, shared by every widget that mounts.
 *
 * Admin is asked of the database, never inferred in the browser — the answer
 * only changes what renders, and every write it unlocks is still gated by RLS
 * on the other side. The promise is cached at module level so PollWidget ×4,
 * the presenter bar and the console chip do not each fire their own RPC.
 * OAuth sign-in always navigates, so a page load is the right cache lifetime;
 * an in-page anonymous sign-in can only go false → false.
 *
 * A plain hook rather than context: it has to work inside DeckProvider
 * (PresenterBar) and outside it (PollWidget on /vote), and a provider would
 * widen the client boundary for no benefit.
 */
let cached: Promise<boolean> | null = null;

export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const client = supabase();
    if (!client) return; // backend off — nobody is an admin here
    const promise: Promise<boolean> = (cached ??= client.rpc("is_admin").then(
      (result: { data: unknown }) => result.data === true,
      () => false,
    ));
    let cancelled = false;
    void promise.then((v) => {
      if (!cancelled && v) setIsAdmin(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return isAdmin;
}
