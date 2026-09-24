import { cn } from "@/lib/utils";

/**
 * Blueprint marks (DA v3.1): the technical-drawing details that make the square DA Pierre's own.
 * All decorative (aria-hidden).
 */

/** A small "+" registration mark in currentColor. Position it with absolute classes. */
export function PlusMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute size-[11px] text-foreground/35", className)}>
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
    </span>
  );
}

/** Section separator: a hairline across the container, with a plus mark at each end. */
export function SectionRule({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative h-px bg-rule", className)}>
      <PlusMark className="-left-[5px] -top-[5px]" />
      <PlusMark className="-right-[5px] -top-[5px]" />
    </div>
  );
}

/** Crop marks: four small corner ticks just outside a box (the parent must be `relative`). */
export function CropMarks({ className }: { className?: string }) {
  const tick = "pointer-events-none absolute size-3 border-foreground/30";
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute -inset-2", className)}>
      <span className={cn(tick, "left-0 top-0 border-l border-t")} />
      <span className={cn(tick, "right-0 top-0 border-r border-t")} />
      <span className={cn(tick, "bottom-0 left-0 border-b border-l")} />
      <span className={cn(tick, "bottom-0 right-0 border-b border-r")} />
    </span>
  );
}
