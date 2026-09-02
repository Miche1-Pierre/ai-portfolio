# 01 — Concept & Scope

## 1.1 The core principle

> **The journey is the interface, not the content.**

Most portfolios are a stack of pages behind a navbar. Here, the *act of moving
between sections* is the product. You are a pilot. Sections are places. Getting
there is a short, earned cinematic — which gives a **narrative reason** for every
transition instead of a fade.

This matters for one specific reader: a hiring manager evaluating a
**Software Engineer moving into AI**. A generic template says "I can use a
framework." A coherent, performant, tasteful *navigable system* says "I can
architect an experience, make deliberate technical trade-offs, and ship it."
That is the actual differentiator — not the animations themselves.

## 1.2 The mental model: a mini OS

```
                 🌌 CONSTELLATION            ← home / star map (pick a destination)
                       │ select
                       ▼
                🪐 PLANET (orbit)            ← approach the chosen world
                       │
                       ▼
              🚀 COCKPIT / BOARD             ← the HUB. navigation + interaction points
                       │  "DESTINATION: AI"
                       ▼
                  🚀 LAUNCH                   ← 3–5s cinematic (skippable)
                       ▼
              ✦✦✦  TRAVEL  ✦✦✦               ← warp interstitial (skippable)
                       ▼
                🪐 ARRIVAL                    ← the world resolves
                       ▼
              🧭 EXPLORATION / DATA           ← the section content, revealed by interaction
```

## 1.3 Many interaction points, not one giant page

Each environment has **several things to click** instead of one long scroll.
On a planet surface / in the cockpit you can interact with:

| Object        | Reveals                          | Reuses (existing repo)          |
|---------------|----------------------------------|---------------------------------|
| 🎛 Cockpit     | Navigation / the board           | `NavigationMenu`                |
| 🖥 Console     | Info / **AI assistant**          | **`ChatBot.tsx`** (repurpose)   |
| 🪟 Window      | View of the planet / animation   | —                               |
| ⌨️ Terminal    | Projects                         | `work/ProjectCard`              |
| 🗂 Panel       | Experience / timeline            | `about/Experience`, `Education` |
| 📡 Antenna     | Contact                          | `ContactForm.tsx` (repurpose)   |
| 🔍 Decor       | Easter eggs                      | —                               |

This is the antidote to "one enormous animated page": attention is spatial and
chunked, and each object is a small, testable component.

## 1.4 Scope — what this is and is NOT

**This IS:**
- A **2D / 2.5D** experience: SVG artwork + parallax layers + light WebGL *only where it earns its place*.
- **Five places**, not fifteen pages.
- A shared visual grammar across all planets (see [Art Direction](./02-art-direction.md)).

**This is NOT:**
- A fully-modelled Three.js 3D world. (Default: no Three.js. It's an optional upgrade for exactly one hero moment — see [Architecture §5.4](./05-architecture.md).)
- A replacement for real content. The space layer wraps a real, SSR'd, crawlable site.
- An excuse to animate everything.

## 1.5 The honest feasibility check ("are we just piling up animations?")

You asked the right question. Here is the architect's answer.

**The concept is genuinely good IF — and only if — these five constraints hold:**

1. **Skippable & fast.** Every cinematic can be skipped (`Esc` / click / "Skip"),
   and the *first* time is ≤ ~4s, *subsequent* trips are near-instant. A cinematic
   you can't skip is a tax the visitor pays to see your work. Fatal.
2. **Progressive enhancement.** Real routes underneath (`/`, `/software`, `/ai`, …).
   No-JS, reduced-motion, and screen-reader users get a clean, direct site. The
   space OS is a layer *on top*, never a gate. (See [05](./05-architecture.md).)
3. **Content depth matches visual ambition.** A gorgeous ship parked next to three
   sentences of filler reads as *style over substance* — the exact opposite of the
   signal you want. The content upgrade (from the CV) is not optional; it's half
   the project. (See [06](./06-content-and-copy.md).)
4. **Performance & SEO parity.** The current site is SEO-optimized (`next-seo`,
   `next-sitemap`, a Lighthouse script). The refactor must **not regress** Core
   Web Vitals or crawlability. Heavy scenes are lazy-loaded and code-split.
5. **Asset discipline.** The real cost here is **art production + choreography**,
   not the framework. One consistent, hand-drawn SVG system beats a pile of
   mismatched effects. If the asset system slips, the whole thing looks amateur.

**The failure mode to avoid:** over-investing in transitions while the pages they
connect stay thin, slow, or inaccessible. We de-risk this deliberately by building
**one full vertical slice first** (one complete journey, grey-boxed) before any
real art — see [Roadmap Phase 2](./07-roadmap-and-open-questions.md).

**Definition of "good" for this project:**
> The travel adds *delight* without ever becoming a *toll booth*, the content
> would stand on its own even stripped of animation, and Lighthouse stays green.

If we can hold that line, the concept is a strong, differentiating bet. If we
can't, we should scale back to a tasteful parallax site — and that decision
should be made at the end of Phase 2, on evidence, not vibes.
