"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import { SHAPE, surfaces, type ThemeName } from "@/components/intro/look";
import { WorldContext, Panel, useWorld, type V3 } from "@/components/intro/kit";
import { Barrel, Bench, Bush, Car, Lamp, Person, Pine, Pond, SkyClouds, Tree, Walker } from "@/components/intro/props";
import { Blueprint, Chimney, Conveyor, Dock, LaunchSite, Offices, Road, Van, Workshop } from "@/components/intro/stations";
import { END, stepAt, track } from "@/components/intro/timeline";

export { DIR, RIGHT, UP } from "@/components/intro/kit";

/*
 * The world of the intro, in plan units like the hero SVG (x to the right-down of the screen, z to
 * the left-down, y up). Five stations along a cobalt trail: the client's offices (embed), a
 * blueprint (scope), the workshop (build), the loading dock and its van (ship), the launch site,
 * with their surroundings and the people around them.
 */

/** Camera focus and relative zoom of each station (same order as the steps). */
export const STATIONS: { focus: V3; zoom: number }[] = [
  { focus: [-8, 6.5, 44], zoom: 1.9 },
  { focus: [9.5, 0.5, 44], zoom: 2.6 },
  { focus: [36, 5, 40], zoom: 1.85 },
  { focus: [62, 3, 45], zoom: 2.0 },
  { focus: [98, 9, 49], zoom: 1.9 },
];

/** Corners of the world, for the overview framings. */
export const WORLD_BOX = { min: [-31, 0, 29] as V3, max: [116, 23, 60] as V3 };

// the cobalt trail: arrival, the client's door, across the blueprint, into the workshop, along the
// belt, down from the dock, along the road, onto the pad
const TRAIL: V3[] = [
  [-32, 0.15, 55], [-21, 0.15, 55], [-11, 0.15, 52.5], [-7, 0.15, 49.5], [-7, 0.15, 46.5],
  [-4.5, 0.15, 49.5], [1.5, 0.5, 44.5], [9.5, 0.55, 44], [16, 0.5, 44],
  [20, 0.15, 50.5], [28, 0.15, 50.5], [28, 0.15, 48.5],
  [30.5, 1.6, 44], [36, 3.6, 38.5], [41.5, 4.8, 37],
  [48, 4.8, 37], [54.5, 4.8, 37], [58.5, 4.8, 39],
  [61.5, 4.6, 43.4], [62.6, 1.4, 46.6], [66, 0.15, 49],
  [80, 0.15, 49], [90.5, 0.4, 49], [97.5, 1.95, 49],
];
const TRAIL_STOPS = [4, 7, 11, 17, 23];

// ---------------------------------------------------------------------------------------------- effects

function Floor() {
  const { s } = useWorld();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uFloor: { value: new THREE.Color(s.floor) },
          uGrid: { value: new THREE.Color(s.grid) },
          uCenter: { value: new THREE.Vector2(44, 46) },
        },
        vertexShader: /* glsl */ `varying vec3 vWorld; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uFloor; uniform vec3 uGrid; uniform vec2 uCenter; varying vec3 vWorld;
          float lineAt(float v) { float w = max(fwidth(v), 1e-4); float d = abs(fract(v - 0.5) - 0.5); return 1.0 - smoothstep(0.0, w * 1.1, d); }
          void main() {
            float g = max(lineAt(vWorld.x / 6.0), lineAt(vWorld.z / 6.0));
            vec2 d = (vWorld.xz - uCenter) / vec2(150.0, 95.0);
            float a = 1.0 - smoothstep(0.6, 1.0, length(d));
            gl_FragColor = vec4(mix(uFloor, uGrid, g), a);
            #include <colorspace_fragment>
          }`,
      }),
    [s.floor, s.grid]
  );
  return (
    <mesh material={material} rotation={[-Math.PI / 2, 0, 0]} position={[44, 0, 46]} renderOrder={-2}>
      <planeGeometry args={[340, 240]} />
    </mesh>
  );
}

/** The trail as a curve, and the arc-length position (0..1) of each station on it. */
function useTrail() {
  return useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(TRAIL.map((p) => new THREE.Vector3(...p)), false, "centripetal");
    const samples = 800;
    const pts = Array.from({ length: samples + 1 }, (_, i) => curve.getPointAt(i / samples));
    const stops = TRAIL_STOPS.map((k) => {
      const target = new THREE.Vector3(...TRAIL[k]);
      let best = 0;
      let dist = Infinity;
      pts.forEach((p, i) => {
        const d = p.distanceToSquared(target);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      return best / samples;
    });
    return { curve, stops };
  }, []);
}

const UV_VERT = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SPARKS = 16;

function Trail() {
  const { s, progress } = useWorld();
  const { curve, stops } = useTrail();
  const u = useRef(0);
  const head = useRef<THREE.Group>(null);
  const sparks = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const geos = useMemo(() => ({ core: new THREE.TubeGeometry(curve, 700, 0.3, 8, false), glow: new THREE.TubeGeometry(curve, 700, 0.95, 10, false) }), [curve]);
  const mats = useMemo(() => {
    const make = (color: string, alpha: number, headColor: string) =>
      new THREE.ShaderMaterial({
        transparent: alpha < 1,
        depthWrite: alpha >= 1,
        uniforms: { uProgress: { value: 0 }, uColor: { value: new THREE.Color(color) }, uHead: { value: new THREE.Color(headColor) }, uAlpha: { value: alpha } },
        vertexShader: UV_VERT,
        fragmentShader: /* glsl */ `
          uniform float uProgress; uniform vec3 uColor; uniform vec3 uHead; uniform float uAlpha; varying vec2 vUv;
          void main() {
            if (vUv.x > uProgress) discard;
            float h = smoothstep(uProgress - 0.025, uProgress, vUv.x);
            gl_FragColor = vec4(mix(uColor, uHead, h * 0.85), uAlpha * mix(1.0, 1.4, h));
            #include <colorspace_fragment>
          }`,
      });
    return { core: make(s.trail, 1, s.trailHead), glow: make(s.glow, 0.28, s.glow) };
  }, [s.trail, s.trailHead, s.glow]);
  useFrame(({ clock }, dt) => {
    const p = progress.get();
    const { from, to, t } = track(p);
    const at = (i: number) => (i < 0 ? 0 : stops[i]);
    let target = to < 0 ? 0 : at(from) + (at(to) - at(from)) * t;
    if (p >= END) target = 1;
    u.current += (target - u.current) * (1 - Math.exp(-dt * 7));
    mats.core.uniforms.uProgress.value = u.current;
    mats.glow.uniforms.uProgress.value = u.current;
    const time = clock.getElapsedTime();
    if (head.current) {
      head.current.visible = u.current > 0.002 && u.current < 0.999;
      head.current.position.copy(curve.getPointAt(Math.min(1, u.current)));
      head.current.scale.setScalar(1 + 0.2 * Math.sin(time * 4));
    }
    // little sparks run along the part of the trail already drawn, like data on its way
    if (sparks.current) {
      for (let k = 0; k < SPARKS; k++) {
        if (u.current < 0.01) tmp.scale.setScalar(0);
        else {
          const f = ((time * 0.06 + k / SPARKS) % 1) * u.current;
          tmp.position.copy(curve.getPointAt(Math.min(1, f)));
          tmp.position.y += 0.35;
          tmp.scale.setScalar(0.8 + 0.4 * Math.sin(time * 6 + k));
        }
        tmp.updateMatrix();
        sparks.current.setMatrixAt(k, tmp.matrix);
      }
      sparks.current.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group>
      <mesh geometry={geos.core} material={mats.core} />
      <mesh geometry={geos.glow} material={mats.glow} renderOrder={2} />
      <instancedMesh ref={sparks} args={[undefined, undefined, SPARKS]} renderOrder={3} frustumCulled={false}>
        <sphereGeometry args={[0.26, 10, 8]} />
        <meshBasicMaterial color={s.trailHead} />
      </instancedMesh>
      <group ref={head} visible={false}>
        <mesh>
          <sphereGeometry args={[0.55, 16, 12]} />
          <meshBasicMaterial color={s.trailHead} />
        </mesh>
        <mesh renderOrder={3}>
          <sphereGeometry args={[1.5, 20, 14]} />
          <meshBasicMaterial color={s.glow} transparent opacity={0.3} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Dotted halo on the floor under a station: lit while its step is on screen, dim once visited. */
function Halo({ at, radius, index }: { at: V3; radius: number; index: number }) {
  const { s, progress } = useWorld();
  const level = useRef(0);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color(s.halo) }, uLevel: { value: 0 }, uTime: { value: 0 }, uCells: { value: radius * 1.1 } },
        vertexShader: UV_VERT,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform float uLevel; uniform float uTime; uniform float uCells; varying vec2 vUv;
          void main() {
            vec2 p = vUv * 2.0 - 1.0;
            float r = length(p);
            vec2 cell = fract(vUv * uCells) - 0.5;
            float dotR = mix(0.36, 0.06, r);
            float a = 1.0 - smoothstep(dotR - 0.08, dotR, length(cell));
            a *= 1.0 - smoothstep(0.55, 1.0, r);
            a *= 0.55 + 0.45 * sin(uTime * 2.2 - r * 7.0);
            gl_FragColor = vec4(uColor, a * uLevel * 0.8);
            if (gl_FragColor.a < 0.01) discard;
            #include <colorspace_fragment>
          }`,
      }),
    [s.halo, radius]
  );
  useFrame(({ clock }, dt) => {
    const { index: active } = stepAt(progress.get());
    const target = active === index ? 1 : active > index ? 0.22 : 0;
    level.current += (target - level.current) * (1 - Math.exp(-dt * 4));
    material.uniforms.uLevel.value = level.current;
    material.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <mesh material={material} position={[at[0], at[1] + 0.03, at[2]]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[radius * 2, radius * 2]} />
    </mesh>
  );
}

// ------------------------------------------------------------------------------------------- surroundings

/** The client's car park, behind the offices. */
function CarPark() {
  const { s } = useWorld();
  return (
    <group>
      <Panel at={[-25.5, 0.011, 33.5]} w={11} h={7} face="y" color={s.road} />
      {[-27.9, -24.3, -20.7].map((x) => (
        <Panel key={x} at={[x, 0.02, 33.5]} w={0.18} h={5} face="y" color={s.roadLine} />
      ))}
      <Car at={[-29.6, 33.4]} color={SHAPE.sky} />
      <Car at={[-26.1, 33.6]} color={SHAPE.pink} />
      <Car at={[-22.5, 33.4]} color={SHAPE.lime} />
    </group>
  );
}

const TREES: [number, number, number, string][] = [
  [-15, 32.5, 1.0, SHAPE.green],
  [2, 34.5, 0.85, SHAPE.lime],
  [1, 54.5, 1.0, SHAPE.green],
  [-14, 58, 0.9, SHAPE.lime],
  [44.5, 27, 0.95, SHAPE.green],
  [36, 54, 1.0, SHAPE.green],
  [72, 39, 0.9, SHAPE.lime],
  [80, 58, 1.0, SHAPE.green],
  [106, 58.5, 0.85, SHAPE.lime],
  [116, 44, 0.9, SHAPE.green],
];
const PINES: [number, number, number][] = [
  [-27, 42, 1.0],
  [-30, 47, 0.8],
  [-19.5, 57, 0.9],
  [18.5, 36.5, 0.85],
  [22, 27.5, 0.9],
  [70.5, 28, 1.0],
  [108.5, 40, 1.0],
  [88, 60, 0.9],
  [49, 55, 0.8],
];

// ---------------------------------------------------------------------------------------------- world

export function World({ theme, progress }: { theme: ThemeName; progress: MotionValue<number> }) {
  const value = useMemo(() => ({ theme, s: surfaces(theme), progress }), [theme, progress]);
  return (
    <WorldContext.Provider value={value}>
      <Floor />
      <Halo at={[-7, 0, 48]} radius={13} index={0} />
      <Halo at={[9.5, 0.35, 44]} radius={11} index={1} />
      <Halo at={[33, 0, 40]} radius={17} index={2} />
      <Halo at={[60, 0, 42]} radius={15} index={3} />
      <Halo at={[98, 0, 49]} radius={13} index={4} />
      <Road />
      <Trail />

      <Offices />
      <Blueprint />
      <Chimney />
      <Workshop />
      <Conveyor />
      <Dock />
      <Van />
      <LaunchSite />

      <CarPark />
      <Pond at={[-24, 47.5]} />
      <Bench at={[-10.4, 52.6]} />
      <Bench at={[-2.6, 52.6]} />
      <Bush at={[-14, 48.8]} />
      <Bush at={[12, 52.5]} color={SHAPE.green} />
      <Bush at={[45.2, 50.8]} />
      <Bush at={[91, 56.5]} color={SHAPE.green} />
      <Barrel at={[43.4, 42.6]} color={SHAPE.red} />
      <Barrel at={[44.9, 43.8]} color={SHAPE.blue} />
      <Barrel at={[43.2, 45]} color={SHAPE.red} />
      {[56, 68, 80].map((x) => (
        <Lamp key={`b${x}`} at={[x, 45.2]} />
      ))}
      {[62, 74, 86].map((x) => (
        <Lamp key={`f${x}`} at={[x, 52.8]} />
      ))}
      {TREES.map(([x, z, k, c]) => (
        <Tree key={`t${x}-${z}`} at={[x, z]} s={k} color={c} />
      ))}
      {PINES.map(([x, z, k]) => (
        <Pine key={`p${x}-${z}`} at={[x, z]} s={k} />
      ))}
      <SkyClouds />

      {/* the client's team on the plaza, the crews at the workshop and on the dock, the engineers */}
      <Walker route={[[-10, 49], [-3, 49], [-3, 53.6], [-10, 53.6]]} color={SHAPE.pink} speed={1.2} />
      <Walker route={[[-6.5, 47.4], [-1.4, 51], [-6.5, 54.6], [-11.4, 51]]} color={SHAPE.sky} speed={0.9} phase={0.5} />
      <Walker route={[[-23, 39.5], [-18.5, 44.5], [-15.5, 49.6]]} loop={false} color={SHAPE.lime} speed={1.0} phase={0.2} />
      <Person at={[-10.4, 52.75]} color={SHAPE.yellow} y={0.2} />
      <Walker route={[[25.4, 50.8], [31.6, 50.8], [31.6, 52.6], [25.4, 52.6]]} color={SHAPE.blue} speed={1.0} phase={0.3} />
      <Walker route={[[46.6, 43.2], [46.6, 40.4], [49.4, 40.4]]} loop={false} color={SHAPE.red} speed={0.8} />
      <Walker route={[[57, 42.9], [66.4, 42.9]]} loop={false} color={SHAPE.yellow} speed={1.1} y={4.5} phase={0.6} />
      <Walker route={[[66.6, 33.4], [66.6, 41]]} loop={false} color={SHAPE.pink} speed={0.9} y={4.5} phase={0.1} />
      <Walker route={[[106.6, 55.4], [109.6, 53.4]]} loop={false} color={SHAPE.sky} speed={0.7} phase={0.4} />
      <Person at={[92.2, 57.4]} color={SHAPE.blue} />
      <Person at={[94, 58.2]} color={SHAPE.lime} />
    </WorldContext.Provider>
  );
}
