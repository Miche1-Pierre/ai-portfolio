import Image from "next/image";
import { GraduationCap, Languages, MapPin, ShieldCheck } from "lucide-react";
import { Section } from "@/components/site/section";
import { Reveal } from "@/components/motion/reveal";
import { certifications, education } from "@/content/experience";
import { site } from "@/content/site";

export function About() {
  return (
    <Section
      id="about"
      index="04"
      eyebrow="About"
      title="Engineer first. Increasingly the person who decides what to build."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border bg-card">
            <div className="relative aspect-[4/5] w-full">
              <Image src="/images/profile.png" alt={site.name} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" priority={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
            <ul className="grid gap-2 p-5 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 text-brand" />
                {site.location}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Languages className="size-4 text-brand" />
                {site.languages.join(" · ")}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="size-4 rounded-full bg-brand/20 ring-1 ring-brand/50" />
                {site.availability}
              </li>
            </ul>
          </div>
        </Reveal>

        <div className="flex flex-col gap-6">
          <Reveal delay={0.05}>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                I have progressively been given responsibilities beyond development — <span className="text-foreground">architecture, applied AI and product design</span>. Over the past three years, in startups and established companies, in a research lab and in a regulated environment, I have taken projects from scoping through to production.
              </p>
              <p>
                Today I lead engineering at Plania while shipping enterprise AI systems at TechGuys, and I spend the rest of my time on <span className="text-foreground">Taskforce</span> and <span className="text-foreground">Brain OS</span> — an execution layer and a memory substrate for agents. I care about systems that stay correct, traceable and explainable, which is also why regulated environments never scared me off.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {education.map((ed) => (
                <div key={ed.school} className="rounded-2xl border bg-card p-5">
                  <div className="flex items-center gap-2 text-brand">
                    <GraduationCap className="size-4" />
                    <span className="eyebrow text-brand">Education</span>
                  </div>
                  <p className="mt-3 font-medium">{ed.degree}</p>
                  <p className="text-sm text-muted-foreground">{ed.school}</p>
                  <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                    {ed.detail} · {ed.start} — {ed.end}
                  </p>
                </div>
              ))}
              {certifications.map((c) => (
                <div key={c.title} className="flex gap-4 rounded-2xl border bg-card p-5">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted/40">
                    <Image src={c.image} alt={c.title} fill sizes="56px" className="object-contain p-1" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-brand">
                      <ShieldCheck className="size-4" />
                      <span className="eyebrow text-brand">Certification</span>
                    </div>
                    <p className="mt-2 font-medium">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.issuer}</p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">{c.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
