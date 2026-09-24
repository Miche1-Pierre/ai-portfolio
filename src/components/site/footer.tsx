import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PMMark } from "@/components/site/logo";
import { PlusMark } from "@/components/site/marks";
import { Pill } from "@/components/site/pill";
import { cta } from "@/components/site/cta";
import { featuredProjects } from "@/content/projects";
import { navigation, site } from "@/content/site";

/** Closing dark band: a square tag, one highlighted word, a blinking cursor, one cobalt action. */
function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-night text-night-foreground">
      <div className="container-x relative py-24 sm:py-32">
        <PlusMark className="left-5 top-8 text-night-foreground/40 sm:left-8" />
        <PlusMark className="right-5 top-8 text-night-foreground/40 sm:right-8" />
        <Pill tone="night">Open to new teams</Pill>
        <h2 className="display mt-8 max-w-4xl text-[clamp(2.5rem,5.6vw,4.9rem)]">
          Good products aren&apos;t just prototyped. They&apos;re <span className="mark">shipped</span>.
          <span aria-hidden className="ml-3 inline-block h-[0.72em] w-[0.42em] translate-y-[0.06em] animate-blink bg-shape-lime" />
        </h2>
        <div className="mt-10 flex flex-col gap-8 border-t border-night-line pt-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl text-lg leading-relaxed text-night-muted">
            {site.availability}, remote-friendly and open anywhere. The fastest way to reach me is a short email: I reply
            within a day.
          </p>
          <a href={`mailto:${site.email}`} className={cta({ size: "lg" })}>
            Let&apos;s get in touch
            <ArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
}

function Column({ title, links }: { title: string; links: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noreferrer" className="text-[15px] text-foreground/85 transition-colors hover:text-foreground">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-[15px] text-foreground/85 transition-colors hover:text-foreground">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <CtaBand />
      <div className="bg-paper-soft">
        <div className="container-wide py-16">
          <PMMark mono className="h-8 text-foreground/85" />
          <div className="mt-12 grid grid-cols-2 gap-10 sm:grid-cols-4">
            <Column title="Work" links={featuredProjects.map((p) => ({ href: `/work/${p.slug}`, label: p.name.split(" - ")[0] }))} />
            <Column title="Portfolio" links={navigation.map((n) => ({ href: `/${n.href}`, label: n.label }))} />
            <Column
              title="Connect"
              links={[
                { href: site.socials.github.href, label: "GitHub", external: true },
                { href: site.socials.linkedin.href, label: "LinkedIn", external: true },
                { href: `mailto:${site.email}`, label: "Email", external: true },
              ]}
            />
            <Column
              title="Elsewhere"
              links={[
                { href: "https://www.taskforce-project.fr", label: "Taskforce", external: true },
                { href: "https://docs.taskforce-project.fr/guides/bienvenue", label: "Taskforce docs", external: true },
                { href: "https://bos-landing.onrender.com", label: "Brain OS", external: true },
                { href: "https://www.plania.ai", label: "Plania", external: true },
              ]}
            />
          </div>
          <div className="mt-16 flex flex-col gap-3 border-t border-rule pt-6 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {site.name} · {site.title}
            </p>
            <p>Built with Next.js · set in Geist</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
