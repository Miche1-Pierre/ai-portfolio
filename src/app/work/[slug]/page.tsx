import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookText, Check, Github, Globe, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { ProjectHero } from "@/components/site/project-hero";
import { Footer } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projectBySlug, projects } from "@/content/projects";
import { site } from "@/content/site";

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
    openGraph: { title: `${project.name} — ${site.name}`, description, url, type: "article" },
    twitter: { card: "summary_large_image", title: `${project.name} — ${site.name}`, description },
    alternates: { canonical: url },
  };
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="container-x pt-3 sm:pt-4">
        <div className="glass flex h-14 items-center justify-between rounded-2xl border px-3 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.6)] sm:px-4">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="Home">
            <span className="relative grid size-8 place-items-center rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground">
              PM
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-brand ring-2 ring-background" />
            </span>
            <span className="hidden text-sm font-medium sm:inline">{site.name}</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground" render={<Link href="/#work" />}>
              <ArrowLeft className="size-4" />
              All work
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t pt-8">
      <h2 className="eyebrow mb-4">{title}</h2>
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main>
        <ProjectHero project={project} />

        <div className="container-x grid gap-12 py-16 lg:grid-cols-3 lg:py-20">
          {/* main column */}
          <div className="lg:col-span-2">
            {project.overview ? (
              <p className="text-lg leading-relaxed text-foreground/90 sm:text-xl">{project.overview}</p>
            ) : (
              <p className="text-lg leading-relaxed text-foreground/90 sm:text-xl">{project.description}</p>
            )}

            <div className="mt-10 space-y-8">
              {project.problem ? (
                <Block title="The problem">
                  <p className="leading-relaxed text-muted-foreground">{project.problem}</p>
                </Block>
              ) : null}

              {project.approach?.length ? (
                <Block title="Approach">
                  <ul className="space-y-3">
                    {project.approach.map((a) => (
                      <li key={a} className="flex gap-3 leading-relaxed text-muted-foreground">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: project.beamMode === "adaptive" ? "var(--foreground)" : project.accent }} />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </Block>
              ) : null}

              {project.results?.length ? (
                <Block title="Outcome">
                  <ul className="space-y-3">
                    {project.results.map((r) => (
                      <li key={r} className="flex gap-3 leading-relaxed text-foreground/90">
                        <Check className="mt-0.5 size-4 shrink-0" style={{ color: project.beamMode === "adaptive" ? undefined : project.accent }} />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </Block>
              ) : null}

              {gallery.length ? (
                <Block title="Gallery">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {gallery.map((src) => (
                      <div key={src} className="relative aspect-[16/10] overflow-hidden rounded-xl border bg-muted/30">
                        <Image src={src} alt={`${project.name} screenshot`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover object-top" />
                      </div>
                    ))}
                  </div>
                </Block>
              ) : null}
            </div>
          </div>

          {/* aside */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="rounded-2xl border bg-card/60 p-6">
                <h2 className="eyebrow mb-4">At a glance</h2>
                <dl className="space-y-3 text-sm">
                  {project.role ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Role</dt>
                      <dd className="text-right font-medium">{project.role}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Timeline</dt>
                    <dd className="text-right font-medium">{project.period}</dd>
                  </div>
                </dl>

                {(project.links?.site || project.links?.github || project.links?.docs || project.links?.demo) ? (
                  <div className="mt-5 flex flex-col gap-2">
                    {project.links?.site ? (
                      <Button size="sm" className="w-full justify-start" render={<a href={project.links.site} target="_blank" rel="noreferrer" />}>
                        <Globe />
                        Visit the site
                        <ArrowUpRight className="ml-auto" />
                      </Button>
                    ) : null}
                    {project.links?.github ? (
                      <Button variant="outline" size="sm" className="w-full justify-start" render={<a href={project.links.github} target="_blank" rel="noreferrer" />}>
                        <Github />
                        Source & docs
                        <ArrowUpRight className="ml-auto" />
                      </Button>
                    ) : null}
                    {project.links?.docs ? (
                      <Button variant="outline" size="sm" className="w-full justify-start" render={<a href={project.links.docs} target="_blank" rel="noreferrer" />}>
                        <BookText />
                        Documentation
                        <ArrowUpRight className="ml-auto" />
                      </Button>
                    ) : null}
                    {project.links?.demo ? (
                      <Button variant="outline" size="sm" className="w-full justify-start" render={<a href={project.links.demo} target="_blank" rel="noreferrer" />}>
                        Live demo
                        <ArrowUpRight className="ml-auto" />
                      </Button>
                    ) : null}
                  </div>
                ) : null}

                {project.access ? (
                  <p className="mt-5 flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                    <Lock className="mt-0.5 size-3.5 shrink-0" />
                    {project.access}
                  </p>
                ) : null}
              </div>

              {project.stackGroups?.length ? (
                <div className="rounded-2xl border bg-card/60 p-6">
                  <h2 className="eyebrow mb-4">Stack</h2>
                  <div className="space-y-4">
                    {project.stackGroups.map((g) => (
                      <div key={g.label}>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">{g.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {g.items.map((it) => (
                            <span key={it} className="rounded-md border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                              {it}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border bg-card/60 p-6">
                  <h2 className="eyebrow mb-4">Stack</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((it) => (
                      <span key={it} className="rounded-md border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* prev / next */}
        <div className="container-x grid gap-4 border-t py-10 sm:grid-cols-2">
          {prev ? (
            <Link href={`/work/${prev.slug}`} className="card-hover group flex items-center gap-3 rounded-2xl border bg-card/60 p-5">
              <ArrowLeft className="size-4 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
              <span>
                <span className="block text-xs text-muted-foreground">Previous</span>
                <span className="font-medium">{prev.name}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/work/${next.slug}`} className="card-hover group flex items-center justify-end gap-3 rounded-2xl border bg-card/60 p-5 text-right">
              <span>
                <span className="block text-xs text-muted-foreground">Next</span>
                <span className="font-medium">{next.name}</span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span />
          )}
        </div>

        <div className="container-x pb-16">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            <Link href="/#work">← Back to all work</Link>
          </Badge>
        </div>
      </main>
      <Footer />
    </>
  );
}
