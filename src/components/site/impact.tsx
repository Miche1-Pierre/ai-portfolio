import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionRule } from "@/components/site/marks";
import { SectionHeader } from "@/components/site/section";
import { ShapeBadge, toneFill, toneInk, toneTint, type Tone } from "@/components/site/shapes";
import { projectBySlug } from "@/content/projects";
import { cn } from "@/lib/utils";

// Results straight from the case studies (projects.ts); names follow site.showClientNames.
const COLUMNS: { slug: string; tone: Tone; badge: [Tone, Tone]; metric: string; label: string; points: string[] }[] = [
  {
    slug: "plania",
    tone: "pink",
    badge: ["red", "pink"],
    metric: "13k",
    label: "registered users on the SaaS I lead",
    points: ["MRR held at $12k through the migration", "5 sales a day after the rebuild", "AI agent adopted by 1 buyer in 10"],
  },
  {
    slug: "ai-sales-agent",
    tone: "lime",
    badge: ["green", "lime"],
    metric: "60%",
    label: "of inbound traffic handled by the agent",
    points: ["1 conversation in 4 becomes a quote request", "From scoping to production in weeks"],
  },
  {
    slug: "incident-triage",
    tone: "blue",
    badge: ["blue", "sky"],
    metric: "~100 h",
    label: "of manual work freed every month",
    points: ["Cost per report from $1.93 to near zero", "About $29k a year redeployed to higher-value work"],
  },
];

/** Impact datasheet: three joined square columns, each led by one big number. */
export function Impact() {
  return (
    <section id="impact" className="scroll-mt-20 pb-20 pt-4 sm:pb-28">
      <div className="container-x">
        <SectionRule className="mb-14 sm:mb-20" />
        <Reveal>
          <SectionHeader
            index="04"
            eyebrow="Impact"
            tone="green"
            title="Results that held up in production."
            description="Three enterprise accounts shipped in seven months, and a 13,000-user SaaS rebuilt without a revenue dip."
          />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-14 flex items-center justify-between gap-4 px-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Impact datasheet</span>
            <a href="#work" className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-ink-blue">
              All case studies
              <ArrowRight className="size-4" />
            </a>
          </div>
          <div className="mt-4 grid border-l border-t border-rule md:grid-cols-3">
            {COLUMNS.map((c, i) => {
              const project = projectBySlug(c.slug);
              if (!project) return null;
              return (
                <div key={c.slug} className={cn("flex flex-col border-b border-r border-rule p-7 sm:p-8", toneTint[c.tone])}>
                  <div className="flex items-start gap-3">
                    <ShapeBadge top={c.badge[0]} bottom={c.badge[1]} />
                    <div>
                      <p className={cn("num text-sm", toneInk[c.badge[0]])}>{String(i + 1).padStart(2, "0")}</p>
                      <h3 className="mt-0.5 text-[1.05rem] font-medium leading-snug tracking-[-0.01em]">{project.name}</h3>
                    </div>
                  </div>
                  <p className={cn("mt-10 text-[clamp(3rem,5vw,4.25rem)] font-semibold leading-none tracking-[-0.045em]", toneInk[c.badge[0]])}>
                    {c.metric}
                  </p>
                  <p className="mt-2 text-[15px] text-muted-foreground">{c.label}</p>
                  <ul className="mt-8 space-y-3 border-t border-foreground/10 pt-6">
                    {c.points.map((pt) => (
                      <li key={pt} className="flex gap-3 text-[15px] leading-snug">
                        <span className={cn("mt-[6px] size-1.5 shrink-0", toneFill[c.badge[0]])} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/work/${c.slug}`}
                    className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-medium transition-colors hover:text-ink-blue"
                  >
                    Read the case study
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
