import { Section } from "@/components/site/section";
import { ProjectCard } from "@/components/site/project-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { archiveProjects, clientProjects, projects } from "@/content/projects";

export function Work() {
  const taskforce = projects.find((p) => p.slug === "taskforce")!;
  const brainOs = projects.find((p) => p.slug === "brain-os")!;
  const plania = projects.find((p) => p.slug === "plania")!;
  const agent = projects.find((p) => p.slug === "ai-sales-agent")!;

  return (
    <Section
      id="work"
      index="01"
      eyebrow="Selected work"
      title="Products, agents and platforms — shipped, not just prototyped."
      description="A flagship execution layer, an LLM memory substrate, a 13,000-user SaaS rebuilt under load, and AI systems in production for enterprise clients."
    >
      <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[minmax(0,1fr)]">
        <StaggerItem className="md:col-span-4 md:row-span-2">
          <ProjectCard project={taskforce} size="lg" />
        </StaggerItem>
        <StaggerItem className="md:col-span-2">
          <ProjectCard project={brainOs} />
        </StaggerItem>
        <StaggerItem className="md:col-span-2">
          <ProjectCard project={agent} />
        </StaggerItem>
        <StaggerItem className="md:col-span-6">
          <ProjectCard project={plania} className="md:[&_h3]:text-xl" />
        </StaggerItem>
      </Stagger>

      <div className="mt-12">
        <div className="mb-5 flex items-center gap-3">
          <span className="eyebrow">More client work</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientProjects.map((p) => (
            <StaggerItem key={p.slug}>
              <ProjectCard project={p} size="sm" />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <div className="mt-12">
        <div className="mb-5 flex items-center gap-3">
          <span className="eyebrow">Archive</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archiveProjects.map((p) => (
            <StaggerItem key={p.slug}>
              <ProjectCard project={p} size="sm" />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}
