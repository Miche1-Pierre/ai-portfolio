"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight, BookText, Github, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectArt } from "@/components/site/project-art";
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

// Colours resolved from the CSS tokens (globals.css) so light/dark lives in one place.
function readStage() {
  if (typeof window === "undefined") return { bg: "#090c12", fg: "#ffffff" };
  const cs = getComputedStyle(document.documentElement);
  return {
    bg: cs.getPropertyValue("--stage").trim() || "#090c12",
    fg: cs.getPropertyValue("--stage-fg").trim() || "#ffffff",
  };
}

export function ProjectHero({ project }: { project: Project }) {
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState({ bg: "#090c12", fg: "#ffffff" });
  const revealRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted) setStage(readStage());
  }, [mounted, resolvedTheme]);

  const beam = project.beamMode === "adaptive" ? stage.fg : project.accent;
  const glow = project.beamMode === "adaptive" ? stage.fg : project.accent;
  const cover = project.cover ?? project.images?.[0];

  const muted = { color: "color-mix(in srgb, var(--stage-fg) 62%, transparent)" };
  const subtle = { color: "color-mix(in srgb, var(--stage-fg) 42%, transparent)" };
  const outlineBtn = "stage-outline rounded-full border";

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

  const links = project.links;

  return (
    <section onMouseMove={onMove} onMouseLeave={onLeave} className="stage relative isolate overflow-hidden">
      {/* WebGL beam (or a static fallback for reduced-motion / pre-mount) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {mounted && !reduce ? (
          <LaserFlow
            key={`${beam}-${stage.bg}`}
            color={beam}
            backgroundColor={stage.bg}
            horizontalBeamOffset={0.0}
            verticalBeamOffset={0.0}
            verticalSizing={2.0}
            horizontalSizing={0.5}
            wispDensity={1}
            wispIntensity={5}
            fogIntensity={0.45}
            flowSpeed={0.34}
            dpr={1.5}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(58% 44% at 50% 0%, color-mix(in srgb, ${glow} 42%, transparent), transparent 70%)` }}
          />
        )}
        {/* fade into the page background below the hero */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="container-x relative z-10 flex flex-col items-center pt-32 pb-14 text-center sm:pt-40">
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

        <h1 className="mt-6 max-w-3xl font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-balance sm:text-5xl md:text-6xl">
          {project.name}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={muted}>
          {project.tagline}
        </p>

        {links && (links.site || links.github || links.docs || links.demo) ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {links.site && (
              <Button
                size="sm"
                className="rounded-full"
                style={{ backgroundColor: "var(--stage-fg)", color: "var(--stage)" }}
                render={<a href={links.site} target="_blank" rel="noreferrer" />}
              >
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

        {/* the "window below": screenshot with a cursor-follow reveal, or the project diagram */}
        <div
          className="group relative mt-12 w-full max-w-3xl overflow-hidden rounded-2xl border shadow-2xl"
          style={{ borderColor: `color-mix(in srgb, ${glow} 45%, transparent)` }}
        >
          <div className="flex items-center gap-1.5 border-b px-4 py-2.5 backdrop-blur" style={{ borderColor: "color-mix(in srgb, var(--stage-fg) 12%, transparent)", backgroundColor: "color-mix(in srgb, var(--stage-fg) 5%, transparent)" }}>
            <span className="size-2.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--stage-fg) 25%, transparent)" }} />
            <span className="size-2.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--stage-fg) 20%, transparent)" }} />
            <span className="size-2.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--stage-fg) 15%, transparent)" }} />
            <span className="ml-3 font-mono text-[11px]" style={subtle}>
              {project.slug}
            </span>
          </div>
          <div className="relative aspect-[16/10] w-full" style={{ backgroundColor: "var(--stage-elevated)" }}>
            {cover ? (
              <>
                <Image src={cover} alt={`${project.name} screenshot`} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover object-top" priority />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={revealRef}
                  src={cover}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top opacity-70"
                  style={{
                    mixBlendMode: "lighten",
                    WebkitMaskImage:
                      "radial-gradient(circle at var(--mx, -9999px) var(--my, -9999px), rgba(255,255,255,1) 0px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0) 220px)",
                    maskImage:
                      "radial-gradient(circle at var(--mx, -9999px) var(--my, -9999px), rgba(255,255,255,1) 0px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0) 220px)",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                  }}
                />
              </>
            ) : (
              <div className="absolute inset-0 grid place-items-center p-6">
                <ProjectArt project={project} className="h-full w-full max-h-56" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
