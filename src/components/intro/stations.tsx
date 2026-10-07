"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SHAPE, shade } from "@/components/intro/look";
import { Box, Cloud, Cyl, Panel, Solid, useLook, useWorld, type V3 } from "@/components/intro/kit";
import { Flag } from "@/components/intro/props";
import { END, SLICE, STEPS, between, smooth, stepStart } from "@/components/intro/timeline";

/*
 * The five stations of the tour: the client's offices (embed), the blueprint the pencil draws
 * (scope), the workshop and its belt (build), the loading dock with its forklift and the van
 * (ship), the launch site (launch).
 */

const SCOPE = 1;
const SHIP = 3;
const LAUNCH = STEPS - 1;

// ---------------------------------------------------------------------------------------- 01 embed

export function Offices() {
  const { s } = useWorld();
  return (
    <group>
      {/* the plaza in front of the door */}
      <Panel at={[-6, 0.012, 50.2]} w={11} h={6.6} face="y" color={s.road} />
      <Box from={[-12, 0, 36]} to={[-2, 16, 46]} look={{ top: SHAPE.pink, stripes: "courses" }} />
      <Box from={[-10, 16, 38]} to={[-4, 19, 44]} look={{ top: SHAPE.pink, stripes: "courses" }} />
      <Box from={[-18, 0, 39]} to={[-12, 6, 47]} look={{ top: SHAPE.sky, stripes: "courses" }} />
      {/* rooftop units */}
      <Box from={[-11.6, 16, 36.6]} to={[-10.4, 16.9, 37.8]} look={{ top: s.metal }} />
      <Box from={[-3.4, 16, 44.4]} to={[-2.4, 16.8, 45.4]} look={{ top: s.metal }} />
      <Box from={[-16.8, 6, 40.2]} to={[-15.4, 6.9, 41.6]} look={{ top: s.metal }} />
      {/* window strips on both visible faces */}
      {[37.6, 40.5, 43.4].map((z) => (
        <Panel key={`x${z}`} at={[-1.96, 8.6, z + 0.8]} w={1.6} h={12.4} face="x" color={s.window} />
      ))}
      {[-10.6, -3.6].map((x) => (
        <Panel key={`z${x}`} at={[x + 0.7, 9.5, 46.04]} w={1.4} h={11} face="z" color={s.window} />
      ))}
      {[-16.4, -13.6].map((x) => (
        <Panel key={`a${x}`} at={[x, 3.4, 47.04]} w={1.6} h={2.2} face="z" color={s.window} />
      ))}
      {/* the door, its canopy, the client's sign and flag */}
      <Panel at={[-7, 1.3, 46.04]} w={2} h={2.6} face="z" color={SHAPE.sky} stripes="courses" spacing={0.6} line="#ffffff" />
      <Box from={[-8.6, 2.6, 46]} to={[-5.4, 3, 47.4]} look={{ top: SHAPE.blue }} />
      <Panel at={[-1.95, 13.6, 41]} w={2.4} h={2.4} face="x" color={SHAPE.blue} />
      <Flag at={[-4.6, 19, 43.4]} />
    </group>
  );
}

// ---------------------------------------------------------------------------------------- 02 scope

type Seg = [[number, number], [number, number]];

// what the pencil draws on the sheet: the workshop seen from above, its chimney, an arrow to it
const SKETCH: Seg[] = (() => {
  const segs: Seg[] = [
    [[5.4, 40.2], [11.6, 40.2]],
    [[11.6, 40.2], [11.6, 46.2]],
    [[11.6, 46.2], [5.4, 46.2]],
    [[5.4, 46.2], [5.4, 40.2]],
    [[5.4, 42.2], [11.6, 42.2]],
    [[11.6, 44.2], [5.4, 44.2]],
  ];
  const c: [number, number] = [4.4, 39.1];
  for (let k = 0; k < 14; k++) {
    const a0 = (k / 14) * Math.PI * 2;
    const a1 = ((k + 1) / 14) * Math.PI * 2;
    segs.push([[c[0] + 0.62 * Math.cos(a0), c[1] + 0.62 * Math.sin(a0)], [c[0] + 0.62 * Math.cos(a1), c[1] + 0.62 * Math.sin(a1)]]);
  }
  segs.push([[11.9, 43.2], [14.4, 43.2]], [[14.4, 43.2], [13.6, 42.5]], [[14.4, 43.2], [13.6, 43.9]]);
  return segs;
})();

/** The pencil, built from its tip (origin) up to the eraser along +Y. */
function Pencil({ tipRef }: { tipRef: RefObject<THREE.Group | null> }) {
  const { s } = useWorld();
  const parts = useMemo(
    () => ({
      lead: new THREE.CylinderGeometry(0.14, 0.01, 0.5, 6),
      wood: new THREE.CylinderGeometry(0.45, 0.14, 1.0, 6),
      body: new THREE.CylinderGeometry(0.45, 0.45, 6, 6),
      ferrule: new THREE.CylinderGeometry(0.46, 0.46, 0.5, 12),
      eraser: new THREE.CylinderGeometry(0.45, 0.45, 0.9, 12),
    }),
    []
  );
  // leaning back, away from the camera, so the tip and the drawing stay in view
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-0.45, 0.82, -0.35).normalize()), []);
  const pieces: [keyof typeof parts, number, string][] = [
    ["lead", 0.25, s.lead],
    ["wood", 1.0, s.wood],
    ["body", 4.5, SHAPE.yellow],
    ["ferrule", 7.75, s.metal],
    ["eraser", 8.45, SHAPE.pink],
  ];
  return (
    <group ref={tipRef} position={[5.4, 0.4, 40.2]}>
      <group quaternion={q}>
        {pieces.map(([k, y, color]) => (
          <Solid key={k} geometry={parts[k]} look={{ top: color, wall: color }} rim={false} position={[0, y, 0]} />
        ))}
      </group>
    </group>
  );
}

export function Blueprint() {
  const { progress } = useWorld();
  const tip = useRef<THREE.Group>(null);
  const { geometry, cumulative, total } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(SKETCH.length * 6), 3));
    g.setDrawRange(0, 0);
    const lengths = SKETCH.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
    const cum = [0];
    lengths.forEach((l) => cum.push(cum[cum.length - 1] + l));
    return { geometry: g, cumulative: cum, total: cum[cum.length - 1] };
  }, []);
  useFrame(({ clock }) => {
    // the sheet is drawn while the camera holds on the scope station
    const t = smooth(between(progress.get(), stepStart(SCOPE) + 0.02 * SLICE, stepStart(SCOPE) + 0.6 * SLICE));
    const d = t * total;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const y = 0.37;
    let shown = 0;
    let pen: [number, number] = SKETCH[0][0];
    for (let i = 0; i < SKETCH.length; i++) {
      const [a, b] = SKETCH[i];
      if (cumulative[i] >= d) break;
      const f = Math.min(1, (d - cumulative[i]) / (cumulative[i + 1] - cumulative[i]));
      const e: [number, number] = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      pos.setXYZ(i * 2, a[0], y, a[1]);
      pos.setXYZ(i * 2 + 1, e[0], y, e[1]);
      shown = i + 1;
      pen = e;
    }
    pos.needsUpdate = true;
    geometry.setDrawRange(0, shown * 2);
    if (tip.current) {
      const drawing = t > 0 && t < 1;
      const hover = drawing ? 0.05 * Math.sin(clock.getElapsedTime() * 30) : 0.5 + 0.15 * Math.sin(clock.getElapsedTime() * 1.6);
      tip.current.position.set(pen[0], 0.4 + Math.abs(hover), pen[1]);
    }
  });
  return (
    <group>
      <Box from={[3, 0, 38]} to={[16, 0.35, 50]} look={{ top: SHAPE.sky, stripes: "grid", spacing: 1.3 }} />
      {/* updated every frame: its bounds were computed empty, so never cull it */}
      <lineSegments geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial color="#ffffff" />
      </lineSegments>
      <Pencil tipRef={tip} />
    </group>
  );
}

// ---------------------------------------------------------------------------------------- 03 build

function useGear(rOut: number, rIn: number, teeth: number) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const pitch = (Math.PI * 2) / teeth;
    for (let k = 0; k < teeth; k++) {
      for (const [off, r] of [[-0.27, rIn], [-0.13, rOut], [0.13, rOut], [0.27, rIn]] as const) {
        const a = k * pitch + off * pitch;
        if (k === 0 && off === -0.27) shape.moveTo(r * Math.cos(a), r * Math.sin(a));
        else shape.lineTo(r * Math.cos(a), r * Math.sin(a));
      }
    }
    shape.closePath();
    const hole = new THREE.Path();
    hole.absarc(0, 0, rIn * 0.36, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: false });
  }, [rOut, rIn, teeth]);
}

function Gear({ at, rOut, rIn, teeth, color, speed }: { at: V3; rOut: number; rIn: number; teeth: number; color: string; speed: number }) {
  const geometry = useGear(rOut, rIn, teeth);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * speed;
  });
  return (
    <group position={at} rotation={[0, Math.PI / 2, 0]}>
      <group ref={ref}>
        <Solid geometry={geometry} look={{ top: color, wall: color }} rim={false} />
      </group>
    </group>
  );
}

export function Workshop() {
  const { s } = useWorld();
  const [x0, x1, z0, z1, h, hr] = [24, 42, 30, 48, 9, 3.6];
  const roof = useMemo(() => {
    const teeth = 3;
    const w = (z1 - z0) / teeth;
    const slopes: number[] = [];
    const glass: number[] = [];
    const caps: number[] = [];
    for (let k = 0; k < teeth; k++) {
      const za = z0 + k * w;
      const zb = za + w;
      slopes.push(x0, h, za, x1, h, za, x1, h + hr, zb, x0, h, za, x1, h + hr, zb, x0, h + hr, zb);
      glass.push(x0, h, zb, x1, h, zb, x1, h + hr, zb, x0, h, zb, x1, h + hr, zb, x0, h + hr, zb);
      caps.push(x1, h, za, x1, h + hr, zb, x1, h, zb);
    }
    const geo = (a: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(a, 3));
      g.computeVertexNormals();
      return g;
    };
    return { slopes: geo(slopes), glass: geo(glass), caps: geo(caps) };
  }, [x0, x1, z0, z1, h, hr]);
  return (
    <group>
      <Box from={[x0, 0, z0]} to={[x1, h, z1]} look={{ top: SHAPE.blue, stripes: "courses" }} />
      <Solid geometry={roof.slopes} look={{ top: SHAPE.blue, side: THREE.DoubleSide }} />
      <Solid geometry={roof.glass} look={{ top: s.window, mode: "flat", stripes: "xlines", spacing: 2.25, line: s.mullion, side: THREE.DoubleSide }} rim={false} />
      <Solid geometry={roof.caps} look={{ top: SHAPE.blue, side: THREE.DoubleSide }} />
      <Panel at={[28, 2.6, z1 + 0.04]} w={4} h={5.2} face="z" color={SHAPE.sky} stripes="courses" spacing={1} line="#ffffff" />
      {[33.6, 38.2].map((x) => (
        <Panel key={x} at={[x, 4.8, z1 + 0.04]} w={3} h={3.2} face="z" color={s.window} stripes="xlines" spacing={1.5} line={s.mullion} />
      ))}
      <Panel at={[x1 + 0.04, 4.65, 37]} w={4} h={4.5} face="x" color={s.opening} />
      <Gear at={[x1 + 0.06, 5.0, 32.6]} rOut={2.25} rIn={1.75} teeth={9} color={SHAPE.yellow} speed={0.7} />
      <Gear at={[x1 + 0.06, 7.35, 34.9]} rOut={1.35} rIn={1.02} teeth={7} color={SHAPE.red} speed={-0.9} />
    </group>
  );
}

export function Chimney() {
  const at: V3 = [21.6, 0, 33.2];
  const puffs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t0 = clock.getElapsedTime() * 0.18;
    puffs.current.forEach((g, k) => {
      if (!g) return;
      const t = (t0 + k / 3) % 1;
      g.position.set(at[0] - 0.4 - t * 5, 17.6 + t * 7, at[2] + 0.6 + t * 3);
      g.scale.setScalar(0.4 + Math.sin(Math.PI * t) * 1.2);
    });
  });
  return (
    <group>
      <Cyl at={at} r={1.5} h={15} look={{ top: SHAPE.red, stripes: "ribs", ribs: 14 }} />
      <Cyl at={[at[0], 15, at[2]]} r={1.5} h={2} look={{ top: SHAPE.red, wall: SHAPE.red }} />
      {[0, 1, 2].map((k) => (
        <group key={k} ref={(g) => { puffs.current[k] = g; }} position={[at[0], 17.6, at[2]]} scale={0.4}>
          <Cloud />
        </group>
      ))}
    </group>
  );
}

export function Crate({ at, s = 2.8, h }: { at: V3; s?: number; h?: number }) {
  const height = h ?? s * 0.82;
  const tape = shade(SHAPE.yellow, 0.82);
  return (
    <group>
      <Box from={at} to={[at[0] + s, at[1] + height, at[2] + s]} look={{ top: SHAPE.yellow }} />
      <Panel at={[at[0] + s / 2, at[1] + height + 0.01, at[2] + s / 2]} w={s} h={0.56} face="y" color={tape} />
      <Panel at={[at[0] + s + 0.01, at[1] + height * 0.72, at[2] + s / 2]} w={0.56} h={height * 0.56} face="x" color={tape} />
    </group>
  );
}

export function Conveyor() {
  const { s } = useWorld();
  const crates = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t0 = clock.getElapsedTime() * 0.09;
    crates.current.forEach((g, k) => {
      if (!g) return;
      const t = (t0 + k / 3) % 1;
      g.position.x = 41 + t * 15;
      g.visible = t < 0.97;
    });
  });
  return (
    <group>
      {[44.2, 48, 51.8].flatMap((x) => [35.3, 38].map((z) => <Box key={`${x}-${z}`} from={[x, 0, z]} to={[x + 0.7, 3.5, z + 0.7]} look={{ top: s.metal }} rim={false} />))}
      <Box from={[42, 3.5, 35]} to={[54, 4.5, 39]} look={{ top: s.belt, stripes: "xlines", spacing: 0.9, line: s.beltLine }} />
      {[0, 1, 2].map((k) => (
        <group key={k} ref={(g) => { crates.current[k] = g; }} position={[41 + k * 5, 0, 0]}>
          <Crate at={[0, 4.5, 35.6]} />
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------------------- 04 ship

/** A forklift shuttling a crate across the dock, forwards then in reverse. */
function Forklift() {
  const { s } = useWorld();
  const ref = useRef<THREE.Group>(null);
  const wheel = useMemo(() => new THREE.CylinderGeometry(0.38, 0.38, 0.3, 14), []);
  const tyre = useLook({ top: s.tyre, wall: s.tyre });
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.16;
    const k = 1 - Math.abs(((t % 2) + 2) % 2 - 1); // 0 -> 1 -> 0
    ref.current.position.x = 56.4 + smooth(k) * 7.5;
  });
  return (
    <group ref={ref} position={[56.4, 4.5, 41]}>
      <Box from={[-1.0, 0.35, -0.8]} to={[0.9, 1.35, 0.8]} look={{ top: SHAPE.yellow }} />
      <Box from={[-0.95, 1.35, -0.7]} to={[-0.15, 2.35, 0.7]} look={{ top: s.metal, wall: s.metal }} rim={false} />
      <Box from={[0.95, 0.2, -0.62]} to={[1.1, 3.0, -0.47]} look={{ top: s.metal }} rim={false} />
      <Box from={[0.95, 0.2, 0.47]} to={[1.1, 3.0, 0.62]} look={{ top: s.metal }} rim={false} />
      <Box from={[1.1, 0.4, -0.55]} to={[2.5, 0.55, -0.35]} look={{ top: s.metal }} rim={false} />
      <Box from={[1.1, 0.4, 0.35]} to={[2.5, 0.55, 0.55]} look={{ top: s.metal }} rim={false} />
      <Crate at={[1.15, 0.55, -0.9]} s={1.8} />
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} geometry={wheel} material={tyre} position={[x, 0.38, 0.82]} rotation={[Math.PI / 2, 0, 0]} />
      ))}
    </group>
  );
}

export function Dock() {
  const stack: { at: V3; s: number }[] = [
    { at: [55.2, 4.5, 31.2], s: 3 },
    { at: [58.6, 4.5, 31.2], s: 3 },
    { at: [62.2, 4.5, 31.4], s: 2.6 },
    { at: [55.2, 4.5, 34.6], s: 3 },
    { at: [55.4, 4.5 + 3 * 0.82, 31.4], s: 2.7 },
    { at: [65.4, 4.5, 31.4], s: 2.4 },
  ];
  return (
    <group>
      <Box from={[54, 0, 30]} to={[68, 4.5, 44]} look={{ top: SHAPE.green, stripes: "courses" }} />
      {stack.map((c, i) => (
        <Crate key={i} at={c.at} s={c.s} />
      ))}
      <Forklift />
    </group>
  );
}

export function Road() {
  const { s } = useWorld();
  const dashes = useMemo(() => Array.from({ length: 17 }, (_, k) => 48 + k * 3.4), []);
  return (
    <group>
      <Panel at={[76, 0.01, 49]} w={60} h={6} face="y" color={s.road} />
      {dashes.map((x) => (
        <Panel key={x} at={[x, 0.02, 49]} w={1.7} h={0.24} face="y" color={s.roadLine} />
      ))}
    </group>
  );
}

/** The delivery van: leaves the dock along the road while the ship step is on screen. */
export function Van() {
  const { s, progress } = useWorld();
  const ref = useRef<THREE.Group>(null);
  const spin = useRef<(THREE.Object3D | null)[]>([]);
  const wheel = useMemo(() => new THREE.CylinderGeometry(1.15, 1.15, 0.5, 24), []);
  const tyre = useLook({ top: s.tyre, wall: s.tyre });
  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const a = stepStart(SHIP) + 0.1 * SLICE;
    const target = 22 * smooth(between(progress.get(), a, a + 0.5 * SLICE));
    const before = ref.current.position.x;
    ref.current.position.x += (target - before) * (1 - Math.exp(-dt * 6));
    const moved = ref.current.position.x - before;
    // wheels turn with the distance driven; the body bounces a little while moving
    spin.current.forEach((w) => {
      if (w) w.rotation.z -= moved / 1.15;
    });
    ref.current.position.y = Math.abs(moved) > 0.002 ? Math.abs(Math.sin(clock.getElapsedTime() * 18)) * 0.06 : 0;
  });
  const [x0, z0, z1, zb] = [48, 46.7, 51.3, 1.1];
  return (
    <group ref={ref}>
      <Panel at={[x0 + 5.75, 0.016, 49]} w={11.5} h={4.6} face="y" color={s.shadow} />
      <Box from={[x0, zb, z0]} to={[x0 + 8, zb + 5.6, z1]} look={{ top: SHAPE.lime }} />
      <Box from={[x0 + 8, zb, z0]} to={[x0 + 11.5, zb + 4, z1]} look={{ top: SHAPE.lime }} />
      <Panel at={[x0 + 4, zb + 2.3, z1 + 0.03]} w={7} h={0.8} face="z" color={SHAPE.blue} />
      <Panel at={[x0 + 9.65, zb + 2.75, z1 + 0.03]} w={2.5} h={1.7} face="z" color={s.glass} />
      <Panel at={[x0 + 11.53, zb + 2.75, 49]} w={3.6} h={1.7} face="x" color={s.glass} />
      <Panel at={[x0 + 11.54, zb + 0.9, z1 - 0.9]} w={0.7} h={0.5} face="x" color={SHAPE.yellow} />
      {[x0 + 2.6, x0 + 9.4].map((x, i) => (
        <group key={x}>
          <mesh geometry={wheel} material={tyre} position={[x, 1.15, z1 - 0.2]} rotation={[Math.PI / 2, 0, 0]} />
          <group position={[x, 1.15, z1 + 0.06]} ref={(g) => { spin.current[i] = g; }}>
            <Panel at={[0, 0, 0]} w={0.9} h={0.9} face="z" color={s.hub} />
          </group>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------------------- 05 launch

const PAD: V3 = [97.5, 1.8, 49];
const R = 2.9;

/** Tangent ogive: the rocket's nose, as a lathe profile. */
function useNose(radius: number, height: number) {
  return useMemo(() => {
    const rho = (radius * radius + height * height) / (2 * radius);
    const pts = Array.from({ length: 17 }, (_, i) => {
      const y = (i / 16) * height;
      const r = Math.max(0.001, Math.sqrt(Math.max(0, rho * rho - y * y)) + radius - rho);
      return new THREE.Vector2(r, y);
    });
    return new THREE.LatheGeometry(pts, 40);
  }, [radius, height]);
}

function useFin() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(R - 0.1, 7.2);
    shape.quadraticCurveTo(R + 1.2, 4.4, R + 3.0, 1.6);
    shape.lineTo(R + 3.0, 0);
    shape.lineTo(R + 1.4, 0);
    shape.lineTo(R - 0.1, 1.4);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.32, bevelEnabled: false });
    g.translate(0, 0, -0.16);
    return g;
  }, []);
}

function Porthole({ y, r, angle = Math.PI / 4 }: { y: number; r: number; angle?: number }) {
  const { s } = useWorld();
  const ring = useLook({ top: SHAPE.blue, mode: "flat" });
  const glass = useLook({ top: s.glass, mode: "flat" });
  const geos = useMemo(() => ({ ring: new THREE.CircleGeometry(r, 32), glass: new THREE.CircleGeometry(r * 0.68, 32) }), [r]);
  return (
    <group position={[(R + 0.04) * Math.cos(angle), y, (R + 0.04) * Math.sin(angle)]} rotation={[0, Math.PI / 2 - angle, 0]}>
      <mesh geometry={geos.ring} material={ring} />
      <mesh geometry={geos.glass} material={glass} position={[0, 0, 0.02]} />
    </group>
  );
}

/** The launch tower beside the pad: a lattice, two service arms that swing away before lift-off. */
function Tower({ progress }: { progress: { get: () => number } }) {
  const { s } = useWorld();
  const arms = useRef<(THREE.Group | null)[]>([]);
  const at: [number, number] = [104.2, 44];
  const h = 20;
  const look = { top: s.metal, wall: s.metal };
  useFrame(() => {
    const loc = between(progress.get(), stepStart(LAUNCH), END);
    const a = smooth(between(loc, 0.1, 0.2)) * 1.25;
    arms.current.forEach((g) => {
      if (g) g.rotation.y = -a;
    });
  });
  const levels = [3.2, 6.4, 9.6, 12.8, 16, 19.2];
  const [x, z] = at;
  return (
    <group>
      {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([dx, dz]) => (
        <Box key={`${dx}${dz}`} from={[x + dx - 0.16, 0, z + dz - 0.16]} to={[x + dx + 0.16, h, z + dz + 0.16]} look={look} rim={false} />
      ))}
      {levels.map((y) => (
        <group key={y}>
          <Box from={[x - 1.2, y, z + 1.04]} to={[x + 1.2, y + 0.28, z + 1.36]} look={look} rim={false} />
          <Box from={[x + 1.04, y, z - 1.2]} to={[x + 1.36, y + 0.28, z + 1.2]} look={look} rim={false} />
        </group>
      ))}
      <Box from={[x - 1.5, h, z - 1.5]} to={[x + 1.5, h + 0.4, z + 1.5]} look={{ top: SHAPE.red }} />
      {[7.5, 13].map((y, i) => (
        <group key={y} position={[x - 1.2, y, z + 1.2]} ref={(g) => { arms.current[i] = g; }}>
          {/* towards the rocket's side, from the tower's front corner */}
          <group rotation={[0, Math.atan2(-(PAD[2] - (z + 1.2)), PAD[0] - (x - 1.2)), 0]}>
            <Box from={[0, -0.18, -0.25]} to={[3.4, 0.18, 0.25]} look={look} rim={false} />
          </group>
        </group>
      ))}
    </group>
  );
}

/** The countdown: three lights on the pad turn from red to green, then lift-off. */
function Countdown({ progress }: { progress: { get: () => number } }) {
  const red = useLook({ top: SHAPE.red, mode: "flat" });
  const green = useLook({ top: SHAPE.green, mode: "flat" });
  const lights = useRef<(THREE.Mesh | null)[]>([]);
  const geo = useMemo(() => new THREE.CylinderGeometry(0.42, 0.42, 0.3, 20), []);
  useFrame(() => {
    const loc = between(progress.get(), stepStart(LAUNCH), END);
    lights.current.forEach((m, k) => {
      if (m) m.material = loc > 0.05 + 0.05 * k ? green : red;
    });
  });
  const spots: V3[] = [
    [92.6, 1.95, 51.6],
    [93.6, 1.95, 53.2],
    [95.1, 1.95, 54.4],
  ];
  return (
    <group>
      {spots.map((p, k) => (
        <mesh key={k} ref={(m) => { lights.current[k] = m; }} geometry={geo} material={red} position={p} />
      ))}
    </group>
  );
}

/** Mission control: a small dome with a radar dish turning on its roof. */
function MissionControl() {
  const { s } = useWorld();
  const dish = useRef<THREE.Group>(null);
  const dome = useMemo(() => new THREE.SphereGeometry(3.4, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2), []);
  const bowl = useMemo(() => new THREE.SphereGeometry(1.4, 24, 10, 0, Math.PI * 2, 0, Math.PI / 3), []);
  useFrame((_, dt) => {
    if (dish.current) dish.current.rotation.y += dt * 0.6;
  });
  const at: V3 = [111.5, 0, 51];
  return (
    <group>
      <Solid geometry={dome} look={{ top: SHAPE.sky, stripes: "courses", spacing: 1.2 }} position={at} />
      <group position={[at[0], 0, at[2]]} rotation={[0, Math.PI / 4, 0]}>
        <Panel at={[0, 1.1, 3.25]} w={1.3} h={2.2} face="z" color={SHAPE.blue} />
      </group>
      <Cyl at={[at[0] - 1.2, 2.6, at[2] - 1.2]} r={0.15} h={1.6} look={{ top: s.metal, wall: s.metal }} segments={8} rim={false} />
      <group ref={dish} position={[at[0] - 1.2, 4.3, at[2] - 1.2]}>
        <group rotation={[-0.9, 0, 0]}>
          <Solid geometry={bowl} look={{ top: "#ffffff", side: THREE.DoubleSide }} rim={false} rotation={[Math.PI, 0, 0]} />
        </group>
      </group>
    </group>
  );
}

export function LaunchSite() {
  const { s, progress } = useWorld();
  const rocket = useRef<THREE.Group>(null);
  const flames = useRef<THREE.Group>(null);
  const contrail = useRef<THREE.Mesh>(null);
  const burst = useRef<(THREE.Group | null)[]>([]);
  const lift = useRef(0);
  const fin = useFin();
  const nose = useNose(R, 7);
  const bell = useMemo(() => new THREE.CylinderGeometry(1.0, 1.6, 1.3, 28, 1, true), []);
  const flameGeos = useMemo(() => ({ outer: new THREE.ConeGeometry(1.5, 5.5, 24), inner: new THREE.ConeGeometry(0.8, 3.2, 20) }), []);
  const flameOuter = useLook({ top: SHAPE.yellow, mode: "flat" });
  const flameInner = useLook({ top: "#fff6d6", mode: "flat" });
  const burstSpots = useMemo(
    () => Array.from({ length: 5 }, (_, k) => {
      const a = (k / 5) * Math.PI * 2 + 0.4;
      return [PAD[0] + Math.cos(a) * 5.6, 2.4, PAD[2] + Math.sin(a) * 5.6] as V3;
    }),
    []
  );
  useFrame(({ clock }, dt) => {
    const p = progress.get();
    const loc = between(p, stepStart(LAUNCH), END);
    const t = between(p, stepStart(LAUNCH) + 0.25 * SLICE, 1);
    const target = 130 * Math.pow(t, 2.2);
    lift.current += (target - lift.current) * (1 - Math.exp(-dt * 5));
    const time = clock.getElapsedTime();
    // engines on: the rocket shakes on the pad for a moment, then climbs
    const shake = loc > 0.16 && lift.current < 2 ? 0.09 * smooth(between(loc, 0.16, 0.24)) : 0;
    if (rocket.current) rocket.current.position.set(PAD[0] + Math.sin(time * 41) * shake, PAD[1] + lift.current, PAD[2] + Math.cos(time * 37) * shake);
    if (flames.current) {
      flames.current.visible = loc > 0.17;
      flames.current.scale.set(1 + 0.08 * Math.sin(time * 23), 0.9 + 0.25 * Math.abs(Math.sin(time * 31)), 1 + 0.08 * Math.cos(time * 19));
    }
    if (contrail.current) {
      contrail.current.visible = lift.current > 0.5;
      contrail.current.scale.y = Math.max(0.01, lift.current);
      contrail.current.position.y = PAD[1] + lift.current / 2;
    }
    const grow = smooth(between(loc, 0.18, 0.5));
    burst.current.forEach((g, k) => {
      if (!g) return;
      g.scale.setScalar(0.35 + grow * (1.5 + 0.25 * Math.sin(k * 2.1)) + 0.05 * Math.sin(time * 1.3 + k));
      const out = 1 + grow * 0.45;
      g.position.set(PAD[0] + (burstSpots[k][0] - PAD[0]) * out, burstSpots[k][1] + grow * 0.6, PAD[2] + (burstSpots[k][2] - PAD[2]) * out);
    });
  });
  return (
    <group>
      <Cyl at={[PAD[0], 0, PAD[2]]} r={6.5} h={1.8} look={{ top: SHAPE.yellow, stripes: "ribs", ribs: 36 }} />
      <mesh position={[PAD[0], 1.83, PAD[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.05, 5.35, 64]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <Countdown progress={progress} />
      <Tower progress={progress} />
      <MissionControl />
      <group ref={rocket} position={PAD}>
        {[0, 120, 240].map((deg) => (
          <Solid key={deg} geometry={fin} look={{ top: SHAPE.red, wall: SHAPE.red }} rim={false} rotation={[0, -THREE.MathUtils.degToRad(deg), 0]} />
        ))}
        <Solid geometry={bell} look={{ top: s.metal, wall: s.metal, side: THREE.DoubleSide }} rim={false} position={[0, 0.7, 0]} />
        <Cyl at={[0, 1.2, 0]} r={R} h={13.4} look={{ top: SHAPE.red, stripes: "ribs", ribs: 16 }} rim={false} />
        <Cyl at={[0, 2.2, 0]} r={R + 0.03} h={0.6} look={{ top: SHAPE.red, wall: SHAPE.red }} rim={false} />
        <Cyl at={[0, 11.4, 0]} r={R + 0.03} h={1.2} look={{ top: SHAPE.blue, wall: SHAPE.blue }} rim={false} />
        <Porthole y={8.4} r={1.3} />
        <Porthole y={5.4} r={0.75} />
        <Solid geometry={nose} look={{ top: SHAPE.red, wall: SHAPE.red }} rim={false} position={[0, 14.6, 0]} />
        <group ref={flames} position={[0, -0.2, 0]} visible={false}>
          <mesh geometry={flameGeos.outer} material={flameOuter} position={[0, -2.6, 0]} rotation={[Math.PI, 0, 0]} />
          <mesh geometry={flameGeos.inner} material={flameInner} position={[0, -1.5, 0]} rotation={[Math.PI, 0, 0]} />
        </group>
      </group>
      <mesh ref={contrail} position={PAD} visible={false} renderOrder={2}>
        <cylinderGeometry args={[0.9, 1.7, 1, 24, 1, true]} />
        <meshBasicMaterial color={s.glow} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {burstSpots.map((p, k) => (
        <group key={k} ref={(g) => { burst.current[k] = g; }} position={p} scale={0.35}>
          <Cloud />
        </group>
      ))}
    </group>
  );
}
