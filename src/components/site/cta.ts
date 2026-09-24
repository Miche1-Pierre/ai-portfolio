import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Dust-style call-to-action styles for links and buttons outside the shadcn primitives:
 * one solid action blue, a paper secondary, a text link with an arrow, and a white button for
 * the dark band. `cta()` merges extra classes with tailwind-merge (safe overrides).
 */
const ctaBase = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,box-shadow,transform] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_1px_2px_rgb(0_60_130/0.2)] hover:bg-primary-hover active:translate-y-px",
        secondary:
          "border border-border bg-paper-soft text-foreground shadow-xs hover:bg-muted active:translate-y-px",
        ghost: "text-foreground hover:text-ink-blue [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5",
        inverse: "bg-white text-night hover:bg-white/90 active:translate-y-px",
      },
      size: {
        sm: "h-9 rounded-[10px] px-3.5 text-sm",
        md: "h-10 rounded-xl px-4 text-sm",
        lg: "h-12 rounded-xl px-5 text-base",
      },
    },
    compoundVariants: [
      { variant: "ghost", size: "sm", className: "px-1" },
      { variant: "ghost", size: "md", className: "px-1" },
      { variant: "ghost", size: "lg", className: "px-1" },
    ],
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export type CtaProps = VariantProps<typeof ctaBase>;

export function cta({ className, ...variants }: CtaProps & { className?: string } = {}): string {
  return cn(ctaBase(variants), className);
}
