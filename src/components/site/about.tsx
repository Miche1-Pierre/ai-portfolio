"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CropMarks, SectionRule } from "@/components/site/marks";
import { Pill } from "@/components/site/pill";
import { QuoteShapes } from "@/components/site/shapes";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

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

/**
 * A statement card (crop-marked, with a counter) next to the portrait. Every statement is stacked
 * in the same grid cell, so the card keeps the height of the longest one and never jumps.
 */
export function About() {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((v) => (v + d + STATEMENTS.length) % STATEMENTS.length);
  const layer = (k: number) =>
    cn(
      "[grid-area:1/1] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
      k === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
    );

  return (
    <section id="about" className="scroll-mt-20 pb-20 pt-4 sm:pb-28">
      <div className="container-x">
        <SectionRule className="mb-14 sm:mb-20" />
        <Reveal className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="relative flex min-h-[26rem] flex-col bg-tint-blue p-6 sm:p-12 lg:min-h-[34rem]">
            <CropMarks />
            <div className="flex items-center justify-between gap-4">
              <Pill index="02">About</Pill>
              <span className="font-mono text-[11px] tracking-[0.1em] text-ink-blue" aria-live="polite">
                {String(i + 1).padStart(2, "0")} / {String(STATEMENTS.length).padStart(2, "0")}
              </span>
            </div>
            <QuoteShapes className="mt-10" />
            <div className="mt-6 grid flex-1">
              {STATEMENTS.map((s, k) => (
                <blockquote key={s.quote} aria-hidden={k !== i} className={cn("title text-[clamp(1.8rem,3.6vw,3.25rem)] leading-[1.08]", layer(k))}>
                  {s.quote}
                </blockquote>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-foreground/10 pt-6">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium tracking-[-0.01em]">{site.name}</p>
                <div className="grid">
                  {STATEMENTS.map((s, k) => (
                    <p key={s.context} aria-hidden={k !== i} className={cn("text-sm text-muted-foreground", layer(k))}>
                      {s.context}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous statement"
                  className="grid size-12 place-items-center rounded-full border border-foreground/20 bg-card/70 text-foreground transition-colors hover:bg-card"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next statement"
                  className="grid size-12 place-items-center rounded-full border border-foreground/20 bg-card/70 text-foreground transition-colors hover:bg-card"
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
