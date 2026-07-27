import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * One entry, because there is one page.
 *
 * `/signin`, `/vote` and `/auth/*` are presenter and attendee plumbing rather
 * than content, and are deliberately left out — a sitemap is a list of what is
 * worth indexing, not an inventory of routes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
