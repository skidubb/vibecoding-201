import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Poppins, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Poppins is not a variable font on Google Fonts, so weights are explicit.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const TITLE = "Vibecoding 201 · Building Production GTM Tools";
const DESCRIPTION =
  "Taking one GTM prototype from a chat window to a tool your team depends on. Pavilion AI in GTM School. Scott Ewalt, Cardinal Element.";

export const metadata: Metadata = {
  // Every relative URL below resolves against this, including the card that
  // `opengraph-image.tsx` generates. Without it Next emits a relative og:image
  // and the unfurl is a bare link — which is what this page looked like in
  // Pavilion's Slack before this existed.
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Vibecoding 201",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        {/* The deck is driven from the keyboard, and the first thing a Tab
            press lands on is the progress rail — one tick per section, ahead of
            the content on every single page load. The skip link is off-screen
            until it takes focus, then sits above the fixed chrome. */}
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        {/* Page views and visitors, in the Vercel dashboard. The beacon 404s
            harmlessly in local production builds; the component tolerates it. */}
        <Analytics />
      </body>
    </html>
  );
}
