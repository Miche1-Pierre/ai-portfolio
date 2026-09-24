"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

import journeyPath from "@/data/journey-path.json";
import { lookState, mulberry, roverState, smoothstep, toThree } from "@/components/journey/journey-state";

/* ----------------------------------------------------------------------------- l'eau */

/** Mer, lac, rivière : vaguelettes (déplacement + normale analytique), fresnel vers le ciel, reflet
 *  du soleil, écume qui avance au rivage. L'attribut de couleur exporté par Blender porte
 *  B = 1 - 0,5 x rivage, G = 1 - 0,35 x profondeur (`zx_terrain_mountain._paint_water`). Brume du décor reproduite. */
const WATER_VERT = /* glsl */ `
attribute vec4 color;
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vShore;
varying float vDeep;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float calm = 1.0 - 0.6 * clamp((1.0 - color.b) / 0.5, 0.0, 1.0);
  float a1 = wp.x * 0.35 + uTime * 1.1;
  float b1 = wp.z * 0.28 + uTime * 0.9;
  float a2 = (wp.x + wp.z) * 0.9 - uTime * 1.7;
  float h = (0.12 * sin(a1) * cos(b1) + 0.05 * sin(a2)) * calm;
  float dhdx = (0.12 * 0.35 * cos(a1) * cos(b1) + 0.05 * 0.9 * cos(a2)) * calm;
  float dhdz = (-0.12 * 0.28 * sin(a1) * sin(b1) + 0.05 * 0.9 * cos(a2)) * calm;
  wp.y += h;
  vNormalW = normalize(vec3(-dhdx, 1.0, -dhdz));
  vWorld = wp.xyz;
  vShore = clamp((1.0 - color.b) / 0.5, 0.0, 1.0);
  vDeep = clamp((1.0 - color.g) / 0.35, 0.0, 1.0);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const WATER_FRAG = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform vec3 uSkyColor;
uniform vec3 uDeepColor;
uniform vec3 uShallowColor;
uniform vec3 uFoamColor;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
varying vec3 vWorld;
varying vec3 vNormalW;
varying float vShore;
varying float vDeep;
void main() {
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 N = normalize(vNormalW);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
  vec3 base = mix(uShallowColor, uDeepColor, vDeep);
  float diff = 0.6 + 0.4 * max(dot(N, uSunDir), 0.0);
  vec3 col = base * diff;
  col = mix(col, uSkyColor, 0.06 + 0.28 * fres);
  vec3 H = normalize(uSunDir + V);
  float spec = pow(max(dot(N, H), 0.0), 110.0) * smoothstep(0.0, 0.15, uSunDir.y);
  col += uSunColor * spec * 1.1;
  float band = sin(vShore * 14.0 - uTime * 1.4 + 2.5 * sin(vWorld.x * 0.7 + vWorld.z * 0.5));
  float foam = smoothstep(0.62, 0.95, band) * smoothstep(0.6, 0.92, vShore) * 0.75;
  foam += smoothstep(0.94, 1.0, vShore) * 0.45;
  col = mix(col, uFoamColor, clamp(foam, 0.0, 1.0));
  float alpha = mix(uOpacity, 0.94, clamp(0.5 * vShore + 0.4 * fres, 0.0, 1.0));
  float dist = length(cameraPosition - vWorld);
  col = mix(col, uFogColor, smoothstep(uFogNear, uFogFar, dist));
  gl_FragColor = vec4(col, alpha);
  #include <colorspace_fragment>
}
`;

let waterMaterial: THREE.ShaderMaterial | null = null;

export const WATER = /_Terrain_Mountain_(Sea|Lake|River)$/;

export function getWaterMaterial(): THREE.ShaderMaterial {
  if (!waterMaterial) {
    waterMaterial = new THREE.ShaderMaterial({
      vertexShader: WATER_VERT,
      fragmentShader: WATER_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.84 },
        uSunDir: { value: lookState.sunDir.clone() },
        uSunColor: { value: lookState.sun.clone() },
        uSkyColor: { value: lookState.sky.clone() },
        uDeepColor: { value: new THREE.Color("#1c5674") },
        uShallowColor: { value: new THREE.Color("#3a95b6") },
        uFoamColor: { value: new THREE.Color("#eef6f8") },
        uFogColor: { value: lookState.fog.clone() },
        uFogNear: { value: 35 },
        uFogFar: { value: 260 },
      },
    });
  }
  return waterMaterial;
}

export function updateWater(dt: number) {
  if (!waterMaterial) return;
  const u = waterMaterial.uniforms;
  u.uTime.value += Math.min(dt, 0.05);
  (u.uSunDir.value as THREE.Vector3).copy(lookState.sunDir);
  (u.uSunColor.value as THREE.Color).copy(lookState.sun);
  (u.uSkyColor.value as THREE.Color).copy(lookState.sky);
  (u.uFogColor.value as THREE.Color).copy(lookState.fog);
  u.uFogNear.value = lookState.fogNear;
  u.uFogFar.value = lookState.fogFar;
}

/* ----------------------------------------------------------------------------- la neige qui scintille */

export const SNOW_MATERIAL = /^MAT_(ground_snow|ground_snowline|snow|outcrop_snow)$/;

/** Paillettes sur la neige : des cellules aléatoires accrochées au monde ET à l'angle de vue, donc
 *  elles s'allument et s'éteignent quand la caméra avance. */
export function addSnowSparkle(mat: THREE.Material) {
  if (mat.userData.sparkle) return;
  mat.userData.sparkle = true;
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSnowWorld;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvSnowWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSnowWorld;")
      .replace(
        "#include <opaque_fragment>",
        `vec3 snowView = normalize(cameraPosition - vSnowWorld);
        vec3 snowCell = floor(vSnowWorld * 9.0 + snowView * 2.5);
        float snowHash = fract(sin(dot(snowCell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
        float snowGlint = step(0.972, snowHash) * pow(max(dot(normalize(vNormal), snowView), 0.0), 1.5);
        outgoingLight += snowGlint * 0.85;
        #include <opaque_fragment>`,
      );
  };
  mat.needsUpdate = true;
}

/* ----------------------------------------------------------------------------- la prairie */

const EXTRAS = journeyPath as unknown as { side_paths?: readonly (readonly (readonly number[])[])[]; tunnel_lamps?: readonly (readonly number[])[] };

/** Grille spatiale 2D (x, z) des points de la route et des chemins : distance rapide. */
function makeNear(points: THREE.Vector3[], cell: number) {
  const map = new Map<string, THREE.Vector3[]>();
  const key = (x: number, z: number) => `${Math.floor(x / cell)}:${Math.floor(z / cell)}`;
  for (const p of points) {
    const k = key(p.x, p.z);
    const list = map.get(k);
    if (list) list.push(p);
    else map.set(k, [p]);
  }
  return (x: number, z: number, radius: number) => {
    let best = Infinity;
    const r = Math.ceil(radius / cell);
    const cx = Math.floor(x / cell);
    const cz = Math.floor(z / cell);
    for (let i = -r; i <= r; i++) {
      for (let j = -r; j <= r; j++) {
        const list = map.get(`${cx + i}:${cz + j}`);
        if (!list) continue;
        for (const p of list) {
          const d = Math.hypot(p.x - x, p.z - z);
          if (d < best) best = d;
        }
      }
    }
    return best;
  };
}

/** Une touffe = trois brins triangulaires ; une fleur = tige + losange. */
function tuftGeometry() {
  const positions: number[] = [];
  const colors: number[] = [];
  const base = new THREE.Color("#4f7a3a");
  const tip = new THREE.Color("#a8c96a");
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.4;
    const lean = 0.18;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const w = 0.07;
    // pied gauche, pied droit, pointe (penchée vers l'extérieur)
    positions.push(-dz * w, 0, dx * w, dz * w, 0, -dx * w, dx * lean, 0.5, dz * lean);
    colors.push(base.r, base.g, base.b, base.r, base.g, base.b, tip.r, tip.g, tip.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

function flowerGeometry() {
  const positions: number[] = [];
  const colors: number[] = [];
  const stem = new THREE.Color("#5b8a3c");
  const white = new THREE.Color("#ffffff");
  positions.push(-0.012, 0, 0, 0.012, 0, 0, 0, 0.32, 0);
  colors.push(stem.r, stem.g, stem.b, stem.r, stem.g, stem.b, stem.r, stem.g, stem.b);
  const r = 0.07;
  const y = 0.34;
  // losange horizontal (deux triangles), teinté par l'instance
  positions.push(-r, y, 0, 0, y, r, r, y, 0, -r, y, 0, r, y, 0, 0, y, -r);
  for (let i = 0; i < 6; i++) colors.push(white.r, white.g, white.b);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

function windMaterial(color: string, strength: number) {
  const mat = new THREE.MeshStandardMaterial({ color, vertexColors: true, roughness: 1, side: THREE.DoubleSide });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    mat.userData.shader = shader;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
        float windPhase = uTime * 1.6 + instanceMatrix[3][0] * 0.35 + instanceMatrix[3][2] * 0.27;
        float windLift = clamp(position.y * 2.0, 0.0, 1.0);
        transformed.x += (sin(windPhase) * 0.6 + sin(windPhase * 2.3) * 0.25) * ${strength.toFixed(3)} * windLift;
        transformed.z += cos(windPhase * 0.8) * ${(strength * 0.5).toFixed(3)} * windLift;
        #endif`,
      );
  };
  return mat;
}

const FLOWER_COLORS = ["#ffffff", "#ffe27a", "#ff9fb4", "#c79bff", "#ffb35c"].map((c) => new THREE.Color(c));

/** Herbe et fleurs instanciées sur la bande d'herbe du terrain chargé : tirées sur les triangles
 *  (pondérés par l'aire), jamais sur la route, les chemins ni les champs, denses près de la route
 *  (là où la caméra regarde), clairsemées au loin. Le vent les balance dans le shader. */
export function Meadow({ scenes }: { scenes: readonly THREE.Object3D[] }) {
  const built = useMemo(() => {
    let grass: THREE.Mesh | null = null;
    const fields: THREE.Box3[] = [];
    for (const root of scenes) {
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        if (/_Terrain_Mountain_Grass$/.test(m.name)) grass = m;
        if (/_Field_\d+_soil$/.test(m.name)) fields.push(new THREE.Box3().setFromObject(m).expandByScalar(0.8));
      });
    }
    if (!grass) return null;
    const mesh = grass as THREE.Mesh;
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    const idx = geo.index;
    const triCount = idx ? idx.count / 3 : pos.count / 3;
    const road = makeNear(journeyPath.points.map(toThree), 8);
    const paths = makeNear((EXTRAS.side_paths ?? []).flatMap((line) => line.map(([x, y]) => new THREE.Vector3(x, 0, -y))), 8);
    const rnd = mulberry(1234);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const n = new THREE.Vector3();
    const p = new THREE.Vector3();
    // aires cumulées
    const cum = new Float32Array(triCount);
    let total = 0;
    for (let i = 0; i < triCount; i++) {
      const ia = idx ? idx.getX(3 * i) : 3 * i;
      const ib = idx ? idx.getX(3 * i + 1) : 3 * i + 1;
      const ic = idx ? idx.getX(3 * i + 2) : 3 * i + 2;
      a.fromBufferAttribute(pos, ia);
      b.fromBufferAttribute(pos, ib);
      c.fromBufferAttribute(pos, ic);
      total += b.clone().sub(a).cross(c.clone().sub(a)).length() * 0.5;
      cum[i] = total;
    }
    const pick = () => {
      const r = rnd() * total;
      let lo = 0;
      let hi = triCount - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < r) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    };
    const tufts: THREE.Matrix4[] = [];
    const tuftTints: THREE.Color[] = [];
    const flowers: THREE.Matrix4[] = [];
    const flowerTints: THREE.Color[] = [];
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sc = new THREE.Vector3();
    const TARGET = 9000;
    let tries = 0;
    while (tufts.length < TARGET && tries < TARGET * 6) {
      tries++;
      const i = pick();
      const ia = idx ? idx.getX(3 * i) : 3 * i;
      const ib = idx ? idx.getX(3 * i + 1) : 3 * i + 1;
      const ic = idx ? idx.getX(3 * i + 2) : 3 * i + 2;
      a.fromBufferAttribute(pos, ia);
      b.fromBufferAttribute(pos, ib);
      c.fromBufferAttribute(pos, ic);
      n.copy(b).sub(a).cross(c.clone().sub(a)).normalize();
      if (n.y < 0.74) continue;
      let u = rnd();
      let v = rnd();
      if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
      }
      p.copy(a).addScaledVector(b.clone().sub(a), u).addScaledVector(c.clone().sub(a), v);
      const dRoad = road(p.x, p.z, 70);
      if (dRoad < 3.3 || dRoad > 70) continue;
      const keep = dRoad < 22 ? 1 : dRoad < 50 ? 0.4 : 0.15;
      if (rnd() > keep) continue;
      if (paths(p.x, p.z, 3) < 1.9) continue;
      if (fields.some((f) => p.x > f.min.x && p.x < f.max.x && p.z > f.min.z && p.z < f.max.z)) continue;
      const flower = rnd() < 0.09;
      const s = flower ? 0.8 + rnd() * 0.6 : 0.65 + rnd() * 0.75;
      q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, rnd() * Math.PI * 2);
      sc.set(s, s * (flower ? 1 : 0.8 + rnd() * 0.6), s);
      m4.compose(p, q, sc);
      if (flower) {
        flowers.push(m4.clone());
        flowerTints.push(FLOWER_COLORS[Math.floor(rnd() * FLOWER_COLORS.length)]);
      } else {
        tufts.push(m4.clone());
        const t = rnd();
        tuftTints.push(new THREE.Color().setHSL(0.24 + 0.05 * t, 0.5, 0.42 + 0.14 * rnd()));
      }
    }
    const make = (geometry: THREE.BufferGeometry, mats: THREE.Matrix4[], tints: THREE.Color[], material: THREE.Material) => {
      const inst = new THREE.InstancedMesh(geometry, material, Math.max(1, mats.length));
      mats.forEach((m, k) => inst.setMatrixAt(k, m));
      tints.forEach((col, k) => inst.setColorAt(k, col));
      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
      inst.castShadow = false;
      inst.receiveShadow = true;
      inst.frustumCulled = false;
      return inst;
    };
    const tuftMesh = make(tuftGeometry(), tufts, tuftTints, windMaterial("#ffffff", 0.09));
    const flowerMesh = make(flowerGeometry(), flowers, flowerTints, windMaterial("#ffffff", 0.05));
    return { tuftMesh, flowerMesh };
  }, [scenes]);

  useFrame((_, dt) => {
    if (!built) return;
    for (const mesh of [built.tuftMesh, built.flowerMesh]) {
      const shader = (mesh.material as THREE.Material).userData.shader as { uniforms: { uTime: { value: number } } } | undefined;
      if (shader) shader.uniforms.uTime.value += Math.min(dt, 0.05);
    }
  });

  if (!built) return null;
  return (
    <>
      <primitive object={built.tuftMesh} />
      <primitive object={built.flowerMesh} />
    </>
  );
}

/* ----------------------------------------------------------------------------- les nuages, le soleil */

type Cloud = { x: number; y: number; z: number; speed: number; blobs: { dx: number; dy: number; dz: number; r: number }[] };

/** Nuages low-poly (amas d'icosaèdres aplatis) qui dérivent lentement au-dessus de l'île et, plus
 *  bas, au large ; chacun reboucle de l'autre côté du monde. */
export function Clouds() {
  const data = useMemo(() => {
    const rnd = mulberry(77);
    const clouds: Cloud[] = [];
    const add = (x: number, y: number, z: number, size: number) => {
      const blobs = [];
      const n = 5 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) {
        blobs.push({ dx: (rnd() - 0.5) * size * 1.6, dy: (rnd() - 0.3) * size * 0.35, dz: (rnd() - 0.5) * size * 0.8, r: size * (0.35 + rnd() * 0.4) });
      }
      clouds.push({ x, y, z, speed: 0.5 + rnd() * 0.5, blobs });
    };
    for (let i = 0; i < 14; i++) add(-60 + rnd() * 400, 78 + rnd() * 30, -(-40 + rnd() * 340), 10 + rnd() * 9);
    for (let i = 0; i < 10; i++) add(-120 + rnd() * 520, 46 + rnd() * 18, -(-150 + rnd() * 80), 16 + rnd() * 10);
    for (let i = 0; i < 8; i++) add(-120 + rnd() * 520, 50 + rnd() * 18, -(330 + rnd() * 80), 16 + rnd() * 10);
    const count = clouds.reduce((acc, c) => acc + c.blobs.length, 0);
    return { clouds, count };
  }, []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.22, roughness: 1, flatShading: true }),
    [],
  );
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const sc = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const time = useRef(0);
  useFrame((_, dt) => {
    if (!mesh.current) return;
    time.current += Math.min(dt, 0.05);
    let k = 0;
    for (const c of data.clouds) {
      const x = -140 + ((((c.x + 140 + time.current * c.speed) % 560) + 560) % 560);
      for (const b of c.blobs) {
        pos.set(x + b.dx, c.y + b.dy, c.z + b.dz);
        sc.set(b.r, b.r * 0.55, b.r);
        m4.compose(pos, q, sc);
        mesh.current.setMatrixAt(k++, m4);
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geometry, material, data.count]} frustumCulled={false} />;
}

/** Le disque du soleil (la lune la nuit) : un sprite additif posé loin dans la direction de la
 *  lumière courante, devant le fond mais derrière les montagnes. */
export function SunSprite() {
  const sprite = useRef<THREE.Sprite>(null);
  const material = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.18, "rgba(255,255,255,0.95)");
      g.addColorStop(0.3, "rgba(255,255,255,0.35)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.SpriteMaterial({ map: texture, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
  }, []);
  const { camera } = useThree();
  useFrame(() => {
    if (!sprite.current) return;
    const night = lookState.intensity < 1.8;
    const size = night ? 34 : 110;
    sprite.current.position.copy(camera.position).addScaledVector(lookState.sunDir, 420);
    sprite.current.scale.set(size, size, 1);
    material.color.copy(lookState.sun);
    material.opacity = smoothstep(lookState.elevation, 2, 9) * (night ? 0.8 : 1);
  });
  return <sprite ref={sprite} material={material} renderOrder={-1} />;
}

/** Les lampes du tunnel (positions exportées par Blender) : de vraies lumières ponctuelles chaudes. */
export function TunnelLights() {
  const lamps = useMemo(() => (EXTRAS.tunnel_lamps ?? []).map(toThree), []);
  return (
    <>
      {lamps.map((p, i) => (
        <pointLight key={i} position={p} color="#ffd9a0" intensity={7} distance={12} decay={1.6} />
      ))}
    </>
  );
}

/** Post-traitement (ordinateur seulement) : léger bloom sur le soleil, les fenêtres et les lampes,
 *  vignettage doux. */
export function Effects({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.82} luminanceSmoothing={0.25} intensity={0.5} mipmapBlur />
      <Vignette eskil={false} offset={0.22} darkness={0.5} />
    </EffectComposer>
  );
}

/** Quand le rover est loin de l'eau et des lampes, rien à faire : petit garde-fou pour un rendu
 *  stable (les états partagés sont lus à chaque image). */
export function useNatureTick() {
  useEffect(() => {
    void roverState;
  }, []);
}
