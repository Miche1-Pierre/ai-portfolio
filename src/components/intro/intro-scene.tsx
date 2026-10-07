"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import type { ThemeName } from "@/components/intro/look";
import { END, SLICE, STEPS, between, smooth, stepStart, track } from "@/components/intro/timeline";
import { DIR, RIGHT, STATIONS, UP, WORLD_BOX, World } from "@/components/intro/world";

type Frame = { c: THREE.Vector3; z: number };
type Rect = { x0: number; y0: number; x1: number; y1: number };

// the corners of the world, projected on the screen plane once
const CORNERS = (() => {
  const { min, max } = WORLD_BOX;
  const out: [number, number][] = [];
  for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) {
    const p = new THREE.Vector3(x, y, z);
    out.push([p.dot(RIGHT), p.dot(UP)]);
  }
  return out;
})();

/** Camera centre and zoom (px per unit) that fit the whole world into a screen rectangle. */
function fit(rect: Rect, w: number, h: number): Frame {
  const us = CORNERS.map((c) => c[0]);
  const vs = CORNERS.map((c) => c[1]);
  const [u0, u1, v0, v1] = [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)];
  const z = Math.min((rect.x1 - rect.x0) / (u1 - u0), (rect.y1 - rect.y0) / (v1 - v0));
  const fc = RIGHT.clone().multiplyScalar((u0 + u1) / 2).addScaledVector(UP, (v0 + v1) / 2);
  return { c: place(fc, z, (rect.x0 + rect.x1) / 2 - w / 2, (rect.y0 + rect.y1) / 2 - h / 2), z };
}

/** Camera centre that shows world point `f` at (ax, ay) px from the canvas centre (y down). */
function place(f: THREE.Vector3, z: number, ax: number, ay: number) {
  return f.clone().addScaledVector(RIGHT, -ax / z).addScaledVector(UP, ay / z);
}

const mix = (a: Frame, b: Frame, t: number): Frame => ({
  c: a.c.clone().lerp(b.c, t),
  z: Math.exp(THREE.MathUtils.lerp(Math.log(a.z), Math.log(b.z), t)),
});

/**
 * Drives the orthographic camera from the scroll progress: the whole pipeline beside the title,
 * then each station in turn (placed right of the steps on desktop, above the card on phones), then
 * the whole pipeline again with the trail complete. Damped so the moves stay soft.
 */
function Rig({ progress }: { progress: MotionValue<number> }) {
  const { camera, size } = useThree();
  const cur = useRef<Frame | null>(null);
  useFrame((_, dt) => {
    const { width: w, height: h } = size;
    const wide = w >= 1024;
    const hero = fit(wide ? { x0: w * 0.47, y0: h * 0.17, x1: w * 0.98, y1: h * 0.95 } : { x0: w * 0.03, y0: h * 0.6, x1: w * 0.97, y1: h * 0.97 }, w, h);
    const overview = fit(wide ? { x0: w * 0.36, y0: h * 0.14, x1: w * 0.97, y1: h * 0.92 } : { x0: w * 0.03, y0: h * 0.2, x1: w * 0.97, y1: h * 0.72 }, w, h);
    const base = fit({ x0: 0, y0: 0, x1: w, y1: h }, w, h).z;
    const [ax, ay] = wide ? [w * 0.13, h * 0.02] : [0, -h * 0.1];
    const station = (i: number, lift = 0): Frame => {
      const f = new THREE.Vector3(...STATIONS[i].focus);
      f.y += lift;
      // phones: the world is fitted to a narrow screen, so stations need a closer look
      const z = base * STATIONS[i].zoom * (wide ? 1 : 1.45);
      return { c: place(f, z, ax, ay), z };
    };

    const p = progress.get();
    // on the last station the camera rises a little with the rocket
    const lift = 14 * smooth(between(p, stepStart(STEPS - 1) + 0.3 * SLICE, END));
    const frame = (i: number): Frame => {
      if (i < 0) return hero;
      return station(i, i === STEPS - 1 ? lift : 0);
    };
    let target: Frame;
    if (p >= END) target = mix(station(STEPS - 1, lift), overview, smooth(between(p, END, 1)));
    else {
      const { from, to, t } = track(p);
      target = from === to ? frame(from) : mix(frame(from), frame(to), t);
    }

    if (!cur.current) cur.current = { c: target.c.clone(), z: target.z };
    const k = 1 - Math.exp(-dt * 5.5);
    cur.current.c.lerp(target.c, k);
    cur.current.z = Math.exp(THREE.MathUtils.lerp(Math.log(cur.current.z), Math.log(target.z), k));
    camera.position.copy(cur.current.c).addScaledVector(DIR, 400);
    camera.lookAt(cur.current.c);
    camera.zoom = cur.current.z;
    camera.updateProjectionMatrix();
  });
  return null;
}

/** The intro's 3D canvas (client only, loaded lazily by <Intro>). */
export function IntroScene({ progress, theme, active }: { progress: MotionValue<number>; theme: ThemeName; active: boolean }) {
  return (
    <Canvas
      orthographic
      flat
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [400, 400, 400], zoom: 6, near: 1, far: 2000 }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Rig progress={progress} />
      <World theme={theme} progress={progress} />
    </Canvas>
  );
}
