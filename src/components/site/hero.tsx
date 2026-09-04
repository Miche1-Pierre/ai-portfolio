"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, MapPin } from "lucide-react";
import { Spotlight } from "@/components/aceternity/spotlight";
import { MagicButton } from "@/components/aceternity/magic-button";
import { TextGenerateEffect } from "@/components/aceternity/text-generate-effect";
import { site } from "@/content/site";

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay } };

  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-36 sm:pb-24">
      {/* spotlights (warm) */}
      <div aria-hidden>
        <Spotlight className="-left-10 -top-40 h-screen md:-left-32 md:-top-20" fill="var(--brand)" />
        <Spotlight className="left-full top-10 h-[80vh] w-[50vw]" fill="var(--brand-2)" />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="var(--brand)" />
      </div>

      {/* dot grid, faded toward the edges */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className="bg-grid-dots absolute inset-0" />
        <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_18%,black_75%)]" />
      </div>

      <div className="container-x relative z-10 flex flex-col items-center text-center">
        <motion.div {...fade(0)} className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <MapPin className="size-3.5" />
            {site.location}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs text-foreground backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-full bg-brand" />
            {site.availability}
          </span>
        </motion.div>

        <motion.p {...fade(0.08)} className="mt-7 max-w-xl text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          {site.title}
        </motion.p>

        <TextGenerateEffect
          words={site.headline}
          accentFrom={4}
          className="mt-4 max-w-4xl font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-balance sm:text-6xl md:text-7xl"
        />

        <motion.p {...fade(0.5)} className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {site.subheadline}
        </motion.p>

        <motion.div {...fade(0.62)} className="mt-9">
          <MagicButton title="Show my work" icon={<ArrowDown className="size-4" />} position="right" href="#work" />
        </motion.div>
      </div>
    </section>
  );
}
