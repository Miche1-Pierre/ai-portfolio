"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/content/projects";
import { cn } from "@/lib/utils";

const kindLabel: Record<Project["kind"], string> = {
  flagship: "Flagship",
  product: "Product",
  client: "Client work",
  archive: "Archive",
};

function Art({ slug }: { slug: string }) {
  // Lightweight decorative SVGs — one per flagship/product, all theme-aware.
  if (slug === "taskforce")
    return (
      <svg viewBox="0 0 320 160" className="h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="tfg" x1="0" x2="1">
            <stop offset="0" stopColor="var(--brand)" />
            <stop offset="1" stopColor="var(--brand-2)" />
          </linearGradient>
        </defs>
        {[
          [40, 80, 120, 40],
          [40, 80, 120, 80],
          [40, 80, 120, 120],
          [120, 40, 200, 60],
          [120, 80, 200, 60],
          [120, 120, 200, 100],
          [200, 60, 280, 80],
          [200, 100, 280, 80],
        ].map(([x1, y1, x2, y2], i) => (
          <path
            key={i}
            d={`M${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke="url(#tfg)"
            strokeOpacity="0.55"
            strokeWidth="1.5"
          />
        ))}
        {[
          [40, 80],
          [120, 40],
          [120, 80],
          [120, 120],
          [200, 60],
          [200, 100],
          [280, 80],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="9" fill="var(--card)" stroke="var(--brand)" strokeOpacity="0.7" />
            <circle cx={x} cy={y} r="3" fill="var(--brand)" />
          </g>
        ))}
      </svg>
    );
  if (slug === "brain-os")
    return (
      <svg viewBox="0 0 320 160" className="h-full w-full" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 30 + ((i * 53) % 260);
          const y = 30 + ((i * 37) % 100);
          return (
            <g key={i}>
              {i > 0 ? (
                <line
                  x1={x}
                  y1={y}
                  x2={30 + (((i - 1) * 53) % 260)}
                  y2={30 + (((i - 1) * 37) % 100)}
                  stroke="var(--brand-2)"
                  strokeOpacity="0.35"
                />
              ) : null}
              <circle cx={x} cy={y} r={i % 3 === 0 ? 6 : 3.5} fill="var(--brand-2)" fillOpacity={i % 3 === 0 ? 0.9 : 0.6} />
            </g>
          );
        })}
      </svg>
    );
  if (slug === "plania")
    return (
      <svg viewBox="0 0 320 160" className="h-full w-full" aria-hidden>
        {[18, 34, 26, 48, 42, 60, 55, 74, 70, 88, 84, 104].map((h, i) => (
          <rect key={i} x={30 + i * 22} y={130 - h} width="12" height={h} rx="3" fill="var(--brand)" fillOpacity={0.25 + (i / 12) * 0.65} />
        ))}
        <path d="M30 118 C 100 100, 160 90, 290 26" fill="none" stroke="var(--foreground)" strokeOpacity="0.5" strokeWidth="1.5" />
      </svg>
    );
  return (
    <svg viewBox="0 0 320 160" className="h-full w-full" aria-hidden>
      <rect x="30" y="34" width="180" height="36" rx="18" fill="var(--muted)" />
      <rect x="110" y="86" width="180" height="36" rx="18" fill="var(--brand)" fillOpacity="0.25" stroke="var(--brand)" strokeOpacity="0.5" />
      <circle cx="52" cy="52" r="5" fill="var(--muted-foreground)" />
      <circle cx="70" cy="52" r="5" fill="var(--muted-foreground)" fillOpacity="0.6" />
      <circle cx="88" cy="52" r="5" fill="var(--muted-foreground)" fillOpacity="0.3" />
      <rect x="128" y="99" width="120" height="10" rx="5" fill="var(--brand)" fillOpacity="0.7" />
    </svg>
  );
}

export function ProjectCard({ project, size = "md", className }: { project: Project; size?: "lg" | "md" | "sm"; className?: string }) {
  const [open, setOpen] = useState(false);
  const cover = project.images?.[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group card-hover relative flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left ring-0 outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        aria-haspopup="dialog"
      >
        <div className={cn("relative w-full overflow-hidden border-b bg-muted/30", size === "lg" ? "h-52 sm:h-64" : "h-36")}>
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 p-4 transition-transform duration-500 group-hover:scale-[1.02]">
              <Art slug={project.slug} />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {kindLabel[project.kind]}
            </Badge>
            <span className="font-mono text-[11px] text-muted-foreground">{project.period}</span>
          </div>
          <h3 className={cn("font-heading font-semibold tracking-tight", size === "lg" ? "text-2xl" : "text-lg")}>{project.name}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{project.tagline}</p>
          {size === "lg" ? <p className="text-sm leading-relaxed text-muted-foreground/90">{project.description}</p> : null}
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
            {project.stack.slice(0, size === "lg" ? 7 : 4).map((s) => (
              <span key={s} className="rounded-md border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>
        <span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border bg-background/70 text-muted-foreground opacity-0 transition-all group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                {kindLabel[project.kind]}
              </Badge>
              <span className="font-mono text-[11px] text-muted-foreground">{project.period}</span>
            </div>
            <DialogTitle className="font-heading text-2xl font-semibold tracking-tight">{project.name}</DialogTitle>
            <DialogDescription className="text-base">{project.tagline}</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-foreground/90">{project.description}</p>
          {project.highlights.length ? (
            <ul className="grid gap-2 sm:grid-cols-1">
              {project.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                  {h}
                </li>
              ))}
            </ul>
          ) : null}
          {project.images?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {project.images.map((src) => (
                <div key={src} className="relative h-40 overflow-hidden rounded-lg border">
                  <Image src={src} alt="" fill sizes="50vw" className="object-cover object-top" />
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <span key={s} className="rounded-md border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
          {project.links?.github || project.links?.demo ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {project.links.github ? (
                <Button variant="outline" size="sm" render={<a href={project.links.github} target="_blank" rel="noreferrer" />}>
                  <Github />
                  Source & docs
                </Button>
              ) : null}
              {project.links.demo ? (
                <Button size="sm" render={<a href={project.links.demo} target="_blank" rel="noreferrer" />}>
                  Live
                  <ArrowUpRight />
                </Button>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
