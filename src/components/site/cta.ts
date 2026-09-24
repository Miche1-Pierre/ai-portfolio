import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Call-to-action styles for links and buttons outside the shadcn primitives (DA v3.1: square).
 * One solid cobalt action, a bordered secondary, a text link with an arrow, and a white button
 * for the dark band. `cta()` merges extra classes with tailwind-merge (safe overrides).
 */
const ctaBase = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-none font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] hover:bg-primary-hover active:translate-y-px active:shadow-none",
        secondary:
          "border border-foreground/15 bg-background text-foreground hover:border-foreground/45 active:translate-y-px",
        ghost: "text-foreground hover:text-ink-blue [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5",
        inverse: "bg-white text-night hover:bg-white/90 active:translate-y-px",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-base",
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
