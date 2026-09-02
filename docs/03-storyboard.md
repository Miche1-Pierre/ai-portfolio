# 03 — Storyboard (screen by screen)

This is the heart of the spec: every screen, its layout, its interaction points,
how you enter and leave it, its states, and its reduced-motion fallback.

**Legend:** `P0` = must exist for the concept to work · `P1` = important ·
`P2` = polish. Each screen lists the **assets** it needs (detailed in [04](./04-asset-library.md)).

---

## Flow overview

```
  [0] BOOT ──▶ [1] CONSTELLATION ──select──▶ [2] APPROACH ──▶ [3] COCKPIT / BOARD
                     ▲                                                │
                     │                                          set DESTINATION
                     │                                                │ LAUNCH
                     │                                                ▼
                     │                                        [4] LAUNCH SEQUENCE
                     │                                                ▼
                     │                                          [5] TRAVEL / WARP
                     │                                                ▼
              (star map btn)                                     [6] ARRIVAL
                     │                                                ▼
                     └────────────────────────────────────── [7] EXPLORATION / DATA
                                                                     │
                                          (interaction points: console, window,
                                           terminal, panel, antenna, decor)
```

**Global navigation:** a persistent HUD affords two escape hatches at all times —
`◉ STAR MAP` (back to [1]) and `⌂ BOARD` (back to [3]). You are never trapped in a
scene. There is also a hidden **"warp direct"**: `Cmd/Ctrl+K` command palette to
jump to any destination instantly (power-user / recruiter-in-a-hurry path).

---

## [0] BOOT / Preloader `P1`

**Goal:** cover initial asset load; set the tone in 1.5s; never block > 3s.

```
┌───────────────────────────────────────────────┐
│                                               │
│   PIERRE MICHEL // FLIGHT SYSTEMS             │
│                                               │
│   > booting navigation core .......... OK     │
│   > loading star charts ............... OK     │
│   > calibrating thrusters ............. OK     │
│   > uplink to ground control .......... OK     │
│                                               │
│              [ ▓▓▓▓▓▓▓▓░░ 82% ]                │
│                                               │
└───────────────────────────────────────────────┘
```

- Typed monospace boot lines (teal), a progress bar tied to real asset preload.
- Auto-advances to [1] when core assets are ready **or** after a 3s cap (whichever first).
- **Assets:** none (pure type + CSS). **Reduced-motion:** show static "SYSTEM READY" + button.
- **Skippable:** click anywhere to skip once assets are ready.

---

## [1] CONSTELLATION — home / star map `P0`

**Goal:** the landing screen. Present the five destinations as stars in a
constellation; invite selection. This is the "hero."

```
        ·   .        ✦ SOFTWARE                      ·
   ·          ·          \                 ·
        ✦ EARTH ──────────★ (you are here marker)         ·
          \              /        \                    ·
     ·      \           /          ✦ AI            ·
             \         /            |          .
        ·     ✦ LIFE SCIENCES       |     ·
                        \           |                 ·
             ·           ✦ DEEP SPACE          ·   .
   ┌─────────────────────────────────────────────────────┐
   │  PIERRE MICHEL   Full-Stack Software Engineer · AI   │  ← title, small
   │  ◉ SELECT A DESTINATION            [about] [contact] │  ← HUD footer
   └─────────────────────────────────────────────────────┘
```

- Five **star nodes**, connected by faint constellation lines, gently drifting
  (parallax on pointer). Each node = a planet label + glyph.
- **Hover a node:** it brightens, its constellation lines light up, a small
  readout appears (`EARTH · WHO AM I · 0.00 AU`). Micro-sound (optional).
- **Click a node → [2] Approach.**
- A subtle **"you are here"** marker sits near Earth on first load.
- Title + minimal HUD footer with quick links (`about`, `contact`) that also work
  as plain links (progressive enhancement — these are real anchors).

**Interaction points:** the 5 nodes (+ optional 6th hidden node = easter egg / "???").
**Assets:** starfield (far/near), 5 planet glyphs (small), constellation lines, HUD footer frame, cursor.
**States:** idle drift · node-hover · node-selected (brief pulse before transition).
**Reduced-motion / no-JS:** the constellation renders static; nodes are a plain
`<nav>` list of links to each destination route. **Fully usable as a menu.**

---

## [2] APPROACH / Orbit `P1`

**Goal:** a 1–2s bridge — you fly toward the chosen planet and settle into orbit,
with your ship entering frame. Gives context ("this is the place") before the hub.

```
                                        ___
                              ____     /   \
        ·        ·           /    \   | AI  |     ·
                            |  🚀  |   \___/
                             \____/       ▲ the planet grows,
                               ▲          ship glides toward orbit
                          your vessel
   ┌─────────────────────────────────────────────────────┐
   │  APPROACHING · AI               ◉ STAR MAP   ⌂ BOARD │
   └─────────────────────────────────────────────────────┘
```

- Camera pushes in; the selected planet scales up from a node into a world;
  the **ship** slides in from the edge and levels off into orbit.
- Per-planet tint takes over the palette here (see [Art Direction §2.2](./02-art-direction.md)).
- **Auto-advances to [3] Cockpit** (or click to speed through).
- **Assets:** the selected planet (full), ship (exterior, orbit pose), starfield, tint overlay.
- **Reduced-motion:** cross-fade straight from [1] to [3]; skip the fly-in.
- **Note:** [2] can be merged into the *entry* of [3] to save a beat. Kept separate
  here for clarity; final call at Phase 2.

---

## [3] COCKPIT / NAVIGATION BOARD — the HUB `P0`

**Goal:** the single most important screen. The interior of the ship. The **board**
is the central navigation instrument *and* the launch pad. Also the room where the
interaction points live.

```
   ┌──────────────────────── COCKPIT ─────────────────────────┐
   │   🪟 window (view of current planet) ......  🖥 console   │
   │   ┌───────────────────────────────────────────────────┐  │
   │   │                 NAVIGATION                        │  │
   │   │                                                   │  │
   │   │   CURRENT LOCATION        AI ORBIT                │  │
   │   │                                                   │  │
   │   │   DESTINATION        ┌──────────────────┐         │  │
   │   │                      │   ◄  EARTH   ►    │        │  │  ◄ ► cycles planets
   │   │                      └──────────────────┘         │  │
   │   │                                                   │  │
   │   │   DISTANCE   1.00 AU        ETA   00:04           │  │
   │   │                                                   │  │
   │   │                 [  LAUNCH  ]                      │  │  ← amber, armed
   │   └───────────────────────────────────────────────────┘  │
   │   ⌨️ terminal        🗂 panel        📡 antenna           │
   └───────────────────────────────────────────────────────────┘
```

**The board (center):**
- `CURRENT LOCATION` = where you are. `DESTINATION` = a selector you cycle with
  `◄ ►` (or the star map). `DISTANCE` / `ETA` are computed from a simple fake
  orbital table (flavour, but consistent).
- **`LAUNCH`** button is *armed* (amber, pulsing) only when destination ≠ current.
  Press → **[4] Launch Sequence**.

**The interaction points (the "several things to click"):**

| Marker      | Click reveals                                   | Backed by                    | Priority |
|-------------|-------------------------------------------------|------------------------------|----------|
| 🖥 Console   | **AI assistant** — ask about Pierre / the work  | `ChatBot.tsx` (repurposed)   | P0       |
| 🪟 Window    | Cinematic view of current planet + one fact      | new                          | P1       |
| ⌨️ Terminal  | **Projects** list (jumps to Deep Space or inline)| `work/ProjectCard`           | P0       |
| 🗂 Panel     | **Experience / timeline**                        | `about/Experience`,`Education`| P1       |
| 📡 Antenna   | **Contact** (comms uplink)                       | `ContactForm.tsx`            | P0       |
| 🎚 Decor     | Easter eggs (dev console log, konami, a joke)    | new                          | P2       |

Each interaction opens as a **diegetic panel** (a screen inside the cockpit slides
up / a HUD overlay), not a route change — so you stay "in the ship." `Esc` closes.

**States:** idle (breathing dials) · hotspot-hover (label + glow) · panel-open
(dimmed cockpit behind) · launch-armed.
**Assets:** cockpit interior, window frame + planet view, board panel, dials/readouts,
6 hotspot markers, launch button, console/terminal/antenna props.
**Reduced-motion / no-JS:** the board becomes a plain sectioned page — the six
interaction points become **real headings/links** (`#console`, `#projects`,
`#experience`, `#contact`…). The cockpit is decoration around a normal page.

---

## [4] LAUNCH SEQUENCE `P0` (the signature cinematic)

**Goal:** 3–5s of "we are going somewhere." Scripted GSAP timeline. **Always skippable.**
Broken into timed beats:

```
 t=0.0s  ARM        board flips to "LAUNCH CONFIRMED", amber wash, low rumble
 t=0.4s  IGNITION   thrusters light; cockpit shudders (screen-shake, small)
 t=0.9s  RELEASE    camera pulls OUT of the cockpit → exterior of the ship
 t=1.4s  LIFTOFF    ship detaches from orbit, nose swings to the destination vector
 t=2.0s  BURN       flame extends, ship accelerates, stars begin to streak
 t=2.8s  PUNCH      speed lines converge → hard cut / flash into [5] TRAVEL
```

```
   cockpit view                exterior view                 warp entry
   ┌───────────┐               ✦   \  |  /   ✦              ✦──────────
   │ CONFIRMED │   ──pull──▶     🚀───────▶      ──burn──▶   ═════▶  ✦
   │  ▓▓▓▓▓▓▓  │   out           /  |  \                    ──────────
   └───────────┘              streaking stars                streak field
```

- **Camera choreography** is the star: interior → exterior → chase → warp. Small
  screen-shake at ignition (respect reduced-motion). Amber energy throughout.
- **Skip control** visible the whole time (`Skip ▸` bottom-right, `Esc`). Skipping
  jumps straight to [6] Arrival.
- **First trip = full 3–5s. Repeat trips = compressed to ~1.2s** (people don't want
  to rewatch). Store "has launched before" in state.
- **Assets:** ship exterior (multi-pose or riggable SVG), flame/thrust (animated),
  cockpit shudder frame, speed-lines/streak field, amber overlays.
- **Reduced-motion:** replace entirely with a 300ms cross-fade + a static "IN TRANSIT" card.

---

## [5] TRAVEL / WARP `P0`

**Goal:** the interstellar interstitial. Covers loading of the destination surface.
Duration is **honest**: it lasts as long as the next scene needs to preload (min
0.8s, max ~3s), shown as a real ETA/progress.

```
        ✦        ─────────────────✦────────────────        ✦
   ─────────────────────────────────════▶  🚀  ────────────────────
        ✦     ────────────✦──────────────           ─────✦
   ┌─────────────────────────────────────────────────────┐
   │  IN TRANSIT · EARTH ▸ AI     DISTANCE 0.31 AU  ETA 00:02  Skip ▸ │
   └─────────────────────────────────────────────────────┘
```

- Star streaks flowing past; ship small and steady at center; ETA ticking down.
- **Doubles as the asset preloader** for [6]/[7] — the "distance" bar = real load progress.
- Optional: a one-line "flavour telemetry" ticker (`> recalibrating for AI orbit…`).
- **Assets:** streak field (layered), ship (cruise pose), HUD transit bar.
- **Reduced-motion:** static "IN TRANSIT" card with a determinate progress bar.

---

## [6] ARRIVAL `P0`

**Goal:** decelerate, the destination planet fills the frame, the ship parks. Mirror
of [2] Approach, inbound. 1–1.5s.

```
                          _________
                        /           \
                       |             |
        🚀 ────▶       |   AI PLANET |        ← planet resolves, surface detail fades in
      ship parks       |             |
        into orbit      \___________/
   ┌─────────────────────────────────────────────────────┐
   │  ARRIVED · AI PLANET            ◉ STAR MAP   ⌂ BOARD │
   └─────────────────────────────────────────────────────┘
```

- Warp streaks collapse back into points; the planet grows and gains surface detail
  (line-art details draw in via stroke animation); ship eases to a parked pose.
- Per-planet ambience/tint is now fully in effect.
- **Auto-advances / eases into [7] Exploration** (they share the frame; [7] is [6]
  with the content surfaced).
- **Assets:** destination planet (detailed), ship (parked pose), surface reveal layers.
- **Reduced-motion:** planet appears already-resolved; no draw-in.

---

## [7] EXPLORATION / DATA — the destination surface `P0`

**Goal:** where the actual portfolio content lives. Each planet is a **place with
interaction points**, echoing the cockpit model. Same grammar, different content &
tint per planet. This is a real route (e.g. `/ai`) so it's crawlable & shareable.

Generic surface layout (specialized per planet):

```
   ┌───────────────── AI PLANET · WHERE I'M GOING ─────────────────┐
   │  🚀 (parked ship, small)                        ◉ STAR MAP    │
   │                                                               │
   │     ▨ STATION            ⌨ TERMINAL           📡 RELAY        │
   │   "what I do in AI"    "shipped AI systems"   "let's talk"    │
   │                                                               │
   │     ~~~ surface line-art: antennas, servers, data towers ~~~  │
   │  ─────────────────────────────────────────────────────────── │
   │  ⌂ BOARD   ◄ prev planet            next planet ►             │
   └───────────────────────────────────────────────────────────────┘
```

- **Interaction points on the surface** reveal content panels (diegetic overlays or
  in-place expansion). Content per planet is drafted in [06 — Content & Copy](./06-content-and-copy.md).
- You can **walk the neighbourhood** (`◄ prev / next ►` cycles planets *without* a
  full launch — a quick pan) or `⌂ BOARD` / `◉ STAR MAP` to re-navigate.
- Scroll is allowed here for long content (experience, project detail) with light
  parallax — but the *first viewport* is the illustrated scene.

### The five surfaces (specialization)

| Planet         | Signature interaction points                                             |
|----------------|--------------------------------------------------------------------------|
| 🌍 Earth        | **Profile card**, **journey timeline**, **CV print-out** (download), languages, availability |
| 🛠 Software      | **Architecture diagram** (line-art), **stack readouts**, **security/compliance panel** |
| 🤖 AI           | **AI console** (ChatBot), **shipped-systems terminal**, **capabilities station** |
| 🧬 Life Sciences | **The "why" log** (narrative), **cross-domain bridge diagram**, lab/research nodes |
| 🛰 Deep Space    | **Project docking bays**: Taskforce, Brain OS, Plania (+ archive) as ships/stations |

**Assets:** per-planet surface set (3–4 structures each), planet-specific decor,
content panels/overlays, the parked ship.
**Reduced-motion / no-JS:** each surface degrades to a clean, scrollable content
page with headings & links (the illustration becomes a static banner). **This is
the real, SEO-indexed portfolio** underneath the experience.

---

## Screen → priority → asset summary

| Screen              | Prio | Key new assets                                    |
|---------------------|------|---------------------------------------------------|
| [0] Boot            | P1   | (type + CSS only)                                 |
| [1] Constellation   | P0   | starfield, 5 glyphs, lines, HUD frame, cursor     |
| [2] Approach        | P1   | planet (full) ×5, ship (orbit)                    |
| [3] Cockpit/Board   | P0   | cockpit interior, board, dials, 6 hotspots, window|
| [4] Launch          | P0   | ship exterior, flame, streaks, amber FX           |
| [5] Travel          | P0   | streak field, ship (cruise), transit HUD          |
| [6] Arrival         | P0   | planet (detailed) ×5, ship (parked)               |
| [7] Exploration ×5  | P0   | 5 surface sets (3–4 structures each), panels      |

Full breakdown and counts → **[04 — Asset Library](./04-asset-library.md)**.
