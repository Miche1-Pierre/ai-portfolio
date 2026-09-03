import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function Section({
  id,
  index,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative scroll-mt-24 py-20 sm:py-28", className)}>
      <div className="container-x">
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 sm:mb-14">
            <div className="flex items-center gap-3">
              <span className="eyebrow">{index}</span>
              <span className="h-px w-8 bg-border" />
              <span className="eyebrow">{eyebrow}</span>
            </div>
            <h2 className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {title}
            </h2>
            {description ? (
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  );
}
