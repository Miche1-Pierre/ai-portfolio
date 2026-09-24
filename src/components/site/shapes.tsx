import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Filled geometric shapes: the graphic vocabulary of DA v3 (Dust-inspired).
 * Circle, half disc, quarter disc, "dee" (half stadium), pill, rounded square.
 * Colour = `currentColor` (e.g. `text-shape-red`). Always decorative (aria-hidden).
 */
export type ShapeKind = "circle" | "half" | "quarter" | "dee" | "pill" | "square";

const PATHS: Record<ShapeKind, { viewBox: string; d: string }> = {
  circle: { viewBox: "0 0 100 100", d: "M50 0a50 50 0 1 1 0 100a50 50 0 1 1 0-100Z" },
  half: { viewBox: "0 0 100 50", d: "M0 50A50 50 0 0 1 100 50Z" },
  quarter: { viewBox: "0 0 100 100", d: "M0 100V0a100 100 0 0 1 100 100Z" },
  dee: { viewBox: "0 0 100 100", d: "M0 0h50a50 50 0 0 1 0 100H0Z" },
  pill: { viewBox: "0 0 100 40", d: "M20 0h60a20 20 0 0 1 0 40H20A20 20 0 0 1 20 0Z" },
  square: { viewBox: "0 0 100 100", d: "M18 0h64a18 18 0 0 1 18 18v64a18 18 0 0 1-18 18H18A18 18 0 0 1 0 82V18A18 18 0 0 1 18 0Z" },
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

/** Circle + dee pair: the graphic "quote marks" of statement cards (as on dust.tt). */
export function QuoteShapes({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex items-center gap-1", className)}>
      <Shape kind="circle" className="size-6 text-shape-lime" />
      <Shape kind="dee" className="size-6 text-shape-pink" />
    </span>
  );
}

/** Two-shape badge (a half disc over a rounded square): section icons of the datasheet. */
export function ShapeBadge({ top, bottom, className }: { top: Tone; bottom: Tone; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative inline-flex h-9 w-8 flex-col items-center", className)}>
      <Shape kind="half" className={cn("h-3.5 w-6", toneShape[top])} />
      <Shape kind="square" className={cn("-mt-px size-8", toneShape[bottom])} />
    </span>
  );
}

/** Cycle of kinds for bullets. */
export const bulletKinds: ShapeKind[] = ["circle", "quarter", "dee", "square", "half"];
