import Image, { type StaticImageData } from "next/image";

import anthropic from "@/assets/logos/anthropic.svg";
import anthropicMono from "@/assets/logos/anthropic-mono.svg";
import antigravity from "@/assets/logos/antigravity.svg";
import antigravityMono from "@/assets/logos/antigravity-mono.svg";
import aws from "@/assets/logos/aws.svg";
import awsMono from "@/assets/logos/aws-mono.svg";
import base44 from "@/assets/logos/base44.svg";
import base44Mono from "@/assets/logos/base44-mono.svg";
import claude from "@/assets/logos/claude.svg";
import cursor from "@/assets/logos/cursor.svg";
import cursorMono from "@/assets/logos/cursor-mono.svg";
import github from "@/assets/logos/github.svg";
import githubMono from "@/assets/logos/github-mono.svg";
import google from "@/assets/logos/google.svg";
import googleMono from "@/assets/logos/google-mono.svg";
import lovable from "@/assets/logos/lovable.svg";
import lovableMono from "@/assets/logos/lovable-mono.svg";
import microsoft from "@/assets/logos/microsoft.svg";
import microsoftMono from "@/assets/logos/microsoft-mono.svg";
import mcp from "@/assets/logos/model-context-protocol.svg";
import mcpMono from "@/assets/logos/model-context-protocol-mono.svg";
import onePassword from "@/assets/logos/1password.svg";
import onePasswordMono from "@/assets/logos/1password-mono.svg";
import openai from "@/assets/logos/openai.svg";
import openaiMono from "@/assets/logos/openai-mono.svg";
import owasp from "@/assets/logos/owasp.svg";
import owaspMono from "@/assets/logos/owasp-mono.svg";
import replit from "@/assets/logos/replit.svg";
import replitMono from "@/assets/logos/replit-mono.svg";
import stripe from "@/assets/logos/stripe.svg";
import stripeMono from "@/assets/logos/stripe-mono.svg";
import pavilion from "@/assets/logos/pavilion.png";
import pavilionMono from "@/assets/logos/pavilion-mono.png";
import postgresql from "@/assets/logos/postgresql.svg";
import posthog from "@/assets/logos/posthog.svg";
import posthogMono from "@/assets/logos/posthog-mono.svg";
import sentry from "@/assets/logos/sentry.svg";
import sentryMono from "@/assets/logos/sentry-mono.svg";
import umami from "@/assets/logos/umami.svg";
import umamiMono from "@/assets/logos/umami-mono.svg";
import supabase from "@/assets/logos/supabase.svg";
import supabaseMono from "@/assets/logos/supabase-mono.svg";
import v0 from "@/assets/logos/v0.svg";
import v0Mono from "@/assets/logos/v0-mono.svg";
import vercel from "@/assets/logos/vercel.svg";
import vercelMono from "@/assets/logos/vercel-mono.svg";

/**
 * Brand marks, paired light and dark.
 *
 * Both variants render and CSS hides one, because sections carry their theme as
 * a `[data-theme]` attribute and no component in this codebase takes a theme
 * prop. Picking in JavaScript would mean threading the section's theme down
 * through every layout.
 *
 * The pairing is not a guess. Every mark was rasterised onto both surfaces and
 * looked at: the colour wordmarks are near-black and disappear on navy, and the
 * mono variants are white and disappear on lavender. `claude` and `postgresql`
 * carry their own colour and read on both, so they have no mono variant.
 */
const MARKS = {
  anthropic: { color: anthropic, mono: anthropicMono, name: "Anthropic" },
  antigravity: { color: antigravity, mono: antigravityMono, name: "Google Antigravity" },
  aws: { color: aws, mono: awsMono, name: "AWS" },
  base44: { color: base44, mono: base44Mono, name: "Base44" },
  claude: { color: claude, mono: claude, name: "Claude" },
  cursor: { color: cursor, mono: cursorMono, name: "Cursor" },
  github: { color: github, mono: githubMono, name: "GitHub" },
  google: { color: google, mono: googleMono, name: "Google" },
  lovable: { color: lovable, mono: lovableMono, name: "Lovable" },
  mcp: { color: mcp, mono: mcpMono, name: "Model Context Protocol" },
  microsoft: { color: microsoft, mono: microsoftMono, name: "Microsoft" },
  onePassword: { color: onePassword, mono: onePasswordMono, name: "1Password" },
  openai: { color: openai, mono: openaiMono, name: "OpenAI" },
  owasp: { color: owasp, mono: owaspMono, name: "OWASP" },
  pavilion: { color: pavilion, mono: pavilionMono, name: "Pavilion" },
  postgresql: { color: postgresql, mono: postgresql, name: "PostgreSQL" },
  posthog: { color: posthog, mono: posthogMono, name: "PostHog" },
  sentry: { color: sentry, mono: sentryMono, name: "Sentry" },
  umami: { color: umami, mono: umamiMono, name: "Umami" },
  replit: { color: replit, mono: replitMono, name: "Replit" },
  stripe: { color: stripe, mono: stripeMono, name: "Stripe" },
  supabase: { color: supabase, mono: supabaseMono, name: "Supabase" },
  v0: { color: v0, mono: v0Mono, name: "v0" },
  vercel: { color: vercel, mono: vercelMono, name: "Vercel" },
} satisfies Record<
  string,
  { color: StaticImageData; mono: StaticImageData; name: string }
>;

export type BrandKey = keyof typeof MARKS;

export function Logo({ brand, height = 24 }: { brand: BrandKey; height?: number }) {
  const mark = MARKS[brand];
  const common = { alt: mark.name, height, width: 0, style: { height, width: "auto" } };

  return (
    <span className="inline-flex items-center" role="img" aria-label={mark.name}>
      <Image {...common} src={mark.color} className="logo-color" aria-hidden />
      <Image {...common} src={mark.mono} className="logo-mono" aria-hidden />
    </span>
  );
}
