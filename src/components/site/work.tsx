import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/site/section";
import { ProjectCard } from "@/components/site/project-card";
import { PinContainer } from "@/components/aceternity/pin";
import { IconCover } from "@/components/site/icon-cover";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { archiveProjects, clientProjects, featuredProjects, type Project } from "@/content/projects";

const kindLabel: Record<Project["kind"], string> = {
  flagship: "Flagship",
  product: "Product",
  client: "Client work",
  archive: "Archive",
};

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="eyebrow">{children}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function FeaturedPin({ project }: { project: Project }) {
  const cover = project.cover ?? project.images?.[0];
  return (
    <div className="flex h-[27rem] w-full items-center justify-center">
      <PinContainer href={`/work/${project.slug}`} title="View case study">
        <div className="w-[18rem] sm:w-[22rem]">
          <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-xl border bg-muted/20">
            {cover ? (
              <Image src={cover} alt="" fill sizes="(max-width: 640px) 80vw, 320px" className="object-cover object-top" />
            ) : (
              <IconCover project={project} />
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {kindLabel[project.kind]}
            </Badge>
            <span className="font-mono text-[11px] text-muted-foreground">{project.period}</span>
          </div>
          <h3 className="mt-2 font-heading text-lg font-semibold tracking-tight">{project.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{project.tagline}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.stack.slice(0, 4).map((s) => (
              <span key={s} className="rounded-md border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand">
            View case study
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </PinContainer>
    </div>
  );
}

export function Work() {
  return (
    <Section
      id="work"
      index="01"
      eyebrow="Selected work"
      title="Products, agents and platforms - shipped, not just prototyped."
      description="A flagship execution layer, an LLM memory substrate, a 13,000-user SaaS rebuilt under load, and AI systems in production for enterprise clients."
    >
      {/* Featured: 3D-pin cards that open the case study */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {featuredProjects.map((p) => (
          <FeaturedPin key={p.slug} project={p} />
        ))}
      </div>

      <div className="mt-8">
        <GroupLabel>More client work</GroupLabel>
        <Stagger className={GRID}>
          {clientProjects.map((p) => (
            <StaggerItem key={p.slug}>
              <ProjectCard project={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <div className="mt-12">
        <GroupLabel>Archive</GroupLabel>
        <Stagger className={GRID}>
          {archiveProjects.map((p) => (
            <StaggerItem key={p.slug}>
              <ProjectCard project={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
