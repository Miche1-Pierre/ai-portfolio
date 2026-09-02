# 07 — Roadmap & Open Questions

## 7.1 Phased plan

Each phase ends with something **runnable and reviewable**. We do not build all the
art, then all the code — we build a thin slice, prove it, then widen.

| Phase | Name                 | Outcome                                                                 | Rough effort |
|-------|----------------------|------------------------------------------------------------------------|--------------|
| **0** | Spec & decisions     | This spec + your answers to §7.3. *(we are here)*                       | done-ish     |
| **1** | Foundation           | Libs installed (`framer-motion`, `gsap`), `TravelProvider`, routes, typed `content/`, palette/HUD tokens, reduced-motion + Cmd+K. **Grey-boxed**, no real art. | ~2–3 d |
| **2** | **Vertical slice** 🎯 | ONE full journey end-to-end: Constellation → Board → Launch → Travel → Arrival → **AI** surface, with the **minimum viable asset set** ([04 §4.11](./04-asset-library.md)). **This is the go/no-go test for the whole concept.** | ~3–5 d |
| **3** | Art pass             | Produce the P0 SVG library to the shared ink hand; replace grey-boxes.  | asset-bound  |
| **4** | All destinations     | Earth, Software, Life Sciences, Deep Space surfaces + all interaction points (console/AI, window, terminal, panel, antenna). Content from [06](./06-content-and-copy.md). | ~1–2 wk |
| **5** | Polish               | Idle life, easter eggs, optional sound, perf pass, a11y audit, SEO parity, cross-device/mobile. | ~1 wk |
| **6** | Launch               | Final content + NDA review, Lighthouse green, ship to Vercel; PR flow. | ~2–3 d |

*Efforts are order-of-magnitude for one focused builder; art production is the wildcard.*

## 7.2 De-risking: what Phase 2 must answer

The vertical slice exists to answer, **on evidence**:
1. Does the journey feel *delightful* or *tedious* by the second trip?
2. Is the skip/fast-path genuinely invisible-when-wanted?
3. Do performance & Lighthouse hold with real GSAP timelines running?
4. Does the grey-boxed content already read as substantial?

If yes → proceed to art. If the journey feels like a toll booth even when skippable
→ we scale back to a tasteful parallax portfolio (still a real upgrade) and keep the
best 1–2 cinematic moments. **This decision is made at the end of Phase 2, not now.**

## 7.3 Open decisions — I need your call on these

> These are the "specify everything" forks. Numbered so you can answer inline.

1. **Art direction** — Fusion *"Star-Chart Blueprint"* (recommended), pure hand-drawn
   *ink & paper*, or pure *cockpit-HUD*? → [02](./02-art-direction.md)
2. **Routing** — routed-per-destination (recommended: SEO, deep-links, no-JS) vs
   single-page client canvas? → [05](./05-architecture.md)
3. **3D scope** — SVG/2.5D only to start (recommended), or budget one R3F hero scene? → [05 §5.4](./05-architecture.md)
4. **Confidentiality** — which client names / metrics may be public vs anonymised vs
   omitted? (Safex, Communauto, Plania $12k MRR, Groupe Laplante…) → [06 §6.6](./06-content-and-copy.md)
5. **Deep Space line-up** — confirm Taskforce / Brain OS / Plania as headliners; keep
   SpeedReporting / Admin MNS / Portfolio as an archive bay? → [06 §6.5](./06-content-and-copy.md)
6. **Git history** — the single commit `bbf9bdb` (HEAD of `master`) is authored
   `Miche1-Pierre <P.Michel@nancyclotep.com>` (your old work email). Rewrite it to
   `pierre.michel.work@gmail.com` and **force-push `master`**? (Everything else is
   already correctly attributed. All *new* commits already use the right identity —
   I set the local git config.) → see §7.5
7. **Branch flow** — keep working on `feat/space-os` (off `master`); when ready, PR
   into `dev` then `master` (your GitFlow), or straight to `master`?
8. **Sound & easter eggs** — want ambient sound (off by default) + easter eggs, or skip?
9. **AI console** — confirm repurposing the existing `ChatBot.tsx` as the ship's AI
   console (vs building fresh)?

## 7.4 What I did NOT touch (awaiting your go-ahead)

- **No push** to GitHub (branch is local only).
- **No history rewrite** (the `bbf9bdb` email fix is decision #6).
- **No code changes** to the app — only added `docs/`. The current site still builds
  and runs exactly as before.
- **No content published** anywhere.

## 7.5 The git identity fix (detail for decision #6)

Audit result across all branches:
```
124  Miche1-Pierre <pierre.michel.work@gmail.com>   ✅ correct
 25  Pierre        <pierre.michel.work@gmail.com>   ✅ correct email (merge commits)
  1  Miche1-Pierre <P.Michel@nancyclotep.com>       ⚠️ wrong — commit bbf9bdb (tip of master)
```
It's the **tip** commit, so the fix is clean (only that SHA changes). Proposed:
```bash
git rebase -p --exec 'true' HEAD~1   # or, simplest for the tip:
git commit --amend --reset-author --no-edit   # after checking out master at bbf9bdb
git push --force-with-lease origin master
```
This rewrites public history for one commit and needs a **force-push** — an
outward-facing, hard-to-fully-undo action — so I'll only run it on your explicit yes.

## 7.6 Suggested immediate next step

Answer §7.3 (at least #1, #2, #3, #6). Then I start **Phase 1 (Foundation)** on
`feat/space-os`: install libs, wire routes + `TravelProvider` + typed content, and
grey-box the flow — so Phase 2's vertical slice can prove the concept fast.
