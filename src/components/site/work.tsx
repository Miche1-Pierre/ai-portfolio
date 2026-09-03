import { Section } from "@/components/site/section";
import { ProjectCard } from "@/components/site/project-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { archiveProjects, clientProjects, featuredProjects } from "@/content/projects";

// One uniform grid shape reused for every group, so all cards/thumbnails stay identical in size.
const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="eyebrow">{children}</span>
      <span className="h-px flex-1 bg-border" />
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
      <Stagger className={GRID}>
        {featuredProjects.map((p) => (
          <StaggerItem key={p.slug}>
            <ProjectCard project={p} />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-12">
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
