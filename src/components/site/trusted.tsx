import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { organizations } from "@/content/site";

/** Who Pierre shipped with: a ruled spec-sheet grid, one numbered cell per organisation. */
export function Trusted() {
  return (
    <section aria-labelledby="trusted-title" className="pb-16 pt-6 sm:pb-24">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h2 id="trusted-title" className="title text-[clamp(1.7rem,2.8vw,2.3rem)]">
            Trusted by teams at <span className="accent-word">{organizations.length}</span> organizations
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Employers and clients · 2024 - 2026</p>
        </Reveal>
        <ul className="mt-8 grid grid-cols-2 border-l border-t border-rule sm:grid-cols-4">
          {organizations.map((o, i) => (
            <li key={o.name} className="flex min-h-32 flex-col justify-between gap-6 border-b border-r border-rule p-5">
              <span className="font-mono text-[10px] tracking-[0.1em] text-subtle">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-lg font-semibold tracking-[-0.03em] sm:text-xl">{o.name}</p>
                {/* what the organisation was to Pierre, and the case study when there is one */}
                <p className="mt-1 flex flex-col items-start gap-1 font-mono text-[11px] uppercase tracking-[0.06em] lg:flex-row lg:items-center lg:gap-2">
                  <span className="text-muted-foreground">{o.kind === "employer" ? "Employer" : "Client"}</span>
                  {o.slug ? (
                    <>
                      <span aria-hidden="true" className="hidden size-1 rounded-full bg-foreground/25 lg:block" />
                      <Link href={`/work/${o.slug}`} className="inline-flex items-center gap-1 text-ink-blue hover:underline">
                        Case study
                        <ArrowUpRight className="size-3" />
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
