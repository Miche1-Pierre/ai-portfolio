import { Section } from "@/components/site/section";
import { ProjectCard } from "@/components/site/project-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { archiveProjects, clientProjects, featuredProjects } from "@/content/projects";

// Same grid for every group so every tile is identical (Pierre's rule).
const GRID = "grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2";

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className="eyebrow">{children}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function Work() {
  return (
    <Section
      id="work"
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

      <div className="mt-20">
        <GroupLabel>More client work</GroupLabel>
        <Stagger className={GRID}>
          {clientProjects.map((p) => (
            <StaggerItem key={p.slug}>
              <ProjectCard project={p} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <div className="mt-20">
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
