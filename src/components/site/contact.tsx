"use client";

import { useState } from "react";
import { Check, Copy, Github, Linkedin, Send } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/site/section";
import { Shape } from "@/components/site/shapes";
import { cta } from "@/components/site/cta";
import { site } from "@/content/site";

const FORMSPREE = "https://formspree.io/f/xanjrryq";

const field =
  "w-full rounded-xl border border-input bg-background px-3.5 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-subtle focus:border-ring focus:ring-3 focus:ring-ring/25";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json as { ok?: boolean }).ok !== false) {
        setStatus("success");
        form.reset();
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            eyebrow="Contact"
            tone="pink"
            title="Building something with AI, or hiring for it? Let's talk."
            description={`${site.availability}. Open to remote roles and collaborations, anywhere.`}
          />
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <Reveal>
            <div className="relative flex h-full flex-col justify-between gap-10 overflow-hidden rounded-3xl bg-tint-lime p-8 sm:p-10">
              <span aria-hidden className="absolute right-8 top-8 flex items-center gap-1">
                <Shape kind="circle" className="size-5 text-shape-green" />
                <Shape kind="quarter" className="size-5 text-shape-yellow" />
              </span>
              <div>
                <p className="eyebrow text-ink-lime">Direct</p>
                <button
                  type="button"
                  onClick={copy}
                  className="group mt-5 flex max-w-full items-center gap-3 text-left text-[clamp(1.05rem,2.1vw,1.5rem)] font-medium tracking-[-0.02em]"
                >
                  <span className="whitespace-nowrap">{site.email}</span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-foreground/10 bg-card/70 text-muted-foreground transition-colors group-hover:text-foreground">
                    {copied ? <Check className="size-4 text-ink-green" /> : <Copy className="size-4" />}
                  </span>
                </button>
                <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
                  {copied ? "Copied to clipboard." : "Click to copy. I reply within a day."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={site.socials.linkedin.href} target="_blank" rel="noreferrer" className={cta({ variant: "secondary", size: "md", className: "bg-card" })}>
                  <Linkedin />
                  LinkedIn
                </a>
                <a href={site.socials.github.href} target="_blank" rel="noreferrer" className={cta({ variant: "secondary", size: "md", className: "bg-card" })}>
                  <Github />
                  GitHub
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border bg-card p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-muted-foreground">
                  Name
                  <input name="name" required autoComplete="name" className={`${field} h-11`} placeholder="Ada Lovelace" />
                </label>
                <label className="grid gap-2 text-sm text-muted-foreground">
                  Email
                  <input name="email" type="email" required autoComplete="email" className={`${field} h-11`} placeholder="ada@company.com" />
                </label>
              </div>
              <label className="grid gap-2 text-sm text-muted-foreground">
                Message
                <textarea name="message" required rows={6} className={`${field} resize-y py-3`} placeholder="What are you building?" />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {status === "success"
                    ? "Sent - I'll get back to you shortly."
                    : status === "error"
                      ? "Something went wrong. Email me directly instead."
                      : "Replies within a day, usually faster."}
                </p>
                <button type="submit" disabled={status === "sending"} className={cta({ size: "md" })}>
                  {status === "sending" ? "Sending…" : "Send message"}
                  <Send />
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
