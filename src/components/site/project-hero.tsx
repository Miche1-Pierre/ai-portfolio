"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight, BookText, Github, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

// The project hero is a dark "stage" in both site themes: the beam only reads on dark,
// and this avoids the washed-out invert path. Taskforce's adaptive beam stays white here.
const STAGE_BG = "#090c12";

export function ProjectHero({ project }: { project: Project }) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const revealRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => setMounted(true), []);

  const beam = project.beamMode === "adaptive" ? "#ffffff" : project.accent;
  const glow = project.beamMode === "adaptive" ? "#ffffff" : project.accent;
  const cover = project.cover ?? project.images?.[0];

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
    <section
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative isolate overflow-hidden text-white"
      style={{ backgroundColor: STAGE_BG }}
    >
      {/* WebGL beam (or a static fallback for reduced-motion / pre-mount) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {mounted && !reduce ? (
          <LaserFlow
            color={beam}
            backgroundColor={STAGE_BG}
            horizontalBeamOffset={0.0}
            verticalBeamOffset={-0.05}
            verticalSizing={1.7}
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
            style={{ background: `radial-gradient(58% 44% at 50% 0%, color-mix(in oklch, ${glow} 42%, transparent), transparent 70%)` }}
          />
        )}
        {/* fade into the page background below the hero */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="container-x relative z-10 flex flex-col items-center pt-32 pb-14 text-center sm:pt-40">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-white/15 bg-white/5 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur">
            {kindLabel[project.kind]}
          </Badge>
          <span className="font-mono text-[11px] text-white/50">{project.period}</span>
        </div>

        <h1 className="mt-6 max-w-3xl font-heading text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-balance sm:text-5xl md:text-6xl">
          {project.name}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">{project.tagline}</p>

        {project.links && (project.links.site || project.links.github || project.links.docs || project.links.demo) ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {project.links.site && (
              <Button size="sm" className="rounded-full bg-white text-neutral-900 hover:bg-white/90" render={<a href={project.links.site} target="_blank" rel="noreferrer" />}>
                <Globe />
                Visit site
                <ArrowUpRight />
              </Button>
            )}
            {project.links.github && (
              <Button variant="outline" size="sm" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10" render={<a href={project.links.github} target="_blank" rel="noreferrer" />}>
                <Github />
                Source
              </Button>
            )}
            {project.links.docs && (
              <Button variant="outline" size="sm" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10" render={<a href={project.links.docs} target="_blank" rel="noreferrer" />}>
                <BookText />
                Docs
              </Button>
            )}
            {project.links.demo && (
              <Button variant="outline" size="sm" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10" render={<a href={project.links.demo} target="_blank" rel="noreferrer" />}>
                Live demo
                <ArrowUpRight />
              </Button>
            )}
          </div>
        ) : null}

        {/* the "window below" — screenshot with a cursor-follow reveal, or the project diagram */}
        <div
          className="group relative mt-12 w-full max-w-3xl overflow-hidden rounded-2xl border shadow-2xl"
          style={{ borderColor: `color-mix(in oklch, ${glow} 45%, transparent)` }}
        >
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/40 px-4 py-2.5 backdrop-blur">
            <span className="size-2.5 rounded-full bg-white/25" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="ml-3 font-mono text-[11px] text-white/40">{project.slug}</span>
          </div>
          <div className="relative aspect-[16/10] w-full bg-black/50">
            {cover ? (
              <>
                <Image src={cover} alt={`${project.name} screenshot`} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover object-top" priority />
                {/* cursor spotlight reveal */}
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
              <div className="absolute inset-0 grid place-items-center p-6 text-white">
                <ProjectArt project={project} className="h-full w-full max-h-56" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
