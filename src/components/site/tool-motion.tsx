"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Check, GitPullRequest, ShieldAlert, X } from "lucide-react";
import type { StackGroup, ToolCallout, ToolShot, ToolVisual } from "@/content/projects";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/* ---------- a detail of a screenshot: zoomed on one point of the app ---------- */

export function ShotDetail({ shot, alt, sizes, className }: { shot: ToolShot; alt: string; sizes: string; className?: string }) {
  return (
    <div className={cn("tool-detail", className)}>
      <Image
        src={shot.src}
        alt={alt}
        fill
        sizes={sizes}
        className="tool-detail-img object-cover"
        style={{ objectPosition: shot.focus, transformOrigin: shot.focus, ["--zoom" as string]: shot.zoom }}
      />
    </div>
  );
}

/* ---------- hero: the app tilts up as you scroll, labels float around it ---------- */

const CALLOUT_SPOTS = ["left-[-4%] top-[14%]", "right-[-5%] top-[46%]", "bottom-[-6%] left-[10%]"];

export function HeroShot({ src, alt, callouts }: { src: string; alt: string; callouts: ToolCallout[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "start 25%"] });
  const rotateX = useTransform(scrollYProgress, (v) => (reduce ? 0 : 16 * (1 - v)));
  const scale = useTransform(scrollYProgress, (v) => (reduce ? 1 : 0.93 + 0.07 * v));
  return (
    <div ref={ref} className="relative [perspective:1600px]">
      <motion.div style={{ rotateX, scale, transformOrigin: "50% 100%" }} className="tool-window">
        <div className="tool-window-bar" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="relative aspect-[16/10]">
          <Image src={src} alt={alt} fill priority sizes="(max-width: 1024px) 92vw, 640px" className="object-cover object-top" />
        </div>
      </motion.div>
      {callouts.map((c, i) => (
        <motion.span
          key={c.label}
          initial={reduce ? false : { opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease, delay: 0.5 + i * 0.25 }}
          className={cn("tool-callout absolute hidden sm:inline-flex", CALLOUT_SPOTS[i % CALLOUT_SPOTS.length])}
          data-tone={c.tone}
        >
          <span className="tool-callout-dot" aria-hidden />
          <span className={reduce ? "" : "tool-float"} style={{ animationDelay: `${i * 1.3}s` }}>
            {c.label}
          </span>
        </motion.span>
      ))}
    </div>
  );
}

/* ---------- how it works: the steps scroll by, the picture beside them follows ---------- */

function ApprovalMoment() {
  const reduce = useReducedMotion();
  const lines = ["Read src/app/settings/page.tsx", "Edited src/components/nav.tsx", "Edited src/components/tabs.tsx"];
  return (
    <div className="tool-moment">
      <p className="tool-moment-head">
        <span className="tool-live" aria-hidden />
        Claude Code is working on the issue
      </p>
      <ul className="mt-4 space-y-2 font-mono text-[12.5px]">
        {lines.map((l, i) => (
          <motion.li key={l} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.18, duration: 0.4, ease }} className="flex items-center gap-2 text-[var(--t-muted)]">
            <Check className="size-3.5 text-[var(--t-accent)]" />
            {l}
          </motion.li>
        ))}
      </ul>
      <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5, ease }} className="tool-ask">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ShieldAlert className="size-4 text-[#b26a00]" />
          Wants to run: npm test
        </p>
        <p className="mt-1 text-[13px] text-[var(--t-muted)]">Outside the run&apos;s limits. Denied in 10 minutes without an answer.</p>
        <div className="mt-3 flex gap-2">
          <span className="tool-mini-btn is-primary">Allow</span>
          <span className="tool-mini-btn">Deny</span>
        </div>
      </motion.div>
    </div>
  );
}

function PullRequestMoment() {
  const reduce = useReducedMotion();
  const checks = ["Branch pushed by TaskForce", "Pull request opened", "Waiting for your review"];
  return (
    <div className="tool-moment">
      <p className="tool-moment-head">
        <GitPullRequest className="size-4 text-[var(--t-accent)]" />
        Rebuild the settings navigation
      </p>
      <p className="mt-1 font-mono text-[12px] text-[var(--t-muted)]">agent/rebuild-settings-nav into main</p>
      <ul className="mt-5 space-y-3">
        {checks.map((c, i) => (
          <motion.li key={c} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.22, duration: 0.45, ease }} className="flex items-center gap-2.5 text-[14px]">
            <span className={cn("grid size-5 place-items-center rounded-full", i < 2 ? "bg-[#e7f5ec] text-[#2f8a57]" : "bg-[var(--t-tint)] text-[var(--t-accent)]")}>
              {i < 2 ? <Check className="size-3" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            {c}
          </motion.li>
        ))}
      </ul>
      <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: 0.5 }} className="mt-5 border-t border-[var(--t-border)] pt-4 text-[13px] text-[var(--t-muted)]">
        Nothing is merged without you.
      </motion.p>
    </div>
  );
}

function StepVisual({ visual, alt }: { visual: ToolVisual; alt: string }) {
  if (visual.kind === "approval") return <ApprovalMoment />;
  if (visual.kind === "pull-request") return <PullRequestMoment />;
  return (
    <div className="tool-window">
      <div className="tool-window-bar" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <ShotDetail shot={visual.shot} alt={alt} sizes="(max-width: 1024px) 92vw, 600px" className="aspect-[16/11]" />
    </div>
  );
}

export function StepsScroller({ steps, name }: { steps: { title: string; body: string; visual: ToolVisual }[]; name: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = useReducedMotion();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    for (const el of refs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);
  const current = steps[active];
  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
      <ol className="relative">
        {/* the rail: the part already walked fills with the accent */}
        <span aria-hidden className="tool-rail absolute bottom-6 left-[19px] top-6 hidden w-px lg:block">
          <motion.span className="tool-rail-fill absolute inset-x-0 top-0" animate={{ height: `${(active / Math.max(1, steps.length - 1)) * 100}%` }} transition={{ duration: reduce ? 0 : 0.5, ease }} />
        </span>
        {steps.map((s, i) => (
          <li
            key={s.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            className="relative flex gap-5 py-6 lg:min-h-[52vh] lg:items-center"
          >
            <span className={cn("tool-step relative z-[1] shrink-0 transition-colors duration-300", i === active && "is-active")}>{String(i + 1).padStart(2, "0")}</span>
            <div className={cn("transition-opacity duration-500 lg:opacity-40", i === active && "lg:opacity-100")}>
              <p className="text-[clamp(1.25rem,2vw,1.6rem)] font-semibold tracking-[-0.025em]">{s.title}</p>
              <p className="mt-2 max-w-md text-[17px] leading-relaxed text-[var(--t-muted)]">{s.body}</p>
              {/* phones: the picture under its words */}
              <div className="mt-6 lg:hidden">
                <StepVisual visual={s.visual} alt={`${name}: ${s.title}`} />
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="hidden lg:block">
        <div className="sticky top-[18vh]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.45, ease }}
            >
              <StepVisual visual={current.visual} alt={`${name}: ${current.title}`} />
            </motion.div>
          </AnimatePresence>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--t-muted)]" aria-hidden>
            Step {active + 1} of {steps.length} · {current.title}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- a look inside: one big screen, tabs to switch ---------- */

export function ScreenTabs({ screens, name }: { screens: { src: string; title: string; caption: string }[]; name: string }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const go = (n: number) => {
    const k = (n + screens.length) % screens.length;
    setI(k);
    tabs.current[k]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(i + 1);
    else if (e.key === "ArrowLeft") go(i - 1);
  };
  const s = screens[i];
  return (
    <div className="mt-10">
      <div role="tablist" aria-label={`${name} screens`} onKeyDown={onKey} className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        {screens.map((x, k) => (
          <button
            key={x.src}
            ref={(el) => {
              tabs.current[k] = el;
            }}
            role="tab"
            id={`tool-tab-${k}`}
            aria-selected={k === i}
            aria-controls="tool-tabpanel"
            tabIndex={k === i ? 0 : -1}
            onClick={() => setI(k)}
            className={cn("tool-tab relative shrink-0", k === i && "is-active")}
          >
            {x.title}
            {k === i ? <motion.span layoutId="tool-tab-line" className="tool-tab-line" transition={{ duration: reduce ? 0 : 0.35, ease }} /> : null}
          </button>
        ))}
      </div>
      <div id="tool-tabpanel" role="tabpanel" aria-labelledby={`tool-tab-${i}`} className="mt-6">
        <div className="tool-window">
          <div className="tool-window-bar" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <div className="relative aspect-[16/10]">
            <AnimatePresence initial={false}>
              <motion.div key={s.src} className="absolute inset-0" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.4 }}>
                <Image src={s.src} alt={`${name}: ${s.caption}`} fill sizes="(max-width: 1152px) 94vw, 1100px" className="object-cover object-top" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-center text-[17px] leading-relaxed text-[var(--t-muted)]" aria-live="polite">
          <span className="font-semibold text-[var(--t-fg)]">{s.title}.</span> {s.caption}
        </p>
      </div>
    </div>
  );
}

/* ---------- privacy: what stays on the computer, what only connects if you choose ---------- */

export function PrivacyMap({ local, outside, name }: { local: string[]; outside: string[]; name: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1.15fr)_auto_minmax(0,1fr)]">
      <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-15% 0px" }} transition={{ duration: 0.6, ease }} className="tool-zone is-local">
        <p className="tool-zone-label">On your computer, with {name}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {local.map((l, i) => (
            <motion.li key={l} initial={reduce ? false : { opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.25 + i * 0.08, duration: 0.4, ease }} className="tool-chip is-local">
              {l}
            </motion.li>
          ))}
        </ul>
      </motion.div>
      {/* the only way out: a dashed line, travelled by a dot, and only when you connect it */}
      <div aria-hidden className="tool-wire">
        <span className="tool-wire-dot" />
      </div>
      <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-15% 0px" }} transition={{ duration: 0.6, ease, delay: 0.15 }} className="tool-zone is-outside">
        <p className="tool-zone-label">Only if you connect it</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {outside.map((l) => (
            <li key={l} className="tool-chip is-outside">
              {l}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

/* ---------- how it is built: the stack as layers, laid one on the other ---------- */

export function LayerStack({ groups }: { groups: StackGroup[] }) {
  const reduce = useReducedMotion();
  return (
    <ol className="space-y-2">
      {groups.map((g, i) => (
        <motion.li
          key={g.label}
          initial={reduce ? false : { opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ delay: i * 0.09, duration: 0.55, ease }}
          className="tool-layer"
          style={{ ["--before" as string]: i, ["--after" as string]: groups.length - 1 - i }}
        >
          <span className="tool-layer-label">{g.label}</span>
          <span className="text-[13.5px] leading-relaxed text-[var(--t-muted)]">{g.items.join("  ·  ")}</span>
        </motion.li>
      ))}
    </ol>
  );
}

/* ---------- small drawn moments for the feature grid ---------- */

export function LogMoment() {
  const reduce = useReducedMotion();
  const lines = [
    ["read", "docs/decisions/navigation.md"],
    ["read", "src/components/nav.tsx"],
    ["edit", "src/components/nav.tsx"],
    ["run", "npm run lint"],
  ];
  return (
    <ul className="tool-log font-mono text-[12.5px]">
      {lines.map(([k, v], i) => (
        <motion.li key={v + k} initial={reduce ? false : { opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.2, duration: 0.4, ease }} className="flex items-center gap-3">
          <span className="tool-log-kind" data-kind={k}>
            {k}
          </span>
          <span className="truncate">{v}</span>
        </motion.li>
      ))}
    </ul>
  );
}

export function PromptMoment() {
  const reduce = useReducedMotion();
  // the assistant's own suggestions in the app, in English
  const asks = ["Find me AI engineer offers in Brussels", "Compare my 3 best places to live", "Draft my overdue follow-ups"];
  return (
    <div className="tool-prompt">
      <p className="text-[13.5px] text-[var(--t-muted)]">Ask anything, @ to mention an application, a CV...</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {asks.map((a, i) => (
          <motion.li key={a} initial={reduce ? false : { opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.18, duration: 0.4, ease }} className="tool-chip is-ask">
            {a}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- the case: without, then with ---------- */

export function WhyLists({ name, without, withItems }: { name: string; without: string[]; withItems: { title: string; body: string }[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-0">
      <div className="md:pr-12">
        <p className="tool-zone-label">Without {name}</p>
        <ul className="mt-6 space-y-5">
          {without.map((w, i) => (
            <motion.li
              key={w}
              initial={reduce ? false : { opacity: 0, x: -10 }}
              whileInView={{ opacity: 1 - i * 0.18, x: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ delay: i * 0.12, duration: 0.5, ease }}
              className="flex items-center gap-3 text-[clamp(1.05rem,1.6vw,1.3rem)] text-[var(--t-muted)]"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[var(--t-border)]">
                <X className="size-3.5" />
              </span>
              <span className="line-through decoration-[var(--t-border)] decoration-1">{w}</span>
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="md:border-l md:border-[var(--t-border)] md:pl-12">
        <p className="tool-zone-label text-[var(--t-accent)]">With {name}</p>
        <ul className="mt-6 space-y-7">
          {withItems.map((w, i) => (
            <motion.li key={w.title} initial={reduce ? false : { opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease }} className="flex gap-4">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[var(--t-accent)] text-white">
                <Check className="size-4" strokeWidth={2.5} />
              </span>
              <span>
                <span className="block text-lg font-semibold tracking-[-0.02em]">{w.title}</span>
                <span className="mt-1 block leading-relaxed text-[var(--t-muted)]">{w.body}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
