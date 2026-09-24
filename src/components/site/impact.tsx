import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/site/section";
import { ShapeBadge, toneFill, toneInk, toneTint, type Tone } from "@/components/site/shapes";
import { projectBySlug } from "@/content/projects";
import { cn } from "@/lib/utils";

// Results straight from the case studies (projects.ts); names follow site.showClientNames.
const COLUMNS: { slug: string; tone: Tone; badge: [Tone, Tone]; points: string[] }[] = [
  {
    slug: "plania",
    tone: "pink",
    badge: ["red", "pink"],
    points: [
      "13,000 registered users",
      "MRR held at $12k through the migration",
      "5 sales a day after the rebuild",
      "AI agent adopted by 1 buyer in 10",
    ],
  },
  {
    slug: "ai-sales-agent",
    tone: "lime",
    badge: ["green", "lime"],
    points: [
      "60% of inbound traffic handled by the agent",
      "1 conversation in 4 becomes a quote request",
      "From scoping to production in weeks",
    ],
  },
  {
    slug: "incident-triage",
    tone: "blue",
    badge: ["blue", "sky"],
    points: [
      "Cost per report from $1.93 to near zero",
      "~100 hours of manual work freed each month",
      "About $29k a year redeployed to higher-value work",
    ],
  },
];

/** Dust's "Trust datasheet": three joined pastel columns with numbered headers and bullets. */
export function Impact() {
  return (
    <section id="impact" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            eyebrow="Impact"
            tone="green"
            title="Results that held up in production."
            description="Three enterprise accounts shipped in seven months, and a 13,000-user SaaS rebuilt without a revenue dip."
          />
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-14 flex items-center justify-between gap-4 px-1 text-sm">
            <span className="text-muted-foreground">Impact datasheet</span>
            <a href="#work" className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-ink-blue">
              All case studies
              <ArrowRight className="size-4" />
            </a>
          </div>
          <div className="mt-4 grid overflow-hidden rounded-3xl md:grid-cols-3">
            {COLUMNS.map((c, i) => {
              const project = projectBySlug(c.slug);
              if (!project) return null;
              return (
                <div key={c.slug} className={cn("flex flex-col p-7 sm:p-8", toneTint[c.tone])}>
                  <div className="flex items-start gap-3">
                    <ShapeBadge top={c.badge[0]} bottom={c.badge[1]} />
                    <div>
                      <p className={cn("num text-lg", toneInk[c.badge[0]])}>{String(i + 1).padStart(2, "0")}</p>
                      <h3 className="mt-0.5 text-[1.05rem] font-medium leading-snug tracking-[-0.01em]">{project.name}</h3>
                    </div>
                  </div>
                  <ul className="mt-8 space-y-4">
                    {c.points.map((pt) => (
                      <li key={pt} className="flex gap-3 text-[15px] leading-snug">
                        <span className={cn("mt-[7px] size-1.5 shrink-0 rounded-full", toneFill[c.badge[0]])} />
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
