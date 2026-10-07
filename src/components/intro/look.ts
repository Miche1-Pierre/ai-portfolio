import * as THREE from "three";

/**
 * The hero's drawing style, in 3D: flat colours chosen by face orientation, like the isometric SVG
 * of `scripts/gen-hero-iso.py` (vivid tops, light walls facing +X, shaded walls facing +Z, thin
 * courses or ribs on the walls). No lights: the shader picks the colour from the face normal, so
 * every face keeps the exact palette in both themes. Colours mirror globals.css and the generator.
 */
export type ThemeName = "light" | "dark";

export const SHAPE = {
  blue: "#2f6bf6",
  lime: "#e2f78c",
  pink: "#f99bc3",
  sky: "#a9c6ff",
  yellow: "#ffc94d",
  green: "#6fbf8f",
  red: "#ef6a4c",
} as const;

const SURFACES = {
  light: {
    wallLight: "#ffffff",
    wallDark: "#efeeea",
    wallLine: "#e2e0db",
    wallEdge: "#d4d2cd",
    grid: "#e8e7e3",
    floor: "#fbfaf9",
    rim: 0.45,
    window: "#a9c6ff",
    mullion: "#ffffff",
    glass: "#cfe0ff",
    opening: "#5b6272",
    belt: "#3b4150",
    beltLine: "#5b6272",
    tyre: "#2d313b",
    hub: "#d4d2cd",
    metal: "#d4d2cd",
    smoke: "#ffffff",
    smokeLine: "#d8d6d0",
    road: "#f1f0ec",
    roadLine: "#ffffff",
    shadow: "#ebe9e4",
    wood: "#f3d9a4",
    lead: "#3b4150",
    pawn: "#ffffff",
    trail: "#2f6bf6",
    trailHead: "#ffffff",
    glow: "#7ea4ff",
    halo: "#2f6bf6",
  },
  dark: {
    wallLight: "#232a41",
    wallDark: "#1a2034",
    wallLine: "#2b334d",
    wallEdge: "#323b58",
    grid: "#1c2237",
    floor: "#0f1322",
    rim: 0.22,
    window: "#ffd66b",
    mullion: "#1a2034",
    glass: "#7ea4ff",
    opening: "#070a12",
    belt: "#0a0d17",
    beltLine: "#232a41",
    tyre: "#05070d",
    hub: "#39425f",
    metal: "#39425f",
    smoke: "#3d4766",
    smokeLine: "#56618a",
    road: "#141a2d",
    roadLine: "#2b334d",
    shadow: "#0a0e1a",
    wood: "#c7ad7f",
    lead: "#0a0d17",
    pawn: "#c9d2ea",
    trail: "#7ea4ff",
    trailHead: "#ffffff",
    glow: "#2f6bf6",
    halo: "#7ea4ff",
  },
} as const;

export type Surfaces = (typeof SURFACES)[ThemeName];
export const surfaces = (theme: ThemeName): Surfaces => SURFACES[theme];

/** Darken a #rrggbb colour (k < 1). */
export function shade(hex: string, k: number) {
  const n = Number.parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export type Look = {
  /** Colour of the faces turned up (or the only colour in the "flat" and "ball" modes). */
  top: string;
  /** Colour the walls with this instead of the neutral walls (bands, chimney cap, rocket). */
  wall?: string;
  /** "block": tops + two-tone walls; "ball": two-tone sphere lit from the upper left; "flat": one colour. */
  mode?: "block" | "ball" | "flat";
  /** Lines drawn on the walls (courses, ribs) or on the top (grid), or along world X / Z (mullions, rollers). */
  stripes?: "none" | "courses" | "ribs" | "grid" | "xlines" | "zlines";
  spacing?: number;
  ribs?: number;
  line?: string;
  side?: THREE.Side;
};

const STRIPES = { none: 0, courses: 1, ribs: 2, grid: 3, xlines: 4, zlines: 5 } as const;
const MODES = { block: 0, ball: 1, flat: 2 } as const;

const vertexShader = /* glsl */ `
varying vec3 vWorld;
varying vec3 vLocal;
varying vec3 vNormalW;
void main() {
  vLocal = position;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const fragmentShader = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uLight;
uniform vec3 uDark;
uniform vec3 uLine;
uniform int uMode;
uniform int uStripes;
uniform float uSpacing;
uniform float uRibs;
varying vec3 vWorld;
varying vec3 vLocal;
varying vec3 vNormalW;

// 1 on the integer values of v, about one pixel wide whatever the zoom
float lineAt(float v) {
  float w = max(fwidth(v), 1e-4);
  float d = abs(fract(v - 0.5) - 0.5);
  return 1.0 - smoothstep(0.0, w * 1.1, d);
}

void main() {
  // flat normal from the screen derivatives (one colour per face, like the drawing), turned to the camera
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (dot(n, cameraPosition - vWorld) < 0.0) n = -n;
  bool up = n.y > 0.6;
  vec3 col;
  if (uMode == 2) {
    col = uTop;
  } else if (uMode == 1) {
    // spheres use the smooth normal: a clean crescent of shade, like the drawing's two circles
    col = dot(normalize(vNormalW), normalize(vec3(-0.55, 1.0, 0.45))) > 0.18 ? uTop : uDark;
  } else if (up) {
    col = uTop;
  } else {
    float h = length(n.xz) + 1e-5;
    col = (0.5 + 0.5 * (n.x - n.z) / (h * 1.41421)) > 0.55 ? uLight : uDark;
  }
  if (uStripes == 1 && !up) col = mix(col, uLine, lineAt(vWorld.y / uSpacing));
  if (uStripes == 2 && !up) col = mix(col, uLine, lineAt(atan(vLocal.z, vLocal.x) / 6.28318 * uRibs));
  if (uStripes == 3 && up) col = mix(col, vec3(1.0), max(lineAt(vWorld.x / uSpacing), lineAt(vWorld.z / uSpacing)) * 0.28);
  if (uStripes == 4) col = mix(col, uLine, lineAt(vWorld.x / uSpacing));
  if (uStripes == 5) col = mix(col, uLine, lineAt(vWorld.z / uSpacing));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const cache = new Map<string, THREE.ShaderMaterial>();

/** One material per look and theme, shared by every mesh that uses it. */
export function lookMaterial(look: Look, theme: ThemeName) {
  const key = `${theme}|${JSON.stringify(look)}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const s = SURFACES[theme];
  const mode = look.mode ?? "block";
  // the shaded tone: of the colour itself for spheres and flat panels, of the walls otherwise
  let dark: string = s.wallDark;
  if (mode === "ball" || mode === "flat") dark = shade(look.top, 0.86);
  else if (look.wall) dark = shade(look.wall, 0.86);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: look.side ?? THREE.FrontSide,
    uniforms: {
      uTop: { value: new THREE.Color(look.top) },
      uLight: { value: new THREE.Color(look.wall ?? s.wallLight) },
      uDark: { value: new THREE.Color(dark) },
      uLine: { value: new THREE.Color(look.line ?? (look.wall ? shade(look.wall, 0.8) : s.wallLine)) },
      uMode: { value: MODES[mode] },
      uStripes: { value: STRIPES[look.stripes ?? "none"] },
      uSpacing: { value: look.spacing ?? 1.5 },
      uRibs: { value: look.ribs ?? 24 },
    },
    // the rim lines sit exactly on the faces' edges: push the faces back a hair
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  cache.set(key, material);
  return material;
}
