/**
 * The canonical origin, pinned to production.
 *
 * Deliberately not read from `VERCEL_URL`. Preview deployments get a fresh
 * hostname on every push, and an OG card or a canonical tag that resolved to
 * one would send Slack and Google at a URL that stops existing. The link the
 * class hands out is this one.
 */
export const SITE_URL = "https://crossing-the-gap-site.vercel.app";
