# CLAUDE.md — Pierre Michel's portfolio (v2)

Developer portfolio of Pierre Michel — **Full-Stack Software Engineer · Applied AI**.
Single-page Next.js app. **DA v3 (2026-09-24) is inspired by [dust.tt](https://dust.tt/home)**: white
paper, near-black ink, one action blue, filled geometric shapes, pastel panels, light theme by
default (dark theme kept). **All user-facing copy is in English.**

## Stack
Next.js 15 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · **shadcn/ui
(`base-nova` style on `@base-ui/react` — use the `render` prop, not `asChild`)** · `motion` 13
(`motion/react`) · `next-themes` (light by default) · `lucide-react` · `three` + React Three
Fiber (the `/journey` prototype) · `next-sitemap` · Vercel Analytics. Fonts: **Geist** (`--font-sans`
+ headings, variable: titles 450, display 550), **Geist Mono** (`--font-mono`: labels, numbers,
datelines), **Instrument Serif** italic (`--font-serif`: one accent word only), all self-hosted via
`next/font/google`.

## Where things live
- `src/content/*.ts` — **all content, typed** (site/metrics/nav, experience/education/certs,
  projects, skills). Source of truth = the CV in `C:\Users\pierr\OneDrive\Desktop\Candidature\CV`
  (extract with `pdftotext -layout`). Never invent facts.
- `src/components/site/*` — home sections in page order: `navbar`, `hero` (+ `hero-iso`: the
  isometric floor, chips and "what I'm shipping" card), `trusted` (name wall), `work` +
  `project-card` (pastel panel + product window, identical for every project), `about` (statement
  card + portrait), `approach` (flow panel), `impact` (results datasheet), `skills` (numbered
  pillars), `experience` (ruled list), `contact`, `footer` (dark CTA band + columns). Plus
  `command-menu` (⌘K) and `theme-toggle`. DA primitives: `shapes` (filled shapes + the `Tone`
  maps: `toneShape/Fill/Tint/Ink`, `toneStrong` for pale tones), `logo` (the "PM" monogram built
  from shapes), `pill` (eyebrow pill), `cta` (button styles for links). `project-hero` is the
  case-study hero. `src/components/motion/reveal.tsx` — scroll-reveal helpers (no `filter: blur`).
- `scripts/gen-hero-iso.py` — generates `public/illustrations/hero-iso.svg` (+ `-dark`) and prints
  the chip anchors to copy into `hero-iso.tsx`.
- `src/app/work/[slug]/page.tsx` — one **dedicated case-study page per project** (SSG via
  `generateStaticParams` + per-project `generateMetadata`). Hero = `ProjectHero`: back link, tone
  pill, display title, actions, then the product as a window standing in a large pastel panel of
  the project's `tone` (chrome bar hidden when `project.coverBare`). The v2 LaserFlow beam and the
  Aceternity/React Bits effects were removed with DA v3 (recoverable from commit `10721ee`).
- `src/components/ui/*` — shadcn primitives. `Button` sets `nativeButton={false}` automatically when
  rendered as a link.
- `src/app/globals.css` — **single source of truth for the theme** (his rule): DA v3 tokens for
  light + dark. shadcn semantics (`--primary` = action blue `#0073DF`, AA with white), `--paper-soft`,
  `--night` (dark band), and per tone (blue, red, green, lime, yellow, pink, sky) a vivid `--shape-*`,
  a pastel `--tint-*` and an AA text `--ink-*`. Type classes `.display`, `.title`, `.serif-accent`,
  `.num`, `.pill` (+ `data-tone`); utilities `container-x`, `container-wide`, `eyebrow`, `glass`.
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
