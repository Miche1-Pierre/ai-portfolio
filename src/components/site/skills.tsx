import { Server, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { Section } from "@/components/site/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { skillGroups } from "@/content/skills";

const icons = [Server, Sparkles, ShieldCheck, Wrench];

export function Skills() {
  return (
    <Section
      id="skills"
      index="03"
      eyebrow="Skills"
      title="A full-stack core with an applied-AI edge."
      description="Backend systems that hold in production, frontends people actually use, and agents with guardrails — in environments where compliance is not optional."
    >
      <Stagger className="grid gap-4 md:grid-cols-2">
        {skillGroups.map((g, i) => {
          const Icon = icons[i % icons.length];
          return (
            <StaggerItem key={g.title}>
              <div className="card-hover group h-full rounded-2xl border bg-card p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg border bg-muted/40 text-brand">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="font-heading text-lg font-semibold tracking-tight">{g.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{g.blurb}</p>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {g.items.map((s) => (
                    <li
                      key={s}
                      className="rounded-md border bg-background/60 px-2.5 py-1 text-xs text-foreground/90 transition-colors group-hover:border-brand/30"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
