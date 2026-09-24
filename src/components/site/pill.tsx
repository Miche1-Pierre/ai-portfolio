import type { ReactNode } from "react";
import type { Tone } from "@/components/site/shapes";
import { cn } from "@/lib/utils";

/** Dust-style eyebrow: a pastel pill with a dot, mono uppercase. Styles in globals.css (.pill). */
export function Pill({ children, tone = "blue", className }: { children: ReactNode; tone?: Tone | "night"; className?: string }) {
  return (
    <span className={cn("pill", className)} data-tone={tone === "blue" ? undefined : tone}>
      {children}
    </span>
  );
}
