/**
 * X/Twitter reads `twitter:image` in preference to `og:image`, and several
 * other clients copy that behaviour. One card, two conventions — re-exported
 * rather than duplicated so the two can never drift apart.
 */
export { default, alt, size, contentType } from "./opengraph-image";
