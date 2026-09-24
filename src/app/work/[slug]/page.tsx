import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookText, Check, Github, Globe, Lock } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { ProjectHero } from "@/components/site/project-hero";
import { kindLabel } from "@/components/site/project-card";
import { Footer } from "@/components/site/footer";
import { bulletKinds, ShapeBullet, toneFill, toneInk, toneStrong, toneTint } from "@/components/site/shapes";
import { projectBySlug, projects } from "@/content/projects";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};
  const description = project.description;
  const url = `${site.url}/work/${project.slug}`;
  return {
    title: project.name,
    description,
    openGraph: { title: `${project.name} - ${site.name}`, description, url, type: "article" },
    twitter: { card: "summary_large_image", title: `${project.name} - ${site.name}`, description },
    alternates: { canonical: url },
  };
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t pt-8">
      <h2 className="eyebrow mb-6">{label}</h2>
      {children}
    </section>
  );
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? projects[idx - 1] : null;
  const next = idx < projects.length - 1 ? projects[idx + 1] : null;
  const gallery = project.images?.length ? project.images : [];
  const tone = project.tone;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.description,
    author: { "@type": "Person", name: site.name, url: site.url },
    dateCreated: project.period,
    url: `${site.url}/work/${project.slug}`,
    ...(project.links?.site ? { sameAs: [project.links.site] } : {}),
  };

  const links = project.links;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar base="/" />
      <main>
        <ProjectHero project={project} />

        <div className="container-x grid gap-14 py-20 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16 lg:py-24">
          {/* main column */}
          <div>
            <p className="text-[clamp(1.2rem,1.8vw,1.5rem)] leading-[1.5] tracking-[-0.015em] text-foreground/90">
              {project.overview ?? project.description}
            </p>

            <div className="mt-14 space-y-12">
              {project.problem ? (
                <Block label="The problem">
                  <p className="text-lg leading-relaxed text-muted-foreground">{project.problem}</p>
                </Block>
              ) : null}

              {project.approach?.length ? (
                <Block label="Approach">
                  <ul className="space-y-4">
                    {project.approach.map((a, i) => (
                      <li key={a} className="flex gap-3.5 text-[17px] leading-relaxed text-foreground/85">
                        <ShapeBullet kind={bulletKinds[i % bulletKinds.length]} tone={toneStrong(tone)} className="mt-2 size-3" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </Block>
              ) : null}

              {project.results?.length ? (
                <Block label="Outcome">
                  <ul className="space-y-4">
                    {project.results.map((r) => (
                      <li key={r} className="flex gap-3.5 text-[17px] leading-relaxed">
                        <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center", toneTint[tone])}>
                          <Check className={cn("size-3.5", toneInk[tone])} strokeWidth={2.5} />
                        </span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </Block>
              ) : null}

              {gallery.length ? (
                <Block label="Gallery">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {gallery.map((src) => (
                      <div key={src} className={cn("relative aspect-[16/10] overflow-hidden rounded-2xl", toneTint[tone])}>
                        <div className="absolute inset-[7%] overflow-hidden rounded-lg bg-card shadow-window">
                          <Image src={src} alt={`${project.name} screenshot`} fill sizes="(max-width: 640px) 90vw, 36vw" className="object-cover object-top" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Block>
              ) : null}
            </div>
          </div>

          {/* aside */}
          <aside>
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-3xl border bg-paper-soft p-7">
                <h2 className="eyebrow">At a glance</h2>
                <dl className="mt-5 divide-y text-[15px]">
                  {project.role ? (
                    <div className="flex justify-between gap-6 py-3 first:pt-0">
                      <dt className="text-muted-foreground">Role</dt>
                      <dd className="text-right font-medium">{project.role}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-6 py-3 first:pt-0">
                    <dt className="text-muted-foreground">Timeline</dt>
                    <dd className="text-right font-medium">{project.period}</dd>
                  </div>
                  <div className="flex justify-between gap-6 py-3 first:pt-0">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="flex items-center gap-2 text-right font-medium">
                      <span className={cn("size-2", toneFill[toneStrong(tone)])} />
                      {kindLabel[project.kind]}
                    </dd>
                  </div>
                </dl>

                {links && (links.site || links.github || links.docs || links.demo) ? (
                  <div className="mt-5 flex flex-col gap-2">
                    {links.site ? (
                      <a href={links.site} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-xl border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-foreground/20">
                        <Globe className="size-4 text-muted-foreground" />
                        Visit the site
                        <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
                      </a>
                    ) : null}
                    {links.github ? (
                      <a href={links.github} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-xl border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-foreground/20">
                        <Github className="size-4 text-muted-foreground" />
                        Source & docs
                        <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
                      </a>
                    ) : null}
                    {links.docs ? (
                      <a href={links.docs} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-xl border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-foreground/20">
                        <BookText className="size-4 text-muted-foreground" />
                        Documentation
                        <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
                      </a>
                    ) : null}
                    {links.demo ? (
                      <a href={links.demo} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-xl border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-foreground/20">
                        Live demo
                        <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
                      </a>
                    ) : null}
                  </div>
                ) : null}

                {project.access ? (
                  <p className="mt-5 flex items-start gap-2 rounded-xl bg-muted p-3.5 text-[13px] leading-relaxed text-muted-foreground">
                    <Lock className="mt-0.5 size-3.5 shrink-0" />
                    {project.access}
                  </p>
                ) : null}
              </div>

              <div className="rounded-3xl border p-7">
                <h2 className="eyebrow">Stack</h2>
                {project.stackGroups?.length ? (
                  <div className="mt-5 space-y-5">
                    {project.stackGroups.map((g) => (
                      <div key={g.label}>
                        <p className="text-sm font-medium">{g.label}</p>
                        <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{g.items.join("  ·  ")}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-[14px] leading-relaxed text-muted-foreground">{project.stack.join("  ·  ")}</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* prev / next */}
        <nav aria-label="More case studies" className="container-x grid gap-4 border-t py-12 sm:grid-cols-2">
          {prev ? (
            <Link href={`/work/${prev.slug}`} className="group flex min-w-0 items-center gap-4 border p-6 transition-colors hover:bg-paper-soft">
              <ArrowLeft className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <span className={cn("size-2", toneFill[toneStrong(prev.tone)])} />
                  Previous
                </span>
                <span className="mt-1 block truncate text-lg font-medium tracking-[-0.015em]">{prev.name}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/work/${next.slug}`} className="group flex min-w-0 items-center justify-end gap-4 border p-6 text-right transition-colors hover:bg-paper-soft">
              <span className="min-w-0">
                <span className="flex items-center justify-end gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  Next
                  <span className={cn("size-2", toneFill[toneStrong(next.tone)])} />
                </span>
                <span className="mt-1 block truncate text-lg font-medium tracking-[-0.015em]">{next.name}</span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
      <Footer />
    </>
  );
}
