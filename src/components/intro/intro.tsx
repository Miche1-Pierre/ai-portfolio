"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useTheme } from "next-themes";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { SkyBadges } from "@/components/site/hero-iso";
import { Pill } from "@/components/site/pill";
import { cta } from "@/components/site/cta";
import { introSteps } from "@/content/intro";
import { site } from "@/content/site";
import { HERO_END, START, between, stepAt } from "@/components/intro/timeline";
import { cn } from "@/lib/utils";

const IntroScene = dynamic(() => import("@/components/intro/intro-scene").then((m) => m.IntroScene), { ssr: false });

const num = (i: number) => String(i + 1).padStart(2, "0");

// The last word of the headline takes the accent colour, as in the hero.
function Headline() {
  const i = site.headline.lastIndexOf(" ");
  const last = site.headline.slice(i + 1).replace(/\.$/, "");
  return (
    <h1 className="display mt-7 text-[clamp(2.6rem,6.4vw,5.6rem)]">
      {site.headline.slice(0, i + 1)}
      <span className="accent-word">{last}</span>
      {site.headline.endsWith(".") ? "." : ""}
    </h1>
  );
}

/** The steps beside the scene (desktop): the active one opens, with its progress. */
function StepList({ active, local }: { active: number; local: MotionValue<number> }) {
  return (
    <ol className="mt-6 space-y-1.5">
      {introSteps.map((s, i) => {
        const on = i === active;
        return (
          <li key={s.id}>
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center font-mono text-xs transition-colors duration-300",
                  on ? "border bg-card text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                {num(i)}
              </span>
              <span className={cn("transition-[font-size,color] duration-300", on ? "text-2xl font-medium tracking-[-0.02em]" : "text-sm text-foreground/70")}>
                {s.title}
              </span>
            </div>
            <AnimatePresence initial={false}>
              {on ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-[34px] pb-3 pl-[19.5px] pt-2">
                    <div className="relative w-px shrink-0 bg-rule">
                      <motion.span style={{ scaleY: local }} className="absolute inset-0 origin-top bg-foreground" />
                    </div>
                    <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ol>
  );
}

/** The active step as a card (phones), with round markers for the five steps. */
function StepCard({ active }: { active: number }) {
  const s = introSteps[Math.max(0, active)];
  return (
    <div className="border bg-card/95 p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          {num(Math.max(0, active))} · {s.tag}
        </span>
        <span className="flex gap-1.5" aria-hidden>
          {introSteps.map((x, i) => (
            <span key={x.id} className={cn("size-1.5 rounded-full transition-colors", i <= active ? "bg-primary" : "bg-foreground/20")} />
          ))}
        </span>
      </div>
      <p className="mt-2 text-lg font-medium tracking-[-0.02em]">{s.title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
    </div>
  );
}

/** Without motion or WebGL: the static hero, then the steps as a ruled list. */
function StaticIntro() {
  return (
    <>
      <Hero />
      <section aria-labelledby="how-title" className="pb-16 sm:pb-24">
        <div className="container-x">
          <Pill>Forward deployed</Pill>
          <h2 id="how-title" className="title mt-5 text-[clamp(1.7rem,2.8vw,2.3rem)]">
            How I work
          </h2>
          <ol className="mt-8 grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-5">
            {introSteps.map((s, i) => (
              <li key={s.id} className="border-b border-r border-rule p-5">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  {num(i)} · {s.tag}
                </span>
                <p className="mt-3 font-medium">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

/**
 * The top of the home page: the hero over a 3D isometric world drawn like the hero illustration,
 * then a scroll tour of how Pierre works (forward deployed: embed, scope, build, ship, launch). The
 * section is pinned while a cobalt trail leads the camera from station to station, then the page
 * goes on. Falls back to the static hero with reduced motion or without WebGL.
 */
export function Intro() {
  const ref = useRef<HTMLElement>(null);
  const { resolvedTheme } = useTheme();
  const [mode, setMode] = useState<"intro" | "static">("intro");
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(-1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // function transforms on purpose: motion would hand range transforms to a native ViewTimeline,
  // whose range does not match this pinned section (the hero came back while scrolling)
  const heroOpacity = useTransform(scrollYProgress, (v) => 1 - between(v, 0, HERO_END));
  const heroY = useTransform(scrollYProgress, (v) => -48 * between(v, 0, HERO_END));
  const stepsOpacity = useTransform(scrollYProgress, (v) => between(v, HERO_END, START));
  const local = useTransform(scrollYProgress, (v) => stepAt(v).local);

  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(stepAt(v).index));

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = document.createElement("canvas").getContext("webgl2");
    if (reduce || !gl) setMode("static");
    else setReady(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  if (mode === "static") return <StaticIntro />;

  const heroGone = active >= 0;
  return (
    <section id="top" ref={ref} className="relative h-[620vh]" aria-label="Introduction and how I work">
      <div className="sticky top-0 h-svh overflow-hidden">
        {ready ? (
          <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <IntroScene progress={scrollYProgress} theme={resolvedTheme === "dark" ? "dark" : "light"} active={visible} />
          </motion.div>
        ) : null}

        {/* the hero, over the whole scene */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className={cn("absolute inset-0", heroGone && "pointer-events-none")}>
          <div className="container-wide grid h-full content-start pt-28 sm:pt-32 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:content-center lg:pt-16">
            <div className="relative z-10">
              <Pill>{site.availability}</Pill>
              <Headline />
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:mt-7 sm:text-xl sm:leading-relaxed">{site.subheadline}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-9">
                <a href="#work" className={cta({ size: "lg" })}>
                  See my work
                </a>
                <a href="#contact" className={cta({ variant: "ghost", size: "lg" })}>
                  Get in touch
                  <ArrowRight />
                </a>
              </div>
              <div className="mt-10 hidden space-y-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground sm:block">
                <p>{site.title}</p>
                <p>{site.location}</p>
              </div>
            </div>
          </div>
          {/* the badges float in the empty sky of the scene, as on the illustration */}
          <div className="absolute bottom-[5%] left-[47%] right-[2%] top-[17%] hidden lg:block">
            <SkyBadges />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <span className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              <span className="flex h-6 w-4 justify-center rounded-full border border-foreground/30 pt-1">
                <span className="size-1 animate-bounce rounded-full bg-foreground/60" />
              </span>
              Scroll · how I work
            </span>
          </div>
        </motion.div>

        {/* the tour: steps on the left (desktop) or a card at the bottom (phones), over a soft veil */}
        <motion.div
          style={{ opacity: stepsOpacity }}
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[44%] bg-gradient-to-r from-background via-background/75 to-transparent lg:block"
        />
        <motion.div style={{ opacity: stepsOpacity }} className="pointer-events-none absolute inset-x-0 bottom-[6vh] hidden lg:block">
          <div className="container-wide">
            <div className="max-w-md">
              <Pill>Forward deployed · How I work</Pill>
              <StepList active={active} local={local} />
            </div>
          </div>
        </motion.div>
        <motion.div style={{ opacity: stepsOpacity }} className="pointer-events-none absolute inset-x-4 bottom-4 sm:inset-x-6 lg:hidden">
          <StepCard active={active} />
        </motion.div>
        <motion.a
          href="#work"
          style={{ opacity: stepsOpacity }}
          className={cn(
            "absolute right-5 top-20 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground sm:right-8 lg:bottom-7 lg:right-10 lg:top-auto",
            !heroGone && "pointer-events-none"
          )}
        >
          Skip the tour ↓
        </motion.a>
      </div>
    </section>
  );
}
