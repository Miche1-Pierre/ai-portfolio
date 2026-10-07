"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SHAPE } from "@/components/intro/look";
import { Ball, Box, Cloud, Cyl, Disc, Panel, Solid, makeRoute, useLook, useWorld, type V3 } from "@/components/intro/kit";

/*
 * The surroundings of the stations: trees that sway, bushes, street lamps, benches, parked cars,
 * barrels, a pond, a flag, clouds drifting high above, and people walking their little rounds.
 */

/** Slow sway of a crown in the wind (a few degrees, each tree on its own phase). */
function useSway(phase: number, amount = 0.035) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.9 + phase;
    ref.current.rotation.z = Math.sin(t) * amount;
    ref.current.rotation.x = Math.cos(t * 0.8) * amount * 0.7;
  });
  return ref;
}

/** A round tree: tapered trunk, a crown of two spheres, its shadow on the ground. */
export function Tree({ at, s = 1, color }: { at: [number, number]; s?: number; color: string }) {
  const { s: S } = useWorld();
  const sway = useSway(at[0] * 0.37 + at[1] * 0.11);
  return (
    <group>
      <Disc at={[at[0] + 0.7 * s, at[1] + 0.7 * s]} r={1.7 * s} color={S.shadow} y={0.015} />
      <Cyl at={[at[0], 0, at[1]]} r={0.32 * s} rTop={0.2 * s} h={2 * s} look={{ top: S.wallEdge }} segments={12} rim={false} />
      <group ref={sway} position={[at[0], 1.8 * s, at[1]]}>
        <Ball at={[0, 1.9 * s, 0]} r={2.0 * s} color={color} />
        <Ball at={[-0.9 * s, 3.1 * s, -0.5 * s]} r={1.25 * s} color={color} />
      </group>
    </group>
  );
}

/** A conifer: three stacked cones, two-tone like the walls. */
export function Pine({ at, s = 1 }: { at: [number, number]; s?: number }) {
  const { s: S } = useWorld();
  const sway = useSway(at[0] * 0.21 + at[1] * 0.29, 0.025);
  const cones = useMemo(() => [new THREE.ConeGeometry(2.0 * s, 2.8 * s, 9), new THREE.ConeGeometry(1.55 * s, 2.5 * s, 9), new THREE.ConeGeometry(1.05 * s, 2.2 * s, 9)], [s]);
  const look = { top: SHAPE.green, wall: SHAPE.green };
  return (
    <group>
      <Disc at={[at[0] + 0.6 * s, at[1] + 0.6 * s]} r={1.6 * s} color={S.shadow} y={0.015} />
      <Cyl at={[at[0], 0, at[1]]} r={0.28 * s} h={1.4 * s} look={{ top: S.wallEdge }} segments={10} rim={false} />
      <group ref={sway} position={[at[0], 1.2 * s, at[1]]}>
        <Solid geometry={cones[0]} look={look} rim={false} position={[0, 1.4 * s, 0]} />
        <Solid geometry={cones[1]} look={look} rim={false} position={[0, 3.0 * s, 0]} />
        <Solid geometry={cones[2]} look={look} rim={false} position={[0, 4.4 * s, 0]} />
      </group>
    </group>
  );
}

export function Bush({ at, color = SHAPE.lime }: { at: [number, number]; color?: string }) {
  return (
    <group position={[at[0], 0, at[1]]}>
      <Ball at={[0, 0.7, 0]} r={0.95} color={color} />
      <Ball at={[0.95, 0.5, 0.35]} r={0.7} color={color} />
      <Ball at={[-0.6, 0.45, 0.7]} r={0.6} color={color} />
    </group>
  );
}

// a soft, warm pool of light: bright under the lamp, fading out to nothing
const POOL = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: { uColor: { value: new THREE.Color(SHAPE.yellow) } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      float r = length(vUv * 2.0 - 1.0);
      float a = pow(1.0 - smoothstep(0.0, 1.0, r), 2.0) * 0.38;
      gl_FragColor = vec4(uColor * a, a);
      #include <colorspace_fragment>
    }`,
});

/** A street lamp: white by day, lit (with a pool of light on the ground) in the dark theme. */
export function Lamp({ at }: { at: [number, number] }) {
  const { s, theme } = useWorld();
  const lit = theme === "dark";
  return (
    <group>
      {lit ? (
        <mesh material={POOL} position={[at[0], 0.02, at[1]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
          <planeGeometry args={[6, 6]} />
        </mesh>
      ) : null}
      <Cyl at={[at[0], 0, at[1]]} r={0.13} h={4.2} look={{ top: s.metal, wall: s.metal }} segments={10} rim={false} />
      <Ball at={[at[0], 4.45, at[1]]} r={0.45} color={lit ? SHAPE.yellow : "#ffffff"} />
    </group>
  );
}

export function Bench({ at, alongX = true }: { at: [number, number]; alongX?: boolean }) {
  const { s } = useWorld();
  const [w, d] = alongX ? [2, 0.7] : [0.7, 2];
  const [x, z] = at;
  return (
    <group>
      <Box from={[x - w / 2, 0.45, z - d / 2]} to={[x + w / 2, 0.65, z + d / 2]} look={{ top: s.wood, wall: s.wood }} rim={false} />
      {alongX ? (
        <Box from={[x - w / 2, 0.65, z - d / 2]} to={[x + w / 2, 1.25, z - d / 2 + 0.14]} look={{ top: s.wood, wall: s.wood }} rim={false} />
      ) : (
        <Box from={[x - w / 2, 0.65, z - d / 2]} to={[x - w / 2 + 0.14, 1.25, z + d / 2]} look={{ top: s.wood, wall: s.wood }} rim={false} />
      )}
      <Box from={[x - 0.1, 0, z - 0.1]} to={[x + 0.1, 0.45, z + 0.1]} look={{ top: s.metal }} rim={false} />
    </group>
  );
}

/** A small car parked along z: coloured roof and bonnet, glass cabin, dark wheels. */
export function Car({ at, color }: { at: [number, number]; color: string }) {
  const { s } = useWorld();
  const wheel = useMemo(() => new THREE.CylinderGeometry(0.42, 0.42, 0.3, 16), []);
  const tyre = useLook({ top: s.tyre, wall: s.tyre });
  const [x, z] = at;
  return (
    <group>
      <Panel at={[x + 0.35, 0.016, z + 0.35]} w={2.2} h={4.2} face="y" color={s.shadow} />
      <Box from={[x - 1, 0.35, z - 2]} to={[x + 1, 1.25, z + 2]} look={{ top: color }} />
      <Box from={[x - 0.85, 1.25, z - 1.1]} to={[x + 0.85, 2.0, z + 0.9]} look={{ top: color, wall: s.glass }} />
      {[-1.3, 1.3].map((dz) => (
        <mesh key={dz} geometry={wheel} material={tyre} position={[x + 0.9, 0.42, z + dz]} rotation={[0, 0, Math.PI / 2]} />
      ))}
    </group>
  );
}

export function Barrel({ at, color }: { at: [number, number]; color: string }) {
  return <Cyl at={[at[0], 0, at[1]]} r={0.6} h={1.3} look={{ top: color, stripes: "ribs", ribs: 10 }} segments={20} />;
}

/** A pond: water, a white rim, two lily pads. */
export function Pond({ at }: { at: [number, number] }) {
  const { theme } = useWorld();
  const water = theme === "dark" ? "#1d3466" : SHAPE.sky;
  return (
    <group>
      <Disc at={at} r={3.2} color="#ffffff" y={0.012} stretch={1.45} />
      <Disc at={at} r={2.85} color={water} y={0.018} stretch={1.45} />
      <Disc at={[at[0] - 1.4, at[1] + 0.6]} r={0.5} color={SHAPE.green} y={0.024} />
      <Disc at={[at[0] + 1.6, at[1] - 0.8]} r={0.38} color={SHAPE.green} y={0.024} />
    </group>
  );
}

/** A flag waving on a pole (a few vertices displaced in the vertex shader). */
export function Flag({ at, color = SHAPE.blue }: { at: V3; color?: string }) {
  const { s } = useWorld();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } },
        vertexShader: /* glsl */ `
          uniform float uTime;
          void main() {
            vec3 p = position;
            float k = (p.x + 1.2) / 2.4;
            p.z += sin(p.x * 2.6 - uTime * 5.0) * 0.22 * k;
            p.y += sin(p.x * 1.7 - uTime * 3.0) * 0.06 * k;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          void main() {
            gl_FragColor = vec4(uColor, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [color]
  );
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <group position={at}>
      <Cyl at={[0, 0, 0]} r={0.08} h={4} look={{ top: s.metal, wall: s.metal }} segments={8} rim={false} />
      <mesh material={material} position={[1.25, 3.25, 0]}>
        <planeGeometry args={[2.4, 1.4, 16, 4]} />
      </mesh>
    </group>
  );
}

/** Clouds high above the world, drifting slowly across it. */
export function SkyClouds() {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const clouds: { x: number; y: number; z: number; s: number; speed: number }[] = [
    { x: -10, y: 30, z: 20, s: 2.6, speed: 0.9 },
    { x: 50, y: 34, z: 18, s: 2.2, speed: 0.7 },
    { x: 95, y: 31, z: 30, s: 2.8, speed: 0.8 },
  ];
  useFrame(({ clock }) => {
    refs.current.forEach((g, i) => {
      if (!g) return;
      const c = clouds[i];
      const span = 170;
      g.position.x = -40 + ((c.x + 40 + clock.getElapsedTime() * c.speed) % span);
    });
  });
  return (
    <group>
      {clouds.map((c, i) => (
        <group key={i} ref={(g) => { refs.current[i] = g; }} position={[c.x, c.y, c.z]}>
          <Cloud scale={c.s} />
        </group>
      ))}
    </group>
  );
}

/** Someone walking a little round (a loop, or there and back), bobbing at each step. */
export function Walker({ route, loop = true, speed = 1.1, phase = 0, color, y = 0 }: { route: [number, number][]; loop?: boolean; speed?: number; phase?: number; color: string; y?: number }) {
  const { s } = useWorld();
  const at = useMemo(() => makeRoute(route, loop), [route, loop]);
  const ref = useRef<THREE.Group>(null);
  const body = useMemo(() => new THREE.CapsuleGeometry(0.36, 0.7, 4, 12), []);
  const shirt = useLook({ top: color, mode: "ball" });
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const [x, z] = at(t * speed + phase * 7);
    ref.current.position.set(x, y + Math.abs(Math.sin(t * speed * 6 + phase * 3)) * 0.16, z);
    ref.current.rotation.z = Math.sin(t * speed * 6 + phase * 3) * 0.06;
  });
  return (
    <group ref={ref} position={[route[0][0], y, route[0][1]]} scale={1.3}>
      <mesh geometry={body} material={shirt} position={[0, 0.72, 0]} />
      <Ball at={[0, 1.78, 0]} r={0.33} color={s.pawn} />
    </group>
  );
}

/** Someone standing still (on a bench, watching the launch). */
export function Person({ at, color, y = 0 }: { at: [number, number]; color: string; y?: number }) {
  const { s } = useWorld();
  const body = useMemo(() => new THREE.CapsuleGeometry(0.36, 0.7, 4, 12), []);
  const shirt = useLook({ top: color, mode: "ball" });
  return (
    <group position={[at[0], y, at[1]]} scale={1.3}>
      <mesh geometry={body} material={shirt} position={[0, 0.72, 0]} />
      <Ball at={[0, 1.78, 0]} r={0.33} color={s.pawn} />
    </group>
  );
}
