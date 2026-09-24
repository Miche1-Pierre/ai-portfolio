import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/site/section";
import { bulletKinds, ShapeBullet, type Tone } from "@/components/site/shapes";
import { experiences } from "@/content/experience";
import { site } from "@/content/site";

const BULLET_TONES: Tone[] = ["blue", "red", "yellow", "green", "pink"];

/** Dust's "In the press" list: title block on the left, a ruled list with mono datelines. */
export function Experience() {
  return (
    <section id="experience" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
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

        <ol className="border-t">
          {experiences.map((e, i) => (
            <li key={`${e.company}-${e.role}`} className="border-b py-7">
              <Reveal delay={Math.min(i * 0.03, 0.12)}>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em]">
                  <span className="text-ink-blue">{e.company}</span>
                  <span className="text-muted-foreground">
                    {"  ·  "}
                    {e.start} - {e.end}
                  </span>
                  {e.current ? (
                    <span className="ml-3 inline-flex items-center gap-1.5 text-ink-green">
                      <span className="size-1.5 rounded-full bg-shape-green" />
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
    </section>
  );
}
