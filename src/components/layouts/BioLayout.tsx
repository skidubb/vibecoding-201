"use client";

import Image from "next/image";
import { Reveal } from "@/components/neu/Neu";
import {
  CONTAINER,
  Deeper,
  Footnote,
  Kicker,
  SectionHeader,
  type LayoutProps,
} from "./shared";

/**
 * A portrait beside a column of type, never behind it. The photograph is
 * composed with the subject in the right third and empty wall across the
 * left; the text wrapper caps its width at under half the frame so the two
 * cannot overlap at any viewport. `claim` rendered this section with the
 * headline centred over the subject's face, which is the failure this layout
 * exists to remove.
 *
 * The image renders here at near-full opacity instead of through
 * `SectionBackdrop`: that helper's radial scrim is tuned to push a backdrop
 * into atmosphere, and at 0.86 mid-stop it turns a portrait into a ghost. The
 * two gradients below are the replacement — a left scrim that seats the type
 * on the photographed wall, and a top/bottom fade into the section surface so
 * the photo's edges do not cut hard against the neighbouring sections.
 */
export function BioLayout({ section }: LayoutProps) {
  const media = section.media;
  const base = section.theme === "dark" ? "18,22,42" : "233,230,245";

  return (
    <>
      {/* No ParallaxLayer: its 15% overscan zooms the image, and on a
          portrait that crops the subject's headroom. The photograph renders
          static and complete. */}
      {media?.image && (
        <div className="absolute inset-0">
          <Image
            src={media.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{ opacity: 0.96, objectPosition: "80% 20%" }}
          />
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, rgba(${base},0.97) 0%, rgba(${base},0.88) 44%, transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, var(--surface) 0%, transparent 6%, transparent 94%, var(--surface) 100%)`,
        }}
      />

      <div className={CONTAINER}>
        <div className="w-full max-w-xl md:max-w-[46%]">
          <SectionHeader section={section} />
          {/* The strip renders as bare stacked lines instead of through
              `SectionTail`: `Strip`'s neu-inset panel is a second surface, and
              over a photograph it reads as chrome laid on the picture. Same
              precedent as ClaimLayout, which also renders its tail fields
              directly. Kicker, footnote and deeper keep their shared
              renderers. */}
          {section.strip && (
            <Reveal delay={0.2}>
              <ul className="mt-9 flex flex-col gap-2.5">
                {section.strip.items.map((item) => (
                  <li
                    key={item}
                    className="text-[clamp(0.98rem,1.2vw,1.1rem)] leading-relaxed"
                    style={{ color: "var(--text)" }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          {section.kicker && <Kicker>{section.kicker}</Kicker>}
          {section.footnote && (
            <Footnote href={section.footnoteHref}>{section.footnote}</Footnote>
          )}
          {section.deeper && (
            <Deeper deeper={section.deeper} sectionId={section.id} />
          )}
        </div>
      </div>
    </>
  );
}
