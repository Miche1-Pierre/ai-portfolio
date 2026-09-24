import {
  Binary,
  Bot,
  Braces,
  Brain,
  Building2,
  Code,
  Cpu,
  FileCheck,
  FileSearch,
  FlaskConical,
  KeyRound,
  Landmark,
  Layers,
  Network,
  Scale,
  ShieldCheck,
  TestTube,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionRule } from "@/components/site/marks";
import { SectionHeader } from "@/components/site/section";
import { skillGroups, skillLogos, type SkillGlyph, type SkillItem } from "@/content/skills";
import { cn } from "@/lib/utils";

const MARK = ["bg-shape-blue", "bg-shape-red", "bg-shape-yellow", "bg-shape-green"];
const INK = ["text-ink-blue", "text-ink-red", "text-ink-yellow", "text-ink-green"];

const GLYPHS: Record<SkillGlyph, LucideIcon> = {
  layers: Layers,
  tenant: Building2,
  api: Braces,
  brain: Brain,
  search: FileSearch,
  bot: Bot,
  network: Network,
  vector: Binary,
  cpu: Cpu,
  key: KeyRound,
  "file-check": FileCheck,
  lab: FlaskConical,
  shield: ShieldCheck,
  bank: Landmark,
  scale: Scale,
  test: TestTube,
  code: Code,
};

/** One skill as a link chip: brand logo (or a generic glyph) + name. */
function SkillChip({ item }: { item: SkillItem }) {
  const Glyph = item.glyph ? GLYPHS[item.glyph] : null;
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      title={`${item.name}: open the official site`}
      className="inline-flex items-center gap-1.5 border border-rule bg-card px-2 py-1 text-[13px] text-foreground/85 transition-colors hover:border-foreground/40 hover:text-foreground"
    >
      {item.logo ? (
        <span className="grid size-4 place-items-center rounded-full bg-logo-plate">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/tech/${item.logo}.svg`} alt="" className="size-3" loading="lazy" />
        </span>
      ) : Glyph ? (
        <Glyph className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
      ) : null}
      {item.name}
    </a>
  );
}

/**
 * A ring of logo plates rotating around the wheel's centre; each plate counter-rotates to stay
 * upright. Hovering the wheel pauses it so a logo can be clicked.
 */
function Ring({ items, radius, spin, counter }: { items: typeof skillLogos; radius: number; spin: string; counter: string }) {
  return (
    <div className={cn("absolute inset-0", spin)}>
      {items.map((it, k) => {
        const a = (360 / items.length) * k;
        return (
          <div key={it.logo} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${a}deg) translateX(${radius}px) rotate(${-a}deg)` }}>
            <div className={cn("absolute size-0", counter)}>
              <a
                href={it.href}
                target="_blank"
                rel="noreferrer"
                title={it.name}
                className="absolute -left-[22px] -top-[22px] grid size-11 place-items-center rounded-full bg-logo-plate shadow-sm ring-1 ring-foreground/10 transition-transform hover:scale-110"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/tech/${it.logo}.svg`} alt={it.name} className="size-5" loading="lazy" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Two concentric wheels of tech logos on the side of the page: their centre sits on the viewport's
 * right edge, so only the left half shows (the section clips the rest). Desktop only.
 */
function TechWheels() {
  const outer = skillLogos.slice(0, 14);
  const inner = skillLogos.slice(14);
  return (
    <div className="relative hidden h-[38rem] lg:block" aria-label="Technologies and tools">
      <div className="absolute right-[calc(-1*(max(0px,(100vw_-_72rem)/2)_+_2rem))] top-1/2 size-[42rem] -translate-y-1/2 translate-x-1/2 [&:hover_*]:[animation-play-state:paused]">
        <span aria-hidden className="absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-rule" />
        <span aria-hidden className="absolute left-1/2 top-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-rule" />
        <span aria-hidden className="absolute left-1/2 top-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tint-blue" />
        <Ring items={outer} radius={300} spin="animate-orbit-slow" counter="animate-orbit-slow-reverse" />
        <Ring items={inner} radius={190} spin="animate-orbit-reverse" counter="animate-orbit" />
      </div>
    </div>
  );
}

/** Skills: header + the tech wheels, then a ruled 2x2 sheet of link chips. */
export function Skills() {
  return (
    <section id="skills" className="relative scroll-mt-20 overflow-x-clip pb-20 pt-4 sm:pb-28">
      <div className="container-x">
        <SectionRule className="mb-14 sm:mb-20" />
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <SectionHeader
              index="05"
              eyebrow="Skills"
              title="A full-stack core with an applied-AI edge."
              description="Backend systems that hold in production, frontends people actually use, and agents with guardrails - in environments where compliance is not optional."
            />
          </Reveal>
          <TechWheels />
        </div>

        <div className="mt-12 grid border-l border-t border-rule sm:mt-16 md:grid-cols-2">
          {skillGroups.map((g, i) => (
            <Reveal key={g.title} delay={i * 0.04} className="flex min-w-0 flex-col border-b border-r border-rule p-6 sm:p-9">
              <div className="flex items-center gap-3">
                <span className={cn("size-3 rounded-full", MARK[i % MARK.length])} />
                <span className={cn("num text-sm", INK[i % INK.length])}>S.{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-6 text-2xl font-medium tracking-[-0.02em]">{g.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{g.blurb}</p>
              <div className="mt-6 flex flex-wrap gap-1.5 border-t border-rule pt-5">
                {g.items.map((it) => (
                  <SkillChip key={it.name} item={it} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
