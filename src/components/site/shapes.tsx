import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Filled square shapes: the graphic vocabulary of DA v3.1 (no curves anywhere).
 * Square, rectangle, tall bar, step (L), notch, plus, bar. Colour = `currentColor`
 * (e.g. `text-shape-red`). Always decorative (aria-hidden).
 */
export type ShapeKind = "square" | "rect" | "tall" | "step" | "notch" | "plus" | "bar";

const PATHS: Record<ShapeKind, { viewBox: string; d: string }> = {
  square: { viewBox: "0 0 100 100", d: "M0 0H100V100H0Z" },
  rect: { viewBox: "0 0 100 50", d: "M0 0H100V50H0Z" },
  tall: { viewBox: "0 0 50 100", d: "M0 0H50V100H0Z" },
  step: { viewBox: "0 0 100 100", d: "M0 0H50V50H100V100H0Z" },
  notch: { viewBox: "0 0 100 100", d: "M0 0H100V60H60V100H0Z" },
  plus: { viewBox: "0 0 100 100", d: "M35 0H65V35H100V65H65V100H35V65H0V35H35Z" },
  bar: { viewBox: "0 0 100 30", d: "M0 0H100V30H0Z" },
};

export function Shape({
  kind,
  rotate = 0,
  className,
  style,
}: {
  kind: ShapeKind;
  rotate?: 0 | 90 | 180 | 270;
  className?: string;
  style?: CSSProperties;
}) {
  const { viewBox, d } = PATHS[kind];
  return (
    <svg
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      className={cn("block shrink-0", className)}
      style={{ ...style, transform: rotate ? `rotate(${rotate}deg)` : style?.transform }}
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}

/** A tone of the palette. Each maps to a shape colour, a pastel tint and an AA text ink. */
export type Tone = "blue" | "red" | "green" | "lime" | "yellow" | "pink" | "sky";

// Full class names (Tailwind needs them literally).
export const toneShape: Record<Tone, string> = {
  blue: "text-shape-blue",
  red: "text-shape-red",
  green: "text-shape-green",
  lime: "text-shape-lime",
  yellow: "text-shape-yellow",
  pink: "text-shape-pink",
  sky: "text-shape-sky",
};
export const toneFill: Record<Tone, string> = {
  blue: "bg-shape-blue",
  red: "bg-shape-red",
  green: "bg-shape-green",
  lime: "bg-shape-lime",
  yellow: "bg-shape-yellow",
  pink: "bg-shape-pink",
  sky: "bg-shape-sky",
};
export const toneTint: Record<Tone, string> = {
  blue: "bg-tint-blue",
  red: "bg-tint-red",
  green: "bg-tint-green",
  lime: "bg-tint-lime",
  yellow: "bg-tint-yellow",
  pink: "bg-tint-pink",
  sky: "bg-tint-sky",
};
export const toneInk: Record<Tone, string> = {
  blue: "text-ink-blue",
  red: "text-ink-red",
  green: "text-ink-green",
  lime: "text-ink-lime",
  yellow: "text-ink-yellow",
  pink: "text-ink-pink",
  sky: "text-ink-sky",
};

/** Lime and sky are too pale on their own tint or on white: use their deeper sibling there. */
export const toneStrong = (t: Tone): Tone => (t === "lime" ? "green" : t === "sky" ? "blue" : t);

/** List bullet made of a shape (instead of a dot); vary the kind per item for rhythm. */
export function ShapeBullet({
  kind,
  tone,
  className,
  rotate,
}: {
  kind: ShapeKind;
  tone: Tone;
  className?: string;
  rotate?: 0 | 90 | 180 | 270;
}) {
  return <Shape kind={kind} rotate={rotate} className={cn("size-3", toneShape[tone], className)} />;
}

/** Two stacked blocks: the graphic "quote mark" of statement cards. */
export function QuoteBlocks({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex items-end gap-1", className)}>
      <Shape kind="square" className="size-5 text-shape-blue" />
      <Shape kind="step" className="size-5 text-shape-yellow" />
    </span>
  );
}

/** A bar over a square (a stacked module): section icons of the impact datasheet. */
export function ShapeBadge({ top, bottom, className }: { top: Tone; bottom: Tone; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex h-9 w-8 flex-col items-center gap-0.5", className)}>
      <Shape kind="bar" className={cn("h-2 w-6", toneShape[top])} />
      <Shape kind="square" className={cn("size-7", toneShape[bottom])} />
    </span>
  );
}

/** Cycle of kinds for bullets. */
export const bulletKinds: ShapeKind[] = ["square", "step", "notch", "plus", "tall"];
