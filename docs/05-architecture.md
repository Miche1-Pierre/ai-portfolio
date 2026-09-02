# 05 — Architecture

## 5.1 Guiding principle (repeat, because it decides everything)

> **Progressive enhancement.** A real, routed, server-rendered, accessible
> portfolio is the substrate. The space-OS travel layer is an enhancement on top.

Concretely: strip all JS and you still have a clean five-page portfolio that
Google indexes and a screen reader reads. Add JS and those page transitions
become cinematic journeys. This is what separates "a differentiating experience"
from "an inaccessible tech demo."

## 5.2 Routing strategy — **routed destinations** (recommended)

Each destination is a **real Next.js App Router route**:

```
/                  → Constellation (star map) + entry to the ship
/earth             → WHO AM I        (today's /about content, upgraded)
/software          → WHAT I BUILD
/ai                → WHERE I'M GOING
/life-sciences     → WHY
/projects          → PROJECTS (Deep Space)   (today's /work, upgraded)
```

- **SSR content** on every route → crawlable, shareable, deep-linkable, fast FCP.
- In-session navigation between routes is intercepted by a client **`TravelProvider`**
  that plays the launch/travel/arrival cinematic, then completes the route change.
- Direct hits (someone lands on `/ai` from Google) **skip straight to Arrival** —
  no forced launch from Earth.

> **DECISION #2:** routed (recommended) vs single-page client canvas.
> Single-page is simpler state but sacrifices SEO, deep-links, and no-JS. For a
> job-seeking portfolio where recruiters share links and crawlers matter, **routed wins.**

### Transition mechanism

Two viable implementations (pick at Phase 1):
- **Next.js View Transitions** (`unstable_ViewTransition` / the App Router
  view-transition support) + GSAP for the scripted beats. Cleanest with routing.
- **Framer Motion `AnimatePresence`** over a shared layout with route content as
  children, GSAP for the cinematic timelines.

Either way: **GSAP owns the 3–5s cinematic timelines**; **Framer owns component
enter/exit and micro-interactions**.

## 5.3 The navigation state machine

```ts
// src/lib/navigation/types.ts
export type Destination =
  | "earth" | "software" | "ai" | "life-sciences" | "deep-space";

export type FlightPhase =
  | "idle"        // at a destination / on the board
  | "arming"      // launch pressed, board confirms
  | "launching"   // [4] cinematic
  | "traveling"   // [5] warp + preload
  | "arriving"    // [6] decelerate
  | "explored";   // [7] surface interactive

export interface Planet {
  id: Destination;
  route: `/${string}`;
  title: string;          // "AI PLANET"
  question: string;       // "WHERE I'M GOING"
  au: number;             // fake orbital distance for DIST/ETA flavour
  tint: string;           // palette token
}
```

```ts
// orchestration (simplified)
async function travelTo(dest: Destination, opts?: { instant?: boolean }) {
  if (dest === current) return;
  if (opts?.instant || prefersReducedMotion || hasVisited(dest)) {
    return router.push(planet(dest).route);        // fast path
  }
  setPhase("arming");     await beat(400);
  setPhase("launching");  await launchTimeline();   // GSAP, skippable
  setPhase("traveling");  await Promise.all([warpTimeline(), preload(dest)]);
  setPhase("arriving");   await arrivalTimeline();
  router.push(planet(dest).route);                  // commit the route
  setPhase("explored");
  markVisited(dest);
}
```

- **Skip** rejects the current timeline's promise and jumps to `arriving`/route-commit.
- `prefersReducedMotion`, `hasVisited`, and a global "cinematics off" toggle all
  route through the same fast path — one guard, many triggers.
- State lives in a light context/store (`zustand` or React context). No heavy state lib needed.

## 5.4 Library decisions

| Library                | Role                                              | Verdict |
|------------------------|---------------------------------------------------|---------|
| **Framer Motion**      | component enter/exit, layout, micro-interactions, `AnimatePresence` | ✅ add |
| **GSAP** (+ timeline)  | the launch/travel/arrival cinematics; precise beat sequencing | ✅ add |
| **SVG + CSS + Canvas** | ship, planets, parallax, starfields, idle life    | ✅ core |
| **React Three Fiber / Three.js** | ONE optional hero moment (e.g. a real 3D warp or planet) | ⚠️ P2, default OFF |
| **zustand** (optional) | flight state store                                | ✅ small |

**Rule for R3F:** do not reach for 3D until a 2.5D SVG/canvas version exists and
is proven insufficient. If added, it's lazy-loaded, one scene, behind a capability
check, with an SVG fallback. 3D everywhere is how this project dies.

## 5.5 Performance budget

- **Initial route JS** (Constellation): keep interactive < ~150KB gz; defer GSAP/scene code.
- **Code-split per destination**: each surface + its assets loads on travel, not upfront.
- **Preload during travel**: the warp screen ([5]) is *literally* the destination's
  loader — use it. Prefetch the likely next planet on board hover.
- **No CLS**: reserve space for scenes; SVGs have intrinsic viewBox ratios.
- **Images**: `next/image` for screenshots; SVG inline or via `<img>`/symbol sprites.
- **Keep the Lighthouse script green** (`npm run analyze` already targets SEO + a11y).
  Add a perf budget check to CI (GitHub Actions — already in the skill set).

## 5.6 Accessibility (non-negotiable)

- `prefers-reduced-motion: reduce` → no cinematics (instant route), idle life ≈ off,
  no parallax jitter, no screen-shake.
- **Keyboard**: the board, hotspots, star nodes are real buttons/links; full tab
  order; visible focus rings; `Esc` closes panels; `Enter`/`Space` activate.
- **Screen readers**: scenes are decorative (`aria-hidden`); content panels are
  semantic (`<section>`, headings, lists). Each interaction point has a real label.
- **Focus management**: on arrival, move focus to the surface's `<h1>`.
- **A "Skip the cinematics" preference** persists (localStorage), plus a global
  "Reduce experience" toggle in the HUD.
- **Command palette (Cmd/Ctrl+K)** = instant access to any destination for anyone.

## 5.7 SEO (must not regress)

- Per-route `metadata` (title/description/OG) via App Router + existing `next-seo`.
- Real headings & copy server-rendered on every route (content is NOT locked behind JS).
- `next-sitemap` keeps the sitemap (already wired) — add the new routes.
- OG image per planet (nice-to-have) or keep the global `og-image.png`.
- Structured data (`Person` JSON-LD) on `/earth` for the profile.

## 5.8 Proposed folder structure

```
src/
  app/
    layout.tsx                 # HUD shell + providers + fonts
    page.tsx                   # [1] Constellation
    earth/page.tsx             # [7] surfaces … (software, ai, life-sciences, projects)
    software/page.tsx
    ai/page.tsx
    life-sciences/page.tsx
    projects/page.tsx
    not-found.tsx              # "lost in space" 404 (theme the existing one)
  scenes/                      # cinematic scene components
    Boot/  Constellation/  Cockpit/  Launch/  Travel/  Arrival/
  components/
    space/                     # Ship, Planet, Starfield, Hotspot, Board, Hud…
    ui/                        # restyled Button/Badge/Card/Input as HUD parts
    panels/                    # Console(ChatBot), Antenna(ContactForm), Terminal, ExperiencePanel
  content/                     # TYPED data (replaces the const.tsx sprawl)
    profile.ts  experience.ts  projects.ts  skills.ts  planets.ts
  lib/
    navigation/                # types, store, travelTo, guards
    motion/                    # GSAP timelines, framer variants, reduced-motion
public/assets/…                # (see 04)
```

## 5.9 Data model cleanup

Today content lives in `src/app/const.tsx` (mixed JSX + data, and outdated). Move to
**typed `src/content/*.ts`** modules — separates content from presentation, makes the
CV migration a data edit, and lets the same data feed multiple scenes. (Details &
the actual content in [06](./06-content-and-copy.md).)

## 5.10 Testing & CI

- **Build must stay green** (`next build`) at every step.
- **Playwright** (in your skill set) smoke tests: each route renders content with JS
  disabled; the fast-path nav works; `Esc` closes panels; reduced-motion path loads.
- **Lighthouse** budget in GitHub Actions to catch SEO/perf/a11y regressions early.
