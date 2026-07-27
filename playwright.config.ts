import { defineConfig, devices } from "@playwright/test";

/**
 * The deck's verification gate.
 *
 * Slide 29 teaches a six-item minimum test pack, so the spec filenames in
 * `tests/` are named after it — the listing itself is the artifact. Headed
 * Chromium, because the whole page is driven by requestAnimationFrame (Lenis
 * plus Motion) and a paused rAF makes every scroll assertion a false negative.
 */
const PORT = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // In CI, annotate the diff *and* leave an HTML report behind — the workflow
  // uploads it on failure, and "github" alone writes nothing to disk.
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Animations are the feature under test; a headless-throttled rAF
        // would report scroll failures that do not happen for a presenter.
        headless: true,
        launchOptions: {
          args: ["--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"],
        },
      },
    },
  ],
  // Tested against a production build, not `next dev`. Dev mode's HMR socket
  // fails under Playwright and takes hydration down with it, so every
  // interaction assertion would be a false negative — and this is the artifact
  // that actually ships.
  webServer: {
    command: `npm run build && npx next start --port ${PORT}`,
    // The suite runs with the backend switched off, deliberately.
    //
    // Two things fall out of that. The degradation specs stay meaningful — a
    // poll with no backend has to render its question and say so, and that is
    // only tested if the backend is actually absent. And the kill switch gets
    // exercised on every run rather than being a flag nobody has ever set,
    // which is the difference between a kill switch and a comment.
    //
    // The live path is verified separately, against the real project, by
    // `npm run smoke`.
    env: {
      NEXT_PUBLIC_BACKEND_DISABLED: "1",
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    },
    url: `http://127.0.0.1:${PORT}`,
    // Never reuse. A surviving `next start` serves the previous build, so a
    // source change silently is not under test — which once made a deliberately
    // broken guard pass its own regression test.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
