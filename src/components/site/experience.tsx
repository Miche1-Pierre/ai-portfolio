import { Section } from "@/components/site/section";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { experiences } from "@/content/experience";
import { cn } from "@/lib/utils";

export function Experience() {
  return (
    <Section
      id="experience"
      index="02"
      eyebrow="Experience"
      title="From research lab to regulated industry to startup leadership."
      description="Three years of taking projects from scoping through to production — and progressively owning architecture, applied AI and product decisions."
    >
      <ol className="relative border-l border-border/80 pl-6 sm:pl-10">
        {experiences.map((e, i) => (
          <li key={`${e.company}-${e.role}`} className="relative pb-10 last:pb-0">
            <span
              className={cn(
                "absolute -left-[1.6rem] top-1.5 grid size-5 place-items-center sm:-left-[2.6rem]",
                e.current ? "text-brand" : "text-muted-foreground"
              )}
              aria-hidden
            >
              {e.current ? <span className="absolute size-5 animate-pulse-ring rounded-full bg-brand/60" /> : null}
              <span className={cn("size-2.5 rounded-full ring-4 ring-background", e.current ? "bg-brand" : "bg-border")} />
            </span>
            <Reveal delay={i * 0.04}>
              <div className="rounded-2xl border bg-card/60 p-5 transition-colors hover:bg-card sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-heading text-lg font-semibold tracking-tight">
                    {e.role} <span className="text-muted-foreground">·</span> {e.company}
                  </h3>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {e.start} — {e.end}
                    {e.current ? <span className="ml-2 text-brand">●</span> : null}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{e.location}</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">{e.summary}</p>
                {e.bullets.length ? (
                  <ul className="mt-3 space-y-2">
                    {e.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/80" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {e.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
