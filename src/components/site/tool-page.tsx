import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Github } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { HeroShot, LayerStack, LogMoment, PrivacyMap, PromptMoment, ScreenTabs, ShotDetail, StepsScroller, WhyLists } from "@/components/site/tool-motion";
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
function StoreButton({ tool, name, onDark }: { tool: Tool; name: string; onDark?: boolean }) {
  if (!tool.store.live) {
    return (
      <span className={cn("tool-store is-pending", onDark && "on-dark")} aria-label={`${name} is coming to the Microsoft Store`}>
        <WindowsMark className="size-5" />
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-[0.08em] opacity-75">Coming soon to</span>
          <span className="text-[15px] font-semibold">Microsoft Store</span>
        </span>
      </span>
    );
  }
  return (
    <a href={storeUrl(tool.store.id)} target="_blank" rel="noreferrer" className={cn("tool-store", onDark && "on-dark")} aria-label={`Get ${name} from the Microsoft Store`}>
      <WindowsMark className="size-5" />
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-[0.08em] opacity-75">Get it from</span>
        <span className="text-[15px] font-semibold">Microsoft Store</span>
      </span>
    </a>
  );
}

/** A section's heading: an eyebrow, then a line in two tones (plain, then the accent). */
function Heading({ eyebrow, title, id, center, onDark }: { eyebrow: string; title: [string, string]; id: string; center?: boolean; onDark?: boolean }) {
  return (
    <Reveal className={cn("max-w-3xl", center && "mx-auto text-center")}>
      <p className={cn("tool-eyebrow", onDark && "on-dark")}>{eyebrow}</p>
      <h2 id={id} className="tool-title mt-4 text-[clamp(1.9rem,3.6vw,3.1rem)]">
        {title[0]} <span className={onDark ? "tool-accent-dark" : "tool-accent"}>{title[1]}</span>
      </h2>
    </Reveal>
  );
}

/**
 * The page of a tool Pierre ships (TaskForce, Career OS...): a product page in the tool's own look
 * (its colours, radii and backdrop, from `.tool[data-tool]` in globals.css). Each section has its
 * own device, never a row of cards: the app tilting up under floating labels, a without / with
 * case, the steps scrolling past a picture that follows, one ruled grid of details of the app, a
 * tabbed look inside, a map of where the data lives, the stack as layers, and a closing band.
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

      {/* hero: the words, the ways in, and the app tilting up under its labels */}
      <section aria-labelledby="tool-title" className="tool-hero relative overflow-hidden">
        {tool.heroBackdrop ? (
          <Image src={tool.heroBackdrop} alt="" fill priority sizes="100vw" className="tool-backdrop object-cover" />
        ) : (
          <div aria-hidden className="tool-halo" />
        )}
        <div className="container-x relative z-[1] grid gap-14 pb-24 pt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:pb-28 lg:pt-20">
          <Reveal>
            <p className="tool-pill">
              <span className="tool-pill-dot" />
              {tool.store.live ? "On the Microsoft Store" : "Coming to the Microsoft Store"}
            </p>
            <h1 id="tool-title" className="tool-title mt-6 text-[clamp(2.5rem,5.4vw,4.6rem)]">
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
          </Reveal>
          <HeroShot src={tool.heroShot} alt={`${project.name}, ${tool.screens[0]?.caption ?? "the app"}`} callouts={tool.callouts} />
        </div>
      </section>

      {/* the case: without, then with */}
      <section aria-labelledby="tool-why" className="container-x py-24 lg:py-32">
        <Heading eyebrow="Why it exists" title={tool.why.title} id="tool-why" />
        <WhyLists name={project.name} without={tool.why.without} withItems={tool.why.with} />
      </section>

      {/* the launch film, full width on the tool's night */}
      {tool.video ? (
        <section aria-labelledby="tool-film" className="tool-night relative overflow-hidden">
          <div className="container-x relative py-24 lg:py-28">
            <Heading eyebrow="Watch" title={["The launch film,", "in 42 seconds."]} id="tool-film" center onDark />
            <Reveal className="tool-film mx-auto mt-12 max-w-5xl">
              <video controls preload="none" playsInline poster={tool.video.poster} className="aspect-video w-full" aria-label={tool.video.title}>
                <source src={tool.video.src} type="video/mp4" />
                <track kind="captions" src={tool.video.captions} srcLang="en" label="English" default />
              </video>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* how it works: the steps scroll by, the picture follows */}
      <section aria-labelledby="tool-how" className={cn("container-x py-24 lg:py-32", !tool.video && "border-t border-[var(--t-border)]")}>
        <Heading eyebrow="How it works" title={[`${tool.steps.length} steps,`, "you stay in charge."]} id="tool-how" />
        <StepsScroller steps={tool.steps} name={project.name} />
      </section>

      {/* what it does: one ruled grid, details of the app in the cells */}
      <section aria-labelledby="tool-what" className="tool-band">
        <div className="container-x py-24 lg:py-32">
          <Heading eyebrow="What it does" title={["Everything in one app,", "nothing in the way."]} id="tool-what" />
          <ul className="tool-grid mt-12 grid lg:grid-cols-3">
            {tool.features.map((f) => (
              <li key={f.title} className={cn("tool-grid-cell flex flex-col", f.wide && "lg:col-span-2 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-8")}>
                <div>
                  <p className="text-lg font-semibold tracking-[-0.02em]">{f.title}</p>
                  <p className="mt-2 leading-relaxed text-[var(--t-muted)]">{f.body}</p>
                </div>
                {f.shot ? <ShotDetail shot={f.shot} alt={`${project.name}: ${f.title}`} sizes="(max-width: 1024px) 90vw, 480px" className={cn("mt-6 aspect-[16/10] lg:mt-0", !f.wide && "lg:mt-6")} /> : null}
                {f.visual === "log" ? (
                  <div className="mt-6 lg:mt-0">
                    <LogMoment />
                  </div>
                ) : null}
                {f.visual === "prompt" ? (
                  <div className="mt-6 lg:mt-0">
                    <PromptMoment />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* a look inside: one big screen at a time */}
      <section aria-labelledby="tool-inside" className="container-x py-24 lg:py-32">
        <Heading eyebrow="A look inside" title={[`${project.name},`, "screen by screen."]} id="tool-inside" center />
        <ScreenTabs screens={tool.screens} name={project.name} />
      </section>

      {/* privacy: a map of where the data lives, then the promises */}
      <section aria-labelledby="tool-privacy" className="tool-night relative overflow-hidden">
        <div className="container-x relative py-24 lg:py-32">
          <Heading eyebrow="Privacy" title={[tool.privacy.title + ".", tool.privacy.tagline]} id="tool-privacy" onDark />
          <div className="mt-12">
            <PrivacyMap local={tool.privacy.local} outside={tool.privacy.outside} name={project.name} />
          </div>
          <ul className="mt-14 grid gap-x-10 gap-y-6 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {tool.privacy.points.map((p) => (
              <li key={p} className="flex gap-3 leading-relaxed text-[var(--t-night-muted)]">
                <Check className="mt-1 size-4 shrink-0 text-[var(--t-night-accent)]" strokeWidth={2.5} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* how it is built: the words and the milestones, the stack as layers */}
      <section aria-labelledby="tool-built" className="container-x grid gap-14 py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:py-32">
        <div>
          <Heading eyebrow="Under the hood" title={["How it is", "built."]} id="tool-built" />
          <p className="mt-6 text-lg leading-relaxed text-[var(--t-muted)]">{tool.build}</p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-[15px]">
            {project.role ? (
              <div>
                <dt className="tool-zone-label">Role</dt>
                <dd className="mt-1 font-medium">{project.role}</dd>
              </div>
            ) : null}
            <div>
              <dt className="tool-zone-label">Timeline</dt>
              <dd className="mt-1 font-medium">{project.period}</dd>
            </div>
          </dl>
          {project.results?.length ? (
            <ol className="tool-milestones mt-10">
              {project.results.map((r) => (
                <li key={r} className="tool-milestone">
                  {r}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
        {project.stackGroups?.length ? (
          <div className="lg:pt-24">
            <p className="tool-zone-label mb-4">The stack, layer by layer</p>
            <LayerStack groups={project.stackGroups} />
          </div>
        ) : null}
      </section>

      {/* get it: the closing band, then every reference */}
      <section aria-labelledby="tool-get" className="container-x pb-24 lg:pb-32">
        <div className="tool-cta relative overflow-hidden">
          <div aria-hidden className="tool-cta-glow" />
          <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-16">
            <div>
              <p className="tool-eyebrow on-dark">Get it</p>
              <h2 id="tool-get" className="tool-title mt-4 text-[clamp(2rem,4.4vw,3.6rem)] text-white">
                Try {project.name}.
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75">{tool.facts.join(" · ")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <StoreButton tool={tool} name={project.name} onDark />
              {website ? (
                <a href={website.href} target="_blank" rel="noreferrer" className="tool-button is-light">
                  Website
                  <ArrowUpRight className="size-4" />
                </a>
              ) : null}
            </div>
          </div>
          <ul className="relative flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 px-8 py-6 sm:px-12 lg:px-16">
            {tool.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer" className="tool-ref">
                  {l.label}
                  <ArrowUpRight className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
