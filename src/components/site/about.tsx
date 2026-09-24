"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { QuoteShapes } from "@/components/site/shapes";
import { site } from "@/content/site";

// Pierre's own lines from the site and the Taskforce docs (nothing invented).
const STATEMENTS = [
  {
    quote: "I ship the whole path: architecture, applied AI where it earns its place, and the product around it.",
    context: "Startups, a 13k-user SaaS, a research lab and a regulated pharma environment.",
  },
  {
    quote: "Git remembers what changed. Taskforce remembers why.",
    context: "On Taskforce, the AI delivery OS I build in the open.",
  },
  {
    quote: "An engineer first, going deeper into applied AI and the life sciences.",
    context: "Where I am heading next.",
  },
] as const;

/** Dust's testimonial block: a tinted statement card with shape "quote marks", and a portrait. */
export function About() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const s = STATEMENTS[i];
  const go = (d: number) => setI((v) => (v + d + STATEMENTS.length) % STATEMENTS.length);

  return (
    <section id="about" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="relative flex min-h-[26rem] flex-col rounded-3xl bg-tint-blue p-8 sm:p-12 lg:min-h-[34rem]">
            <QuoteShapes />
            <div className="relative mt-6 flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.blockquote
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="title text-[clamp(1.9rem,3.6vw,3.25rem)] leading-[1.08]"
                  aria-live="polite"
                >
                  {s.quote}
                </motion.blockquote>
              </AnimatePresence>
            </div>
            <QuoteShapes className="mt-6 self-end" />
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-lg font-medium tracking-[-0.01em]">{site.name}</p>
                <p className="text-sm text-muted-foreground">{s.context}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous statement"
                  className="grid size-12 place-items-center rounded-full border border-foreground/15 bg-card/60 text-foreground transition-colors hover:bg-card"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next statement"
                  className="grid size-12 place-items-center rounded-full border border-foreground/15 bg-card/60 text-foreground transition-colors hover:bg-card"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden rounded-3xl bg-muted">
            <Image
              src="/images/about.png"
              alt="Pierre Michel at his desk"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-[50%_30%]"
            />
            <p className="absolute bottom-4 left-4 rounded-full bg-card/90 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-foreground/80 backdrop-blur-sm">
              {site.location}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
