import { site } from "./site";

const client = (name: string, generic: string) =>
  site.showClientNames ? name : generic;

export type ProjectKind = "flagship" | "product" | "client" | "archive";

export type StackGroup = { label: string; items: string[] };
export type ProjectLink = { label: string; href: string };

export type Project = {
  slug: string;
  name: string;
  kind: ProjectKind;
  tagline: string;
  /** Short blurb used on the card. */
  description: string;

  /** Accent hex used for the LaserFlow beam + page accents. Ignored when beamMode is "adaptive". */
  accent: string;
  /** Taskforce beam is white on dark / near-black on light, following the theme. */
  beamMode?: "adaptive";

  /** Long-form content for the dedicated project page. */
  overview?: string;
  problem?: string;
  approach?: string[];
  results?: string[];
  role?: string;
  stackGroups?: StackGroup[];
  /** External destinations (rendered as buttons + "where to find it"). */
  links?: { site?: string; github?: string; docs?: string; demo?: string };
  /** Note shown when there is deliberately no public link (client / proprietary work). */
  access?: string;

  images?: string[];
  /** Screenshot shown in the hero showcase; falls back to the diagram when absent. */
  cover?: string;

  stack: string[];
  period: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "taskforce",
    name: "Taskforce",
    kind: "flagship",
    tagline: "Describe the outcome. Taskforce runs the delivery.",
    description:
      "An AI delivery operating system that turns an outcome into specs, plans and prompts coding agents execute — with human approval and a full audit trail at every checkpoint. Solo project and RNCP final thesis, built in the open.",
    accent: "#c7ccd6",
    beamMode: "adaptive",
    overview:
      "Teams don't lose time building — they lose it transferring context. Taskforce replaces the handoffs of a normal delivery (vision → spec → architecture → API → breakdown → implementation → QA) with one governed run where every decision, constraint and model call is attributed and preserved. Its intelligence core, Brain OS, is built to remember the why — “Git remembers what changed. Taskforce remembers why.”",
    problem:
      "Context leaks across every handoff between people and tools. Nothing understands the work across Linear, GitHub and Notion and the AI that acts on them — so intent gets re-explained at each step instead of delivered.",
    approach: [
      "A seven-checkpoint delivery run — Vision → Product Spec → Architecture → API Contract → Breakdown → Implementation → QA & Deploy — with human approval at every gate.",
      "Multi-tenant backend in Java 21 / Spring Boot on Clean Architecture; Next.js / React front end; PostgreSQL and Keycloak for auth and SSO.",
      "An AI gateway routing to Claude, OpenAI, Cursor and self-hosted Ollama, plus an MCP integration to orchestrate tools like Linear and GitHub.",
      "~9 containerised services behind Nginx, shipped with Docker Compose and GitHub Actions CI/CD.",
      "A public, versioned documentation vault: architecture, ADRs, API contracts, data model, security and runbooks.",
    ],
    results: [
      "Core features live (spec drafting, breakdown, Smart Assign); QA & deploy in beta.",
      "Full engineering knowledge base published openly as a navigable, versioned vault.",
      "Foundation of my RNCP Level 6 final thesis.",
    ],
    role: "Solo — architecture, product and implementation.",
    stackGroups: [
      { label: "Backend", items: ["Java 21", "Spring Boot", "Clean Architecture", "PostgreSQL", "Keycloak"] },
      { label: "Frontend", items: ["Next.js", "React", "TypeScript", "TailwindCSS", "shadcn/ui"] },
      { label: "Applied AI", items: ["LLM gateway", "Claude / OpenAI / Ollama", "MCP", "Multi-agent orchestration"] },
      { label: "DevOps", items: ["Docker Compose", "Nginx", "GitHub Actions", "GHCR"] },
    ],
    links: {
      site: "https://www.taskforce-project.fr",
      github: "https://github.com/taskforce-project",
      docs: "https://github.com/taskforce-project/taskforce-docs",
    },
    stack: ["Java 21", "Spring Boot", "Next.js", "PostgreSQL", "Keycloak", "MCP", "Docker", "GitHub Actions"],
    period: "2025 — present",
    featured: true,
  },
  {
    slug: "brain-os",
    name: "Brain OS",
    kind: "flagship",
    tagline: "Persistent memory for LLMs — the intelligence core behind Taskforce.",
    description:
      "A memory substrate pairing a knowledge graph with vector search, usable by agents and developers alike. The R&D is on the architecture, not the model: how to represent state, context and the consequences of actions so an agent can reason over them.",
    accent: "#b794ff",
    overview:
      "Where documentation search tells you what exists, Brain OS is built to capture why: the decisions, constraints and trade-offs behind a system. It backs Taskforce's audit trail and long-running memory, and is designed to be queried the same way by a developer and by an autonomous agent.",
    problem:
      "LLM agents are effectively stateless — they forget decisions, constraints and the reasoning behind them between runs, so quality and consistency degrade over a long delivery.",
    approach: [
      "A knowledge graph and vector search combined into a single memory layer.",
      "A schema for state, context and action-consequences to support agent reasoning.",
      "Exposed over MCP so agents and tools consume exactly the same memory a developer does.",
    ],
    results: [
      "Powers Taskforce's “remember the why” audit and memory system.",
      "Active R&D under national student-entrepreneur (SNEE) status.",
    ],
    role: "Solo — R&D and architecture.",
    stackGroups: [
      { label: "Core", items: ["Knowledge graph", "Vector search", "Embeddings"] },
      { label: "Interface", items: ["MCP", "LLM agents", "Multi-agent orchestration"] },
    ],
    links: {
      site: "https://www.taskforce-project.fr",
      docs: "https://github.com/taskforce-project/taskforce-docs",
    },
    stack: ["Knowledge graph", "Vector search", "Embeddings", "MCP", "LLMs"],
    period: "May 2026 — present",
    featured: true,
  },
  {
    slug: "plania",
    name: "Plania",
    kind: "product",
    tagline: "A 13,000-user SaaS, rebuilt from the architecture up.",
    description:
      "As Head of Engineering I rebuilt the product architecture, closed security flaws and reworked pricing, then added an agentic layer over 10+ business tools and rebuilt the purchase-and-payments funnel end to end.",
    accent: "#37d39b",
    overview:
      "I inherited a live SaaS with 13,000 registered users and rebuilt it under load. Foundations first — architecture, security and pricing — then an agentic layer over the business and a rebuilt purchase funnel, all while keeping revenue flat through the migration.",
    problem:
      "A growing SaaS carrying architectural debt and security gaps, on a pricing model that no longer fit — with real users and revenue that couldn't be interrupted.",
    approach: [
      "Rebuilt the product architecture, closed security flaws and reworked the pricing model — MRR held at $12k through the migration.",
      "Designed an agentic system connecting 10+ business tools (analytics, payments, infrastructure) to automate internal workflows.",
      "Rebuilt the purchase funnel and payments end to end.",
    ],
    results: [
      "5 sales a day after the rebuild.",
      "AI agent sold as a subscription, adopted by 1 buyer in 10.",
      "MRR held at $12k with no revenue regression through the migration.",
    ],
    role: "Head of Engineering.",
    stackGroups: [
      { label: "Product", items: ["Next.js", "Node.js", "PostgreSQL"] },
      { label: "Growth", items: ["Payments", "Purchase funnel", "Pricing"] },
      { label: "Automation", items: ["AI agents", "Analytics", "Integrations"] },
    ],
    access: "Proprietary product — no public repository.",
    stack: ["Next.js", "Node.js", "PostgreSQL", "Payments", "AI agents"],
    period: "2026 — present",
    featured: true,
  },
  {
    slug: "ai-sales-agent",
    name: `AI sales agent — ${client("Safex", "North American carrier")}`,
    kind: "client",
    tagline: "60% of traffic; 1 conversation in 4 becomes a quote request.",
    description:
      "Designed and shipped to production an AI sales agent for a North American carrier. It now handles the majority of inbound traffic and converts a quarter of conversations into quote requests.",
    accent: "#4cc3ff",
    overview:
      "A production LLM sales agent for a North American carrier, taken from scoping to production in weeks. It answers inbound prospects, qualifies them and pushes qualified intent straight into a quote-request funnel.",
    problem:
      "Inbound sales conversations at volume, with a small team — most never reached a quote.",
    approach: [
      "A production LLM agent with guardrails and grounded answers (RAG).",
      "Integrated directly into the quote-request funnel.",
      "Shipped from scoping to production in weeks.",
    ],
    results: [
      "60% of inbound traffic now handled by the agent.",
      "1 conversation in 4 turns into a quote request.",
    ],
    role: "Technical lead — design and delivery.",
    stackGroups: [
      { label: "AI", items: ["LLM agents", "RAG", "Guardrails"] },
      { label: "Product", items: ["TypeScript", "Next.js", "Funnel integration"] },
    ],
    access: "Client engagement — delivered under NDA; the client name is withheld.",
    stack: ["LLM agents", "RAG", "TypeScript", "Next.js"],
    period: "2026",
    featured: true,
  },
  {
    slug: "incident-triage",
    name: `AI incident triage — ${client("Communauto", "car-sharing operator")}`,
    kind: "client",
    tagline: "$1.93 → ~$0 per report; ~100 hours a month freed.",
    description:
      "AI-automated triage of vehicle incident reports for a car-sharing operator active in four countries — cutting unit cost to near zero and redeploying about 100 hours of manual processing every month ($29k a year) to higher-value work.",
    accent: "#f6a94a",
    overview:
      "A car-sharing operator running in four countries processed vehicle incident reports by hand. I automated the triage — classification and extraction with a human in the loop for edge cases — collapsing the per-report cost and freeing a meaningful slice of the team's month.",
    problem:
      "Manual triage of vehicle incident reports at $1.93 each, consuming ~100 hours of staff time every month.",
    approach: [
      "A classification and extraction pipeline over incoming reports.",
      "Human-in-the-loop review kept for edge cases.",
      "Measured against the existing manual cost baseline.",
    ],
    results: [
      "Unit cost cut from $1.93 to near zero.",
      "~100 hours of manual processing freed each month — about $29k a year — redeployed to higher-value work.",
    ],
    role: "Technical lead — design and delivery.",
    stackGroups: [
      { label: "AI", items: ["LLMs", "Classification", "Extraction"] },
      { label: "Automation", items: ["Python", "Node.js", "Human-in-the-loop"] },
    ],
    access: "Client engagement — delivered under NDA; the client name is withheld.",
    stack: ["LLMs", "Python", "Node.js", "Automation"],
    period: "2026",
  },
  {
    slug: "lease-financing",
    name: `Regulated fintech scoping — ${client("Groupe Laplante", "lease-financing group")}`,
    kind: "client",
    tagline: "Feasibility, architecture and compliance for 5 dealerships.",
    description:
      "Feasibility study, architecture and scoping for a lease-financing group, including Law 25 and FINTRAC compliance and banking integrations. Development under way.",
    accent: "#8b8cff",
    overview:
      "A lease-financing group with five dealerships needed a regulated platform. I ran the feasibility study, set the architecture and scoped delivery — with compliance (Québec's Law 25, FINTRAC) and banking integrations designed in from the start rather than bolted on.",
    problem:
      "Standing up regulated lease-financing across five dealerships, with strict privacy and anti-money-laundering obligations.",
    approach: [
      "Feasibility study and target architecture.",
      "Law 25 and FINTRAC compliance designed in from the start.",
      "Banking integrations and delivery scoping.",
    ],
    results: ["Architecture and compliance approach defined; development under way."],
    role: "Architect — feasibility and scoping.",
    stackGroups: [
      { label: "Design", items: ["Architecture", "Feasibility", "Delivery scoping"] },
      { label: "Compliance", items: ["Law 25", "FINTRAC", "Banking integrations"] },
    ],
    access: "Client engagement — delivered under NDA; the client name is withheld.",
    stack: ["Architecture", "Compliance", "Integrations"],
    period: "2026",
  },
  {
    slug: "pharma-lims",
    name: "Pharmaceutical LIMS core",
    kind: "client",
    tagline: "Traceability under 21 CFR Part 11 and GAMP 5.",
    description:
      "Built the core of a pharmaceutical laboratory information management system at Nancyclotep: inventory, industrial process and traceability management, designed to 21 CFR Part 11 (electronic signatures, audit trails) and GAMP 5.",
    accent: "#2ec7c7",
    overview:
      "At Nancyclotep I built the core of a laboratory information management system for a regulated pharmaceutical environment — inventory, industrial process and traceability — with electronic signatures and audit trails designed to the standards that govern the domain.",
    problem:
      "Lab inventory, process and traceability in a regulated pharmaceutical setting, where every action must be attributable and auditable.",
    approach: [
      "Inventory, industrial-process and traceability modules.",
      "Electronic signatures and audit trails to 21 CFR Part 11.",
      "Engineered to GAMP 5 for a validated environment.",
    ],
    results: ["Delivered the traceable core the lab's processes are built on."],
    role: "Full-stack developer.",
    stackGroups: [
      { label: "Backend", items: ["Java", "Spring Boot", "PostgreSQL", "Keycloak"] },
      { label: "Regulated", items: ["21 CFR Part 11", "GAMP 5", "Audit trails"] },
    ],
    access: "Built inside a regulated pharmaceutical environment — no public repository.",
    stack: ["Java", "Spring Boot", "PostgreSQL", "Keycloak"],
    period: "2025 — 2026",
  },
  {
    slug: "speedreporting",
    name: "SpeedReporting",
    kind: "archive",
    tagline: "Internal reporting, project and team management.",
    description:
      "Internal application built for SynapsIA: reporting, project management and team management with custom statistics.",
    accent: "#7aa2ff",
    overview:
      "An internal tool for SynapsIA bringing reporting, project management and team management together, with custom statistics for the team.",
    approach: [
      "Reporting and custom statistics.",
      "Project and team management.",
    ],
    role: "Full-stack developer.",
    stackGroups: [{ label: "Stack", items: ["PHP", "MySQL", "Docker"] }],
    stack: ["PHP", "MySQL", "Docker"],
    period: "2025",
    links: { github: "https://github.com/Miche1-Pierre/speed-reporting" },
    cover: "/images/projects/speedreporting/speedreporting_1.png",
    images: [
      "/images/projects/speedreporting/speedreporting_1.png",
      "/images/projects/speedreporting/speedreporting_2.png",
      "/images/projects/speedreporting/speedreporting_3.png",
    ],
  },
  {
    slug: "admin-mns",
    name: "Admin MNS",
    kind: "archive",
    tagline: "School administration: absences, EDM and chat.",
    description:
      "Administration tool built as an R&D project at Metz Numeric School: administrator management, online absence and lateness tracking, electronic document management and chat.",
    accent: "#63b3ff",
    overview:
      "An R&D administration tool for Metz Numeric School: managing administrators, tracking absences and lateness online, electronic document management and an internal chat.",
    approach: [
      "Administrator management and online absence / lateness tracking.",
      "Electronic document management and chat.",
    ],
    role: "Full-stack developer.",
    stackGroups: [{ label: "Stack", items: ["Java", "Spring Boot", "MySQL"] }],
    stack: ["Java", "Spring Boot", "MySQL"],
    period: "2024",
    links: { github: "https://github.com/Miche1-Pierre/admin-mns" },
    cover: "/images/projects/adminmns/adminmns_1.png",
    images: [
      "/images/projects/adminmns/adminmns_1.png",
      "/images/projects/adminmns/adminmns_2.png",
      "/images/projects/adminmns/adminmns_3.png",
    ],
  },
  {
    slug: "portfolio",
    name: "This portfolio",
    kind: "archive",
    tagline: "Next.js 15, React 19, Tailwind v4, shadcn/ui, motion.",
    description:
      "The site you are reading — built as a small product: typed content, accessible components, motion with reduced-motion fallbacks, SEO and analytics.",
    accent: "#45d8ac",
    overview:
      "The site you are reading, built as a small product: fully typed content, accessible components on shadcn/ui, motion with reduced-motion fallbacks, and a WebGL beam (React Bits' LaserFlow) on each project page.",
    approach: [
      "Typed content model; every fact traceable to the CV.",
      "Accessible shadcn/ui components; motion respects prefers-reduced-motion.",
      "SEO (metadata, JSON-LD, sitemap) and analytics.",
    ],
    role: "Solo.",
    stackGroups: [
      { label: "Framework", items: ["Next.js 15", "React 19", "TypeScript"] },
      { label: "UI", items: ["Tailwind CSS v4", "shadcn/ui", "motion", "three.js"] },
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "motion"],
    period: "2026",
    links: { github: "https://github.com/Miche1-Pierre/ai-portfolio" },
    cover: "/images/projects/portfolio/portfolio_1.png",
    images: [
      "/images/projects/portfolio/portfolio_1.png",
      "/images/projects/portfolio/portfolio_2.png",
    ],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
export const featuredProjects = projects.filter((p) => p.featured);
export const archiveProjects = projects.filter((p) => p.kind === "archive");
export const clientProjects = projects.filter((p) => p.kind === "client" && !p.featured);
