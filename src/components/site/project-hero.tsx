"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight, BookText, Github, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconCover } from "@/components/site/icon-cover";
import type { Project } from "@/content/projects";

const LaserFlow = dynamic(() => import("@/components/reactbits/laser-flow").then((m) => m.LaserFlow), {
  ssr: false,
});

const kindLabel: Record<Project["kind"], string> = {
  flagship: "Flagship",
  product: "Product",
  client: "Client work",
  archive: "Archive",
};

// LaserFlow needs concrete hex; these MIRROR the --stage tokens in globals.css, keyed off the
// theme (default dark) so the beam background always matches the surface. Computing from
// resolvedTheme (not getComputedStyle) avoids a timing race that painted the hero white on reload.
const STAGE = {
  dark: { bg: "#17120e", fg: "#f7f4ee" },
  light: { bg: "#f2ede6", fg: "#17120e" },
} as const;

export function ProjectHero({ project }: { project: Project }) {
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const revealRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => setMounted(true), []);

  const stage = mounted && resolvedTheme === "light" ? STAGE.light : STAGE.dark;
  // Taskforce follows its black/white brand: pass white and let the light-mode invert path render
  // it black on the light stage - so white beam in dark, black beam in light.
  const adaptive = project.beamMode === "adaptive";
  const beam = adaptive ? "#f7f4ee" : project.accent;
  const cover = project.cover ?? project.images?.[0];
  const domain = project.links?.site?.replace(/^https?:\/\//, "").replace(/\/$/, "") ?? project.slug;

  const subtle = { color: "color-mix(in srgb, var(--stage-fg) 45%, transparent)" };
  const outlineBtn = "stage-outline rounded-full border";
  const links = project.links;

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = revealRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };
  const onLeave = () => {
    const el = revealRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "-9999px");
    el.style.setProperty("--my", "-9999px");
  };

  return (
    <section onMouseMove={onMove} onMouseLeave={onLeave} className="stage relative isolate overflow-hidden pb-20">
      {/* Paint order: beam FIRST (behind), text SECOND (blends against it via mix-blend-difference),
          mockup LAST - via DOM order + the section's `isolate`, with NO per-layer z-index. The beam
          shares the text's wrapper and its region is 2x that wrapper, so the flare (mid-beam) always
          lands at the wrapper's bottom edge = the mockup top, no matter how many lines the title takes.
          Only Taskforce (adaptive) flips white/black by theme; colored beams keep their colour via
          `screen` (transparentBackground) so they read the same in light and dark. */}
      <div className="relative pt-32 pb-20 sm:pt-36 sm:pb-24">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 bottom-[-134%]">
          {mounted ? (
            <LaserFlow
              color={beam}
              backgroundColor={stage.bg}
              horizontalBeamOffset={0.1}
              verticalBeamOffset={0.03}
              verticalSizing={1.8}
              horizontalSizing={0.5}
              wispDensity={1}
              wispIntensity={8}
              fogIntensity={0.7}
              flowSpeed={reduce ? 0 : 0.35}
              wispSpeed={reduce ? 0 : 12}
              fogFallSpeed={reduce ? 0 : 0.6}
              dpr={1.5}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(42% 34% at 50% 2%, color-mix(in srgb, ${project.beamMode === "adaptive" ? "var(--stage-fg)" : project.accent} 45%, transparent), transparent 70%)` }}
            />
          )}
        </div>

        {/* text (relative, shares the section stacking context, paints over the beam) */}
        <div className="container-x relative flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <span
            className="rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur"
            style={{ borderColor: "color-mix(in srgb, var(--stage-fg) 20%, transparent)", backgroundColor: "color-mix(in srgb, var(--stage-fg) 6%, transparent)", color: "color-mix(in srgb, var(--stage-fg) 80%, transparent)" }}
          >
            {kindLabel[project.kind]}
          </span>
          <span className="font-mono text-[11px]" style={subtle}>
            {project.period}
          </span>
        </div>

        {/* white + mix-blend-difference => letters invert to dark over the white beam, stay light
            over the dark stage, and read dark over the cream stage in light mode - all automatic. */}
        <h1
          className="mt-6 max-w-3xl font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-balance sm:text-5xl md:text-6xl"
          style={{ color: "#ffffff", mixBlendMode: "difference" }}
        >
          {project.name}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: "#dedede", mixBlendMode: "difference" }}>
          {project.tagline}
        </p>

        {links && (links.site || links.github || links.docs || links.demo) ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {links.site && (
              <Button size="sm" className="rounded-full" style={{ backgroundColor: "var(--stage-fg)", color: "var(--stage)" }} render={<a href={links.site} target="_blank" rel="noreferrer" />}>
                <Globe />
                Visit site
                <ArrowUpRight />
              </Button>
            )}
            {links.github && (
              <Button variant="outline" size="sm" className={outlineBtn} render={<a href={links.github} target="_blank" rel="noreferrer" />}>
                <Github />
                Source
              </Button>
            )}
            {links.docs && (
              <Button variant="outline" size="sm" className={outlineBtn} render={<a href={links.docs} target="_blank" rel="noreferrer" />}>
                <BookText />
                Docs
              </Button>
            )}
            {links.demo && (
              <Button variant="outline" size="sm" className={outlineBtn} render={<a href={links.demo} target="_blank" rel="noreferrer" />}>
                Live demo
                <ArrowUpRight />
              </Button>
            )}
          </div>
        ) : null}
        </div>
      </div>

      {/* 3. product window (painted last, sits over the beam). The gap above it is the wrapper's
           padding-bottom, so the beam region ends at this mockup's top edge and the flare lands there. */}
      <div className="relative mx-auto w-full max-w-[84rem] px-4 sm:px-8">
        <div
          className="group relative w-full overflow-hidden rounded-2xl shadow-2xl"
          style={{ boxShadow: `0 40px 90px -50px color-mix(in srgb, ${beam} 65%, transparent)` }}
        >
          {!project.coverBare && (
            <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ backgroundColor: "color-mix(in srgb, var(--stage-fg) 5%, transparent)" }}>
              <span className="size-2.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--stage-fg) 22%, transparent)" }} />
              <span className="size-2.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--stage-fg) 18%, transparent)" }} />
              <span className="size-2.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--stage-fg) 14%, transparent)" }} />
              <span className="ml-3 font-mono text-[11px]" style={subtle}>
                {domain}
              </span>
            </div>
          )}
          <div className="relative aspect-[16/9] w-full" style={{ backgroundColor: "var(--stage-elevated)" }}>
            {cover ? (
              <>
                <Image src={cover} alt={`${project.name} product screenshot`} fill sizes="(max-width: 1344px) 100vw, 1344px" className="object-cover object-top" priority />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={revealRef}
                  src={cover}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top opacity-60"
                  style={{
                    mixBlendMode: "lighten",
                    WebkitMaskImage: "radial-gradient(circle at var(--mx, -9999px) var(--my, -9999px), rgba(255,255,255,1) 0px, rgba(255,255,255,0.6) 130px, rgba(255,255,255,0) 240px)",
                    maskImage: "radial-gradient(circle at var(--mx, -9999px) var(--my, -9999px), rgba(255,255,255,1) 0px, rgba(255,255,255,0.6) 130px, rgba(255,255,255,0) 240px)",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                  }}
                />
              </>
            ) : (
              <IconCover project={project} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
