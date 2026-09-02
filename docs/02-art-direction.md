# 02 — Art Direction

## 2.1 The tension to resolve first

Two aesthetics are on the table, and they pull in opposite directions:

- **A. "Explorer's field notebook"** — hand-drawn ink, pencil, lightly textured
  paper, few colours, imperfect lines, a scientific/exploration-log feel.
  *(Your proposal. Warm, human, distinctive.)*
- **B. "Cockpit HUD / retro-terminal"** — dark ground, glowing monospace, thin
  rules, dials and readouts. *(What the repo already leans toward: Space Mono,
  dark mode, `#45d8ac` teal.)*

### ⭐ Recommendation: the fusion — **"Star-Chart Blueprint"**

Hand-inked line-art (planets, ship, decor) drawn like an **astronomer's
notebook**, laid over a **deep space-navy** ground with a faint **graticule /
star-chart grid**, and a **cockpit-HUD UI layer** (monospace readouts, thin
teal/amber rules). 

Why this one:
- It **keeps** what the repo already has (Space Mono, dark ground, teal accent) → less rework.
- It **honours** the hand-drawn idea (the line-art *is* hand-inked).
- It reads unmistakably as **"scientific exploration console"** — perfect for a SWE→AI engineer with a life-sciences thread.
- Ink line-art survives on a dark ground beautifully (white/teal ink on navy), and SVG line-art is trivial to animate (stroke-draw, dash, glow).

> **DECISION #1 for Pierre** (see [07](./07-roadmap-and-open-questions.md)):
> confirm Fusion, or choose pure-A (light paper) or pure-B (dark HUD).
> Everything below assumes the fusion; the palette has a light-paper variant ready.

## 2.2 Palette (tokens)

Dark ground is primary. A light "paper" surface is used for notebook overlays / print-outs.

```
--space-void      #0A0E14   deep navy-black       page ground
--space-deep      #10151F   panels / cards
--space-line      #1E2A3A   grid / graticule / hairlines
--ink             #E8ECF1   primary "ink" (near-white)      text & line-art
--ink-dim         #8A97A8   secondary text / muted line-art
--accent-teal     #45D8AC   PRIMARY: active, console, links (kept from repo)
--accent-amber    #F5B23E   SECONDARY: launch, warnings, energy
--accent-magenta  #C86FE9   tertiary/AI accent (sparingly — AI planet)
--paper           #F4EFE3   light notebook surface (overlays, CV print-out)
--paper-ink       #232019   ink on paper
```

Rules: **one accent per context.** Teal = "system nominal / interactive."
Amber = "energy / caution / launch." Magenta appears essentially only on the AI
planet. Never use all three at once in one view.

Per-planet tint (a single hue shift over the shared grammar, for a sense of place):

| Planet        | Tint            | Feeling                    |
|---------------|-----------------|----------------------------|
| Earth         | soft blue/green | familiar, home             |
| Software      | steel / teal    | precise, structural        |
| AI            | magenta/violet  | electric, forward          |
| Life Sciences | bio-green/amber | organic, warm              |
| Deep Space    | indigo / ice    | vast, quiet                |

## 2.3 Typography

- **Space Mono** (already loaded) — HUD, readouts, data, labels, body. It carries the "console" voice.
- **One display face** for planet names / big titles — a condensed or slightly
  hand-drawn face for character (e.g. a geometric condensed, or a marker/ink
  face). *Budget: max ONE extra family, `font-display: swap`, subset to Latin.*
- Numerals as **tabular** in HUD readouts (DISTANCE / ETA don't jitter).

## 2.4 The parallax model (formalized)

Depth = speed. Every scene is built from these planes, back to front:

```
plane            parallax   contents
──────────────────────────────────────────────────────────
backdrop          0.10x     deep gradient, faint nebula
starfield-far     0.30x     tiny slow stars, graticule grid
planet / midfield 0.60x     the planet, distant structures
ship / subject    1.00x     the vessel, the focus of the scene
foreground        1.50x     decor: struts, dust, a passing satellite
UI / HUD          fixed     board, readouts, hotspot markers (no parallax)
```

Movement drivers: pointer position (subtle tilt), scroll (on exploration
surfaces), and scripted timelines (launch/travel). Amplitude is **small and
weighty** — a ship has mass; nothing snaps.

## 2.5 Line & texture

- **Line-art:** 1.5–2px ink strokes, *slightly* wobbly (hand-drawn), consistent
  stroke weight across every asset. Round caps/joins. This consistency is what
  makes the set feel like one hand.
- **SVG-first**, always, wherever possible → infinite scale, tiny payload,
  animate stroke/fill/glow directly with CSS/GSAP.
- **Texture:** a subtle paper-grain / film-grain overlay (5–8% opacity), a faint
  star-chart graticule, and a soft vignette. Applied globally, cheaply (one
  fixed overlay), so the whole site shares a "surface."
- **Glow:** thin outer glow on active/teal elements (feels like a lit readout).
  Used sparingly; glow is a state, not decoration.

## 2.6 Motion feel

- **Calm, weighty, eased.** Default ease: custom cubic (slow-in, slower-out).
  No bounce, no cartoon squash (the repo's `float-bounce` gets retired for hero elements).
- **Idle life:** everything breathes — stars twinkle, the flame flickers, a dial
  drifts, an antenna blinks. Small amplitudes, desynchronized, so a static screen
  still feels alive.
- **The cinematics** (launch/travel) are the *only* big, scripted moments — and
  they are always skippable.
- **Respect `prefers-reduced-motion`:** idle life reduces to near-zero, cinematics
  become instant cross-fades. (See [05](./05-architecture.md).)

## 2.7 Do / Don't

**Do**
- Keep one consistent ink hand across all assets.
- Let negative space breathe (space is mostly empty — lean into it).
- Make interactivity legible: hotspots have a clear resting hint + hover state.
- Treat the HUD as diegetic (part of the ship), not a floating web navbar.

**Don't**
- Mix illustration styles (no photo + flat + hand-drawn salad).
- Use more than one accent colour per view.
- Animate for its own sake — every motion answers "what does this tell the user?"
- Let decoration compete with the readable content.
