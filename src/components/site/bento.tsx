"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/aceternity/bento-grid";
import { MagicButton } from "@/components/aceternity/magic-button";
import type { GlobeConfig, Position } from "@/components/aceternity/grid-globe";
import { metrics, site } from "@/content/site";

const World = dynamic(() => import("@/components/aceternity/grid-globe").then((m) => m.World), { ssr: false });

const RED = "#c0392b";
const AMBER = "#e0913a";
const ORANGE = "#d98324";

const globeConfig: GlobeConfig = {
  globeColor: "#2a1c15",
  emissive: "#2a1c15",
  emissiveIntensity: 0.22,
  shininess: 1.1,
  atmosphereColor: "#ffb488",
  atmosphereAltitude: 0.16,
  polygonColor: "rgba(247,206,178,0.85)",
  ambientLight: "#ffd9c2",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffe9dc",
  pointLight: "#ffd9c2",
  arcTime: 1600,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  autoRotate: true,
  autoRotateSpeed: 0.7,
};

// The only journey that matters here: France <-> Montréal.
const P = { montreal: [45.5, -73.56], paris: [48.85, 2.35] } as const;
const arc = (order: number, a: readonly [number, number], b: readonly [number, number], arcAlt: number, color: string): Position => ({ order, startLat: a[0], startLng: a[1], endLat: b[0], endLng: b[1], arcAlt, color });
const globeArcs: Position[] = [
  arc(0, P.paris, P.montreal, 0.3, RED),
  arc(1, P.montreal, P.paris, 0.3, AMBER),
  arc(2, P.paris, P.montreal, 0.22, ORANGE),
];

const stack = ["Java / Spring", "Next.js / React", "TypeScript", "Python", "PostgreSQL", "LLM agents", "RAG / MCP", "Docker / K8s"];

export function Bento() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <section id="about" className="container-x scroll-mt-24 py-20 sm:py-28">
      <div className="mb-10 flex flex-col gap-4 sm:mb-14">
        <div className="flex items-center gap-3">
          <span className="eyebrow">02</span>
          <span className="h-px w-8 bg-border" />
          <span className="eyebrow">About</span>
        </div>
        <h2 className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          A quick snapshot of how I work and what I&apos;m into.
        </h2>
      </div>

      <BentoGrid>
        {/* A — positioning + metrics */}
        <BentoCard className="md:col-span-4 md:row-span-2">
          <div>
            <p className="eyebrow">How I work</p>
            <h3 className="mt-3 max-w-xl font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              From scoping to production, across very different rooms.
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Startups, a 13k-user SaaS, an AI research lab and a regulated pharma environment. I ship the
              whole path: architecture, applied AI, and the product around it, with the checks each world needs.
            </p>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label}>
                <dd className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  {"prefix" in m ? m.prefix : ""}
                  {m.value}
                  {m.suffix}
                </dd>
                <dt className="mt-1 text-[11px] leading-snug text-muted-foreground">{m.label}</dt>
              </div>
            ))}
          </dl>
        </BentoCard>

        {/* B — 3D globe */}
        <BentoCard
          className="min-h-[22rem] border-transparent text-white md:col-span-2 md:row-span-2"
          style={{ background: "radial-gradient(120% 90% at 50% 8%, #241a14 0%, #140f0c 70%)" }}
        >
          <div className="relative z-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">Where</p>
            <h3 className="mt-2 font-heading text-xl font-semibold tracking-tight">Montréal-bound, remote-ready.</h3>
            <p className="mt-2 max-w-[15rem] text-sm leading-relaxed text-white/70">
              Relocating to Montréal, QC, and comfortable collaborating across time zones.
            </p>
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-10 top-24 sm:top-28">
            <World globeConfig={globeConfig} data={globeArcs} />
          </div>
        </BentoCard>

        {/* C — stack */}
        <BentoCard className="md:col-span-2">
          <p className="eyebrow">Core stack</p>
          <div className="mt-auto flex flex-wrap gap-1.5">
            {stack.map((s) => (
              <span key={s} className="rounded-md border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </BentoCard>

        {/* D — currently building (real Taskforce / Brain OS shot behind) */}
        <BentoCard className="relative md:col-span-2">
          <Image
            src="/images/projects/taskforce/taskforce_2.png"
            alt="Taskforce Brain OS knowledge graph"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-center opacity-35 transition-opacity duration-300 group-hover/bento:opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/85 to-card/40" />
          <div className="relative z-10">
            <p className="eyebrow">Currently building</p>
            <h3 className="mt-3 font-heading text-lg font-semibold tracking-tight">Taskforce &amp; Brain OS</h3>
          </div>
          <p className="relative z-10 mt-auto text-sm leading-relaxed text-muted-foreground">
            An AI delivery OS and its memory core, built in the open.{" "}
            <a href={site.socials.taskforce.href} target="_blank" rel="noreferrer" className="font-medium text-foreground underline-offset-4 hover:underline">
              See it on GitHub
            </a>
          </p>
        </BentoCard>

        {/* E — about photo */}
        <BentoCard className="relative md:col-span-2">
          <Image src="/images/about.png" alt="Pierre Michel" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-center opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="relative z-10 mt-auto">
            <p className="font-heading text-lg font-semibold tracking-tight">Engineer, going deeper into applied AI.</p>
            <p className="mt-1 text-sm text-muted-foreground">Pivoting toward AI and the life sciences.</p>
          </div>
        </BentoCard>

        {/* F — copy email CTA */}
        <BentoCard className="items-start md:col-span-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">Want to build something with AI?</h3>
            <p className="mt-1 text-sm text-muted-foreground">The best way to reach me is a short email. I reply within a day.</p>
          </div>
          <MagicButton
            title={copied ? "Copied to clipboard" : "Copy my email"}
            icon={copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            position="right"
            onClick={copy}
            className="mt-4 md:mt-0"
          />
        </BentoCard>
      </BentoGrid>
    </section>
  );
}
