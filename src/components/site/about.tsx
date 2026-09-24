"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CropMarks, SectionRule } from "@/components/site/marks";
import { Pill } from "@/components/site/pill";
import { QuoteBlocks } from "@/components/site/shapes";
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

/** A statement card (square, crop-marked, with a counter) next to the portrait. */
export function About() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const s = STATEMENTS[i];
  const go = (d: number) => setI((v) => (v + d + STATEMENTS.length) % STATEMENTS.length);

  return (
    <section id="about" className="scroll-mt-20 pb-20 pt-4 sm:pb-28">
      <div className="container-x">
        <SectionRule className="mb-14 sm:mb-20" />
        <Reveal className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="relative flex min-h-[26rem] flex-col bg-tint-blue p-8 sm:p-12 lg:min-h-[34rem]">
            <CropMarks />
            <div className="flex items-center justify-between gap-4">
              <Pill index="02">About</Pill>
              <span className="font-mono text-[11px] tracking-[0.1em] text-ink-blue">
                {String(i + 1).padStart(2, "0")} / {String(STATEMENTS.length).padStart(2, "0")}
              </span>
            </div>
            <QuoteBlocks className="mt-10" />
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
            <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-foreground/10 pt-6">
              <div>
                <p className="text-lg font-medium tracking-[-0.01em]">{site.name}</p>
                <p className="text-sm text-muted-foreground">{s.context}</p>
              </div>
              <div className="flex">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous statement"
                  className="grid size-12 place-items-center border border-foreground/20 bg-card/70 text-foreground transition-colors hover:bg-card"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next statement"
                  className="-ml-px grid size-12 place-items-center border border-foreground/20 bg-card/70 text-foreground transition-colors hover:bg-card"
                >
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden bg-muted">
            <Image
              src="/images/about.png"
              alt="Pierre Michel at his desk"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-[50%_30%]"
            />
            <p className="absolute bottom-0 left-0 bg-card px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-foreground/80">
              {site.location}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
