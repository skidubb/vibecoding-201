import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Session refresh.
 *
 * This file is `proxy.ts`, not `middleware.ts`. Next 16 renamed the convention;
 * `middleware.ts` still works but is deprecated, and having both is a build
 * error. The runtime here is Node and cannot be configured — setting `runtime`
 * throws — so any advice to pair Supabase auth with the edge runtime does not
 * apply.
 *
 * The matcher deliberately excludes `/`. The deck is a static document served
 * from the CDN: routing it through here would make every load a function
 * invocation returning Set-Cookie, which is exactly what stops a response being
 * cached. Two hundred people opening the link at once should cost one cached
 * document. The browser client refreshes its own session on the deck, which is
 * all a single-page document needs.
 *
 * `/admin` is here because the console's server component reads the session
 * but cannot write refreshed cookies — a server component renders after
 * headers are gone. This pass is what keeps an expired-but-refreshable
 * presenter session signed in at the console door.
 */
export async function proxy(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [key, value] of Object.entries(headers ?? {})) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  // Nothing between the client's construction and this call: it is what
  // refreshes an expired token and writes the new cookies through setAll.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  matcher: ["/signin", "/vote", "/admin/:path*", "/auth/:path*"],
};
