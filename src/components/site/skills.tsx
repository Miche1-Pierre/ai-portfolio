import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/site/section";
import { skillGroups } from "@/content/skills";
import { cn } from "@/lib/utils";

const MARK = ["bg-shape-blue", "bg-shape-red", "bg-shape-yellow", "bg-shape-green"];
const INK = ["text-ink-blue", "text-ink-red", "text-ink-yellow", "text-ink-green"];

/** Skills as a ruled 2x2 sheet: one square cell per group, numbered, with its stack. */
export function Skills() {
  return (
    <Section
      id="skills"
      index="05"
      eyebrow="Skills"
      title="A full-stack core with an applied-AI edge."
      description="Backend systems that hold in production, frontends people actually use, and agents with guardrails - in environments where compliance is not optional."
    >
      <div className="grid border-l border-t border-rule md:grid-cols-2">
        {skillGroups.map((g, i) => (
          <Reveal key={g.title} delay={i * 0.04} className="flex flex-col border-b border-r border-rule p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <span className={cn("size-3", MARK[i % MARK.length])} />
              <span className={cn("num text-sm", INK[i % INK.length])}>S.{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="mt-6 text-2xl font-medium tracking-[-0.02em]">{g.title}</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{g.blurb}</p>
            <p className="mt-6 border-t border-rule pt-5 font-mono text-[12px] leading-[1.9] text-foreground/80">{g.items.join("  ·  ")}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
