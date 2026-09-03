import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="container-x flex flex-col items-start justify-between gap-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <div>
          <p className="font-medium text-foreground">{site.name}</p>
          <p className="mt-1">
            {site.title} · © {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a className="transition-colors hover:text-foreground" href={site.socials.github.href} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="transition-colors hover:text-foreground" href={site.socials.linkedin.href} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="transition-colors hover:text-foreground" href={`mailto:${site.email}`}>
            Email
          </a>
          <span className="hidden text-border sm:inline">|</span>
          <span className="font-mono text-[11px]">Next.js · shadcn/ui · motion</span>
        </div>
      </div>
    </footer>
  );
}
