# CLAUDE.md — AI Portfolio (Space OS refactor)

Pierre Michel's developer portfolio (Next.js 15 · React 19 · TypeScript · Tailwind 4),
being refactored into a **"Space OS"**: a navigable universe where travelling between
five planets *is* the navigation. **All user-facing copy is in English.**

## Read first
The full specification is in **`docs/`** (`README.md` + `01`–`07`): concept & scope,
art direction, screen-by-screen storyboard, asset library, architecture, CV-sourced
content, and roadmap. Start at `docs/README.md`.

## Decisions locked (2026-09-02)
- **Navigation:** routed-per-destination (`/earth /software /ai /life-sciences /projects`),
  progressive enhancement — real SSR pages under a cinematic travel layer. (`docs/05`)
- **Visual direction — UNDER TEST:** 3D **low-poly cartoon "diorama"** look (Short-Trip-ish),
  **pre-rendered** in Blender → images/sprites/video, composited in a 2D/parallax web layer
  (target runtime = pre-rendered, not live R3F). This is being validated via a **style frame**
  before any portfolio code. The 2D "Star-Chart Blueprint" in `docs/02` is the fallback if the
  low-poly test doesn't win. Update `docs/02`, `docs/04`, `docs/05 §5.4` once the look is chosen.
- **Current phase:** STYLE FRAME — the first scene (launch base) follows Pierre's own brief in
  **`docs/08-scene-brief-launch-base.md`** (source of truth for this scene): low-poly canyon, huge
  paneled station-sphere behind, small rocket **posée** at centre — **no flame / smoke / lift-off**,
  16:9, frontal slight low angle. The Blender file is split into collections **`BG` / `TERRAIN` /
  `ROCKET`** so each renders as its own web layer. No portfolio code until the look is approved.

## Blender MCP (wired)
- Server registered in `.mcp.json` (`blender` → `uvx blender-mcp`, UTF-8 env).
- Addon installed at `…/Blender/5.1/scripts/addons/blender_mcp.py`.
- **To use:** open **Blender 5.1** → Preferences → Add-ons → enable **"Interface: MCP for Blender"**
  → 3D viewport sidebar (`N`) → **MCP for Blender** tab → **Start MCP Server** (socket port 9876).
  Then launch Claude Code **from `C:\Portfolio`**, approve the `blender` server → `mcp__blender__*`
  tools become available.
- ⚠️ **Save the .blend before running `execute_blender_code`** (it runs arbitrary Python).
  The first command after connecting sometimes no-ops — just retry. Don't run a second MCP client
  (e.g. Claude Desktop) against Blender at the same time.

## Git
- Identity: `Miche1-Pierre <pierre.michel.work@gmail.com>` (set locally; verified).
- Working branch: **`feat/space-os`** (off `master`). GitFlow: PR into `dev` then `master`.
- **Don't push or force-push without asking.** Commit only when asked.

## Guardrails
- Never delete/overwrite the user's files or force-push public history without explicit OK.
- Client names/metrics from the CV (Safex, Communauto, Plania…) need NDA review before going public (`docs/06 §6.6`).
