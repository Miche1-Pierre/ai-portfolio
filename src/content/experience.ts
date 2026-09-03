import { site } from "./site";

const client = (name: string, generic: string) =>
  site.showClientNames ? `${name} (${generic})` : generic;

export type Experience = {
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  summary: string;
  bullets: string[];
  tags: string[];
  current?: boolean;
};

export const experiences: Experience[] = [
  {
    company: "Plania (a TechGuys unit)",
    role: "Head of Engineering",
    start: "May 2026",
    end: "Present",
    location: "Montréal, QC",
    current: true,
    summary:
      "Leading engineering for a SaaS with 13,000 registered users - architecture, security, pricing and an agentic layer over the business.",
    bullets: [
      "Rebuilt the product architecture, fixed security flaws and reworked the pricing model; MRR held at $12k.",
      "Designed an agentic system connecting 10+ business tools (analytics, payments, infrastructure) to automate internal workflows.",
      "Rebuilt the purchase funnel and payments end to end: 5 sales a day; an AI agent sold as a subscription, adopted by 1 buyer in 10.",
    ],
    tags: ["Leadership", "Architecture", "AI agents", "Payments", "Security"],
  },
  {
    company: "TechGuys",
    role: "Technical Lead · Full-Stack Developer",
    start: "Feb 2026",
    end: "Present",
    location: "Montréal, QC",
    current: true,
    summary:
      "Three enterprise accounts delivered in seven months, independently or in a pair, from scoping to production.",
    bullets: [
      `${client("Safex", "A North American carrier")}: designed and shipped an AI sales agent to production - 60% of traffic goes through it, 1 conversation in 4 leads to a quote request.`,
      `${client("Communauto", "A car-sharing operator across 4 countries")}: AI-automated triage of vehicle incident reports - unit cost cut from $1.93 to near zero, ~100 hours of manual processing freed every month ($29k a year) and redeployed to higher-value work.`,
      `${client("Groupe Laplante", "A lease-financing group with 5 dealerships")}: feasibility study, architecture and scoping, Law 25 and FINTRAC compliance, banking integrations - development under way.`,
    ],
    tags: ["LLM agents", "RAG", "Next.js", "Compliance", "Integrations"],
  },
  {
    company: "Université de Lorraine · PeeL",
    role: "Student Entrepreneur (SNEE)",
    start: "Dec 2025",
    end: "Present",
    location: "Metz, France",
    current: true,
    summary:
      "National student-entrepreneur status supporting Taskforce and Brain OS as a founder-led R&D effort.",
    bullets: [],
    tags: ["Entrepreneurship", "R&D"],
  },
  {
    company: "Nancyclotep",
    role: "Full-Stack Developer",
    start: "Sep 2025",
    end: "Jan 2026",
    location: "Nancy, France",
    summary:
      "Built the core of a pharmaceutical LIMS in a regulated environment.",
    bullets: [
      "Inventory, industrial process and traceability management.",
      "Designed to 21 CFR Part 11 (electronic signatures, audit trails) and GAMP 5 standards.",
    ],
    tags: ["Java", "Spring Boot", "21 CFR Part 11", "GAMP 5"],
  },
  {
    company: "SYNAPSIA",
    role: "Full-Stack Developer",
    start: "Apr 2025",
    end: "Jun 2025",
    location: "Metz, France (remote)",
    summary:
      "Built an internal application for reporting, project and team management with custom statistics.",
    bullets: [],
    tags: ["PHP", "MySQL", "Docker"],
  },
  {
    company: "LORIA (CNRS · Inria · Université de Lorraine)",
    role: "Full-Stack Developer Intern",
    start: "May 2024",
    end: "Jul 2024",
    location: "Nancy, France",
    summary:
      "Developed a letter-of-recommendation management application for the research lab's applications.",
    bullets: [],
    tags: ["Python", "SQLite", "Docker"],
  },
];

export const education = [
  {
    school: "Metz Numeric School (MNS)",
    degree: "Bachelor, Full-Stack Development",
    detail: "RNCP Level 6 - bachelor equivalent",
    start: "2023",
    end: "2026",
  },
] as const;

export const certifications = [
  {
    title: "AI Foundations Associate",
    issuer: "Oracle Cloud Infrastructure",
    year: "2025",
    detail: "Valid 2025 - 2027",
    image: "/images/certifications/OCI25AICFAV1.png",
  },
] as const;
