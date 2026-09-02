# 06 — Content & Copy

> All copy is **English**. Source of truth = **CV** (`CV-Pierre-Michel-EN.pdf`),
> LinkedIn (`/in/pierre-michel-work`), GitHub (`Miche1-Pierre`).

## 6.0 Content migration — the repo is out of date

`src/app/const.tsx` predates the CV. It must be upgraded, not just re-skinned:

| Field        | Repo says (old)                     | CV says (new — use this)                                    |
|--------------|-------------------------------------|-------------------------------------------------------------|
| Title        | "Fullstack Developer"               | **Full-Stack Software Engineer \| Applied AI**              |
| Location     | "Metz, France"                      | **France — open to relocating to Montreal (QC), Canada**   |
| Education    | "Master … MNS"                      | **Bachelor, Full-Stack Dev, MNS — RNCP Level 6 (2023–2026)** |
| Experience   | SynapsIA + LORIA only               | + **Plania, TechGuys, Nancyclotep, SNEE** (full timeline)  |
| Projects     | Portfolio, SpeedReporting, AdminMNS | headline **Taskforce, Brain OS, Plania**; old ones → archive|
| Skills       | basic html/css/js…                  | + **Java 21/Spring, RAG, agents, MCP, security/compliance** |
| LinkedIn URL | `/in/pierre-michel-6424a8240`       | **`/in/pierre-michel-work`** (fix)                          |
| Availability | —                                   | **Available from October 2026**                             |

## 6.1 🌍 EARTH — WHO AM I

**Headline:** Pierre Michel — Full-Stack Software Engineer · Applied AI
**Location:** France · open to relocating to Montreal (QC), Canada
**Languages:** French (native) · English (professional)
**Availability:** from October 2026

**Profile (from CV, lightly tightened):**
> Over the past three years — in startups and established companies, in a research
> lab and in a regulated environment — I've taken projects from scoping through to
> production. Along the way I've grown beyond development into architecture, applied
> AI and product design.

**CTA:** `Download CV` (the PDF) · `Contact` (antenna) · links: GitHub, LinkedIn.

## 6.2 🛠 SOFTWARE — WHAT I BUILD

Framed as *"systems, not snippets."*

- **Backend & Frontend:** Java 21 / Spring Boot (Clean Architecture, multi-tenant),
  PostgreSQL, REST APIs, Python, Node.js; TypeScript, Next.js / React, React Native, TailwindCSS.
- **Security & compliance:** OAuth2/OIDC (Keycloak), RBAC, OWASP ZAP; 21 CFR Part 11,
  GAMP 5, GDPR, FINTRAC.
- **DevOps, quality & tools:** Docker, GitHub Actions, GHCR, Nginx, Git (GitFlow);
  JUnit 5, Jest, Playwright, SonarQube; Cursor, Claude Code.

**Signature line:** architecture that survives production — multi-tenant, 9
containerised services, CI/CD, security by design.

## 6.3 🤖 AI — WHERE I'M GOING

Framed as *"applied AI that ships."* The **AI console (ChatBot)** lives here.

- **Capabilities:** LLMs, RAG, AI agents, MCP servers, multi-agent orchestration,
  embeddings; ML/DL foundations.
- **Shipped AI systems** (⚠ see confidentiality §6.6):
  - An **AI sales agent** shipped to production for a North American carrier —
    ~60% of traffic routes through it; ~1 in 4 conversations leads to a quote request.
  - **AI-automated triage** of vehicle-incident reports for a car-sharing operator —
    unit cost cut to ~zero, ~100 manual hours/month freed and redeployed.
  - An **agentic system** connecting 10+ business tools (analytics, payments,
    infrastructure), automating internal workflows.

## 6.4 🧬 LIFE SCIENCES — WHY

The narrative planet: *why* software × AI × the living/scientific world. Grounded
in real experience (not aspiration):

- **Nancyclotep (pharma):** built the core of a **pharmaceutical LIMS** — inventory,
  industrial process, traceability — to **21 CFR Part 11** (e-signatures, audit
  trails) and **GAMP 5**. Engineering inside a regulated, life-critical domain.
- **LORIA (CNRS · Inria · Université de Lorraine):** full-stack development inside a
  **public research lab**. The research-meets-engineering mindset.
- **The thread:** systems where correctness, traceability and reasoning matter —
  the same rigor AI agents need, applied to the sciences of the living world.

*(This planet is the natural bridge to your broader bio-informatics direction.)*

## 6.5 🛰 DEEP SPACE — PROJECTS

**Docking bays** (headliners from the CV):

- **Taskforce** — *solo project, RNCP final thesis.* "Describe the outcome,
  Taskforce orchestrates the execution": an execution layer over a team's existing
  tools, coupled with Brain OS. Multi-tenant, **9 containerised services** — Java 21
  / Spring Boot, Next.js, PostgreSQL, Keycloak, CI/CD. Public technical docs on
  GitHub (architecture, ADRs, API, security, infra). → `github.com/taskforce-project`
- **Brain OS** — *R&D, AI architecture.* Persistent memory for LLMs: knowledge graph
  + vector search, usable by agents and developers. R&D on the *architecture* (state,
  context, consequences of actions) rather than the model.
- **Plania** (a TechGuys unit) — *Head of Engineering.* SaaS, **13,000 registered
  users**: product architecture rebuilt, security fixed, pricing reworked; agentic
  system across 10+ tools.

**Archive bay** (keep, lower priority — screenshots already in repo):
SpeedReporting (SynapsIA), Admin MNS, this Portfolio.

## 6.6 ⚠ Confidentiality — a decision, not a default

The CV contains **real client names and hard metrics**: Plania (13k users, MRR
$12k, 5 sales/day), Safex, Communauto ($1.93→~0, ~$29k/yr, ~100 h/mo), Groupe
Laplante. A CV shared 1:1 with a recruiter is one thing; a **public, indexed
website** is another. Some of this may be under NDA or simply better kept vague publicly.

> **DECISION #4:** For each client name + metric, choose **publish / anonymise / omit.**
> Safe anonymised phrasings are ready, e.g.:
> - "a North American carrier" instead of the named client,
> - "a car-sharing operator across 4 countries,"
> - "cut a manual process to near-zero unit cost, freeing ~100 hours/month."

I will **not** publish specific client names or figures without your explicit go-ahead.

## 6.7 Voice

- **Substance copy:** confident, precise, plain English. Recruiter-scannable.
- **Flavour copy** (boot lines, HUD labels, transit telemetry): light
  exploration-log voice — but never at the expense of clarity. The content must
  read well even if you delete every space metaphor.

## 6.8 Quick data fixes (independent of the whole refactor)

These are worth doing regardless of the space concept:
1. LinkedIn URL → `/in/pierre-michel-work`.
2. Job title, location, education level → match CV.
3. Feature Taskforce / Brain OS / Plania.
4. Add the full experience timeline.
