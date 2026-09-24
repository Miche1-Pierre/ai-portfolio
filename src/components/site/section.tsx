import { Reveal } from "@/components/motion/reveal";
import { Pill } from "@/components/site/pill";
import type { Tone } from "@/components/site/shapes";
import { cn } from "@/lib/utils";

/** Dust-style section header: pastel pill, big 450-weight title, muted lead. */
export function SectionHeader({
  eyebrow,
  tone = "blue",
  title,
  description,
  align = "left",
  size = "lg",
  className,
}: {
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
      <Pill tone={tone}>{eyebrow}</Pill>
      <h2 className={cn("title max-w-3xl", size === "lg" ? "text-[clamp(2.1rem,4.2vw,3.5rem)]" : "text-[clamp(2rem,3.3vw,2.85rem)]")}>{title}</h2>
      {description ? (
        <p className={cn("max-w-2xl text-lg leading-relaxed text-muted-foreground", align === "center" && "mx-auto")}>{description}</p>
      ) : null}
    </div>
  );
}

export function Section({
  id,
  eyebrow,
  tone,
  title,
  description,
  align,
  children,
  className,
}: {
  id: string;
  eyebrow: string;
  tone?: Tone;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative scroll-mt-20 py-20 sm:py-28", className)}>
      <div className="container-x">
        <Reveal>
          <SectionHeader eyebrow={eyebrow} tone={tone} title={title} description={description} align={align} className="mb-12 sm:mb-16" />
        </Reveal>
        {children}
      </div>
    </section>
  );
}
