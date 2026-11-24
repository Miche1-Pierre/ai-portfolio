import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import type { Project, Tool } from "@/content/projects";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

const storeUrl = (id: string) => `https://apps.microsoft.com/detail/${id}`;

/** The Windows mark, for the Microsoft Store button. */
function WindowsMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path fill="currentColor" d="M3 5.5 10.5 4.5v7H3zM11.5 4.4 21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zM11.5 12.5H21V21l-9.5-1.4z" />
    </svg>
  );
}

/** "Get it from Microsoft Store", or the listing's state while it is in certification. */
function StoreButton({ tool, name }: { tool: Tool; name: string }) {
  if (!tool.store.live) {
    return (
      <span className="tool-store is-pending" aria-label={`${name} is coming to the Microsoft Store`}>
        <WindowsMark className="size-5" />
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-[0.08em] opacity-75">Coming soon to</span>
          <span className="text-[15px] font-semibold">Microsoft Store</span>
        </span>
      </span>
    );
  }
  return (
    <a href={storeUrl(tool.store.id)} target="_blank" rel="noreferrer" className="tool-store" aria-label={`Get ${name} from the Microsoft Store`}>
      <WindowsMark className="size-5" />
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-[0.08em] opacity-75">Get it from</span>
        <span className="text-[15px] font-semibold">Microsoft Store</span>
      </span>
    </a>
  );
}

/** A screenshot as an app window: a thin title bar, then the picture at 16:10. */
function Window({ src, alt, priority, sizes }: { src: string; alt: string; priority?: boolean; sizes: string }) {
  return (
    <div className="tool-window">
      <div className="tool-window-bar" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="relative aspect-[16/10]">
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover object-top" />
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, id }: { eyebrow: string; title: string; id: string }) {
  return (
    <div className="max-w-2xl">
      <p className="tool-eyebrow">{eyebrow}</p>
      <h2 id={id} className="tool-title mt-3 text-[clamp(1.7rem,3vw,2.6rem)]">
        {title}
      </h2>
    </div>
  );
}

/**
 * The page of a tool Pierre ships (TaskForce, Career OS...): a product page in the tool's own look
 * (its colours, radii and backdrop, from `.tool[data-tool]` in globals.css), with the Microsoft
 * Store and every other way to get it, the launch film when there is one, how it works, what it
 * does, a look inside, its privacy, how it is built, and the references.
 */
export function ToolPage({ project }: { project: Project & { tool: Tool } }) {
  const { tool } = project;
  const website = tool.links.find((l) => l.label === "Website");

  return (
    <div className="tool" data-tool={tool.theme}>
      {/* the tool's own strip under the site's fixed bar (h-16): back to the work, its mark and name, who made it */}
      <div className="tool-strip pt-16">
        <div className="container-x flex h-14 items-center justify-between gap-4">
          <Link href="/#work" className="inline-flex items-center gap-2 text-sm text-[var(--t-muted)] transition-colors hover:text-[var(--t-fg)]">
            <ArrowLeft className="size-4" />
            All work
          </Link>
          <span className="flex items-center gap-2.5">
            <Image src={tool.logo.src} alt="" width={tool.logo.width} height={tool.logo.height} className={cn("h-6 w-auto", tool.logo.invertOnDark && "dark:invert")} />
            <span className="font-semibold tracking-[-0.02em]">{project.name}</span>
          </span>
          <span className="hidden text-sm text-[var(--t-muted)] sm:block">A tool by {site.name}</span>
        </div>
      </div>

      {/* hero */}
      <section aria-labelledby="tool-title" className="tool-hero relative overflow-hidden">
        {tool.heroBackdrop ? (
          <Image src={tool.heroBackdrop} alt="" fill priority sizes="100vw" className="tool-backdrop object-cover" />
        ) : (
          <div aria-hidden className="tool-halo" />
        )}
        <div className="container-x relative z-[1] grid gap-12 pb-20 pt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:pb-24 lg:pt-20">
          <div>
            <p className="tool-pill">
              <span className="tool-pill-dot" />
              {tool.store.live ? "On the Microsoft Store" : "Coming to the Microsoft Store"}
            </p>
            <h1 id="tool-title" className="tool-title mt-6 text-[clamp(2.4rem,5.2vw,4.4rem)]">
              {tool.headline[0]} <span className="tool-accent">{tool.headline[1]}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--t-muted)]">{tool.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <StoreButton tool={tool} name={project.name} />
              {website ? (
                <a href={website.href} target="_blank" rel="noreferrer" className="tool-button">
                  Website
                  <ArrowUpRight className="size-4" />
                </a>
              ) : null}
              {project.links?.github ? (
                <a href={project.links.github} target="_blank" rel="noreferrer" className="tool-button is-ghost">
                  <Github className="size-4" />
                  Source
                </a>
              ) : null}
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[var(--t-muted)]">
              {tool.facts.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span aria-hidden className="size-1.5 rounded-full bg-[var(--t-accent)]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <Window src={tool.heroShot} alt={`${project.name}, ${tool.screens[0]?.caption ?? "the app"}`} priority sizes="(max-width: 1024px) 92vw, 640px" />
        </div>
      </section>

      {/* the launch film */}
      {tool.video ? (
        <section aria-labelledby="tool-film" className="tool-band">
          <div className="container-x py-20 lg:py-24">
            <SectionTitle eyebrow="Watch" title="The launch film" id="tool-film" />
            <div className="tool-film mt-10">
              <video controls preload="none" playsInline poster={tool.video.poster} className="aspect-video w-full" aria-label={tool.video.title}>
                <source src={tool.video.src} type="video/mp4" />
                <track kind="captions" src={tool.video.captions} srcLang="en" label="English" default />
              </video>
            </div>
          </div>
        </section>
      ) : null}

      {/* how it works */}
      <section aria-labelledby="tool-how" className="container-x py-20 lg:py-24">
        <SectionTitle eyebrow="How it works" title={`${tool.steps.length} steps, you stay in charge`} id="tool-how" />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tool.steps.map((s, i) => (
            <li key={s.title} className="tool-card">
              <span className="tool-step">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-5 text-lg font-semibold tracking-[-0.02em]">{s.title}</p>
              <p className="mt-2 leading-relaxed text-[var(--t-muted)]">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* what it does */}
      <section aria-labelledby="tool-what" className="tool-band">
        <div className="container-x py-20 lg:py-24">
          <SectionTitle eyebrow="What it does" title="Everything in one app" id="tool-what" />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tool.features.map((f) => (
              <li key={f.title} className="tool-card">
                <span aria-hidden className="tool-mark" />
                <p className="mt-4 text-lg font-semibold tracking-[-0.02em]">{f.title}</p>
                <p className="mt-2 leading-relaxed text-[var(--t-muted)]">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* a look inside */}
      <section aria-labelledby="tool-inside" className="container-x py-20 lg:py-24">
        <SectionTitle eyebrow="A look inside" title={`${project.name}, screen by screen`} id="tool-inside" />
        <ul className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2">
          {tool.screens.map((s) => (
            <li key={s.src}>
              <Window src={s.src} alt={`${project.name}: ${s.caption}`} sizes="(max-width: 768px) 92vw, 540px" />
              <p className="mt-4 font-semibold tracking-[-0.015em]">{s.title}</p>
              <p className="mt-1 leading-relaxed text-[var(--t-muted)]">{s.caption}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* privacy: the tool's night */}
      <section aria-labelledby="tool-privacy" className="tool-night relative overflow-hidden">
        <div className="container-x relative grid gap-10 py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-24">
          <div>
            <p className="tool-eyebrow">Privacy</p>
            <h2 id="tool-privacy" className="tool-title mt-3 text-[clamp(1.7rem,3vw,2.6rem)]">
              {tool.privacy.title}
            </h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {tool.privacy.points.map((p) => (
              <li key={p} className="tool-night-card leading-relaxed">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* how it is built */}
      <section aria-labelledby="tool-built" className="container-x grid gap-12 py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:py-24">
        <div>
          <SectionTitle eyebrow="Under the hood" title="How it is built" id="tool-built" />
          <p className="mt-6 text-lg leading-relaxed text-[var(--t-muted)]">{tool.build}</p>
          {project.results?.length ? (
            <ul className="mt-8 space-y-3">
              {project.results.map((r) => (
                <li key={r} className="flex gap-3 leading-relaxed">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[var(--t-accent)]" />
                  {r}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="tool-card h-fit">
          <dl className="divide-y divide-[var(--t-border)] text-[15px]">
            {project.role ? (
              <div className="flex justify-between gap-6 pb-3">
                <dt className="text-[var(--t-muted)]">Role</dt>
                <dd className="text-right font-medium">{project.role}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-[var(--t-muted)]">Timeline</dt>
              <dd className="text-right font-medium">{project.period}</dd>
            </div>
          </dl>
          {project.stackGroups?.length ? (
            <div className="mt-4 space-y-4">
              {project.stackGroups.map((g) => (
                <div key={g.label}>
                  <p className="text-sm font-medium">{g.label}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-[var(--t-muted)]">{g.items.join("  ·  ")}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* get it, and the references */}
      <section aria-labelledby="tool-get" className="tool-band">
        <div className="container-x grid gap-10 py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:py-24">
          <div>
            <SectionTitle eyebrow="Get it" title={`Try ${project.name}`} id="tool-get" />
            <div className="mt-8">
              <StoreButton tool={tool} name={project.name} />
            </div>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {tool.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer" className="tool-link">
                  {l.label === "Source on GitHub" ? <Github className="size-4 shrink-0 text-[var(--t-muted)]" /> : null}
                  <span>{l.label}</span>
                  <ArrowUpRight className="ml-auto size-4 shrink-0 text-[var(--t-muted)]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
