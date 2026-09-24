# 3D world workspace

Blender sources, glTF exports and generator scripts for the portfolio's 3D experience: a
scroll-driven ascent from a dry harbour to a summit observatory (working title "Low Tide").
The working documents are in French:

- `CLAUDE.md`: the working contract for Claude (pipeline, conventions, budgets, gotchas)
- `ART_DIRECTION.md`: the art direction (style, palette, light, camera, checklist)
- `STORYTELLING.md`: the world, its zones, the avatar, the vertical slice, open decisions
- `palette.json`: single source of truth for colours, read by the scripts

Layout: `references/` (reference images, Git LFS), `scenes/` (.blend sources, Git LFS),
`exports/` (.glb, Draco), `renders/` (control renders, ignored), `scripts/` (Blender Python:
`lib/`, `assets/`, `build/`).

Pipeline smoke test (headless, Blender 5.1):

```
& "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" --background --python C:\Portfolio\blender\scripts\smoke_test.py
```
