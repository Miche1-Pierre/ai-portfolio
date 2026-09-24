/**
 * Skills, grouped as on the CV. Every item links to its official site (or, for a concept, to a
 * reference page). `logo` = a brand SVG in public/tech/ (Simple Icons, CC0; brand logos belong to
 * their owners); `glyph` = a generic icon when there is no brand logo.
 */
export type SkillGlyph =
  | "layers"
  | "tenant"
  | "api"
  | "brain"
  | "search"
  | "bot"
  | "network"
  | "vector"
  | "cpu"
  | "key"
  | "file-check"
  | "lab"
  | "shield"
  | "bank"
  | "scale"
  | "test"
  | "code";

export type SkillItem = { name: string; href: string; logo?: string; glyph?: SkillGlyph };

export type SkillGroup = {
  title: string;
  blurb: string;
  items: SkillItem[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Backend & Frontend",
    blurb: "Systems that survive production - clean architecture, multi-tenant, typed end to end.",
    items: [
      { name: "Java 21", href: "https://openjdk.org/projects/jdk/21/", logo: "openjdk" },
      { name: "Spring Boot", href: "https://spring.io/projects/spring-boot", logo: "springboot" },
      { name: "Clean Architecture", href: "https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html", glyph: "layers" },
      { name: "Multi-tenant", href: "https://en.wikipedia.org/wiki/Multitenancy", glyph: "tenant" },
      { name: "PostgreSQL", href: "https://www.postgresql.org", logo: "postgresql" },
      { name: "REST APIs", href: "https://en.wikipedia.org/wiki/REST", glyph: "api" },
      { name: "Python", href: "https://www.python.org", logo: "python" },
      { name: "Node.js", href: "https://nodejs.org", logo: "nodedotjs" },
      { name: "TypeScript", href: "https://www.typescriptlang.org", logo: "typescript" },
      { name: "Next.js", href: "https://nextjs.org", logo: "nextdotjs" },
      { name: "React", href: "https://react.dev", logo: "react" },
      { name: "React Native", href: "https://reactnative.dev", logo: "react" },
      { name: "Tailwind CSS", href: "https://tailwindcss.com", logo: "tailwindcss" },
    ],
  },
  {
    title: "Applied AI",
    blurb: "Agents that ship: retrieval, orchestration and memory, with guardrails.",
    items: [
      { name: "LLMs", href: "https://en.wikipedia.org/wiki/Large_language_model", glyph: "brain" },
      { name: "RAG", href: "https://en.wikipedia.org/wiki/Retrieval-augmented_generation", glyph: "search" },
      { name: "AI agents", href: "https://en.wikipedia.org/wiki/Intelligent_agent", glyph: "bot" },
      { name: "MCP servers", href: "https://modelcontextprotocol.io", logo: "modelcontextprotocol" },
      { name: "Multi-agent orchestration", href: "https://en.wikipedia.org/wiki/Multi-agent_system", glyph: "network" },
      { name: "Embeddings", href: "https://en.wikipedia.org/wiki/Embedding_(machine_learning)", glyph: "vector" },
      { name: "ML / DL foundations", href: "https://en.wikipedia.org/wiki/Deep_learning", glyph: "cpu" },
    ],
  },
  {
    title: "Security & Compliance",
    blurb: "Built for regulated environments - from identity to audit trails.",
    items: [
      { name: "OAuth2 / OIDC (Keycloak)", href: "https://www.keycloak.org", logo: "keycloak" },
      { name: "RBAC", href: "https://en.wikipedia.org/wiki/Role-based_access_control", glyph: "key" },
      { name: "OWASP ZAP", href: "https://www.zaproxy.org", logo: "owasp" },
      { name: "21 CFR Part 11", href: "https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11", glyph: "file-check" },
      { name: "GAMP 5", href: "https://ispe.org/publications/guidance-documents/gamp-5-guide-2nd-edition", glyph: "lab" },
      { name: "GDPR", href: "https://eur-lex.europa.eu/eli/reg/2016/679/oj", glyph: "shield" },
      { name: "FINTRAC", href: "https://fintrac-canafe.canada.ca", glyph: "bank" },
      { name: "Law 25", href: "https://www.cai.gouv.qc.ca/", glyph: "scale" },
    ],
  },
  {
    title: "DevOps, Quality & Tools",
    blurb: "Containers, pipelines, observability and tests - from commit to production.",
    items: [
      { name: "Docker", href: "https://www.docker.com", logo: "docker" },
      { name: "Kubernetes", href: "https://kubernetes.io", logo: "kubernetes" },
      { name: "Nginx", href: "https://nginx.org", logo: "nginx" },
      { name: "GitHub Actions", href: "https://github.com/features/actions", logo: "githubactions" },
      { name: "Prometheus", href: "https://prometheus.io", logo: "prometheus" },
      { name: "Grafana", href: "https://grafana.com", logo: "grafana" },
      { name: "OpenTelemetry", href: "https://opentelemetry.io", logo: "opentelemetry" },
      { name: "JUnit 5", href: "https://junit.org", logo: "junit5" },
      { name: "Playwright", href: "https://playwright.dev", glyph: "test" },
      { name: "SonarQube", href: "https://www.sonarsource.com/products/sonarqube/", logo: "sonarqubeserver" },
      { name: "Git (GitFlow)", href: "https://git-scm.com", logo: "git" },
      { name: "VS Code", href: "https://code.visualstudio.com", glyph: "code" },
      { name: "IntelliJ IDEA", href: "https://www.jetbrains.com/idea/", logo: "intellijidea" },
      { name: "Visual Studio", href: "https://visualstudio.microsoft.com", glyph: "code" },
      { name: "Claude Code", href: "https://claude.com/claude-code", logo: "claude" },
    ],
  },
];

/** Every brand logo used above, once, for the tech wheels. */
export const skillLogos: { name: string; logo: string; href: string }[] = (() => {
  const seen = new Set<string>();
  const out: { name: string; logo: string; href: string }[] = [];
  for (const g of skillGroups)
    for (const it of g.items)
      if (it.logo && !seen.has(it.logo)) {
        seen.add(it.logo);
        out.push({ name: it.name, logo: it.logo, href: it.href });
      }
  return out;
})();
