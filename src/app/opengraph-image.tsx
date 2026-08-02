import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The unfurl card.
 *
 * The link goes into Pavilion's Slack and into Zoom chat, where it renders at
 * roughly a third of these dimensions. That is the whole design constraint:
 * three lines, one accent, nothing that survives 1200px but dissolves at 360.
 *
 * Colours are lifted from the dark theme in `globals.css` rather than invented
 * here — `#12162a` is the page ground, `#1a1f36` is `--surface`, `--edge` is the
 * hairline — so the card reads as a slide that fell out of the deck.
 *
 * It does *not* carry `.neu-raised`'s shadow pair. Satori rasterises through
 * resvg, which lays `box-shadow` down at full opacity with no blur, so the
 * deck's soft two-tone shadow came out as a hard offset duplicate of the panel
 * along the bottom-right — visibly a misprint, and still visible at thumbnail
 * size. The hairline alone carries the panel here. Do not add a shadow back
 * without rendering the file and looking at it.
 */

export const alt =
  "Vibecoding 201: Building Production GTM Tools. Pavilion AI in GTM School, Scott Ewalt.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori reads ttf/otf/woff and cannot read the woff2 that `next/font` emits,
// so the two families are vendored as subset ttf. See src/assets/fonts/README.md.
const loadFont = (file: string) =>
  readFile(join(process.cwd(), "src", "assets", "fonts", file));

export default async function Image() {
  const [poppinsBold, interRegular, interMedium] = await Promise.all([
    loadFont("Poppins-Bold.subset.ttf"),
    loadFont("Inter-Regular.subset.ttf"),
    loadFont("Inter-Medium.subset.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 40,
          background: "#12162a",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 76px",
            borderRadius: 28,
            background: "#1a1f36",
            border: "1px solid rgba(206, 198, 244, 0.13)",
          }}
        >
          {/* The magenta tick. Decorative, and 3.55:1 against the panel. */}
          <div
            style={{
              width: 88,
              height: 10,
              borderRadius: 5,
              background: "#df285b",
              marginBottom: 36,
            }}
          />

          <div
            style={{
              fontFamily: "Poppins",
              fontWeight: 700,
              // Sized so "Vibecoding 201" sets on one line with margin to
              // spare. It is the only string here that can overrun the panel.
              fontSize: 116,
              lineHeight: 1.02,
              letterSpacing: -2.5,
              color: "#f3f1fb",
            }}
          >
            Vibecoding 201
          </div>

          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: 50,
              lineHeight: 1.2,
              letterSpacing: -1,
              color: "#cec6f4",
              marginTop: 18,
            }}
          >
            Building Production GTM Tools
          </div>

          <div
            style={{
              width: 232,
              height: 1,
              background: "rgba(206, 198, 244, 0.16)",
              marginTop: 40,
              marginBottom: 26,
            }}
          />

          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: 30,
              letterSpacing: 0.2,
              color: "#9a9db4",
            }}
          >
            Pavilion AI in GTM School · Scott Ewalt
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Poppins", data: poppinsBold, style: "normal", weight: 700 },
        { name: "Inter", data: interRegular, style: "normal", weight: 400 },
        { name: "Inter", data: interMedium, style: "normal", weight: 500 },
      ],
    },
  );
}
