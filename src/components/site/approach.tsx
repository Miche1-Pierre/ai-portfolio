import { Reveal } from "@/components/motion/reveal";
import { CropMarks, SectionRule } from "@/components/site/marks";
import { SectionHeader } from "@/components/site/section";
import { cn } from "@/lib/utils";

// The three phases; the checklists restate each blurb, nothing added.
const phases = [
  {
    title: "Scope & architecture",
    blurb: "We align on the outcome, the constraints and the architecture before a line of code, so the build has a spine.",
    checks: ["Outcome", "Constraints", "Architecture"],
    badge: "bg-shape-blue text-white",
    dot: "bg-shape-blue",
  },
  {
    title: "Build in the loop",
    blurb: "Ship in governed increments, with the right tools in the loop, human approval at each gate, and a real audit trail.",
    checks: ["Governed increments", "Human approval at each gate", "Audit trail"],
    badge: "bg-shape-red text-white",
    dot: "bg-shape-red",
  },
  {
    title: "Harden & launch",
    blurb: "Security, observability and QA through to production, with the documentation that keeps it maintainable.",
    checks: ["Security", "Observability", "QA", "Documentation"],
    badge: "bg-shape-yellow text-night",
    dot: "bg-shape-yellow",
  },
];

/** The approach as a pipeline of three square stages on blueprint paper. */
export function Approach() {
  return (
    <section id="approach" className="scroll-mt-20 pb-20 pt-4 sm:pb-28">
      <div className="container-x">
        <SectionRule className="mb-14 sm:mb-20" />
        <Reveal>
          <SectionHeader
            index="03"
            eyebrow="My approach"
            title="How I take an idea to something in production."
            description="Three phases, the same discipline whether it's a startup MVP or a regulated platform."
            className="mb-12 sm:mb-16"
          />
        </Reveal>
        <Reveal delay={0.05}>
          <div className="relative bg-tint-blue p-4 [background-image:linear-gradient(to_right,color-mix(in_oklch,var(--ink-blue)_10%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--ink-blue)_10%,transparent)_1px,transparent_1px)] [background-size:24px_24px] sm:p-8">
            <CropMarks />
            <ol className="relative grid gap-4 lg:grid-cols-3 lg:gap-8">
              {/* the pipeline, visible between the stages on desktop */}
              <span aria-hidden className="absolute inset-x-0 top-[38px] hidden h-0.5 bg-ink-blue/50 lg:block" />
              {phases.map((p, i) => (
                <li key={p.title} className="relative border border-foreground/10 bg-card p-6">
                  <div className="flex items-center gap-3">
                    <span className={cn("grid size-7 place-items-center rounded-full font-mono text-[11px]", p.badge)}>{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Phase {i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-medium tracking-[-0.02em]">{p.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{p.blurb}</p>
                  <ul className="mt-5 space-y-2 border-t border-rule pt-4">
                    {p.checks.map((c) => (
                      <li key={c} className="flex items-center gap-2.5 font-mono text-[12px] text-foreground/80">
                        <span className={cn("size-1.5 shrink-0 rounded-full", p.dot)} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
