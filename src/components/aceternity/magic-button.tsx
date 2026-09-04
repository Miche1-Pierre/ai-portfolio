import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Aceternity UI "shimmer / magic" button (adapted to the warm palette): an animated conic-gradient
// border spins behind an inner pill. Renders as a <button> unless `href` is given.
export function MagicButton({
  title,
  icon,
  position = "right",
  href,
  onClick,
  className,
  innerClassName,
}: {
  title: string;
  icon?: ReactNode;
  position?: "left" | "right";
  href?: string;
  onClick?: () => void;
  className?: string;
  innerClassName?: string;
}) {
  const inner = (
    <>
      <span className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,var(--brand-2)_0%,var(--brand)_50%,var(--brand-2)_100%)]" />
      <span
        className={cn(
          "inline-flex h-full w-full items-center justify-center gap-2 rounded-lg bg-background px-7 text-sm font-medium text-foreground backdrop-blur-3xl",
          innerClassName
        )}
      >
        {position === "left" && icon}
        {title}
        {position === "right" && icon}
      </span>
    </>
  );

  const base = cn(
    "relative inline-flex h-12 w-full overflow-hidden rounded-lg p-[1.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-60",
    className
  );

  if (href) {
    return (
      <a href={href} className={base}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={base}>
      {inner}
    </button>
  );
}

export default MagicButton;
