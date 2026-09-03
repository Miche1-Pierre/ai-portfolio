import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconCover } from "@/components/site/icon-cover";
import type { Project } from "@/content/projects";
import { cn } from "@/lib/utils";

const kindLabel: Record<Project["kind"], string> = {
  flagship: "Flagship",
  product: "Product",
  client: "Client work",
  archive: "Archive",
};

// One uniform card for every project (Huly-style): identical thumbnail framing (16/10) and body,
// so the grid reads as a consistent set of tiles rather than mismatched sizes.
export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  const cover = project.cover ?? project.images?.[0];

  return (
    <Link
      href={`/work/${project.slug}`}
      className={cn(
        "group card-hover relative flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      aria-label={`${project.name} - open case study`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b bg-muted/20">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <IconCover project={project} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/70 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {kindLabel[project.kind]}
          </Badge>
          <span className="font-mono text-[11px] text-muted-foreground">{project.period}</span>
        </div>
        <h3 className="font-heading text-lg font-semibold tracking-tight">{project.name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{project.tagline}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {project.stack.slice(0, 4).map((s) => (
            <span key={s} className="rounded-md border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          View case study
          <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>

      <span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border bg-background/70 text-muted-foreground opacity-0 backdrop-blur transition-all group-hover:opacity-100">
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
}
