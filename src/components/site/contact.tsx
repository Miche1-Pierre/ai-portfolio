"use client";

import { useState } from "react";
import { Check, Copy, Github, Linkedin, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/section";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/content/site";

const FORMSPREE = "https://formspree.io/f/xanjrryq";

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

  const field =
    "w-full rounded-lg border bg-background/60 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/50 focus:ring-2 focus:ring-ring";

  return (
    <Section
      id="contact"
      index="05"
      eyebrow="Contact"
      title="Building something with AI, or hiring for it? Let's talk."
      description={`${site.availability}. Open to remote roles and collaborations, anywhere.`}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Reveal>
          <div className="flex h-full flex-col justify-between gap-6 rounded-2xl border bg-card p-6">
            <div>
              <p className="eyebrow">Direct</p>
              <button
                type="button"
                onClick={copy}
                className="group mt-3 flex items-center gap-3 text-left font-heading text-sm font-semibold tracking-tight sm:text-lg md:text-xl"
              >
                <Mail className="size-5 shrink-0 text-brand" />
                <span className="whitespace-nowrap">{site.email}</span>
                <span className="grid size-7 place-items-center rounded-md border text-muted-foreground transition-colors group-hover:text-foreground">
                  {copied ? <Check className="size-3.5 text-brand" /> : <Copy className="size-3.5" />}
                </span>
              </button>
              <p className="mt-2 text-xs text-muted-foreground">{copied ? "Copied to clipboard." : "Click to copy."}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" render={<a href={site.socials.linkedin.href} target="_blank" rel="noreferrer" />}>
                <Linkedin />
                LinkedIn
              </Button>
              <Button variant="outline" render={<a href={site.socials.github.href} target="_blank" rel="noreferrer" />}>
                <Github />
                GitHub
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border bg-card p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                Name
                <input name="name" required autoComplete="name" className={field} placeholder="Ada Lovelace" />
              </label>
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                Email
                <input name="email" type="email" required autoComplete="email" className={field} placeholder="ada@company.com" />
              </label>
            </div>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              Message
              <textarea name="message" required rows={5} className={field} placeholder="What are you building?" />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {status === "success" ? "Sent - I'll get back to you shortly." : status === "error" ? "Something went wrong. Email me directly instead." : "Replies within a day, usually faster."}
              </p>
              <Button type="submit" disabled={status === "sending"} className="h-10 rounded-full px-5">
                {status === "sending" ? "Sending…" : "Send message"}
                <Send className="size-4" />
              </Button>
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
