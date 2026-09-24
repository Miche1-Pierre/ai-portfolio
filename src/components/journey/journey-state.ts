import * as THREE from "three";

/** Repères partagés par la scène et ses décors (eau, prairie, nuages, soleil). */
export const UP = new THREE.Vector3(0, 1, 0);

/** Blender (Z up) -> three.js (Y up) : (x, y, z) -> (x, z, -y). */
export const toThree = ([x, y, z]: readonly number[]) => new THREE.Vector3(x, z, -y);

export const smoothstep = (v: number, a: number, b: number) => {
  const t = THREE.MathUtils.clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** État partagé du rover (écrit par <Rover>, lu par l'atmosphère, les traces, les particules). */
export const roverState = {
  s: 0,
  speed: 0,
  altitude: 0,
  position: new THREE.Vector3(),
  forward: new THREE.Vector3(1, 0, 0),
  right: new THREE.Vector3(0, 0, 1),
};

/** Lumière courante (écrite par <Atmosphere> à chaque image) : direction VERS le soleil, couleurs
 *  du soleil, du ciel et de la brume, élévation en degrés. Lue par l'eau, le soleil, les nuages. */
export const lookState = {
  sunDir: new THREE.Vector3(0.5, 0.5, -0.7).normalize(),
  sun: new THREE.Color("#ffd2a1"),
  sky: new THREE.Color("#c9d8e8"),
  fog: new THREE.Color("#c9d8e8"),
  elevation: 20,
  intensity: 2.5,
  fogNear: 35,
  fogFar: 260,
};
