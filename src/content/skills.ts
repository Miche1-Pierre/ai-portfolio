export type SkillGroup = {
  title: string;
  blurb: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Backend & Frontend",
    blurb: "Systems that survive production - clean architecture, multi-tenant, typed end to end.",
    items: [
      "Java 21 / Spring Boot",
      "Clean Architecture",
      "Multi-tenant",
      "PostgreSQL",
      "REST APIs",
      "Python",
      "Node.js",
      "TypeScript",
      "Next.js / React",
      "React Native",
      "Tailwind CSS",
    ],
  },
  {
    title: "Applied AI",
    blurb: "Agents that ship: retrieval, orchestration and memory, with guardrails.",
    items: [
      "LLMs",
      "RAG",
      "AI agents",
      "MCP servers",
      "Multi-agent orchestration",
      "Embeddings",
      "ML / DL foundations",
    ],
  },
  {
    title: "Security & Compliance",
    blurb: "Built for regulated environments - from identity to audit trails.",
    items: [
      "OAuth2 / OIDC (Keycloak)",
      "RBAC",
      "OWASP ZAP",
      "21 CFR Part 11",
      "GAMP 5",
      "GDPR",
      "FINTRAC",
      "Law 25",
    ],
  },
  {
    title: "DevOps, Quality & Tools",
    blurb: "Containers, pipelines, observability and tests - from commit to production.",
    items: [
      "Docker",
      "Kubernetes",
      "Nginx",
      "GitHub Actions",
      "Prometheus",
      "Grafana",
      "OpenTelemetry",
      "JUnit 5",
      "Playwright",
      "SonarQube",
      "Git (GitFlow)",
      "VS Code",
      "IntelliJ IDEA",
      "Visual Studio",
      "Claude Code",
    ],
  },
];

/** Flat list for the marquee. */
export const techMarquee = [
  "Java 21",
  "Spring Boot",
  "Next.js",
  "React 19",
  "TypeScript",
  "PostgreSQL",
  "Keycloak",
  "Docker",
  "Kubernetes",
  "GitHub Actions",
  "Prometheus",
  "Grafana",
  "LLM agents",
  "RAG",
  "MCP",
  "Embeddings",
  "Python",
  "Node.js",
  "Tailwind CSS",
  "Playwright",
  "SonarQube",
];
