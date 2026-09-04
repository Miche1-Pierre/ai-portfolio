"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Aceternity UI "3D Pin" (adapted). The card tilts back in 3D on hover and a floating label with
// animated rings rises above it. `href` routes internally (Next Link).
export function PinContainer({
  children,
  title,
  href,
  className,
  containerClassName,
}: {
  children: ReactNode;
  title?: string;
  href: string;
  className?: string;
  containerClassName?: string;
}) {
  const [transform, setTransform] = useState("translate(-50%,-50%) rotateX(0deg)");

  return (
    <Link
      className={cn("group/pin relative z-10 cursor-pointer", containerClassName)}
      href={href}
      onMouseEnter={() => setTransform("translate(-50%,-50%) rotateX(18deg) scale(0.96)")}
      onMouseLeave={() => setTransform("translate(-50%,-50%) rotateX(0deg) scale(1)")}
    >
      <div style={{ perspective: "1000px", transform: "rotateX(70deg) translateZ(0deg)" }} className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2">
        <div
          style={{ transform }}
          className="absolute left-1/2 top-1/2 flex items-start justify-start overflow-hidden rounded-2xl border bg-card p-4 shadow-[0_8px_16px_rgb(0_0_0/0.25)] transition duration-700 group-hover/pin:border-brand/40"
        >
          <div className={cn("relative z-10", className)}>{children}</div>
        </div>
      </div>
      <PinPerspective title={title} />
    </Link>
  );
}

function PinPerspective({ title }: { title?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex h-full w-full items-center justify-center opacity-0 transition duration-500 group-hover/pin:opacity-100">
      <div className="inset-0 -mt-10 h-full w-full flex-none">
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <span className="relative z-20 whitespace-nowrap rounded-full bg-foreground px-5 py-1.5 text-xs font-semibold text-background shadow-lg ring-1 ring-border">
            {title ?? "View"}
          </span>
        </div>

        <div className="absolute left-1/2 top-1/2" style={{ perspective: "1000px", transform: "rotateX(70deg) translateZ(0)" }}>
          {[0, 2, 4].map((delay) => (
            <span
              key={delay}
              style={{ animationDelay: `${delay}s` }}
              className="absolute left-1/2 top-1/2 h-[11.25rem] w-[11.25rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_18%,transparent)_0%,transparent_90%)]"
            />
          ))}
        </div>

        <span className="absolute right-1/2 bottom-1/2 h-20 w-px translate-y-[14px] bg-gradient-to-b from-transparent to-brand blur-[2px]" />
        <span className="absolute right-1/2 bottom-1/2 h-20 w-px translate-y-[14px] bg-gradient-to-b from-transparent to-brand" />
        <span className="absolute right-1/2 bottom-1/2 z-40 h-[4px] w-[4px] translate-x-[1.5px] translate-y-[14px] rounded-full bg-brand blur-[3px]" />
        <span className="absolute right-1/2 bottom-1/2 z-40 h-[2px] w-[2px] translate-x-[0.5px] translate-y-[14px] rounded-full bg-brand" />
      </div>
    </div>
  );
}

export default PinContainer;
