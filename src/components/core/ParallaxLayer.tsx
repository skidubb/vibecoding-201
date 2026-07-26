"use client";

import Image, { type StaticImageData } from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * A depth layer inside a section. Transform-only so it stays on the compositor
 * during a Zoom screenshare.
 *
 * `speed` is the fraction of the section's travel the layer drifts: negative
 * moves it against the scroll (reads as further away).
 */
export function ParallaxLayer({
  speed = -0.15,
  className = "",
  children,
}: {
  speed?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-speed * 100}%`, `${speed * 100}%`]
  );

  return (
    <div ref={ref} className={`absolute inset-0 ${className}`}>
      <motion.div style={{ y }} className="absolute inset-[-15%]">
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Full-bleed background image with a scrim so type stays readable on top.
 *
 * Must be rendered as a direct child of the section (a sibling of the content
 * container, never inside it) — `absolute inset-0` resolves against the nearest
 * positioned ancestor, and the content container is both narrower and padded.
 */
export function ImageBackdrop({
  src,
  alt = "",
  speed = -0.15,
  opacity = 0.32,
  scrim = "dark",
  preload = false,
  focal = "center",
  /** Adds a second gradient weighted to one side, to protect a column of type. */
  sideScrim,
}: {
  src: StaticImageData;
  alt?: string;
  speed?: number;
  opacity?: number;
  scrim?: "dark" | "light";
  preload?: boolean;
  focal?: string;
  sideScrim?: "left" | "right";
}) {
  const base = scrim === "dark" ? "18,22,42" : "233,230,245";
  return (
    <>
      <ParallaxLayer speed={speed}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          preload={preload}
          className="object-cover"
          style={{ opacity, objectPosition: focal }}
        />
      </ParallaxLayer>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 50% 40%, rgba(${base},0.45) 0%, rgba(${base},0.86) 62%, var(--surface) 100%)`,
        }}
      />
      {sideScrim && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to ${
              sideScrim === "left" ? "right" : "left"
            }, rgba(${base},0.92) 0%, rgba(${base},0.6) 42%, transparent 72%)`,
          }}
        />
      )}
    </>
  );
}

/**
 * Background video that only decodes while it is near the viewport — three
 * autoplaying loops on one page would otherwise cost real frames.
 */
export function VideoBackdrop({
  src,
  poster,
  speed = -0.15,
  opacity = 0.3,
}: {
  src: string;
  poster?: string;
  speed?: number;
  opacity?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <>
      <ParallaxLayer speed={speed}>
        <video
          ref={ref}
          className="h-full w-full object-cover"
          style={{ opacity }}
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
        >
          <source src={src} type="video/mp4" />
        </video>
      </ParallaxLayer>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 95% at 50% 45%, rgba(18,22,42,0.45) 0%, rgba(18,22,42,0.86) 62%, var(--surface) 100%)",
        }}
      />
    </>
  );
}

/** Soft radial bloom used to give flat neumorphic fields some atmosphere. */
export function Glow({
  className = "",
  tone = "lavender",
  size = 55,
}: {
  className?: string;
  tone?: "lavender" | "magenta";
  size?: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{
        width: `${size}vw`,
        height: `${size}vw`,
        background:
          tone === "lavender"
            ? "radial-gradient(circle, var(--glow-a) 0%, transparent 68%)"
            : "radial-gradient(circle, var(--glow-b) 0%, transparent 68%)",
      }}
    />
  );
}
