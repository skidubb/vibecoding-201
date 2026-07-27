import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The tab mark.
 *
 * Rendered at 32px and read at 16, which rules out the wordmark and rules out
 * anything with more than one shape in it. A filled magenta field carrying a
 * single glyph is the only thing that still resolves — white on `#df285b` is
 * 4.57:1, so the letter holds even after the browser downsamples it.
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const poppinsBold = await readFile(
    join(process.cwd(), "src", "assets", "fonts", "Poppins-Bold.subset.ttf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#df285b",
          borderRadius: 8,
          color: "#ffffff",
          fontFamily: "Poppins",
          fontWeight: 700,
          fontSize: 24,
          // Satori centres the line box, which includes a descent no capital
          // uses, so an unpadded V lands visibly above centre.
          paddingTop: 3,
        }}
      >
        V
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Poppins", data: poppinsBold, style: "normal", weight: 700 },
      ],
    },
  );
}
