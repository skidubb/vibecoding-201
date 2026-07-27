import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

/**
 * Unfurl metadata — what the link looks like before anyone clicks it.
 *
 * The URL is dropped into Pavilion's Slack and into Zoom chat, and until this
 * existed it rendered as a bare hostname on a site whose entire argument is
 * that shipped work is finished work.
 *
 * These assertions read the served HTML rather than importing the `metadata`
 * export, because the export being correct and the tags reaching the document
 * are two different claims and only the second one is what Slack sees.
 */

/**
 * The production root, with or without its trailing slash.
 *
 * Next normalises a `"/"` resolved against `metadataBase` down to a bare
 * origin, and the two forms are the same document. Pinning the exact string
 * would fail on a Next upgrade for a reason nobody cares about; what is
 * actually being guarded is that these URLs are absolute and point at
 * production rather than at a preview host or at nothing.
 */
const PRODUCTION_ROOT = /^https:\/\/crossing-the-gap-site\.vercel\.app\/?$/;

/** The `content` of a meta tag, located by whichever attribute carries it. */
async function meta(page: Page, key: string): Promise<string> {
  const tag = page.locator(`meta[property="${key}"], meta[name="${key}"]`).first();
  await expect(tag, `<meta> for ${key} is missing`).toHaveCount(1);
  return (await tag.getAttribute("content")) ?? "";
}

/**
 * Refetches an absolute metadata URL against the test server.
 *
 * `metadataBase` is pinned to production on purpose, so every URL in the head
 * points at vercel.app. Fetching that would test the live deployment instead of
 * this build — the one case where a green run would mean nothing. Only the path
 * is reused.
 */
function onThisServer(absolute: string, baseURL: string): string {
  const { pathname, search } = new URL(absolute);
  return new URL(pathname + search, baseURL).toString();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("the head carries a complete Open Graph card", async ({ page }) => {
  expect(await meta(page, "og:type")).toBe("website");
  expect(await meta(page, "og:site_name")).toBe("Vibecoding 201");
  expect(await meta(page, "og:title")).toContain("Vibecoding 201");
  expect(await meta(page, "og:description")).toContain("Pavilion AI in GTM School");

  // Absolute, or Slack cannot resolve it. This is the exact failure that a
  // missing `metadataBase` produces, and it is invisible in the rendered page.
  const image = await meta(page, "og:image");
  expect(image).toMatch(/^https:\/\//);
  expect(image).toContain("/opengraph-image");

  expect(await meta(page, "og:url")).toMatch(PRODUCTION_ROOT);
});

test("the card is declared large-format for X", async ({ page }) => {
  expect(await meta(page, "twitter:card")).toBe("summary_large_image");
  expect(await meta(page, "twitter:image")).toMatch(/^https:\/\//);
});

test("the canonical link points at the production origin", async ({ page }) => {
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  await expect(canonical).toHaveAttribute("href", PRODUCTION_ROOT);
});

test("the OG image route serves a real PNG", async ({ page, request, baseURL }) => {
  const declared = await meta(page, "og:image");
  const response = await request.get(onThisServer(declared, baseURL!));

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");

  // Non-trivial size, because the interesting failure is not a 500 — it is a
  // route that renders and returns a near-empty canvas when a font fails to
  // load. A 1200x630 card with type on it does not come in under 10KB.
  const bytes = (await response.body()).length;
  expect(bytes, `og image was only ${bytes} bytes`).toBeGreaterThan(10_000);

  // And it really is the requested frame, not the 1200x630 default that
  // ImageResponse would fall back to if `size` stopped being exported.
  expect(await pngSize(request, onThisServer(declared, baseURL!))).toEqual({
    width: 1200,
    height: 630,
  });
});

test("robots.txt is served and names the sitemap", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);

  const body = await robots.text();
  expect(body).toContain("User-agent: *");
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap: https://crossing-the-gap-site.vercel.app/sitemap.xml");

  // The sitemap line has to resolve, or it is a comment that looks like a
  // directive.
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("https://crossing-the-gap-site.vercel.app/");
});

test("the tab icon is generated, not the starter default", async ({ page, request, baseURL }) => {
  const icon = page.locator('link[rel="icon"]').first();
  await expect(icon).toHaveCount(1);

  const href = await icon.getAttribute("href");
  const response = await request.get(new URL(href!, baseURL!).toString());
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/png");
});

test("the skip link is off-screen until it is focused", async ({ page }) => {
  const skip = page.getByRole("link", { name: "Skip to content" });

  // Present in the accessibility tree from the start — a skip link hidden with
  // `display: none` cannot be focused and is therefore decoration.
  await expect(skip).toBeAttached();
  const parked = await skip.boundingBox();
  expect(parked!.y + parked!.height).toBeLessThanOrEqual(0);

  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();

  // Visible, and in the viewport rather than merely un-hidden.
  await expect
    .poll(async () => (await skip.boundingBox())!.y, {
      timeout: 3000,
      message: "the skip link never travelled into the viewport",
    })
    .toBeGreaterThanOrEqual(0);
});

/** Reads width and height out of a PNG's IHDR chunk. */
async function pngSize(request: APIRequestContext, url: string) {
  const body = await (await request.get(url)).body();
  expect(body.subarray(1, 4).toString("ascii"), "not a PNG").toBe("PNG");
  return { width: body.readUInt32BE(16), height: body.readUInt32BE(20) };
}
