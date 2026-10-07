import { introSteps } from "@/content/intro";

/**
 * The scroll timeline of the intro, shared by the HTML overlay and the 3D scene. `p` is the scroll
 * progress through the pinned section (0 at the top, 1 when it unpins).
 *
 *   0 ........ HERO_END  the hero (title, actions) over the whole scene
 *   HERO_END .. START    the title fades, the camera flies to the first station
 *   START ...... END     one equal slice per station: the camera holds on it, then travels to the
 *                        next one during the last TRAVEL of the slice (the step text switches at
 *                        mid-travel, so the words always match what is on screen)
 *   END ........ 1       the camera pulls back over the whole pipeline, then the page goes on
 */
export const STEPS = introSteps.length;
export const HERO_END = 0.05;
export const START = 0.12;
export const END = 0.92;
export const SLICE = (END - START) / STEPS;
/** Share of a slice spent travelling to the next station. */
export const TRAVEL = 0.35;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
export const between = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/** Start of station i's slice on the timeline. */
export const stepStart = (i: number) => START + i * SLICE;

/** Where the camera is: between station `from` and station `to` (eased t), -1 being the hero framing. */
export function track(p: number): { from: number; to: number; t: number } {
  if (p <= HERO_END) return { from: -1, to: -1, t: 0 };
  if (p < START) return { from: -1, to: 0, t: smooth(between(p, HERO_END, START)) };
  const i = Math.min(STEPS - 1, Math.floor((p - START) / SLICE));
  const leave = stepStart(i + 1) - TRAVEL * SLICE;
  if (i < STEPS - 1 && p > leave) return { from: i, to: i + 1, t: smooth(between(p, leave, stepStart(i + 1))) };
  return { from: i, to: i, t: 0 };
}

/** Step shown by the overlay (-1 during the hero) and the progress through it (0..1). */
export function stepAt(p: number): { index: number; local: number } {
  const { from, to, t } = track(p);
  const index = t >= 0.5 ? to : from;
  if (index < 0) return { index: -1, local: 0 };
  const enter = index === 0 ? (HERO_END + START) / 2 : stepStart(index) - (TRAVEL * SLICE) / 2;
  const exit = index === STEPS - 1 ? END : stepStart(index + 1) - (TRAVEL * SLICE) / 2;
  return { index, local: between(p, enter, exit) };
}
