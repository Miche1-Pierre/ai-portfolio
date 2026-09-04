import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Aceternity UI "Bento Grid" (adapted). BentoGrid is the responsive grid; BentoCard is one tile.
export function BentoGrid({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("mx-auto grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[14rem]", className)}>
      {children}
    </div>
  );
}

export function BentoCard({
  className,
  children,
  style,
}: {
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={cn(
        "group/bento relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
