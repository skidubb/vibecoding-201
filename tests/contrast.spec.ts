import { test, expect } from "@playwright/test";

/**
 * Text contrast, measured from the tokens the page actually renders with.
 *
 * This deck is projected to a room. A review of all forty rendered sections
 * found the same defect twelve times: `--text-faint` sat at 3.15:1 on dark and
 * 2.66:1 on light, and it was carrying content rather than captions — the loop
 * step that repairs each defect, Jordan's authorization rules, the nine items
 * of the minimum standard, the path the room was being told to open. Every one
 * of them rendered as disabled text.
 *
 * Asserted against `--surface-raised`, the panel colour those lines sit on,
 * rather than the section background, because that is the harder of the two.
 */

/** WCAG relative luminance for an `rgb(r, g, b)` string. */
function luminance(rgb: string): number {
  const [r, g, b] = rgb
    .match(/\d+(\.\d+)?/g)!
    .slice(0, 3)
    .map(Number)
    .map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(fg: string, bg: string): number {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

/** Resolves theme vars to rgb() by letting the browser compute them. */
async function tokens(page: import("@playwright/test").Page, theme: "dark" | "light") {
  return page.evaluate((t) => {
    const probe = document.createElement("div");
    probe.setAttribute("data-theme", t);
    document.body.appendChild(probe);
    const read = (name: string) => {
      const inner = document.createElement("span");
      inner.style.color = `var(${name})`;
      probe.appendChild(inner);
      const value = getComputedStyle(inner).color;
      inner.remove();
      return value;
    };
    const out = {
      text: read("--text"),
      dim: read("--text-dim"),
      faint: read("--text-faint"),
      accent: read("--accent"),
      surface: read("--surface"),
      raised: read("--surface-raised"),
    };
    probe.remove();
    return out;
  }, theme);
}

for (const theme of ["dark", "light"] as const) {
  test(`${theme} theme text clears the legibility floor on a raised panel`, async ({
    page,
  }) => {
    await page.goto("/");
    const t = await tokens(page, theme);

    // 4.5:1 is the WCAG AA floor for body text, and the floor below which the
    // projector review found copy unreadable.
    expect(
      Math.round(contrast(t.faint, t.raised) * 100) / 100,
      `--text-faint on --surface-raised (${t.faint} on ${t.raised})`,
    ).toBeGreaterThanOrEqual(4.5);

    expect(
      Math.round(contrast(t.dim, t.raised) * 100) / 100,
      `--text-dim on --surface-raised`,
    ).toBeGreaterThanOrEqual(4.5);

    // Headlines carry the room; they get more than the minimum.
    expect(
      Math.round(contrast(t.text, t.surface) * 100) / 100,
      `--text on --surface`,
    ).toBeGreaterThanOrEqual(7);

    // And faint stays a step quieter than dim, or the hierarchy the fix was
    // meant to preserve has been flattened into one grey.
    expect(
      contrast(t.faint, t.raised),
      "faint must remain quieter than dim",
    ).toBeLessThan(contrast(t.dim, t.raised));
  });
}
