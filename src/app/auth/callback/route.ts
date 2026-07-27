import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where both sign-in flows land.
 *
 * Google returns an authorization code and takes `exchangeCodeForSession`.
 * An emailed link returns a `token_hash` and a `type`, and takes `verifyOtp` —
 * they are different calls and using one for the other fails silently enough
 * to look like a broken login.
 *
 * Errors go to a page that says what happened. A redirect back to the deck
 * with no session would leave someone convinced they had signed in.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const wantsKit = url.searchParams.get("kit") === "1";

  const supabase = await createClient();

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash
      ? await supabase.auth.verifyOtp({
          type: (type as "email") ?? "email",
          token_hash: tokenHash,
        })
      : { error: new Error("no credential in callback") };

  if (error) {
    return NextResponse.redirect(new URL("/auth/error", url.origin));
  }

  // Consent, recorded against the account that just gave it. Only ever set to
  // true here — clearing it is the owner's to do, via their own profile row.
  if (wantsKit) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ wants_kit: true }).eq("id", user.id);
    }
  }

  return NextResponse.redirect(new URL("/", url.origin));
}
