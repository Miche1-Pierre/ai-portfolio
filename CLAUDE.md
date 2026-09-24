# CLAUDE.md — Pierre Michel's portfolio (v2)

Developer portfolio of Pierre Michel — **Full-Stack Software Engineer · Applied AI**.
Single-page Next.js app. **DA v3.3 (2026-09-24)**: it started from [dust.tt](https://dust.tt/home), then
Pierre found v3 too close to Dust ("copier-collé"), so it was made his own. The layout is
**square** (cards, panels, buttons, tags, inputs) and the **small details are round on purpose,
for contrast** (his call: the "PM" logo made of shapes, card-corner shapes, bullets, dots, chips).
Taskforce cobalt `#2F6BF6` is the one action colour; blueprint rules with plus marks and crop marks;
one accent word per statement in the accent colour (no highlight block, he rejected it); in the
hero, the whole pipeline as an isometric diorama (scope, build, ship, launch), without Pierre on it
and without tech diagrams (both his calls). No dark closing band and a colour logo in the footer:
those read as copied from Dust. Light theme by default, dark kept, switched with a circular
reveal. **All user-facing copy is in English.**

## Stack
Next.js 15 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · **shadcn/ui
(`base-nova` style on `@base-ui/react` — use the `render` prop, not `asChild`)** · `motion` 13
(`motion/react`) · `next-themes` (light by default) · `lucide-react` · `three` + React Three
Fiber (the `/journey` prototype) · `next-sitemap` · Vercel Analytics. Fonts: **Geist** (`--font-sans`
+ headings, variable: titles 450, display 550), **Geist Mono** (`--font-mono`: labels, numbers,
datelines, the terminal card), both self-hosted via `next/font/google`.

## Where things live
- `src/content/*.ts` — **all content, typed** (site/metrics/nav, experience/education/certs,
  projects, skills). Source of truth = the CV in `C:\Users\pierr\OneDrive\Desktop\Candidature\CV`
  (extract with `pdftotext -layout`). Never invent facts.
- `src/components/site/*` — home sections in page order (numbered 01 to 07 by their tags):
  `navbar`, `hero` (+ `hero-iso`: the pipeline diorama, four square stage tags and, from `sm`,
  badges floating in its sky like clouds: Taskforce and Brain OS link to their case studies, "Next
  up: your project?" to the contact; he found the single card too stuck to the top), `trusted` (ruled grid of
  organisations: employer or client, plus a link when there is a case study), `work` + `project-card` (square pastel panel + product window, identical for
  every project), `about` (crop-marked statement card + portrait; every statement is stacked in one
  grid cell so the card never changes height), `approach` (three-stage pipeline on blueprint paper),
  `impact` (datasheet led by one big number per column), `skills` (link chips to each official site
  + two rotating wheels of tech logos on the page's right edge, desktop only), `experience` (ruled
  log), `contact` (email, LinkedIn, GitHub; **no form**, his call), `footer` (paper, colour logo +
  columns; no dark band). Plus `command-menu` (⌘K) and `theme-toggle` (circular reveal via the View Transitions
  API, instant fallback). DA primitives: `shapes` (round and square shapes + the `Tone` maps:
  `toneShape/Fill/Tint/Ink`, `toneStrong` for pale tones), `logo` (the "PM" monogram made of
  shapes), `pill` (square tag, round dot, optional index), `marks` (`PlusMark`, `SectionRule`,
  `CropMarks`), `cta` (square button styles for links). `project-hero` is the case-study hero.
  `src/components/motion/reveal.tsx` — scroll-reveal helpers (no `filter: blur`).
- `src/content/skills.ts` — every skill has an `href` (official site, or a reference page for a
  concept) and a `logo` (brand SVG in `public/tech/`, from Simple Icons, CC0; the brands belong to
  their owners) or a generic `glyph`. Links were checked on 2026-09-24.
- `scripts/gen-hero-iso.py` — generates `public/illustrations/hero-iso.svg` (+ `-dark`): a blueprint
  and a pencil, a sawtooth workshop with gears and a chimney, a conveyor of crates to a loading dock
  and a van, a rocket on its pad; lit windows in the dark theme; prints the tag anchors and the
  aspect ratio to copy into `hero-iso.tsx`.
- `src/app/work/[slug]/page.tsx` — one **dedicated case-study page per project** (SSG via
  `generateStaticParams` + per-project `generateMetadata`). Hero = `ProjectHero`: back link, tone
  tag, display title, actions, then the product as a square window standing in a large
  crop-marked pastel panel of the project's `tone` (chrome bar hidden when `project.coverBare`).
  The v2 LaserFlow beam and the Aceternity/React Bits effects were removed with DA v3
  (recoverable from commit `10721ee`).
- `src/components/ui/*` — shadcn primitives. `Button` sets `nativeButton={false}` automatically when
  rendered as a link.
- `src/app/globals.css` — **single source of truth for the theme** (his rule): DA v3.1 tokens for
  light + dark. Every radius token is 0 (square DA, shadcn primitives included). shadcn semantics
  (`--primary` = Taskforce cobalt `#2F6BF6`, AA with white), `--paper-soft`, `--night` (dark band),
  `--rule` (blueprint hairlines), `--accent-word`, `--logo-plate` (the plate behind brand logos),
  and per tone (blue, red, green, lime, yellow, pink, sky) a vivid `--shape-*`, a pastel `--tint-*`
  and an AA text `--ink-*`. Type classes `.display`, `.title`, `.accent-word`, `.num`, `.pill`
  (+ `data-tone`); utilities `container-x`, `container-wide`, `eyebrow`, `glass`; the orbit
  animations of the tech wheels; the `::view-transition` rules of the theme switch.
  `src/app/opengraph-image.tsx` and `src/app/icon.svg` mirror the palette in hex (they cannot read
  CSS variables).
- `next.config.ts` — `/about` → `/#about`, `/work` → `/#work` redirects (old URLs are indexed).
- `docs/` — the earlier "Space OS" exploration (01–08). **Superseded** by v2; kept as history.
- `blender/` — the **3D world workspace** (Blender sources, glTF exports, generator scripts, art
  direction + storytelling, in French). **Read `blender/CLAUDE.md` before touching anything 3D**;
  it carries the pipeline, conventions, budgets and Blender MCP gotchas.

## Rules
- **Client names are public** since 2026-09-04 (`site.showClientNames = true`, Pierre's explicit
  call: Safex Transport, Communauto, Groupe Laplante, Nancyclotep, SynapsIA). He may re-anonymise
  any client on request. Metrics from the CV are fine.
- No client-side API keys (the old OpenAI chatbot was removed for that reason).
- The CV PDF is **not** published (contains a phone number) unless Pierre asks.
- Respect `prefers-reduced-motion`; keep animations cheap (no blur filters, small aurora blobs).
- Commit only when asked; **never push/merge to `master` without explicit OK** (Vercel deploys it).

## Dev
- Branch: `feat/portfolio-v3` (DA v3 + `/journey`, PR into `master`; merge only on Pierre's
  explicit OK). `feat/portfolio-v2` == the v2 shipped on 2026-09-04.
- Dev server: `npm run dev -- -p 3010` → http://localhost:3010 (3000/3001 are taken on this machine).
- Checks: `npx tsc --noEmit`, `npx next lint`, `npm run build` (postbuild regenerates the sitemap).
- Git identity: `Miche1-Pierre <pierre.michel.work@gmail.com>`.
