"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { HeroIso } from "@/components/site/hero-iso";
import { Pill } from "@/components/site/pill";
import { cta } from "@/components/site/cta";
import { site } from "@/content/site";

/** Dust-style hero: big left-aligned statement, one blue action, isometric floor on the right. */
export function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <section id="top" className="relative overflow-hidden pb-12 pt-28 sm:pt-32 lg:pb-20 lg:pt-36">
      <div className="container-wide grid items-center gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-4">
        <div className="relative z-10">
          <motion.div {...fade(0)}>
            <Pill>{site.availability}</Pill>
          </motion.div>

          <motion.h1 {...fade(0.06)} className="display mt-7 text-[clamp(2.9rem,6.4vw,5.6rem)]">
            {site.headline}
          </motion.h1>

          <motion.p {...fade(0.14)} className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed">
            {site.subheadline}
          </motion.p>

          <motion.div {...fade(0.22)} className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="#work" className={cta({ size: "lg" })}>
              See my work
            </a>
            <a href="#contact" className={cta({ variant: "ghost", size: "lg" })}>
              Get in touch
              <ArrowRight />
            </a>
          </motion.div>

          <motion.div {...fade(0.3)} className="mt-10 space-y-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            <p>{site.title}</p>
            <p>{site.location}</p>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative sm:pt-20 lg:-mr-4 lg:pt-14 xl:-mr-8"
        >
          <HeroIso />
        </motion.div>
      </div>
    </section>
  );
}
