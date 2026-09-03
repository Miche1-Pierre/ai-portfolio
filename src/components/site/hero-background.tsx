"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";

const SideRays = dynamic(() => import("@/components/reactbits/side-rays"), { ssr: false });

// Warm brand rays, kept subtle. Emerge from the top-right so the left-aligned headline stays clean.
export function HeroBackground() {
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(55% 45% at 78% 0%, color-mix(in oklch, var(--brand) 22%, transparent), transparent 70%)" }}
      />
    );
  }

  const light = resolvedTheme === "light";
  return (
    <div className="absolute inset-0">
      <SideRays
        origin="top-right"
        rayColor1="#e0913a"
        rayColor2="#c81e1e"
        speed={reduce ? 0 : 1.4}
        intensity={light ? 0.9 : 1.25}
        spread={1.5}
        saturation={1.15}
        blend={0.5}
        falloff={2}
        opacity={light ? 0.42 : 0.82}
      />
    </div>
  );
}
