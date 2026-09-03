import { site } from "./site";

const client = (name: string, generic: string) =>
  site.showClientNames ? name : generic;

export type ProjectKind = "flagship" | "product" | "client" | "archive";

export type Project = {
  slug: string;
  name: string;
  kind: ProjectKind;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  period: string;
  links?: { github?: string; demo?: string; docs?: string };
  images?: string[];
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "taskforce",
    name: "Taskforce",
    kind: "flagship",
    tagline: "Describe the outcome. Taskforce orchestrates the execution.",
    description:
      "An execution layer that sits on top of the tools a team already uses, coupled with Brain OS. Solo project and RNCP final thesis, with public technical documentation.",
    highlights: [
      "Multi-tenant architecture, 9 containerised services",
      "Java 21 / Spring Boot (Clean Architecture), Next.js, PostgreSQL, Keycloak, CI/CD",
      "Public docs on GitHub: architecture, ADRs, API, security, infrastructure",
    ],
    stack: ["Java 21", "Spring Boot", "Next.js", "PostgreSQL", "Keycloak", "Docker", "GitHub Actions"],
    period: "2025 — present",
    links: { github: "https://github.com/taskforce-project" },
    featured: true,
  },
  {
    slug: "brain-os",
    name: "Brain OS",
    kind: "flagship",
    tagline: "Persistent memory for LLMs.",
    description:
      "A knowledge graph and vector search that agents and developers can both use. The R&D is on the architecture rather than the model: representing state, context and the consequences of actions for agent reasoning.",
    highlights: [
      "Knowledge graph + vector search as one memory substrate",
      "Designed for agents and developers alike",
      "R&D focus: state, context and action consequences",
    ],
    stack: ["LLMs", "Embeddings", "Knowledge graph", "Vector search", "MCP"],
    period: "May 2026 — present",
    featured: true,
  },
  {
    slug: "plania",
    name: "Plania",
    kind: "product",
    tagline: "A 13,000-user SaaS, rebuilt from the architecture up.",
    description:
      "As Head of Engineering I rebuilt the product architecture, closed security flaws and reworked pricing, then added an agentic layer connecting 10+ business tools and rebuilt the purchase funnel and payments end to end.",
    highlights: [
      "MRR held at $12k through the rebuild",
      "Agentic system across analytics, payments and infrastructure",
      "5 sales a day; AI agent subscription adopted by 1 buyer in 10",
    ],
    stack: ["Next.js", "Node.js", "PostgreSQL", "Payments", "AI agents"],
    period: "2026 — present",
    featured: true,
  },
  {
    slug: "ai-sales-agent",
    name: `AI sales agent — ${client("Safex", "North American carrier")}`,
    kind: "client",
    tagline: "60% of traffic, 1 conversation in 4 becomes a quote request.",
    description:
      "Designed and shipped to production an AI sales agent for a North American carrier. It now handles the majority of inbound traffic and converts a quarter of conversations into quote requests.",
    highlights: ["Production LLM agent with guardrails", "Quote-request funnel integration", "Shipped in weeks, from scoping to production"],
    stack: ["LLM agents", "RAG", "TypeScript", "Next.js"],
    period: "2026",
    featured: true,
  },
  {
    slug: "incident-triage",
    name: `AI incident triage — ${client("Communauto", "car-sharing operator")}`,
    kind: "client",
    tagline: "$1.93 → ~$0 per report, ~100 hours a month freed.",
    description:
      "AI-automated triage of vehicle incident reports for a car-sharing operator active in four countries — cutting the unit cost to near zero and redeploying about 100 hours of manual processing every month ($29k a year) to higher-value work.",
    highlights: ["Classification + extraction pipeline", "Human-in-the-loop for edge cases", "Measured ROI: ~$29k / year"],
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
    highlights: ["Law 25 & FINTRAC compliance design", "Banking integrations", "Architecture and delivery scoping"],
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
    highlights: ["Electronic signatures & audit trails", "Process and inventory traceability", "Regulated-environment engineering"],
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
    highlights: [],
    stack: ["PHP", "MySQL", "Docker"],
    period: "2025",
    links: { github: "https://github.com/Miche1-Pierre/speed-reporting" },
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
    highlights: [],
    stack: ["Java", "Spring Boot", "MySQL"],
    period: "2024",
    links: { github: "https://github.com/Miche1-Pierre/admin-mns" },
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
    highlights: [],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "motion"],
    period: "2026",
    links: { github: "https://github.com/Miche1-Pierre/ai-portfolio" },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const archiveProjects = projects.filter((p) => p.kind === "archive");
export const clientProjects = projects.filter((p) => p.kind === "client" && !p.featured);
