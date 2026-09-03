"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";

const Aurora = dynamic(() => import("@/components/reactbits/aurora"), { ssr: false });

// Warm aurora that follows the brand palette.
const DARK = ["#7a1512", "#e0913a", "#c81e1e"];
const LIGHT = ["#b91c1c", "#e0913a", "#b91c1c"];

export function HeroBackground() {
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || reduce) {
    return (
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(60% 46% at 50% 0%, color-mix(in oklch, var(--brand) 26%, transparent), transparent 70%)" }}
      />
    );
  }

  const light = resolvedTheme === "light";
  return (
    <div className="absolute inset-x-0 top-0 h-[130%]" style={{ opacity: light ? 0.5 : 0.8 }}>
      <Aurora colorStops={light ? LIGHT : DARK} amplitude={light ? 0.8 : 1.15} blend={0.65} speed={0.6} lightMode={light} />
    </div>
  );
}
