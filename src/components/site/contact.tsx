"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CropMarks, SectionRule } from "@/components/site/marks";
import { SectionHeader } from "@/components/site/section";
import { Shape } from "@/components/site/shapes";
import { cta } from "@/components/site/cta";
import { site } from "@/content/site";

/** Contact without a form: email first (send or copy), then LinkedIn and GitHub. */
export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const social = [
    { href: site.socials.linkedin.href, label: "LinkedIn", handle: "pierre-michel-work", hint: "Let's connect", Icon: Linkedin },
    { href: site.socials.github.href, label: "GitHub", handle: "Miche1-Pierre", hint: "See the code", Icon: Github },
  ];

  return (
    <section id="contact" className="scroll-mt-20 pb-20 pt-4 sm:pb-28">
      <div className="container-x">
        <SectionRule className="mb-14 sm:mb-20" />
        <Reveal>
          <SectionHeader
            index="07"
            eyebrow="Contact"
            tone="pink"
            title="Building something with AI, or hiring for it? Let's talk."
            description={`${site.availability}. Open to remote roles and collaborations, anywhere.`}
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <Reveal className="min-w-0 md:col-span-2 lg:col-span-1">
            <div className="relative flex h-full flex-col justify-between gap-10 bg-tint-lime p-6 sm:p-10">
              <CropMarks />
              <span aria-hidden className="absolute right-6 top-6 flex items-center gap-1 sm:right-8 sm:top-8">
                <Shape kind="circle" className="size-5 text-shape-green" />
                <Shape kind="quarter" className="size-5 text-shape-yellow" />
              </span>
              <div>
                <p className="eyebrow text-ink-lime">Email</p>
                <p className="mt-5 whitespace-nowrap text-[clamp(0.85rem,4.2vw,1.5rem)] font-medium tracking-[-0.02em] sm:text-[clamp(1.05rem,2.1vw,1.5rem)]">
                  {site.email}
                </p>
                <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
                  {copied ? "Copied to clipboard." : "The fastest way to reach me. I reply within a day."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${site.email}`} className={cta({ size: "md" })}>
                  <Mail />
                  Send an email
                </a>
                <button type="button" onClick={copy} className={cta({ variant: "secondary", size: "md", className: "bg-card" })}>
                  {copied ? <Check className="text-ink-green" /> : <Copy />}
                  {copied ? "Copied" : "Copy address"}
                </button>
              </div>
            </div>
          </Reveal>

          {social.map(({ href, label, handle, hint, Icon }, k) => (
            <Reveal key={label} delay={0.05 * (k + 1)} className="min-w-0">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full min-h-56 flex-col justify-between gap-8 border border-rule bg-card p-6 transition-colors hover:border-foreground/35 sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="eyebrow">{label}</p>
                  <span className="grid size-11 place-items-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                </div>
                <div>
                  <p className="truncate text-lg font-medium tracking-[-0.02em]">{handle}</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors group-hover:text-ink-blue">
                    {hint}
                    <ArrowUpRight className="size-4" />
                  </p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
