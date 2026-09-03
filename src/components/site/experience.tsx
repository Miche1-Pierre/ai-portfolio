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
      <ol className="relative">
        {/* the rail — a single line, centered on the dots */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 left-[10px] top-2 w-px -translate-x-1/2 bg-gradient-to-b from-border via-border to-transparent"
        />
        {experiences.map((e, i) => {
          const rich = e.bullets.length > 0;
          return (
            <li key={`${e.company}-${e.role}`} className="relative grid grid-cols-[20px_1fr] gap-x-4 pb-8 last:pb-0 sm:gap-x-6">
              {/* dot — centered in the 20px gutter, exactly on the rail */}
              <span className="relative flex justify-center pt-[7px]" aria-hidden>
                {e.current ? <span className="absolute top-[5px] size-3.5 animate-pulse-ring rounded-full bg-brand/50" /> : null}
                <span className={cn("relative z-10 size-[9px] rounded-full ring-4 ring-background", e.current ? "bg-brand" : "bg-muted-foreground/40")} />
              </span>

              <Reveal delay={i * 0.03}>
                {rich ? (
                  <div className="-mt-1 rounded-2xl border bg-card/60 p-5 transition-colors hover:bg-card sm:p-6">
                    <Head e={e} />
                    <p className="mt-3 text-sm leading-relaxed text-foreground/90">{e.summary}</p>
                    <ul className="mt-3 space-y-2">
                      {e.bullets.map((b) => (
                        <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/80" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Tags tags={e.tags} />
                  </div>
                ) : (
                  <div className="pb-1 pt-0.5">
                    <Head e={e} />
                    {e.summary ? <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.summary}</p> : null}
                    <Tags tags={e.tags} compact />
                  </div>
                )}
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

function Head({ e }: { e: (typeof experiences)[number] }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h3 className="font-heading text-base font-semibold tracking-tight sm:text-lg">
        {e.role} <span className="text-muted-foreground">·</span> {e.company}
      </h3>
      <span className="font-mono text-[11px] text-muted-foreground">
        {e.start} — {e.end}
        {e.current ? <span className="ml-2 text-brand">●</span> : null}
      </span>
      <p className="w-full text-xs text-muted-foreground">{e.location}</p>
    </div>
  );
}

function Tags({ tags, compact = false }: { tags: readonly string[]; compact?: boolean }) {
  if (!tags.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", compact ? "mt-2.5" : "mt-4")}>
      {tags.map((t) => (
        <Badge key={t} variant="secondary" className="font-normal">
          {t}
        </Badge>
      ))}
    </div>
  );
}
