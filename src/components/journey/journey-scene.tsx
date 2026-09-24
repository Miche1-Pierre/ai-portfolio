"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import * as THREE from "three";

import { worldPalette } from "@/content/world-palette";
import journeyPath from "@/data/journey-path.json";
import { JOURNEY_START_S } from "@/components/journey/stations";
import { lookState, mulberry, roverState, smoothstep, toThree, UP } from "@/components/journey/journey-state";
import { Clouds, Effects, Meadow, SNOW_MATERIAL, SunSprite, TunnelLights, WATER, addSnowSparkle, getWaterMaterial, updateWater } from "@/components/journey/journey-nature";

const DRACO = "/draco/";
const MODELS = {
  port: "/models/z0-port.glb",
  track: "/models/z1-piste.glb",
  sable: "/models/z1-sable.glb",
  foret: "/models/z2-foret.glb",
  atelier: "/models/z2-atelier.glb",
  col: "/models/z3-col.glb",
  observatoire: "/models/z4-observatoire.glb",
  rover: "/models/avatar-rover.glb",
} as const;
const WORLD_MODELS = [MODELS.port, MODELS.track, MODELS.sable, MODELS.foret, MODELS.atelier, MODELS.col, MODELS.observatoire] as const;

const WHEEL_RADIUS = 0.4;
const ROVER_LIFT = 0.1;
const START_S = JOURNEY_START_S;


/** Données exportées avec la spline par Blender (z1_track.py) : caméra d'intro, ligne de neige. */
type Intro = { camera: readonly (readonly number[])[]; handover_s: number };
type Snow = { from: number; z: number; to: number };
const EXTRAS = journeyPath as unknown as {
  intro?: Intro;
  snow?: Snow;
  camera_side?: readonly number[];
  tunnels?: readonly (readonly number[])[];
};
const INTRO = EXTRAS.intro;
const SNOW: Snow = EXTRAS.snow ?? { from: 46, z: 52, to: 58 };
/** Côté de la caméra de poursuite le long de la route, exporté par Blender : +1 à droite de la
 *  marche, -1 à gauche, toujours vers l'aval (sinon elle entre dans le talus amont). */
const CAMERA_SIDE = EXTRAS.camera_side ?? [];
/** Abscisses (m) des tunnels : entre l'entrée et 12 m après la sortie, la caméra suit le rover sans
 *  test d'obstacle (la face du terrain qui ferme le portail la bloquerait contre le rover). */
const TUNNELS = EXTRAS.tunnels ?? [];
const inTunnel = (s: number) => TUNNELS.some(([a, b]) => s > a - 6 && s < b + 22);
/** 0 dehors, 1 sous la voûte (la caméra suit 8,5 m derrière : elle y est de l'entrée + 5 m à la
 *  sortie + 12 m) : elle se rapproche et se recentre pour rester sous la voûte (rayon 4,4 m). */
function tunnelFactor(s: number): number {
  let f = 0;
  for (const [a, b] of TUNNELS) f = Math.max(f, smoothstep(s, a - 4, a + 4) * (1 - smoothstep(s, b + 12, b + 20)));
  return f;
}
function cameraSideAt(t: number): number {
  if (!CAMERA_SIDE.length) return 1;
  const f = THREE.MathUtils.clamp(t, 0, 1) * (CAMERA_SIDE.length - 1);
  const i = Math.floor(f);
  const a = CAMERA_SIDE[i];
  const b = CAMERA_SIDE[Math.min(i + 1, CAMERA_SIDE.length - 1)];
  return THREE.MathUtils.lerp(a, b, f - i);
}
/** La lampe du hangar (Blender : Z0_Lights_HangarLamp, jamais exportée) : le garage n'est pas noir. */
const LAMP_POS = toThree([-0.4, 0.0, 2.45]);


function useCurve() {
  return useMemo(() => {
    const points = journeyPath.points.map(toThree);
    const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
    curve.arcLengthDivisions = 1200;
    const length = curve.getLength();
    /** Progression de scroll (0..1) -> paramètre de spline, en partant à START_S. */
    const toT = (progress: number) => {
      const t0 = START_S / length;
      return THREE.MathUtils.clamp(t0 + progress * (1 - t0), 0, 1);
    };
    return { curve, length, toT };
  }, []);
}

/** Pose un objet dont l'avant est +X et le haut +Y sur un point de la spline. */
function placeAlong(obj: THREE.Object3D, point: THREE.Vector3, tangent: THREE.Vector3) {
  const forward = tangent.clone().normalize();
  const right = new THREE.Vector3().crossVectors(forward, UP).normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();
  const m = new THREE.Matrix4().makeBasis(forward, up, right);
  obj.quaternion.setFromRotationMatrix(m);
  obj.position.copy(point);
}

type Driven = { progress: MotionValue<number>; damping: number };

function useSmoothProgress(progress: MotionValue<number>, damping: number) {
  const value = useRef(progress.get());
  return (dt: number) => {
    const target = progress.get();
    value.current += (target - value.current) * Math.min(1, dt * damping);
    return THREE.MathUtils.clamp(value.current, 0, 1);
  };
}

/** Maillages contre lesquels la caméra ne doit pas passer (terrain, falaises, quai, bâtiments). */
const colliders: THREE.Object3D[] = [];
const COLLIDER =
  /_(Mountain_(?!Sea$|Lake$|River$)\w+|Cliff_\d+|Quay|Kerb_\d+|Scree\w*|Gable_[FB]|Wall_[LR]|Roof|LeanTo_Roof|(Cabin|Workshop|Gare|House_\d|Auberge|Windmill|Observatory|Crane)_(plaster|wood|stone|white|steel|rust|roof|slate)|Checkpoint_(plaster|stone)|Conifers\w+_(Needles|Trunks)|Wreck\w*|Reef_\d|Tunnel_\d+|Tunnel_Portal_\d+_\d|Bridge_Deck_\d+|Lighthouse_Tower)$/;

/** Le verre sort de Blender en transmission (KHR_materials_transmission). Sur le web on le remplace
 *  par un simple mélange alpha : même intention (on voit l'intérieur), sans la passe de rendu
 *  supplémentaire que three.js consacre aux matériaux transmissifs. */
const glassCache = new Map<THREE.Material, THREE.Material>();
function webGlass(mat: THREE.Material): THREE.Material {
  const phys = mat as THREE.MeshPhysicalMaterial;
  if (!phys.isMeshPhysicalMaterial || !(phys.transmission > 0)) return mat;
  let glass = glassCache.get(mat);
  if (!glass) {
    glass = new THREE.MeshStandardMaterial({
      name: mat.name,
      color: phys.color,
      roughness: phys.roughness,
      metalness: 0,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      side: phys.side,
    });
    glassCache.set(mat, glass);
  }
  return glass;
}

/** Ombres et verre pour un modèle chargé : le verre, transparent, ne porte pas d'ombre. */
function prepare(root: THREE.Object3D, castShadow: boolean) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.material = Array.isArray(m.material) ? m.material.map(webGlass) : webGlass(m.material);
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) if (SNOW_MATERIAL.test(mat.name)) addSnowSparkle(mat);
    const glass = (Array.isArray(m.material) ? m.material : [m.material]).some((x) => x.transparent);
    m.receiveShadow = true;
    m.castShadow = castShadow && !glass;
  });
}

function World() {
  const models = useGLTF([...WORLD_MODELS], DRACO);
  const scenes = useMemo(() => models.map((m) => m.scene), [models]);
  useEffect(() => {
    colliders.length = 0;
    for (const root of scenes) {
      prepare(root, true);
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        if (COLLIDER.test(o.name)) colliders.push(o);
        // Mer, lac, rivière : le shader d'eau du site (vaguelettes, reflet du soleil, écume).
        if (WATER.test(o.name)) {
          m.material = getWaterMaterial();
          m.castShadow = false;
          m.receiveShadow = false;
          m.renderOrder = 2;
        }
      });
    }
  }, [scenes]);
  useFrame((_, dt) => updateWater(dt));
  return (
    <>
      {scenes.map((scene, i) => (
        <primitive key={WORLD_MODELS[i]} object={scene} />
      ))}
      <Meadow scenes={scenes} />
    </>
  );
}

/* ----------------------------------------------------------------------------- le rover */

const SNOW_CAP = new THREE.MeshStandardMaterial({ color: "#f4f6f8", roughness: 0.95 });

function Rover({ progress, damping, curve, length, toT }: Driven & { curve: THREE.CatmullRomCurve3; length: number; toT: (p: number) => number }) {
  const { scene } = useGLTF(MODELS.rover, DRACO);
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const caps = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const wheels = useMemo(() => {
    const found: THREE.Object3D[] = [];
    scene.traverse((o) => {
      if (/_Wheel_(FL|FR|RL|RR)$/.test(o.name)) found.push(o);
    });
    return found;
  }, [scene]);
  useEffect(() => {
    prepare(scene, true);
  }, [scene]);
  const smooth = useSmoothProgress(progress, damping);
  const last = useRef(0);
  const speed = useRef(0);
  const accel = useRef(0);

  useFrame((_, dt) => {
    if (!group.current || !body.current || dt <= 0) return;
    const t = toT(smooth(dt));
    const here = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    // Posé 10 cm au-dessus de la spline : la chaussée et ses ornières sont dessinées au-dessus du
    // sol, les pneus ne doivent pas y baigner (ça scintillait). Aucune secousse simulée : Pierre
    // veut un roulement fluide (2026-09-07).
    placeAlong(group.current, here.clone().setY(here.y + ROVER_LIFT), tangent);
    // Les roues tournent avec la distance parcourue (axe de roue : Blender Y -> glTF Z).
    const travelled = (t - last.current) * length;
    last.current = t;
    for (const wheel of wheels) wheel.rotation.z -= travelled / WHEEL_RADIUS;
    const v = travelled / dt;
    const a = (v - speed.current) / dt;
    speed.current += (v - speed.current) * Math.min(1, dt * 6);
    accel.current += (a - accel.current) * Math.min(1, dt * 3);
    const s = t * length;
    // La neige s'accumule sur le capot, la bâche et le toit au-dessus de la ligne de neige.
    const snow = smoothstep(here.y, SNOW.from, SNOW.to + 6);
    if (caps.current) {
      caps.current.visible = snow > 0.02;
      caps.current.scale.y = Math.max(0.01, snow);
    }
    // Les phares s'allument sous la voûte (le soleil n'y entre pas).
    if (lamp.current) lamp.current.intensity = 16 * tunnelFactor(s);
    // État partagé
    roverState.s = s;
    roverState.speed = speed.current;
    roverState.altitude = here.y;
    roverState.position.copy(here);
    roverState.forward.copy(tangent).normalize();
    roverState.right.crossVectors(roverState.forward, UP).normalize();
  });

  return (
    <group ref={group}>
      <group ref={body}>
        <primitive object={scene} />
        <pointLight ref={lamp} position={[2.6, 1.1, 0]} color="#ffe2a8" intensity={0} distance={18} decay={1.5} />
        <group ref={caps} visible={false}>
          <mesh position={[1.325, 1.09, 0]} material={SNOW_CAP} castShadow>
            <boxGeometry args={[0.34, 0.07, 1.46]} />
          </mesh>
          <mesh position={[0.43, 1.95, 0.3]} material={SNOW_CAP} castShadow>
            <boxGeometry args={[0.78, 0.06, 0.26]} />
          </mesh>
          <mesh position={[0.5, 1.63, 0]} material={SNOW_CAP}>
            <boxGeometry args={[0.9, 0.05, 1.2]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ----------------------------------------------------------------------------- traces et particules */

/** Deux traces de roues sur la neige, révélées derrière le rover (plage de dessin), fondues à la
 *  ligne de neige par l'alpha des sommets. */
function Tracks({ curve, length }: { curve: THREE.CatmullRomCurve3; length: number }) {
  const geometry = useMemo(() => {
    const step = 0.6;
    const n = Math.floor(length / step);
    const positions: number[] = [];
    const colors: number[] = [];
    const index: number[] = [];
    // Neige tassée, sable mouillé, terre : chaque sol garde une trace, plus ou moins marquée.
    const TINT_SNOW = new THREE.Color("#8796a6");
    const TINT_SAND = new THREE.Color("#b3946a");
    const TINT_DIRT = new THREE.Color("#8a6a4c");
    const sandFrom = journeyPath.stations.find((st) => st.name === "phare")?.s ?? 42;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = curve.getPointAt(t);
      const forward = curve.getTangentAt(t).setY(0).normalize();
      const right = new THREE.Vector3().crossVectors(forward, UP).normalize();
      const s = t * length;
      const snow = smoothstep(p.y, SNOW.from + 2, SNOW.to);
      const sand = s > sandFrom && p.y < 2.6 ? 1 : 0;
      const tint = snow > 0.5 ? TINT_SNOW : sand ? TINT_SAND : TINT_DIRT;
      const alpha = Math.max(snow, sand * 0.7, s > sandFrom ? 0.28 : 0);
      for (const side of [-0.78, 0.78]) {
        for (const edge of [-0.17, 0.17]) {
          positions.push(p.x + right.x * (side + edge), p.y + 0.07, p.z + right.z * (side + edge));
          colors.push(tint.r, tint.g, tint.b, alpha);
        }
      }
      if (i > 0) {
        const b = i * 4;
        const a = b - 4;
        index.push(a, b, a + 1, a + 1, b, b + 1, a + 2, b + 2, a + 3, a + 3, b + 2, b + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
    g.setIndex(index);
    g.computeVertexNormals();
    g.setDrawRange(0, 0);
    return g;
  }, [curve, length]);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
    [],
  );
  useFrame(() => {
    const total = geometry.index ? geometry.index.count : 0;
    const segments = Math.floor((roverState.s / length) * (total / 12));
    geometry.setDrawRange(0, Math.max(0, segments) * 12);
  });
  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}

const PARTICLES = 160;

/** Disque doux (dégradé radial) pour les particules : sans lui, three.js dessine des carrés. */
function puffTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(0.45, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Poussière derrière les roues sur la terre et le sable, poudrerie sur la neige. */
function Particles() {
  const state = useMemo(() => {
    const positions = new Float32Array(PARTICLES * 3).fill(-1000);
    const velocities = new Float32Array(PARTICLES * 3);
    const life = new Float32Array(PARTICLES);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: "#c7a27a",
      map: puffTexture(),
      size: 0.9,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      alphaTest: 0.02,
    });
    return { positions, velocities, life, geometry, material, cursor: 0, pending: 0, rnd: mulberry(4242) };
  }, []);
  const dust = useMemo(() => new THREE.Color("#c7a27a"), []);
  const powder = useMemo(() => new THREE.Color("#eef3f8"), []);

  useFrame((_, dt) => {
    const { positions, velocities, life, geometry, material, rnd } = state;
    const snow = smoothstep(roverState.altitude, SNOW.from, SNOW.to);
    material.color.copy(dust).lerp(powder, snow);
    material.opacity = 0.35 + 0.25 * snow;
    // Émission proportionnelle à la vitesse, derrière chaque roue arrière.
    state.pending += Math.min(Math.abs(roverState.speed), 40) * dt * 6;
    while (state.pending >= 1) {
      state.pending -= 1;
      const i = state.cursor;
      state.cursor = (state.cursor + 1) % PARTICLES;
      const side = rnd() < 0.5 ? -0.8 : 0.8;
      const p = roverState.position;
      const f = roverState.forward;
      const r = roverState.right;
      positions[i * 3] = p.x - f.x * 1.3 + r.x * side;
      positions[i * 3 + 1] = p.y + 0.15;
      positions[i * 3 + 2] = p.z - f.z * 1.3 + r.z * side;
      const kick = 0.6 + rnd() * 1.2;
      velocities[i * 3] = -f.x * kick + (rnd() - 0.5) * 0.8;
      velocities[i * 3 + 1] = 0.8 + rnd() * 1.2;
      velocities[i * 3 + 2] = -f.z * kick + (rnd() - 0.5) * 0.8;
      life[i] = 0.9 + rnd() * 0.5;
    }
    for (let i = 0; i < PARTICLES; i++) {
      if (life[i] <= 0) continue;
      life[i] -= dt;
      if (life[i] <= 0) {
        positions[i * 3 + 1] = -1000;
        continue;
      }
      velocities[i * 3 + 1] -= 1.8 * dt;
      positions[i * 3] += velocities[i * 3] * dt;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
    }
    geometry.attributes.position.needsUpdate = true;
  });
  return <points geometry={state.geometry} material={state.material} frustumCulled={false} />;
}

/* ----------------------------------------------------------------------------- l'atmosphère */

type Look = {
  sky: THREE.Color;
  ground: THREE.Color;
  fog: THREE.Color;
  sun: THREE.Color;
  azimuth: number;
  elevation: number;
  intensity: number;
  hemi: number;
  fogNear: number;
  fogFar: number;
};

const Z = worldPalette.zones;
const L = worldPalette.lights;
const look = (sky: string, ground: string, fog: string, sun: string, azimuth: number, elevation: number, intensity: number, hemi: number, fogNear: number, fogFar: number): Look => ({
  sky: new THREE.Color(sky),
  ground: new THREE.Color(ground),
  fog: new THREE.Color(fog),
  sun: new THREE.Color(sun),
  azimuth,
  elevation,
  intensity,
  hemi,
  fogNear,
  fogFar,
});
/** Une lumière par zone (STORYTELLING §3.6 : l'ascension dure une journée). Azimut depuis +X en
 *  degrés, négatif = côté mer (sud) ; élévation en degrés. */
const LOOKS: Look[] = [
  look(Z.z0_port.sky, Z.z0_port.ground, Z.z0_port.fog, L.key_dawn, -55, 18, 2.6, 0.95, 35, 260), // aube au port
  look(Z.z1_sable.sky, Z.z1_sable.ground, Z.z1_sable.fog, "#ffe4bf", -68, 28, 2.8, 0.9, 40, 280), // matin clair sur la plage
  look(Z.z2_foret.sky, Z.z2_foret.ground, Z.z2_foret.fog, "#fff1dc", -85, 44, 2.6, 0.85, 30, 240), // fin de matinée dans la forêt
  look(Z.z2_atelier.sky, "#8fb063", Z.z2_atelier.fog, L.key_noon, -95, 56, 3.0, 0.85, 45, 300), // midi au lac et au village
  look(Z.z3_desert.sky, Z.z3_desert.ground, Z.z3_desert.fog, "#ffd9a8", -110, 48, 3.0, 0.8, 45, 300), // après-midi chaud dans le canyon
  look(Z.z3_col.sky, Z.z3_col.ground, Z.z3_col.fog, "#e6eef8", -125, 24, 2.1, 1.1, 25, 220), // hiver sur le massif
  look(Z.z4_observatoire.sky, Z.z4_observatoire.ground, Z.z4_observatoire.fog, L.key_sunset, -152, 8, 2.4, 0.7, 40, 280), // coucher au sommet
  look(Z.z5_ciel.sky, "#2a3352", "#20223a", "#8fa0d0", -100, 40, 1.4, 0.65, 20, 210), // nuit claire au phare (lune)
];

/** Bornes des zones le long de la route (abscisses, m) : port | plage | forêt | lac et village |
 *  canyon | massif | sommet | phare. La lumière glisse d'une zone à la suivante sur 40 m. */
function useZoneEdges(length: number) {
  return useMemo(() => {
    const at = (name: string, fallback: number) => journeyPath.stations.find((s) => s.name === name)?.s ?? fallback;
    return [
      at("borne-2023", 68),
      at("borne-2025", 187),
      at("borne-dec-2025", 323) - 12,
      at("atelier", 472) - 45,
      at("col-neige", 652) - 60,
      at("observatoire", 803) - 40,
      at("bout", length) - 60,
    ];
  }, [length]);
}

function Atmosphere({ length }: { length: number }) {
  const { scene } = useThree();
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const edges = useZoneEdges(length);
  const cur = useMemo(() => ({ ...LOOKS[0], sky: LOOKS[0].sky.clone(), ground: LOOKS[0].ground.clone(), fog: LOOKS[0].fog.clone(), sun: LOOKS[0].sun.clone() }), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    scene.background = cur.sky;
    scene.fog = new THREE.Fog(cur.fog, cur.fogNear, cur.fogFar);
  }, [scene, cur]);

  useFrame(() => {
    const s = roverState.s;
    let i = 0;
    while (i < edges.length && s > edges[i]) i++;
    const a = LOOKS[Math.min(i, LOOKS.length - 1)];
    let target = a;
    let k = 0;
    if (i > 0 && s - edges[i - 1] < 20) {
      target = LOOKS[i - 1];
      k = 1 - smoothstep(s, edges[i - 1] - 20, edges[i - 1] + 20);
    } else if (i < edges.length && edges[i] - s < 20) {
      target = LOOKS[Math.min(i + 1, LOOKS.length - 1)];
      k = smoothstep(s, edges[i] - 20, edges[i] + 20);
    }
    cur.sky.lerpColors(a.sky, target.sky, k);
    cur.ground.lerpColors(a.ground, target.ground, k);
    cur.fog.lerpColors(a.fog, target.fog, k);
    cur.sun.lerpColors(a.sun, target.sun, k);
    cur.azimuth = THREE.MathUtils.lerp(a.azimuth, target.azimuth, k);
    cur.elevation = THREE.MathUtils.lerp(a.elevation, target.elevation, k);
    cur.intensity = THREE.MathUtils.lerp(a.intensity, target.intensity, k);
    cur.hemi = THREE.MathUtils.lerp(a.hemi, target.hemi, k);
    cur.fogNear = THREE.MathUtils.lerp(a.fogNear, target.fogNear, k);
    cur.fogFar = THREE.MathUtils.lerp(a.fogFar, target.fogFar, k);
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.near = cur.fogNear;
      fog.far = cur.fogFar;
    }
    if (hemi.current) {
      hemi.current.color.copy(cur.sky);
      hemi.current.groundColor.copy(cur.ground);
      hemi.current.intensity = cur.hemi;
    }
    if (sun.current) {
      const az = THREE.MathUtils.degToRad(cur.azimuth);
      const el = THREE.MathUtils.degToRad(cur.elevation);
      dir.set(Math.cos(az) * Math.cos(el), Math.sin(el), -Math.sin(az) * Math.cos(el)); // Blender (x, y, z) -> three (x, z, -y)
      lookState.sunDir.copy(dir);
      lookState.sun.copy(cur.sun);
      lookState.sky.copy(cur.sky);
      lookState.fog.copy(cur.fog);
      lookState.elevation = cur.elevation;
      lookState.intensity = cur.intensity;
      lookState.fogNear = cur.fogNear;
      lookState.fogFar = cur.fogFar;
      sun.current.color.copy(cur.sun);
      sun.current.intensity = cur.intensity;
      // Le soleil (et sa boîte d'ombre) suit le rover.
      sun.current.position.copy(roverState.position).addScaledVector(dir, 70);
      sun.current.target.position.copy(roverState.position);
      sun.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={[cur.sky, cur.ground, cur.hemi]} />
      <directionalLight
        ref={sun}
        color={cur.sun}
        intensity={cur.intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-near={5}
        shadow-camera-far={160}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
      />
    </>
  );
}

/* ----------------------------------------------------------------------------- la caméra */

function ChaseCamera({ progress, damping, curve, length, toT }: Driven & { curve: THREE.CatmullRomCurve3; length: number; toT: (p: number) => number }) {
  const { camera } = useThree();
  const smooth = useSmoothProgress(progress, damping);
  const scratch = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      right: new THREE.Vector3(),
      eye: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      ray: new THREE.Raycaster(),
    }),
    [],
  );
  // Chemin de la caméra dans le garage et jusqu'à la sortie ; son dernier point est la pose de
  // poursuite au passage de relais, pour ne pas sauter.
  const intro = useMemo(() => {
    if (!INTRO) return null;
    const points = INTRO.camera.map(toThree);
    const tH = THREE.MathUtils.clamp(INTRO.handover_s / length, 0, 1);
    const hereH = curve.getPointAt(tH);
    const flatH = curve.getTangentAt(tH).setY(0).normalize();
    const rightH = new THREE.Vector3().crossVectors(flatH, UP).normalize();
    points.push(hereH.clone().addScaledVector(flatH, -4).addScaledVector(rightH, 2.2 * cameraSideAt(tH)).setY(hereH.y + 3.1));
    const path = new THREE.CatmullRomCurve3(points, false, "centripetal");
    path.arcLengthDivisions = 200;
    return { path, handoverS: INTRO.handover_s };
  }, [curve, length]);

  useFrame((_, dt) => {
    const t = toT(smooth(dt));
    const s = t * length;
    const here = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const flat = tangent.clone().setY(0).normalize();
    scratch.right.crossVectors(flat, UP).normalize();
    // 0 = dans le garage (caméra sur son propre chemin), 1 = poursuite.
    const k = intro ? THREE.MathUtils.clamp(s / intro.handoverS, 0, 1) : 1;
    // Trois quarts arrière, un peu en hauteur, décalée côté mer (ART_DIRECTION §8) : on recule le
    // long de la tangente à plat (pas le long de la spline : dans un lacet elle repasse au-dessus
    // d'elle-même). Juste après le hangar la caméra reste proche, puis prend du recul.
    const tunnel = tunnelFactor(s);
    const back = THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(4.0, 8.5, THREE.MathUtils.clamp((s - (intro?.handoverS ?? START_S)) / 20, 0, 1)),
      6.5,
      tunnel,
    );
    scratch.pos
      .copy(here)
      .addScaledVector(flat, -back)
      .addScaledVector(scratch.right, THREE.MathUtils.lerp(2.2, 0.8, tunnel) * cameraSideAt(t));
    scratch.pos.y = here.y + THREE.MathUtils.lerp(3.1, 2.4, tunnel);
    if (intro && k < 1) {
      // Le chemin d'intro sort par la porte et rejoint la pose de poursuite au passage de relais.
      intro.path.getPointAt(k, scratch.pos);
    } else {
      // Si le terrain est entre le rover et la caméra, on rapproche la caméra juste devant l'obstacle.
      scratch.eye.copy(here).setY(here.y + 1.6);
      scratch.dir.subVectors(scratch.pos, scratch.eye);
      const wanted = scratch.dir.length();
      scratch.ray.set(scratch.eye, scratch.dir.normalize());
      scratch.ray.far = wanted;
      const hit = colliders.length && !inTunnel(s) ? scratch.ray.intersectObjects(colliders, false)[0] : undefined;
      if (hit && hit.distance < wanted) {
        scratch.pos.copy(scratch.eye).addScaledVector(scratch.dir, Math.max(2.5, hit.distance - 0.7));
      }
    }
    camera.position.lerp(scratch.pos, Math.min(1, dt * 5));
    // Champ plus large dans le garage (on est à deux mètres du rover), normal dehors.
    const persp = camera as THREE.PerspectiveCamera;
    const fov = THREE.MathUtils.lerp(56, 42, k);
    if (Math.abs(persp.fov - fov) > 0.05) {
      persp.fov = fov;
      persp.updateProjectionMatrix();
    }
    // Dans le garage on regarde le rover lui-même, puis de plus en plus loin devant lui.
    scratch.look.copy(here).addScaledVector(flat, THREE.MathUtils.lerp(1.5, 9, k)).setY(here.y + THREE.MathUtils.lerp(1.0, 1.2, k));
    camera.lookAt(scratch.look);
  });

  return null;
}

/** Pont de debug (dev seulement) : rendre une image à la main quand l'onglet est en pause,
 *  et lire la caméra. `window.__journey.advance(performance.now())`. */
function DebugBridge({ progress }: { progress: MotionValue<number> }) {
  const advance = useThree((s) => s.advance);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { __journey?: unknown }).__journey = {
      advance,
      camera,
      scene,
      three: THREE,
      rover: roverState,
      setProgress: (v: number) => progress.set(v),
    };
  }, [advance, camera, scene, progress]);
  return null;
}

export type JourneySceneProps = {
  progress: MotionValue<number>;
  /** Amortissement du suivi (grand = immédiat, pour prefers-reduced-motion). */
  damping?: number;
  shadows?: boolean;
};

export function JourneyScene({ progress, damping = 3.5, shadows = true }: JourneySceneProps) {
  const { curve, length, toT } = useCurve();
  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows={shadows ? "soft" : false}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
      camera={{ fov: 42, near: 0.5, far: 460, position: [-6, 4, 6] }}
    >
      <Atmosphere length={length} />
      <pointLight position={LAMP_POS} color={worldPalette.lights.key_dawn} intensity={16} distance={10} decay={2} />
      <Suspense fallback={null}>
        <World />
        <Rover progress={progress} damping={damping} curve={curve} length={length} toT={toT} />
        <Tracks curve={curve} length={length} />
        <Particles />
      </Suspense>
      <Clouds />
      <SunSprite />
      <TunnelLights />
      <ChaseCamera progress={progress} damping={damping * 0.8} curve={curve} length={length} toT={toT} />
      <DebugBridge progress={progress} />
      <Effects enabled={shadows} />
    </Canvas>
  );
}

useGLTF.preload([...WORLD_MODELS], DRACO);
useGLTF.preload(MODELS.rover, DRACO);
