"use client";

import { createContext, useContext, useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import { lookMaterial, type Look, type Surfaces, type ThemeName } from "@/components/intro/look";

/*
 * Building blocks of the intro world: the shared context (theme, palette, scroll progress) and the
 * primitives every piece is made of, all in the hero's drawing style (see look.ts).
 */

// view directions of the isometric camera (looking along -DIR)
export const DIR = new THREE.Vector3(1, 1, 1).normalize();
export const RIGHT = new THREE.Vector3(1, 0, -1).normalize();
export const UP = new THREE.Vector3(-1, 2, -1).normalize();

export type V3 = [number, number, number];

type WorldCtx = { theme: ThemeName; s: Surfaces; progress: MotionValue<number> };
export const WorldContext = createContext<WorldCtx | null>(null);

export const useWorld = () => {
  const v = useContext(WorldContext);
  if (!v) throw new Error("useWorld outside <World>");
  return v;
};

export const useLook = (look: Look) => {
  const { theme } = useWorld();
  return lookMaterial(look, theme);
};

/** A mesh in the drawing style, with the white rim lines of the drawing on its edges. */
export function Solid({ geometry, look, rim = true, ...props }: { geometry: THREE.BufferGeometry; look: Look; rim?: boolean } & Omit<ThreeElements["group"], "children">) {
  const material = useLook(look);
  const { s } = useWorld();
  const edges = useMemo(() => (rim ? new THREE.EdgesGeometry(geometry, 25) : null), [geometry, rim]);
  return (
    <group {...props}>
      <mesh geometry={geometry} material={material} />
      {edges ? (
        <lineSegments geometry={edges}>
          <lineBasicMaterial color="#ffffff" transparent opacity={s.rim} />
        </lineSegments>
      ) : null}
    </group>
  );
}

/** Axis-aligned block from (x0, y0, z0) to (x1, y1, z1). */
export function Box({ from, to, look, rim }: { from: V3; to: V3; look: Look; rim?: boolean }) {
  const geometry = useMemo(() => new THREE.BoxGeometry(to[0] - from[0], to[1] - from[1], to[2] - from[2]), [from, to]);
  const position: V3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  return <Solid geometry={geometry} look={look} rim={rim} position={position} />;
}

/** Upright cylinder (or frustum, with rTop) standing at (x, y0, z). */
export function Cyl({ at, r, rTop, h, look, segments = 40, rim }: { at: V3; r: number; rTop?: number; h: number; look: Look; segments?: number; rim?: boolean }) {
  const geometry = useMemo(() => new THREE.CylinderGeometry(rTop ?? r, r, h, segments), [r, rTop, h, segments]);
  return <Solid geometry={geometry} look={look} rim={rim} position={[at[0], at[1] + h / 2, at[2]]} />;
}

/** A flat panel on a wall, the floor or a top ("x": facing +X, "z": facing +Z, "y": lying flat). */
export function Panel({ at, w, h, face, color, stripes, spacing, line }: { at: V3; w: number; h: number; face: "x" | "z" | "y"; color: string; stripes?: Look["stripes"]; spacing?: number; line?: string }) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(w, h), [w, h]);
  const material = useLook({ top: color, mode: "flat", stripes, spacing, line });
  const rotation: V3 = face === "x" ? [0, Math.PI / 2, 0] : face === "y" ? [-Math.PI / 2, 0, 0] : [0, 0, 0];
  return <mesh geometry={geometry} material={material} position={at} rotation={rotation} />;
}

/** A disc lying on the ground (shadows, plazas, ponds), optionally stretched into an ellipse. */
export function Disc({ at, r, color, y = 0.02, stretch = 1 }: { at: [number, number]; r: number; color: string; y?: number; stretch?: number }) {
  const geometry = useMemo(() => new THREE.CircleGeometry(r, 40), [r]);
  const material = useLook({ top: color, mode: "flat" });
  return <mesh geometry={geometry} material={material} position={[at[0], y, at[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={[stretch, 1, 1]} />;
}

/** A sphere shaded like the drawing's crowns: a lit cap and a crescent of shade. */
export function Ball({ at, r, color, scale }: { at: V3; r: number; color: string; scale?: V3 }) {
  const geometry = useMemo(() => new THREE.SphereGeometry(r, 28, 18), [r]);
  const material = useLook({ top: color, mode: "ball" });
  return <mesh geometry={geometry} material={material} position={at} scale={scale} />;
}

const CLOUD: [number, number, number][] = [
  [-1.0, 0.25, 0.72],
  [0.0, -0.32, 1.0],
  [1.02, 0.18, 0.7],
  [0.5, 0.48, 0.62],
  [-0.42, 0.52, 0.6],
];

/** A cloud seen from the camera: puffs laid out on the screen plane, outlined as one shape. */
export function Cloud({ scale = 1 }: { scale?: number }) {
  const { s } = useWorld();
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 20, 14), []);
  const fill = useLook({ top: s.smoke, mode: "flat" });
  const line = useLook({ top: s.smokeLine, mode: "flat", side: THREE.BackSide });
  return (
    <group scale={scale}>
      {CLOUD.map(([dx, dy, r], i) => {
        const p = RIGHT.clone().multiplyScalar(dx).addScaledVector(UP, -dy);
        return (
          <group key={i} position={p.toArray()}>
            <mesh geometry={sphere} material={line} scale={r + 0.07} />
            <mesh geometry={sphere} material={fill} scale={r} />
          </group>
        );
      })}
    </group>
  );
}

/** Distance-parameterised position on a polyline (closed loop, or there and back again). */
export function makeRoute(points: [number, number][], loop: boolean) {
  const pts = loop ? [...points, points[0]] : points;
  const lengths = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lengths.reduce((a, b) => a + b, 0);
  return (distance: number): [number, number] => {
    let d = loop ? ((distance % total) + total) % total : total - Math.abs((((distance % (2 * total)) + 2 * total) % (2 * total)) - total);
    for (let i = 0; i < lengths.length; i++) {
      if (d <= lengths[i] || i === lengths.length - 1) {
        const t = lengths[i] ? Math.min(1, d / lengths[i]) : 0;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t];
      }
      d -= lengths[i];
    }
    return pts[pts.length - 1];
  };
}
