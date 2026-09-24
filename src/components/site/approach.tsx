import { GitBranch, ShieldCheck, Target, UserCheck, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PMMark } from "@/components/site/logo";
import { SectionHeader } from "@/components/site/section";
import { cn } from "@/lib/utils";

const phases = [
  {
    title: "Scope & architecture",
    blurb: "We align on the outcome, the constraints and the architecture before a line of code, so the build has a spine.",
    ink: "text-ink-blue",
  },
  {
    title: "Build in the loop",
    blurb: "Ship in governed increments, with the right tools in the loop, human approval at each gate, and a real audit trail.",
    ink: "text-ink-red",
  },
  {
    title: "Harden & launch",
    blurb: "Security, observability and QA through to production, with the documentation that keeps it maintainable.",
    ink: "text-ink-yellow",
  },
];

// The same three phases, drawn as Dust's "agent in action" flow.
const FLOW: { icon: LucideIcon; text: string }[] = [
  { icon: Target, text: "Outcome and constraints agreed" },
  { icon: GitBranch, text: "Built in governed increments" },
  { icon: UserCheck, text: "Human approval at each gate" },
  { icon: ShieldCheck, text: "Secured, observed, shipped" },
];

/** Dust's "See Dust in action" block: a pastel panel with a flow, and the text beside it. */
export function Approach() {
  return (
    <section id="approach" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-3xl bg-tint-blue px-6 py-12 sm:px-12 sm:py-14">
            <div className="relative mx-auto flex max-w-sm flex-col items-center">
              {/* the thread linking the steps */}
              <span aria-hidden className="absolute bottom-6 top-12 w-px bg-shape-blue/50" />
              <span className="relative grid size-24 place-items-center rounded-2xl border bg-card shadow-md">
                <PMMark className="h-7" />
              </span>
              <ol className="relative mt-8 w-full space-y-3">
                {FLOW.map(({ icon: Icon, text }, i) => (
                  <li
                    key={text}
                    className="flex items-center justify-center gap-2.5 rounded-lg border bg-card px-4 py-3 text-sm text-foreground/90 shadow-xs"
                  >
                    {i === 0 ? <span className="size-1.5 rounded-full bg-shape-blue" /> : null}
                    <Icon className="size-4 text-ink-blue" strokeWidth={1.75} />
                    {text}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>

        <Reveal className="order-1 lg:order-2">
          <SectionHeader
            eyebrow="My approach"
            size="md"
            title="How I take an idea to something in production."
            description="Three phases, the same discipline whether it's a startup MVP or a regulated platform."
          />
          <ol className="mt-10 space-y-6">
            {phases.map((p, i) => (
              <li key={p.title} className="grid grid-cols-[2.75rem_1fr] gap-2 border-t pt-5">
                <span className={cn("num text-xl", p.ink)}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-lg font-medium tracking-[-0.015em]">{p.title}</h3>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{p.blurb}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
