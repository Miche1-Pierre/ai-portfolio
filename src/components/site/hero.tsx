"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight, Github, Linkedin, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "@/components/site/hero-background";
import { metrics, site } from "@/content/site";

const ease = [0.22, 1, 0.36, 1] as const;

function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, ease, delay },
        };

  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-24">
      {/* background: soft aurora field + film grain (no stripes) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <HeroBackground />
        {/* film grain for a premium, non-flat surface (whisper-subtle) */}
        <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-soft-light" />
        {/* soft vignette to focus the centre */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(130% 90% at 50% -10%, transparent 52%, color-mix(in oklch, var(--background) 78%, transparent))" }}
        />
        {/* ground into the page */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="container-x">
        <motion.div {...fade(0)} className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {site.location}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs text-foreground">
            <span className="size-1.5 rounded-full bg-brand" />
            {site.availability}
          </span>
        </motion.div>

        <motion.h1
          {...fade(0.08)}
          className="mt-7 max-w-4xl font-heading text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl md:text-7xl"
        >
          <span className="text-gradient">{site.headline}</span>
        </motion.h1>

        <motion.p {...fade(0.16)} className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          <span className="text-foreground">{site.title}.</span> {site.subheadline}
        </motion.p>

        <motion.div {...fade(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
          <Button render={<a href="#work" />} className="h-11 rounded-full px-6 text-sm">
            View selected work
            <ArrowDown className="size-4 transition-transform group-hover/button:translate-y-0.5" />
          </Button>
          <Button variant="outline" render={<a href="#contact" />} className="h-11 rounded-full px-6 text-sm">
            Get in touch
          </Button>
          <div className="ml-1 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              render={<a href={site.socials.github.href} target="_blank" rel="noreferrer" aria-label="GitHub" />}
            >
              <Github />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              render={<a href={site.socials.linkedin.href} target="_blank" rel="noreferrer" aria-label="LinkedIn" />}
            >
              <Linkedin />
            </Button>
          </div>
        </motion.div>

        <motion.dl
          {...fade(0.36)}
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:mt-20 md:grid-cols-4"
        >
          {metrics.map((m) => (
            <div key={m.label} className="bg-card/80 p-5 sm:p-6">
              <dt className="order-2 mt-2 text-xs leading-relaxed text-muted-foreground">{m.label}</dt>
              <dd className="order-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                <Counter value={m.value} prefix={"prefix" in m ? m.prefix : ""} suffix={m.suffix} />
              </dd>
            </div>
          ))}
        </motion.dl>

        <motion.a
          {...fade(0.5)}
          href={site.socials.taskforce.href}
          target="_blank"
          rel="noreferrer"
          className="group mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Currently building <span className="font-medium text-foreground">Taskforce</span> - public docs on GitHub
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </motion.a>
      </div>
    </section>
  );
}
