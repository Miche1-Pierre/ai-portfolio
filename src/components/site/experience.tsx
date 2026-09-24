import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionRule } from "@/components/site/marks";
import { SectionHeader } from "@/components/site/section";
import { bulletKinds, ShapeBullet, type Tone } from "@/components/site/shapes";
import { experiences } from "@/content/experience";
import { site } from "@/content/site";

const BULLET_TONES: Tone[] = ["blue", "red", "yellow", "green", "pink"];

/** Experience as a ruled log: title block on the left, mono datelines and roles on the right. */
export function Experience() {
  return (
    <section id="experience" className="scroll-mt-20 pb-20 pt-4 sm:pb-28">
      <div className="container-x">
        <SectionRule className="mb-14 sm:mb-20" />
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              index="06"
              eyebrow="Experience"
              size="md"
              title="From research lab to regulated industry to startup leadership."
              description="Three years of taking projects from scoping through to production - and progressively owning architecture, applied AI and product decisions."
            />
            <a
              href={site.socials.linkedin.href}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-[15px] font-medium transition-colors hover:text-ink-blue"
            >
              More on LinkedIn
              <ArrowRight className="size-4" />
            </a>
          </Reveal>

          <ol className="border-t border-rule">
            {experiences.map((e, i) => (
              <li key={`${e.company}-${e.role}`} className="grid grid-cols-[2.5rem_1fr] gap-x-2 border-b border-rule py-7">
                <span className="num pt-0.5 text-[12px] text-subtle">{String(experiences.length - i).padStart(2, "0")}</span>
                <Reveal delay={Math.min(i * 0.03, 0.12)}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em]">
                    <span className="text-ink-blue">{e.company}</span>
                    <span className="text-muted-foreground">
                      {"  ·  "}
                      {e.start} - {e.end}
                    </span>
                    {e.current ? (
                      <span className="ml-3 inline-flex items-center gap-1.5 text-ink-green">
                        <span className="size-1.5 bg-shape-green" />
                        Now
                      </span>
                    ) : null}
                  </p>
                  <h3 className="mt-2.5 text-xl font-medium tracking-[-0.02em]">{e.role}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{e.location}</p>
                  {e.summary ? <p className="mt-3 max-w-2xl leading-relaxed text-foreground/85">{e.summary}</p> : null}
                  {e.bullets.length ? (
                    <ul className="mt-4 max-w-2xl space-y-2.5">
                      {e.bullets.map((b, j) => (
                        <li key={b} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground">
                          <ShapeBullet
                            kind={bulletKinds[j % bulletKinds.length]}
                            tone={BULLET_TONES[j % BULLET_TONES.length]}
                            className="mt-1.5 size-2.5"
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {e.tags.length ? (
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.06em] text-subtle">{e.tags.join("  ·  ")}</p>
                  ) : null}
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
