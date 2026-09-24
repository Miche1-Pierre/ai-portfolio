import { Reveal } from "@/components/motion/reveal";
import { SectionRule } from "@/components/site/marks";
import { Pill } from "@/components/site/pill";
import type { Tone } from "@/components/site/shapes";
import { cn } from "@/lib/utils";

/** Section header (DA v3.1): numbered square tag, big 450-weight title, muted lead. */
export function SectionHeader({
  index,
  eyebrow,
  tone = "blue",
  title,
  description,
  align = "left",
  size = "lg",
  className,
}: {
  index?: string;
  eyebrow: string;
  tone?: Tone;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** "md" for titles that sit in a half-width column. */
  size?: "lg" | "md";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-6", align === "center" && "items-center text-center", className)}>
      <Pill tone={tone} index={index}>
        {eyebrow}
      </Pill>
      <h2 className={cn("title max-w-3xl", size === "lg" ? "text-[clamp(2.1rem,4.2vw,3.5rem)]" : "text-[clamp(2rem,3.3vw,2.85rem)]")}>{title}</h2>
      {description ? (
        <p className={cn("max-w-2xl text-lg leading-relaxed text-muted-foreground", align === "center" && "mx-auto")}>{description}</p>
      ) : null}
    </div>
  );
}

export function Section({
  id,
  index,
  eyebrow,
  tone,
  title,
  description,
  align,
  children,
  className,
}: {
  id: string;
  index?: string;
  eyebrow: string;
  tone?: Tone;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative scroll-mt-20 pb-20 pt-4 sm:pb-28", className)}>
      <div className="container-x">
        <SectionRule className="mb-14 sm:mb-20" />
        <Reveal>
          <SectionHeader index={index} eyebrow={eyebrow} tone={tone} title={title} description={description} align={align} className="mb-12 sm:mb-16" />
        </Reveal>
        {children}
      </div>
    </section>
  );
}
