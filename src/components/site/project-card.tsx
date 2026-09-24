import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IconCover } from "@/components/site/icon-cover";
import { Shape, toneFill, toneShape, toneStrong, toneTint } from "@/components/site/shapes";
import type { Project } from "@/content/projects";
import { cn } from "@/lib/utils";

export const kindLabel: Record<Project["kind"], string> = {
  flagship: "Flagship",
  product: "Product",
  client: "Client work",
  archive: "Archive",
};

/**
 * One uniform card for every project (his rule: identical tiles across groups). DA v3.1: a square
 * pastel panel in the project's tone holding the product as a window, with a numbered label.
 */
export function ProjectCard({ project, index, className }: { project: Project; index?: number; className?: string }) {
  const cover = project.cover ?? project.images?.[0];
  const strong = toneStrong(project.tone);

  return (
    <Link
      href={`/work/${project.slug}`}
      className={cn("group flex h-full flex-col outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)}
      aria-label={`${project.name} - read the case study`}
    >
      <div className={cn("relative aspect-[16/11] overflow-hidden", toneTint[project.tone])}>
        {/* two square blocks in the panel's corner */}
        <span aria-hidden className="absolute left-5 top-5 flex items-end gap-1">
          <Shape kind="square" className={cn("size-3.5", toneShape[strong])} />
          <Shape kind="step" className={cn("size-3.5 opacity-60", toneShape[strong])} />
        </span>
        {index !== undefined ? (
          <span className={cn("absolute right-5 top-4 font-mono text-[11px] tracking-[0.1em]", toneShape[strong])}>
            {String(index).padStart(2, "0")}
          </span>
        ) : null}
        {/* the product window, bleeding off the bottom-right */}
        <div className="absolute bottom-[-10%] left-[10%] right-[-8%] top-[16%] overflow-hidden bg-card shadow-window transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
          {!project.coverBare && cover ? (
            <div className="flex h-6 items-center gap-1.5 border-b bg-paper-soft px-3">
              <span className="size-2 bg-shape-red/80" />
              <span className="size-2 bg-shape-yellow/80" />
              <span className="size-2 bg-shape-green/80" />
            </div>
          ) : null}
          <div className="relative h-full w-full">
            {cover ? (
              <Image
                src={cover}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1152px) 50vw, 560px"
                className="object-cover object-top"
              />
            ) : (
              <IconCover project={project} />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col border-b border-rule px-1 pb-5 pt-5">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          <span className={cn("size-2", toneFill[strong])} />
          {kindLabel[project.kind]}
          <span className="text-border">/</span>
          {project.period}
        </p>
        <h3 className="mt-2.5 text-xl font-medium tracking-[-0.02em] sm:text-[1.35rem]">{project.name}</h3>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{project.tagline}</p>
        <p className="mt-3 font-mono text-[11px] leading-relaxed text-subtle">{project.stack.slice(0, 4).join(" · ")}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-foreground transition-colors group-hover:text-ink-blue">
          Read the case study
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
