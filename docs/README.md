# Space OS Portfolio — Specification

> A complete, build-ready specification for refactoring `ai-portfolio` into a
> **navigable universe**: a mini "space operating system" where *travel is the
> navigation* and each destination is a section of the portfolio.

**Owner:** Pierre Michel — Full-Stack Software Engineer | Applied AI
**Branch:** `feat/space-os` (from `master`)
**Status:** `SPEC` — nothing is coded yet. This is the "specify everything first" phase.
**Language:** All user-facing copy is **English**. These docs are English for repo consistency.

---

## The idea in one sentence

> Not *"here is my portfolio"* — but *"here is my universe, explore it."*
> You pilot a small ship between five planets; each planet is a part of who I am.

## The five destinations

| # | Planet         | Question         | Maps to (CV)                                             |
|---|----------------|------------------|----------------------------------------------------------|
| 1 | 🌍 Earth        | **WHO AM I**     | Profile, journey, CV, availability                       |
| 2 | 🛠 Software      | **WHAT I BUILD** | Architecture, backend/frontend, security, DevOps         |
| 3 | 🤖 AI           | **WHERE I'M GOING** | LLMs, RAG, agents, MCP, multi-agent orchestration     |
| 4 | 🧬 Life Sciences | **WHY**          | Software × AI × the living/scientific world              |
| 5 | 🛰 Deep Space    | **PROJECTS**     | Taskforce, Brain OS, Plania (+ archive)                  |

## How to read this spec

Read in order — each doc builds on the previous one:

1. **[01 — Concept & Scope](./01-concept-and-scope.md)** — the vision, the core principle, and an honest feasibility/scope reality check (the "are we just piling up animations?" question, answered).
2. **[02 — Art Direction](./02-art-direction.md)** — visual identity, palette, typography, the parallax model, motion feel.
3. **[03 — Storyboard](./03-storyboard.md)** — the full screen-by-screen flow: constellation → cockpit/board → launch → travel → arrival → exploration. *(Core deliverable.)*
4. **[04 — Asset Library](./04-asset-library.md)** — the precise, categorized list of assets to produce, SVG-first, with priorities and a minimum-viable set. *(Core deliverable.)*
5. **[05 — Architecture](./05-architecture.md)** — tech decisions: routing, the navigation state machine, Framer Motion vs GSAP vs R3F, performance, a11y, SEO.
6. **[06 — Content & Copy](./06-content-and-copy.md)** — the actual English copy per destination, sourced from the CV, plus content-migration notes and confidentiality flags.
7. **[07 — Roadmap & Open Questions](./07-roadmap-and-open-questions.md)** — phased build plan, what to prototype first to de-risk, and the decisions I need from you.

## The one architectural rule that keeps this honest

**Progressive enhancement.** Under the cinematic space layer there is a real,
routed, crawlable, keyboard-accessible portfolio. The travel sequences are an
*enhancement on top of working pages*, never a toll booth in front of them.
If JavaScript fails, if you use a screen reader, or if you prefer reduced
motion — you still reach every section in one click. See [05](./05-architecture.md).

---

*Current stack (already in repo): Next.js 15 · React 19 · TypeScript · Tailwind 4 ·
`next-themes` · `lucide-react` · `next-seo` · `next-sitemap`. Font: Space Mono.
To add: `framer-motion`, `gsap` (and optionally `@react-three/fiber`).*
