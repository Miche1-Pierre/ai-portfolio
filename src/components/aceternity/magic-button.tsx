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
      <span className="absolute inset-[-1000%] animate-[magic-spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ffcf8a_0%,var(--brand)_50%,#ffcf8a_100%)]" />
      <span
        className={cn(
          "inline-flex h-full w-full items-center justify-center gap-2 rounded-lg bg-background px-7 text-sm font-medium text-foreground backdrop-blur-3xl transition-colors duration-300 group-hover:bg-muted",
          innerClassName
        )}
      >
        {position === "left" && <span className="transition-transform duration-300 group-hover:-translate-x-0.5">{icon}</span>}
        {title}
        {position === "right" && <span className="transition-transform duration-300 group-hover:translate-x-0.5">{icon}</span>}
      </span>
    </>
  );

  const base = cn(
    "group relative inline-flex h-12 w-full overflow-hidden rounded-lg p-[2px] outline-none transition-[transform,box-shadow] duration-300 hover:scale-[1.03] hover:shadow-[0_12px_40px_-10px_var(--brand)] focus-visible:ring-2 focus-visible:ring-ring active:scale-95 md:w-60",
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
