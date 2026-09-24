import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookText, Github, Globe } from "lucide-react";
import { IconCover } from "@/components/site/icon-cover";
import { Pill } from "@/components/site/pill";
import { kindLabel } from "@/components/site/project-card";
import { Shape, toneShape, toneStrong, toneTint } from "@/components/site/shapes";
import { cta } from "@/components/site/cta";
import type { Project } from "@/content/projects";
import { cn } from "@/lib/utils";

/**
 * Case-study hero (DA v3, Dust-style): back link, tone pill, display title, actions, then the
 * product shown as a window standing in a large pastel panel of the project's tone.
 */
export function ProjectHero({ project }: { project: Project }) {
  const deco = toneShape[toneStrong(project.tone)];
  const cover = project.cover ?? project.images?.[0];
  const domain = project.links?.site?.replace(/^https?:\/\//, "").replace(/\/$/, "") ?? project.slug;
  const links = project.links;
  const hasLinks = !!(links && (links.site || links.github || links.docs || links.demo));

  return (
    <section className="pt-24 sm:pt-28">
      <div className="container-x">
        <Link href="/#work" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" />
          All work
        </Link>

        <div className="mt-10 grid items-end gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div>
            <Pill tone={project.tone}>
              {kindLabel[project.kind]} · {project.period}
            </Pill>
            <h1 className="display mt-6 text-[clamp(2.6rem,5.4vw,4.75rem)]">{project.name}</h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">{project.tagline}</p>
          </div>

          {hasLinks ? (
            <div className="flex flex-wrap gap-2.5 lg:justify-end">
              {links?.site ? (
                <a href={links.site} target="_blank" rel="noreferrer" className={cta({ size: "md" })}>
                  <Globe />
                  Visit site
                  <ArrowUpRight />
                </a>
              ) : null}
              {links?.github ? (
                <a href={links.github} target="_blank" rel="noreferrer" className={cta({ variant: "secondary", size: "md" })}>
                  <Github />
                  Source
                </a>
              ) : null}
              {links?.docs ? (
                <a href={links.docs} target="_blank" rel="noreferrer" className={cta({ variant: "secondary", size: "md" })}>
                  <BookText />
                  Docs
                </a>
              ) : null}
              {links?.demo ? (
                <a href={links.demo} target="_blank" rel="noreferrer" className={cta({ variant: "secondary", size: "md" })}>
                  Live demo
                  <ArrowUpRight />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="container-wide mt-12 sm:mt-14">
        <div className={cn("relative overflow-hidden rounded-[2rem] px-4 pt-12 sm:px-10 sm:pt-16 lg:px-20 lg:pt-20", toneTint[project.tone])}>
          <span aria-hidden className="absolute left-6 top-6 flex items-center gap-1.5 sm:left-8 sm:top-8">
            <Shape kind="circle" className={cn("size-5", deco)} />
            <Shape kind="dee" className={cn("size-5 opacity-60", deco)} />
          </span>
          <span aria-hidden className="absolute right-6 top-6 hidden items-center gap-1.5 sm:right-8 sm:top-8 sm:flex">
            <Shape kind="quarter" className={cn("size-5 opacity-60", deco)} />
            <Shape kind="square" className={cn("size-5", deco)} />
          </span>

          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-t-2xl bg-card shadow-window">
            {!project.coverBare ? (
              <div className="flex h-9 items-center gap-2 border-b bg-paper-soft px-4">
                <span className="size-2.5 rounded-full bg-shape-red/80" />
                <span className="size-2.5 rounded-full bg-shape-yellow/80" />
                <span className="size-2.5 rounded-full bg-shape-green/80" />
                <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">{domain}</span>
              </div>
            ) : null}
            <div className="relative aspect-[16/9] w-full bg-muted">
              {cover ? (
                <Image
                  src={cover}
                  alt={`${project.name} product screenshot`}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1152px"
                  className="object-cover object-top"
                  priority
                />
              ) : (
                <IconCover project={project} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
