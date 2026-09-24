import Link from "next/link";
import { PMMark } from "@/components/site/logo";
import { featuredProjects } from "@/content/projects";
import { navigation, site } from "@/content/site";

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
    <footer className="border-t border-rule bg-paper-soft">
      <div className="container-wide py-16">
        <PMMark className="h-8" />
        <div className="mt-12 grid grid-cols-2 gap-10 sm:grid-cols-3">
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
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-rule pt-6 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name} · {site.title}
          </p>
          <p>Built with Next.js · set in Geist</p>
        </div>
      </div>
    </footer>
  );
}
