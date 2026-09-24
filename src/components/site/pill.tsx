import type { ReactNode } from "react";
import type { Tone } from "@/components/site/shapes";
import { cn } from "@/lib/utils";

/**
 * Eyebrow tag: square, pastel, mono uppercase, with a round marker and an optional section
 * index ("01"). Styles in globals.css (.pill).
 */
export function Pill({
  children,
  tone = "blue",
  index,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  index?: string;
  className?: string;
}) {
  return (
    <span className={cn("pill", className)} data-tone={tone === "blue" ? undefined : tone}>
      {index ? <span className="opacity-60">{index}</span> : null}
      {children}
    </span>
  );
}
