# CLAUDE.md — Pierre Michel's portfolio (v2)

Developer portfolio of Pierre Michel — **Full-Stack Software Engineer · Applied AI**.
Single-page Next.js app, Attio/Linear-grade design. **All user-facing copy is in English.**

## Stack
Next.js 15 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · **shadcn/ui
(`base-nova` style on `@base-ui/react` — use the `render` prop, not `asChild`)** · `motion` 13
(`motion/react`) · `next-themes` (dark by default) · `lucide-react` · `three` (WebGL beam) ·
`next-sitemap` · Vercel Analytics. Fonts: Geist (`--font-sans`) + Geist Mono (`--font-geist-mono`).

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
  `generateStaticParams` + per-project `generateMetadata`). Hero = `ProjectHero`, a dark "stage"
  in both themes with a **`LaserFlow` WebGL beam** (`src/components/reactbits/laser-flow.tsx`,
  React Bits, ported to TSX, `three`, client-only via `next/dynamic ssr:false`) coloured per
  project (`project.accent`; Taskforce beam is white via `beamMode: "adaptive"`), plus a browser-
  chrome showcase (screenshot with a cursor-follow mask reveal, or the diagram when there's no shot).
- `src/components/ui/*` — shadcn primitives. `Button` sets `nativeButton={false}` automatically when
  rendered as a link.
- `src/app/globals.css` — oklch tokens (`--brand` teal, `--brand-2` violet), `@utility` helpers
  (`container-x`, `bg-grid`, `glass`, `text-gradient`, `eyebrow`, `card-hover`). Gotcha: inside
  `@utility`, use `background-image` (longhand) for gradient text — the `background` shorthand drops
  `background-clip: text` under Lightning CSS.
- `next.config.ts` — `/about` → `/#about`, `/work` → `/#work` redirects (old URLs are indexed).
- `docs/` — the earlier "Space OS" exploration (01–08). **Superseded** by v2; kept as history.

## Rules
- **Client names from the CV stay anonymised** (`site.showClientNames = false`) until Pierre
  explicitly allows publishing them. Metrics from the CV are fine.
- No client-side API keys (the old OpenAI chatbot was removed for that reason).
- The CV PDF is **not** published (contains a phone number) unless Pierre asks.
- Respect `prefers-reduced-motion`; keep animations cheap (no blur filters, small aurora blobs).
- Commit only when asked; **never push/merge to `master` without explicit OK** (Vercel deploys it).

## Dev
- Branch: `feat/portfolio-v2` (pushed; PR into `master` pending Pierre's review).
- Dev server: `npm run dev -- -p 3010` → http://localhost:3010 (3000/3001 are taken on this machine).
- Checks: `npx tsc --noEmit`, `npx next lint`, `npm run build` (postbuild regenerates the sitemap).
- Git identity: `Miche1-Pierre <pierre.michel.work@gmail.com>`.
