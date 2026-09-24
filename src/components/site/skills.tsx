import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/site/section";
import { skillGroups } from "@/content/skills";
import { cn } from "@/lib/utils";

// Dust numbers its pillars in mono, each in its own colour.
const INK = ["text-ink-blue", "text-ink-red", "text-ink-yellow", "text-ink-green"];

/** Dust's numbered 2x2 pillars ("01 ----"), one per skill group. */
export function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="Skills"
      title="A full-stack core with an applied-AI edge."
      description="Backend systems that hold in production, frontends people actually use, and agents with guardrails - in environments where compliance is not optional."
      align="center"
    >
      <div className="mx-auto grid max-w-5xl gap-x-16 gap-y-14 md:grid-cols-2">
        {skillGroups.map((g, i) => (
          <Reveal key={g.title} delay={i * 0.04}>
            <div className="flex items-center gap-5">
              <span className={cn("num text-[2rem] leading-none", INK[i % INK.length])}>{String(i + 1).padStart(2, "0")}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <h3 className="mt-7 text-2xl font-medium tracking-[-0.02em]">{g.title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{g.blurb}</p>
            <p className="mt-5 text-[15px] leading-relaxed text-foreground/80">{g.items.join("  ·  ")}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
