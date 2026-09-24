# CLAUDE.md — Pierre Michel's portfolio (v2)

Developer portfolio of Pierre Michel — **Full-Stack Software Engineer · Applied AI**.
Single-page Next.js app, Attio/Linear-grade design. **All user-facing copy is in English.**

## Stack
Next.js 15 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · **shadcn/ui
(`base-nova` style on `@base-ui/react` — use the `render` prop, not `asChild`)** · `motion` 13
(`motion/react`) · `next-themes` (dark by default) · `lucide-react` · `three` (WebGL beam) ·
`next-sitemap` · Vercel Analytics. Fonts: Poppins (`--font-sans` + headings), IBM Plex Mono
(`--font-mono`), Libre Baskerville (`--font-serif`), all self-hosted via `next/font/google`.

## Where things live
- `src/content/*.ts` — **all content, typed** (site/metrics/nav, experience/education/certs,
  projects, skills). Source of truth = the CV in `C:\Users\pierr\OneDrive\Desktop\Candidature\CV`
  (extract with `pdftotext -layout`). Never invent facts.
- `src/components/site/*` — sections (navbar, hero, marquee, work, experience, skills, about,
  contact, footer) + `command-menu` (⌘K) + `theme-toggle`. `project-card` links to the case-study
  page; `project-art` holds the per-project SVG diagrams (theme-aware, `currentColor` = accent, or
  foreground for Taskforce's adaptive flagship); `project-hero` is the case-study hero.
  `src/components/motion/reveal.tsx` — scroll-reveal helpers (no `filter: blur`: too costly).
- `src/app/work/[slug]/page.tsx` — one **dedicated case-study page per project** (SSG via
  `generateStaticParams` + per-project `generateMetadata`). Hero = `ProjectHero`, a themed stage
  (light/dark) with a **`LaserFlow` WebGL beam** (`src/components/reactbits/laser-flow.tsx`,
  React Bits, ported to TSX, `three`, client-only via `next/dynamic ssr:false`; transparent canvas
  composited with `mix-blend-mode: screen` on the dark stage / `normal` on the light one, never
  `invert`) coloured per project (`project.accent`, one fixed colour in both themes; Taskforce is
  `beamMode: "adaptive"` = white in dark / primary blue `#2f6bf6` in light). The beam shares the
  text wrapper so the flare lands on the mockup's top edge whatever the title length. Mockup =
  borderless browser chrome (chrome bar hidden when `project.coverBare`).
- `src/components/ui/*` — shadcn primitives. `Button` sets `nativeButton={false}` automatically when
  rendered as a link.
- `src/app/globals.css` — **single source of truth for the theme** (his rule): a warm editorial
  HSL palette (red `--primary`, cream/brown surfaces) for light + dark; `--brand`/`--brand-2` alias
  `--primary`/`--chart-4` so the gradient/aurora/accents follow it; `--stage*` hex tokens drive the
  project hero (read at runtime for the WebGL beam). `@utility` helpers (`container-x`, `bg-noise`,
  `glass`, `text-gradient`, `eyebrow`, `card-hover`, `stage`/`stage-outline`). Gotcha: inside
  `@utility`, use `background-image` (longhand) for gradient text — the `background` shorthand drops
  `background-clip: text` under Lightning CSS.
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
- Branch: `feat/portfolio-v2` (== `master` since the 2026-09-04 prod ship; keep working on feat,
  merge into `master` only on Pierre's explicit OK).
- Dev server: `npm run dev -- -p 3010` → http://localhost:3010 (3000/3001 are taken on this machine).
- Checks: `npx tsc --noEmit`, `npx next lint`, `npm run build` (postbuild regenerates the sitemap).
- Git identity: `Miche1-Pierre <pierre.michel.work@gmail.com>`.
