import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { organizations } from "@/content/site";

/** Dust's "Trusted by teams at 3,000+ organizations" row, as a typographic name wall. */
export function Trusted() {
  return (
    <section aria-labelledby="trusted-title" className="py-14 sm:py-20">
      <div className="container-x">
        <Reveal>
          <h2 id="trusted-title" className="title mx-auto max-w-xl text-center text-[clamp(1.7rem,2.8vw,2.3rem)]">
            Trusted by teams <br className="hidden sm:block" />
            at <span className="text-shape-blue">{organizations.length}</span> organizations
          </h2>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {organizations.map((o) => (
            <li key={o.name} className="flex flex-col items-center gap-2 text-center">
              <span className="text-lg font-semibold tracking-[-0.035em] text-foreground/60 sm:text-xl">{o.name}</span>
              {o.slug ? (
                <Link
                  href={`/work/${o.slug}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Case study
                  <ArrowUpRight className="size-3" />
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground">{o.kind === "employer" ? "Employer" : "Client"}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
