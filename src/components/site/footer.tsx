import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PMMark } from "@/components/site/logo";
import { Pill } from "@/components/site/pill";
import { cta } from "@/components/site/cta";
import { featuredProjects } from "@/content/projects";
import { navigation, site } from "@/content/site";

/** Dust's closing dark band: mono pill, big white line with one serif word, one blue action. */
function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-night text-night-foreground">
      <div className="container-x flex flex-col items-center py-24 text-center sm:py-32">
        <Pill tone="night">Open to new teams</Pill>
        <h2 className="display mt-8 max-w-4xl text-[clamp(2.5rem,5.6vw,4.9rem)]">
          Good products aren&apos;t just prototyped. They&apos;re <span className="serif-accent">shipped</span>.
        </h2>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-night-muted">
          {site.availability}, remote-friendly and open anywhere. The fastest way to reach me is a short email: I reply
          within a day.
        </p>
        <a href={`mailto:${site.email}`} className={cta({ size: "lg", className: "mt-10" })}>
          Let&apos;s get in touch
          <ArrowRight />
        </a>
      </div>
    </section>
  );
}

function Column({ title, links }: { title: string; links: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">{title}</p>
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
          <PMMark mono className="h-8 text-foreground/80" />
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
          <div className="mt-16 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {site.name} · {site.title}
            </p>
            <p>Built with Next.js, set in Geist.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
