"use client";

/**
 * BorderGlow — from React Bits (reactbits.dev), ported to TS + the warm palette. A pointer-reactive
 * mesh-gradient border + outer glow that reveals toward the nearest edge. Styles live in globals.css
 * (.border-glow-card). Background defaults to the theme's --card token so it works in light + dark.
 */
import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function parseHSL(hslStr: string) {
  const m = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!m) return { h: 24, s: 85, l: 58 };
  return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]) };
}

function buildGlowVars(glowColor: string, intensity: number): Record<string, string> {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  const vars: Record<string, string> = {};
  opacities.forEach((o, i) => {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(o * intensity, 100)}%)`;
  });
  return vars;
}

const GRADIENT_POSITIONS = ["80% 55%", "69% 34%", "8% 6%", "41% 38%", "86% 85%", "82% 18%", "51% 4%"];
const GRADIENT_KEYS = ["--gradient-one", "--gradient-two", "--gradient-three", "--gradient-four", "--gradient-five", "--gradient-six", "--gradient-seven"];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]): Record<string, string> {
  const vars: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  vars["--gradient-base"] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInCubic = (x: number) => x * x * x;

function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }: { start?: number; end?: number; duration?: number; delay?: number; ease?: (x: number) => number; onUpdate: (v: number) => void; onEnd?: () => void }) {
  const t0 = performance.now() + delay;
  const tick = () => {
    const t = Math.min((performance.now() - t0) / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else onEnd?.();
  };
  setTimeout(() => requestAnimationFrame(tick), delay);
}

export function BorderGlow({
  children,
  className = "",
  edgeSensitivity = 30,
  glowColor = "24 85 58",
  backgroundColor = "var(--card)",
  borderRadius = 20,
  glowRadius = 36,
  glowIntensity = 1,
  coneSpread = 25,
  animated = false,
  colors = ["#c0392b", "#e0913a", "#f43f5e"],
  fillOpacity = 0.5,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
  innerClassName?: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    card.style.setProperty("--edge-proximity", (edge * 100).toFixed(3));
    card.style.setProperty("--cursor-angle", `${deg.toFixed(3)}deg`);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!animated || !card) return;
    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add("sweep-active");
    card.style.setProperty("--cursor-angle", `${angleStart}deg`);
    animateValue({ duration: 500, onUpdate: (v) => card.style.setProperty("--edge-proximity", String(v)) });
    animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: (v) => card.style.setProperty("--cursor-angle", `${((angleEnd - angleStart) * v) / 100 + angleStart}deg`) });
    animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: (v) => card.style.setProperty("--cursor-angle", `${((angleEnd - angleStart) * v) / 100 + angleStart}deg`) });
    animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0, onUpdate: (v) => card.style.setProperty("--edge-proximity", String(v)), onEnd: () => card.classList.remove("sweep-active") });
  }, [animated]);

  const style = {
    "--card-bg": backgroundColor,
    "--edge-sensitivity": edgeSensitivity,
    "--border-radius": `${borderRadius}px`,
    "--glow-padding": `${glowRadius}px`,
    "--cone-spread": coneSpread,
    "--fill-opacity": fillOpacity,
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
  } as CSSProperties;

  return (
    <div ref={cardRef} onPointerMove={handlePointerMove} className={cn("border-glow-card", className)} style={style}>
      <span className="edge-light" />
      <div className={cn("border-glow-inner", innerClassName)}>{children}</div>
    </div>
  );
}

export default BorderGlow;
