"use client";

import { useRef, type ReactNode } from "react";
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

// Aceternity UI "Moving Border" (adapted, warm). A glowing dot traces the card's rounded border.
export function MovingBorderCard({
  children,
  duration = 3000,
  borderRadius = "1.5rem",
  className,
  containerClassName,
  borderClassName,
}: {
  children: ReactNode;
  duration?: number;
  borderRadius?: string;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-transparent p-[1px]", containerClassName)} style={{ borderRadius }}>
      <div className="absolute inset-0" style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}>
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div className={cn("h-20 w-20 bg-[radial-gradient(var(--brand)_40%,transparent_60%)] opacity-70", borderClassName)} />
        </MovingBorder>
      </div>
      <div
        className={cn("relative flex h-full w-full flex-col border bg-card/80 backdrop-blur-xl", className)}
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        {children}
      </div>
    </div>
  );
}

function MovingBorder({ children, duration = 3000, rx, ry }: { children: ReactNode; duration?: number; rx?: string; ry?: string }) {
  const pathRef = useRef<SVGRectElement | null>(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMs = length / duration;
      progress.set((time * pxPerMs) % length);
    }
  });

  const x = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val)?.x ?? 0);
  const y = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val)?.y ?? 0);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="absolute h-full w-full" width="100%" height="100%">
        <rect fill="none" width="100%" height="100%" rx={rx} ry={ry} ref={pathRef} />
      </svg>
      <motion.div style={{ position: "absolute", top: 0, left: 0, display: "inline-block", transform }}>
        {children}
      </motion.div>
    </>
  );
}

export default MovingBorderCard;
