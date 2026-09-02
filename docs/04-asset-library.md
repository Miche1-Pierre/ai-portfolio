# 04 — Asset Library

The real cost of this project is here. This is the precise, categorized list of
what to produce. **SVG-first** everywhere possible (scalable, tiny, animatable);
raster (PNG/WebP) only for textures and existing screenshots.

**Priority:** `P0` = needed for the Phase-2 vertical slice · `P1` = full v1 ·
`P2` = polish. **Format:** `SVG` unless noted.

---

## 4.1 Folder convention

```
public/assets/
  space/        stars, nebula, comets, satellites, generic planets
  ship/         exterior poses, cockpit interior, dashboard, controls, flame
  planets/      earth, ai, software, life-sciences, deep-space (glyph + full + detailed)
  environment/  per-planet surface structures (terminals, antennas, servers, flora…)
  ui/           HUD frames, buttons, panels, hotspot markers, icons, cursor, boot
  textures/     paper grain, star noise, graticule, vignette  (PNG/WebP)
  audio/        (optional, P2) ambient, sfx  (mp3/ogg, muted by default)
```

Naming: `kebab-case`, layered files keep named groups/ids for animation
(`#flame`, `#thruster-L`, `.twinkle`). Every SVG optimized with **SVGO** on export.

---

## 4.2 `space/` — the void

| Asset                    | Fmt | Notes / animation                            | Prio |
|--------------------------|-----|----------------------------------------------|------|
| starfield-far            | SVG | tiny stars, slowest parallax, `.twinkle`      | P0   |
| starfield-near           | SVG | larger stars, faster parallax                 | P0   |
| star-streaks             | SVG | elongated streaks for warp (2–3 density layers)| P0  |
| graticule-grid           | SVG | faint star-chart grid overlay                 | P0   |
| nebula-1 / nebula-2      | SVG | soft cloud shapes, very low opacity           | P1   |
| comet                    | SVG | with tail, occasional drift                   | P2   |
| satellite                | SVG | passes through foreground                      | P2   |
| planet-generic (×2–3)    | SVG | filler worlds for constellation depth         | P1   |

## 4.3 `ship/` — the vessel (the star of the show)

The ship recurs in many poses. **Best approach:** one **modular, rigged SVG** with
named parts (hull, nose, fins, cockpit-glass, thruster-L/R, flame, landing-gear)
so poses are transforms/variants rather than separate drawings.

| Asset                     | Fmt | Notes                                          | Prio |
|---------------------------|-----|------------------------------------------------|------|
| ship-exterior (rig)       | SVG | master rig; poses: orbit, liftoff, cruise, parked | P0 |
| flame / thrust            | SVG | animated (flicker, extend on burn); teal→amber | P0   |
| cockpit-interior          | SVG | the room for screen [3]; layered for depth     | P0   |
| dashboard / board panel   | SVG | the NAVIGATION board frame + slots             | P0   |
| window-frame              | SVG | cockpit window (holds the planet view)         | P0   |
| controls: buttons/dials/levers | SVG | set of ~8 readout & control widgets        | P0   |
| landing-gear              | SVG | for parked pose                                | P1   |
| ship-shadow / glow        | SVG | grounding + lit state                          | P1   |

## 4.4 `planets/` — the five destinations

Each planet needs **three fidelities**: `glyph` (constellation node, ~tiny),
`full` (approach/board window), `detailed` (arrival/surface, with line-art detail
that can stroke-draw in).

| Planet         | glyph | full | detailed | tint          | Prio |
|----------------|:-----:|:----:|:--------:|---------------|------|
| 🌍 Earth        | ✔ | ✔ | ✔ | soft blue/green | P0 |
| 🛠 Software      | ✔ | ✔ | ✔ | steel/teal      | P0 |
| 🤖 AI           | ✔ | ✔ | ✔ | magenta/violet  | P0 |
| 🧬 Life Sciences | ✔ | ✔ | ✔ | bio-green/amber | P1 |
| 🛰 Deep Space    | ✔ | ✔ | ✔ | indigo/ice      | P1 |

→ 15 planet drawings total (3 × 5). P0 for the slice: **Earth + AI** (2 planets × 3 = 6).

## 4.5 `environment/` — surface structures (per planet)

Each exploration surface needs **3–4 signature structures** (the interaction
points) + light decor. All in the shared ink hand.

| Planet         | Structures (interaction points)                              | Prio |
|----------------|--------------------------------------------------------------|------|
| Earth          | profile monument, journey path/timeline post, CV kiosk        | P0   |
| Software        | architecture pylon, stack server-rack, security vault         | P1   |
| AI             | AI console tower, data relay/antenna, capability station      | P0   |
| Life Sciences   | bio-dome, DNA/lab node, bridge span (software↔bio)            | P1   |
| Deep Space      | docking bays for Taskforce / Brain OS / Plania (mini-stations)| P1   |
| shared decor    | rocks, struts, dust, small flora, cabling, ground line        | P1   |

## 4.6 `ui/` — the HUD & chrome

| Asset                         | Fmt | Notes                                  | Prio |
|-------------------------------|-----|----------------------------------------|------|
| hud-frame (corners, hairlines)| SVG | diegetic frame around scenes           | P0   |
| board readouts (LOCATION/DEST/DIST/ETA) | SVG | slot components               | P0   |
| launch-button (armed/idle)    | SVG | amber, pulsing when armed              | P0   |
| hotspot marker                | SVG | resting hint + hover/active states     | P0   |
| skip / back / starmap buttons | SVG | persistent nav affordances             | P0   |
| icons set                     | SVG | nav/info/contact/project (extend `lucide-react`) | P0 |
| progress / transit bar        | SVG | boot + travel                          | P0   |
| cursor / reticle              | SVG | custom pointer (optional)              | P2   |
| boot-screen type              | — | CSS/JS only                              | P1   |
| command-palette (Cmd+K)       | — | UI component, not art                    | P1   |

## 4.7 `textures/`

| Asset            | Fmt  | Notes                               | Prio |
|------------------|------|-------------------------------------|------|
| paper-grain      | WebP | 5–8% overlay, global "surface"      | P1   |
| star-noise       | WebP | subtle backdrop grain               | P1   |
| vignette         | SVG/CSS | soft edge darkening              | P1   |

## 4.8 `audio/` (optional, P2 — muted by default, user-toggle)

ambient-hum (loop) · button-click · hotspot-hover · launch-rumble · warp-whoosh ·
arrival-chime. **Never autoplay with sound**; a HUD toggle enables it.

---

## 4.9 Reuse map — what we already have

Don't redraw what exists. Wire these in:

| Existing repo asset/component        | Becomes                                   |
|--------------------------------------|-------------------------------------------|
| `ChatBot.tsx`                        | 🖥 the ship's **AI console** ([3]/[7-AI])  |
| `ContactForm.tsx`                    | 📡 the **antenna / comms uplink**          |
| `FloatingBadgeCloud.tsx`             | asteroid/badge field or skills cluster    |
| `about/Experience`, `Education`      | 🗂 the **experience panel**                |
| `work/ProjectCard`                   | ⌨️ **terminal** project entries / docking bays |
| `about/CertificationCard/Grid`       | mission badges / medals                    |
| `public/images/profile.png`          | Earth profile monument portrait           |
| `public/images/projects/**`          | screenshots inside project docking bays    |
| `Badge`, `Button`, `Card`, `Input`…  | restyle to HUD components                  |
| Space Mono font, `#45d8ac` teal      | keep — they anchor the HUD identity        |

## 4.10 Production approach

- **Tooling:** vector in Figma / Illustrator / Inkscape; or AI-assisted generation
  (SVG or raster→traced) *then normalized by hand* to one stroke system. Consistency
  of the ink hand matters more than any single asset's detail.
- **Constraints:** uniform stroke weight, round caps, limited palette (tokens from
  [02](./02-art-direction.md)), named layers/ids, artboards sized in a shared grid.
- **Export:** SVGO (strip metadata, keep ids), viewBox not fixed width/height,
  currentColor where a part should inherit theme colour.
- **Budget:** total SVG payload target < ~250KB gzipped for the initial route;
  heavy surfaces lazy-loaded per destination.

## 4.11 Minimum Viable Asset set (Phase-2 slice)

To validate the whole flow end-to-end with real (if minimal) art, produce **only** these:

```
P0-SLICE (≈ 14 assets):
  space/     starfield-far, starfield-near, star-streaks, graticule-grid
  ship/      ship-exterior(rig), flame, cockpit-interior, board-panel, window-frame, controls
  planets/   earth (glyph+full+detailed), ai (glyph+full+detailed)   ← 2 planets only
  ui/        hud-frame, launch-button, hotspot, skip/back/starmap, transit-bar
```

Everything else (Software / Life Sciences / Deep Space planets & surfaces, nebulae,
comets, audio, textures) is added in the art pass **after** the concept is proven.

### Grand total (full v1, excl. audio): ~70–85 SVGs

| Category     | ~count | of which P0 |
|--------------|:------:|:-----------:|
| space        | 10     | 4           |
| ship         | 8      | 6           |
| planets      | 15     | 6 (Earth+AI)|
| environment  | 18     | 3           |
| ui           | 12     | 8           |
| textures     | 3      | 0           |
| **total**    | **~66**| **~27**     |

This is the number that determines the timeline. It is achievable, but it is the
work — plan art production as a first-class track, not an afterthought.
