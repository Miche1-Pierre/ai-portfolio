import type { Tone } from "@/components/site/shapes";
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

  /** Palette tone of the project (DA v3): pastel panel behind its screenshots, bullets, pill. */
  tone: Tone;

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
  /** True when the cover is a photo (not a UI screenshot): the hero renders it without the browser chrome. */
  coverBare?: boolean;

  stack: string[];
  period: string;
  featured?: boolean;
  /** A tool Pierre ships to the public: its page takes the tool's own look (see `Tool`). */
  tool?: Tool;
};

/**
 * A tool Pierre builds and ships (on the Microsoft Store, with its own site): its page on the
 * portfolio is a product page in the tool's own design, not a case study. The theme's tokens live
 * in globals.css under `.tool[data-tool="..."]`, taken from the tool's site.
 */
export type Tool = {
  theme: "career-os" | "taskforce";
  /** for schema.org: the application category and the systems it runs on */
  category: string;
  os: string;
  /** the mark beside the name (an image; `invertOnDark` for a black logo) */
  logo: { src: string; width: number; height: number; invertOnDark?: boolean };
  /** the hero's line: plain words, then the words in the tool's accent */
  headline: [string, string];
  intro: string;
  /** short facts under the buttons: price, licence, platforms */
  facts: string[];
  /** the Microsoft Store listing; `live` false while the listing is in certification */
  store: { id: string; live: boolean };
  /** every other way in, in order (site, download, docs, source, privacy) */
  links: ProjectLink[];
  /** the screenshot in the hero, an optional painted backdrop, and the labels floating around it */
  heroShot: string;
  heroBackdrop?: string;
  callouts: ToolCallout[];
  video?: { src: string; poster: string; captions: string; title: string };
  /** the case for the tool: how it goes without it, then what changes with it */
  why: { title: [string, string]; without: string[]; with: { title: string; body: string }[] };
  /** how it works, one visual per step (a screenshot, or a small drawn moment of the flow) */
  steps: { title: string; body: string; visual: ToolVisual }[];
  /** what it does, as one ruled grid: `wide` cells span two columns, `shot` shows a detail of the app */
  features: { title: string; body: string; wide?: boolean; shot?: ToolShot; visual?: "prompt" | "log" }[];
  screens: { src: string; title: string; caption: string }[];
  /** privacy: the promises, what stays on the computer, and what only connects if you choose */
  privacy: { title: string; tagline: string; points: string[]; local: string[]; outside: string[] };
  /** how it is built, in a few sentences (the layers are the project's stackGroups) */
  build: string;
};

export type ToolCallout = { label: string; tone: "accent" | "green" | "amber" };
/** a detail of a screenshot: the point to centre (CSS object-position) and how far to zoom in */
export type ToolShot = { src: string; focus: string; zoom: number };
export type ToolVisual = { kind: "shot"; shot: ToolShot } | { kind: "approval" } | { kind: "pull-request" };

export const projects: Project[] = [
  {
    slug: "taskforce",
    name: "TaskForce",
    kind: "flagship",
    tone: "blue",
    tagline: "Delegate to AI agents. Keep the final say.",
    description:
      "A free, open source desktop app to plan your work and hand it to Claude Code or GitHub Copilot. Agents work on their own branch, ask before anything risky and never merge without you. On the Microsoft Store, Windows and Linux.",
    overview:
      "Coding agents are fast, but working with them is still messy: context gets lost between tools, you can't see what an agent is doing, and its results land unchecked. TaskForce puts the plan, the project's memory and the agents in one app, on your computer, with you in charge.",
    results: [
      "Published on the Microsoft Store (rated Everyone by the IARC), with Windows and Linux installers.",
      "Installed apps update themselves in the background, and the data is copied before each update changes it.",
      "Open source under the AGPL-3.0; the same app self-hosts as a web app with Docker.",
      "Foundation of my RNCP Level 6 final thesis.",
    ],
    role: "Solo - product, design and engineering.",
    stackGroups: [
      { label: "Desktop", items: ["Electron 44", "Auto-update", "OS keychain", "Microsoft Store", ".deb / AppImage"] },
      { label: "Interface", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4"] },
      { label: "API & data", items: ["Java 21", "Spring Boot 4", "PostgreSQL 18 + pgvector"] },
      { label: "Agents & AI", items: ["Claude Code runner", "GitHub Copilot coding agent", "MCP client", "Ollama", "OpenAI-compatible APIs"] },
      { label: "Integrations", items: ["GitHub", "Slack", "Plane", "MCP servers", "Signed webhooks (HMAC-SHA256)"] },
    ],
    links: {
      site: "https://taskforce-project.fr",
      github: "https://github.com/taskforce-project/taskforce-fullstack",
      docs: "https://docs.taskforce-project.fr",
    },
    cover: "/images/projects/taskforce/v2/dashboard.webp",
    images: [
      "/images/projects/taskforce/v2/dashboard.webp",
      "/images/projects/taskforce/v2/board.webp",
      "/images/projects/taskforce/v2/delegate.webp",
      "/images/projects/taskforce/v2/brain-os.webp",
      "/images/projects/taskforce/v2/integrations.webp",
    ],
    stack: ["Electron", "Next.js 16", "Spring Boot 4", "PostgreSQL", "pgvector", "Claude Code", "MCP"],
    period: "2025 - present",
    featured: true,
    tool: {
      theme: "taskforce",
      category: "DeveloperApplication",
      os: "Windows 10, Windows 11, Linux",
      logo: { src: "/images/projects/taskforce/v2/logo.svg", width: 210, height: 160, invertOnDark: true },
      headline: ["Delegate to AI agents. Keep the", "final say."],
      intro:
        "TaskForce is a free, open source desktop app to plan your work and hand it to Claude Code or GitHub Copilot. Agents work on their own branch, ask before anything risky, and never merge without you.",
      facts: ["Free and open source (AGPL-3.0)", "Windows 10 and 11, Linux", "macOS soon"],
      store: { id: "9PFC2ML6X5SF", live: true },
      links: [
        { label: "Website", href: "https://taskforce-project.fr" },
        { label: "All downloads", href: "https://taskforce-project.fr/download" },
        { label: "Documentation", href: "https://docs.taskforce-project.fr" },
        { label: "Source on GitHub", href: "https://github.com/taskforce-project/taskforce-fullstack" },
        { label: "Security, connection by connection", href: "https://taskforce-project.fr/security" },
      ],
      heroShot: "/images/projects/taskforce/v2/dashboard.webp",
      heroBackdrop: "/images/projects/taskforce/v2/hero-bg.webp",
      callouts: [
        { label: "Claude Code is working on its own branch", tone: "accent" },
        { label: "Waiting for you: run the tests?", tone: "amber" },
        { label: "Pull request ready for review", tone: "green" },
      ],
      why: {
        title: ["Coding agents are fast.", "Working with them is still messy."],
        without: ["Context gets lost between tools", "You can't see what an agent is doing", "Its results land unchecked"],
        with: [
          { title: "Context comes with the task", body: "Agents look up your decisions and conventions in Brain OS before they start, so they never begin from a blank page." },
          { title: "Every step in plain sight", body: "Follow each file an agent reads, each edit and each command, live, on the issue it is working on." },
          { title: "Nothing ships without you", body: "Risky actions wait for your answer, and the work comes back as a pull request for you to review." },
        ],
      },
      steps: [
        {
          title: "Write the issue",
          body: "Plan it on the board or in a cycle. The decisions you keep in Brain OS travel with it.",
          visual: { kind: "shot", shot: { src: "/images/projects/taskforce/v2/board.webp", focus: "35% 30%", zoom: 1.35 } },
        },
        {
          title: "Assign it to an agent",
          body: "Pick Claude Code or GitHub Copilot in the assignee menu, the way you assign a teammate.",
          visual: { kind: "shot", shot: { src: "/images/projects/taskforce/v2/delegate.webp", focus: "88% 22%", zoom: 1.7 } },
        },
        {
          title: "Answer when it asks",
          body: "The run shows up live on the issue. Anything outside the agent's limits waits for you to allow or deny it, and is denied after ten minutes without an answer.",
          visual: { kind: "approval" },
        },
        {
          title: "Review the pull request",
          body: "TaskForce pushes the agent's branch and opens the pull request. Nothing is merged without you.",
          visual: { kind: "pull-request" },
        },
      ],
      features: [
        {
          title: "Plan the work",
          body: "Board, list, backlog, cycles and roadmap over one set of issues, with subtasks, relations, checklists, story points and time tracking.",
          wide: true,
          shot: { src: "/images/projects/taskforce/v2/board.webp", focus: "40% 35%", zoom: 1.5 },
        },
        {
          title: "Keep the project's memory",
          body: "Brain OS holds specs, decisions and notes as linked Markdown pages with wikilinks and tags.",
          shot: { src: "/images/projects/taskforce/v2/brain-os.webp", focus: "18% 45%", zoom: 1.9 },
        },
        {
          title: "Delegate to coding agents",
          body: "Claude Code runs on your computer with your own installation and account; TaskForce never sees your Claude credentials.",
          shot: { src: "/images/projects/taskforce/v2/delegate.webp", focus: "88% 22%", zoom: 1.9 },
        },
        {
          title: "Connect your tools",
          body: "GitHub, Slack and Plane built in, any other tool through its MCP server: 25 official servers listed, with one-click OAuth or a token.",
          wide: true,
          shot: { src: "/images/projects/taskforce/v2/integrations.webp", focus: "50% 40%", zoom: 1.25 },
        },
        {
          title: "Every step in plain sight",
          body: "Follow each file an agent reads, each edit and each command, live, on the issue it is working on.",
          wide: true,
          visual: "log",
        },
        {
          title: "Use the AI you choose",
          body: "A local model through Ollama, or any OpenAI-compatible API with your own key. Without AI, the board, Brain OS and analytics keep working.",
        },
      ],
      screens: [
        { src: "/images/projects/taskforce/v2/dashboard.webp", title: "Dashboard", caption: "Your operations, what needs you next and how the work moves, on one screen." },
        { src: "/images/projects/taskforce/v2/board.webp", title: "Board", caption: "One set of issues, seen as a board, a list, a backlog or a roadmap." },
        { src: "/images/projects/taskforce/v2/delegate.webp", title: "Delegate", caption: "Hand an issue to Claude Code from the assignee menu." },
        { src: "/images/projects/taskforce/v2/brain-os.webp", title: "Brain OS", caption: "Specs, decisions and notes in linked Markdown pages, read by people and agents alike." },
        { src: "/images/projects/taskforce/v2/integrations.webp", title: "Integrations", caption: "GitHub, Slack and Plane built in, any other tool through its MCP server." },
      ],
      privacy: {
        title: "Your work stays on your computer",
        tagline: "Private by design.",
        points: [
          "Your work stays on your computer: the server only keeps your free account.",
          "Nothing leaves unless you connect it, and the app sends no usage data.",
          "API keys and tokens stay in your system's keychain, never in plain text.",
          "Each agent run works on its own branch: anything risky waits for you, and pushing is always refused.",
        ],
        local: ["Projects and issues", "Brain OS pages", "Attachments", "Settings", "Keys, in the keychain"],
        outside: ["Your TaskForce account", "Claude Code, your login", "GitHub and Copilot", "MCP servers", "Your AI provider"],
      },
      build:
        "The desktop app is the whole product, packed for one person. Its Electron shell starts a complete local stack at each launch: a Next.js 16 and React 19 interface, a Spring Boot 4 API on Java 21 and PostgreSQL 18 with pgvector. A runner drives Claude Code with your own installation and login, and an AI relay talks to Ollama or any OpenAI-compatible API. The same app runs as a self-hosted web app with Docker.",
    },
  },
  {
    slug: "career-os",
    name: "Career OS",
    kind: "product",
    tone: "red",
    tagline: "Your whole job search, in one place, on your computer.",
    description:
      "A free, open source tool that runs a job search end to end: offers, applications, follow-ups, interviews, CVs and the move to a new city, with an optional Claude assistant that prepares and never invents. Your data stays on your computer.",
    overview:
      "Career OS gathers a whole search on your computer, from the first offer to the move: applications by stage, computed follow-ups, interviews, CVs and the exact documents sent, contacts, deadlines and statistics.",
    results: [
      "Published on the Microsoft Store in November 2026, with version 0.1.0 also on GitHub.",
      "Free and open source under the MIT licence.",
      "From the first commit to the store package in seven weeks.",
    ],
    role: "Solo - product, design and engineering.",
    stackGroups: [
      { label: "App", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "shadcn/ui"] },
      { label: "Data", items: ["PostgreSQL 17", "Drizzle ORM", "PGlite (PostgreSQL in WebAssembly)", "Docker Compose"] },
      { label: "AI", items: ["Claude through Claude Code", "Anthropic API", "OpenAI-compatible endpoints"] },
      { label: "Delivery", items: ["MSIX for the Microsoft Store", "C# launcher", "One-line PowerShell installer", "GitHub Actions"] },
    ],
    links: {
      site: "https://get-career-os.vercel.app",
      github: "https://github.com/Miche1-Pierre/career-os",
    },
    cover: "/images/projects/career-os/home.webp",
    images: [
      "/images/projects/career-os/home.webp",
      "/images/projects/career-os/today.webp",
      "/images/projects/career-os/board.webp",
      "/images/projects/career-os/analysis.webp",
    ],
    stack: ["Next.js 16", "React 19", "PostgreSQL", "PGlite", "Claude", "MSIX"],
    period: "2026",
    featured: true,
    tool: {
      theme: "career-os",
      category: "BusinessApplication",
      os: "Windows 10, Windows 11",
      logo: { src: "/images/projects/career-os/logo.svg", width: 28, height: 28 },
      headline: ["Your whole search,", "in one place."],
      intro:
        "Career OS gathers your job search on your computer: offers, applications, follow-ups, interviews, CVs and documents, and even settling into a new city. Paste an offer, a link, a file or an e-mail, and the optional Claude assistant fills it in without ever inventing anything. It prepares, you decide.",
      facts: ["Free and open source (MIT)", "Windows 10 and 11", "No account, no ads, no tracking"],
      store: { id: "9NCQ7PFQVM2Q", live: true },
      links: [
        { label: "Website", href: "https://get-career-os.vercel.app" },
        { label: "Latest release", href: "https://github.com/Miche1-Pierre/career-os/releases/latest" },
        { label: "Source on GitHub", href: "https://github.com/Miche1-Pierre/career-os" },
        { label: "Privacy policy (French)", href: "https://get-career-os.vercel.app/confidentialite" },
      ],
      heroShot: "/images/projects/career-os/home.webp",
      callouts: [
        { label: "Technical match: 82%", tone: "accent" },
        { label: "Next follow-up in 5 days", tone: "amber" },
        { label: "Interview booked, Tuesday 2 pm", tone: "green" },
      ],
      video: {
        src: "/videos/career-os-trailer.mp4",
        poster: "/images/projects/career-os/trailer-poster.webp",
        captions: "/videos/career-os-trailer.en.vtt",
        title: "Career OS, the launch film (42 s)",
      },
      why: {
        title: ["A job search spreads everywhere.", "Career OS keeps it in one place."],
        without: ["Offers saved in tabs and e-mails", "Follow-ups kept in your head", "Which CV went where?"],
        with: [
          { title: "Captured in seconds", body: "Paste a text, a link, a file or an e-mail: the role, the dates and the contacts are filled in for you." },
          { title: "Follow-ups computed for you", body: "A Today page tells you what to follow up, what to prepare and which dates are coming." },
          { title: "The exact version sent", body: "Each application keeps the CV and letter it received, filed in your Documents folder." },
        ],
      },
      steps: [
        {
          title: "Capture",
          body: "Paste a text, a link, a file or an e-mail: the opportunity is in, in seconds.",
          visual: { kind: "shot", shot: { src: "/images/projects/career-os/home.webp", focus: "62% 28%", zoom: 1.5 } },
        },
        {
          title: "Let Claude read it",
          body: "The assistant fills in the role, the dates and the contacts, and reads the offer against your profile. It never invents what isn't there.",
          visual: { kind: "shot", shot: { src: "/images/projects/career-os/analysis.webp", focus: "55% 25%", zoom: 1.45 } },
        },
        {
          title: "Check it",
          body: "You review and correct the record before it counts.",
          visual: { kind: "shot", shot: { src: "/images/projects/career-os/application.webp", focus: "55% 20%", zoom: 1.4 } },
        },
        {
          title: "Follow it through",
          body: "Stages, computed follow-ups, interviews, the exact documents sent, deadlines and statistics, up to the decision.",
          visual: { kind: "shot", shot: { src: "/images/projects/career-os/today.webp", focus: "40% 30%", zoom: 1.45 } },
        },
      ],
      features: [
        {
          title: "Track your applications",
          body: "A board by stage, with dates and follow-ups computed for you. Jobs, internships, VIE, master's programmes, training and PhDs, each with its own stages.",
          wide: true,
          shot: { src: "/images/projects/career-os/board.webp", focus: "40% 30%", zoom: 1.5 },
        },
        {
          title: "Know what to do today",
          body: "What to follow up, what to prepare and which dates are coming, on one page.",
          shot: { src: "/images/projects/career-os/today.webp", focus: "30% 35%", zoom: 1.9 },
        },
        {
          title: "Keep everything in order",
          body: "A CV editor for several versions exported to PDF, and the exact version sent with each application.",
          shot: { src: "/images/projects/career-os/cv-editor.webp", focus: "55% 30%", zoom: 1.7 },
        },
        {
          title: "Prepare the move",
          body: "Compare places to live by rent, charges, lease and commute, see them on a map, and follow the steps to move abroad with the official links.",
          wide: true,
          shot: { src: "/images/projects/career-os/move-map.webp", focus: "60% 60%", zoom: 1.35 },
        },
        {
          title: "An assistant that prepares",
          body: "Ask it to find offers or housing, read an offer against your profile, prepare an interview or draft a follow-up. Nothing is sent for you.",
          wide: true,
          visual: "prompt",
        },
        {
          title: "Interviews, contacts, calendar",
          body: "Every interview and contact tied to its application, and a calendar that brings it all together.",
        },
      ],
      screens: [
        { src: "/images/projects/career-os/home.webp", title: "Search", caption: "Ask for anything: offers, a place to live, an answer." },
        { src: "/images/projects/career-os/today.webp", title: "Today", caption: "What to follow up, what to prepare and which dates are coming." },
        { src: "/images/projects/career-os/board.webp", title: "Applications", caption: "Every application on a board, one column per stage." },
        { src: "/images/projects/career-os/application.webp", title: "An application", caption: "Dates, contacts, interviews and the documents sent, on one page." },
        { src: "/images/projects/career-os/analysis.webp", title: "Offer analysis", caption: "An offer read against your profile: the match, the gaps and the questions to ask." },
        { src: "/images/projects/career-os/cv-editor.webp", title: "CV editor", caption: "Several versions of your CV, edited on the page and exported to PDF." },
        { src: "/images/projects/career-os/move-map.webp", title: "Map", caption: "Your workplace and the places you compare, on one map." },
        { src: "/images/projects/career-os/analytics.webp", title: "Statistics", caption: "Only objective numbers: Career OS never draws conclusions for you." },
      ],
      privacy: {
        title: "Your data stays with you",
        tagline: "No account, no tracking.",
        points: [
          "No account to create, no ads, no analytics.",
          "Everything lives in your Documents folder, with a full backup every day. Uninstalling keeps it.",
          "The database is PostgreSQL on your disk, compiled to WebAssembly and served only to your own computer.",
          "The assistant is optional: your Claude subscription, an API key, any OpenAI-compatible endpoint, or none at all.",
        ],
        local: ["Applications", "CVs and documents", "Contacts and interviews", "The database", "A backup every day"],
        outside: ["The Claude assistant, if you want it", "Maps", "Offer and housing searches"],
      },
      build:
        "A Next.js 16 and React 19 app on the open source Sparkle design system, with PostgreSQL 17 through Drizzle, run locally as PGlite (PostgreSQL compiled to WebAssembly) or with Docker. Windows gets a one-line installer and an MSIX package for the Microsoft Store with a small C# launcher, all built by GitHub Actions on every merge.",
    },
  },
  {
    slug: "brain-os",
    name: "Brain OS",
    kind: "flagship",
    tone: "pink",
    tagline: "Your project's reference memory, readable by your AI.",
    description:
      "A reference memory for a whole project, kept fresh, navigable and readable by both people and AI, so an assistant works on the real state of the product instead of re-scanning everything on each conversation.",
    overview:
      "Documentation drifts and scatters; AI assistants lose the thread and start from scratch every conversation. Brain OS keeps a project's decisions, constraints and architecture as a single, versioned source of truth, a “neural Ctrl+F” an agent can query for exactly what it needs. Battle-tested in production on Plania.",
    problem:
      "On every new conversation an AI assistant re-scans everything and loses the thread, while documentation scatters across tools and goes stale.",
    approach: [
      "A single hub (Brain_OS.md) over versioned knowledge domains: project, product, architecture, contracts, security, roadmap.",
      "An agent kernel (AGENTS.md) the AI reads first, so it acts on the real, dated and verifiable state.",
      "Exposed over MCP and built to work with Claude, VS Code, Obsidian, GitHub, Notion and Linear.",
    ],
    results: [
      "Battle-tested in production on Plania, not theory.",
      "Free tier ships the full vault and templates; a paid tier adds MCP and agent orchestration.",
      "Active R&D under national student-entrepreneur (SNEE) status.",
    ],
    role: "Solo - R&D and architecture.",
    stackGroups: [
      { label: "Core", items: ["Structured Markdown", "Versioned domains", "MCP"] },
      { label: "Works with", items: ["Claude", "VS Code", "Obsidian", "GitHub", "Linear"] },
    ],
    links: { site: "https://bos-landing.onrender.com" },
    cover: "/images/projects/brain-os/brain-os_1.png",
    images: ["/images/projects/brain-os/brain-os_1.png"],
    stack: ["Markdown", "MCP", "Obsidian", "Claude", "Knowledge base"],
    period: "May 2026 - present",
    featured: true,
  },
  {
    slug: "plania",
    name: "Plania",
    kind: "product",
    tone: "green",
    tagline: "A 13,000-user SaaS, rebuilt from the architecture up.",
    description:
      "Plania is an AI platform that generates a complete, bank-ready business plan in under 30 minutes. As Head of Engineering I rebuilt its architecture, closed security flaws, reworked pricing, then added an agentic layer over 10+ business tools and rebuilt the purchase-and-payments funnel end to end.",
    overview:
      "Plania turns a founder's idea into a 30-page business plan, 5-year financial projections and a market analysis, formatted for banks and investors. I inherited it as a live SaaS with 13,000 registered users and rebuilt it under load: foundations first (architecture, security, pricing), then an agentic layer over the business and a rebuilt purchase funnel, all while keeping revenue flat through the migration.",
    problem:
      "A growing SaaS carrying architectural debt and security gaps, on a pricing model that no longer fit, with real users and revenue that couldn't be interrupted.",
    approach: [
      "Rebuilt the product architecture, closed security flaws and reworked the pricing model; MRR held at $12k through the migration.",
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
    links: { site: "https://www.plania.ai" },
    cover: "/images/projects/plania/plania_1.png",
    images: ["/images/projects/plania/plania_1.png"],
    access: "Commercial product; the source is private.",
    stack: ["Next.js", "Node.js", "PostgreSQL", "Payments", "AI agents"],
    period: "2026 - present",
    featured: true,
  },
  {
    slug: "ai-sales-agent",
    name: `AI sales agent - ${client("Safex Transport", "North American carrier")}`,
    kind: "client",
    tone: "yellow",
    tagline: "60% of traffic; 1 conversation in 4 becomes a quote request.",
    description:
      "Designed and shipped to production the on-site AI sales agent for Safex Transport, an asset-based North American freight carrier (full- and less-than-truckload, cross-border). It now handles the majority of inbound traffic and converts a quarter of conversations into spot-quote requests.",
    cover: "/images/projects/ai-sales-agent/safex.png",
    overview:
      "An “Ask AI” assistant embedded on Safex Transport's site, taken from scoping to production in weeks. It answers inbound prospects, qualifies them and pushes qualified intent straight into the spot-quote funnel.",
    problem:
      "Inbound sales conversations arriving at volume against a small team, where most never reached a quote.",
    approach: [
      "A production LLM agent with guardrails and grounded answers (RAG) over the carrier's services.",
      "Wired directly into the spot-quote request funnel.",
      "Shipped from scoping to production in weeks.",
    ],
    results: [
      "60% of inbound traffic now handled by the agent.",
      "1 conversation in 4 turns into a quote request.",
    ],
    role: "Technical lead - design and delivery.",
    stackGroups: [
      { label: "AI", items: ["LLM agents", "RAG", "Guardrails"] },
      { label: "Product", items: ["TypeScript", "Next.js", "Funnel integration"] },
    ],
    links: { site: "https://safextransport.ca" },
    stack: ["LLM agents", "RAG", "TypeScript", "Next.js"],
    period: "2026",
  },
  {
    slug: "incident-triage",
    name: `AI incident triage - ${client("Communauto", "car-sharing operator")}`,
    kind: "client",
    tone: "lime",
    tagline: "$1.93 → ~$0 per report; ~100 hours a month freed.",
    description:
      "AI-automated triage of vehicle incident reports for Communauto, a car-sharing operator active in four countries - built on Power Automate and the Microsoft 365 suite, cutting unit cost to near zero and redeploying about 100 hours of manual processing every month ($29k a year) to higher-value work.",
    cover: "/images/projects/incident-triage/incident-triage_1.jpg",
    coverBare: true,
    overview:
      "Communauto, running in four countries, processed vehicle incident reports by hand. I automated the triage on Power Automate and Microsoft 365 (Microsoft Lists), with a Python prototype and a Chrome extension to capture and classify reports, and a human in the loop for edge cases - collapsing the per-report cost and freeing a meaningful slice of the team's month.",
    problem:
      "Manual triage of vehicle incident reports at $1.93 each, consuming ~100 hours of staff time every month.",
    approach: [
      "Triage automated on Power Automate + Microsoft 365 (Microsoft Lists), no heavy infrastructure.",
      "A Python prototype and a Chrome extension to capture, extract and classify incoming reports.",
      "Human-in-the-loop review kept for edge cases, measured against the manual cost baseline.",
    ],
    results: [
      "Unit cost cut from $1.93 to near zero.",
      "~100 hours of manual processing freed each month - about $29k a year - redeployed to higher-value work.",
    ],
    role: "Technical lead - design and delivery.",
    stackGroups: [
      { label: "Automation", items: ["Power Automate", "Microsoft 365", "Microsoft Lists"] },
      { label: "Prototype", items: ["Python", "Chrome extension", "Classification / LLMs"] },
    ],
    links: { site: "https://www.communauto.com" },
    stack: ["Power Automate", "Microsoft 365", "Python", "Chrome extension"],
    period: "2026",
  },
  {
    slug: "lease-financing",
    name: `Regulated fintech scoping - ${client("Groupe Laplante", "lease-financing group")}`,
    kind: "client",
    tone: "sky",
    tagline: "Feasibility, architecture and compliance for 5 dealerships.",
    description:
      "Feasibility study, architecture and scoping for Groupe Laplante, a lease-financing group with five dealerships, including Law 25 and FINTRAC compliance and banking integrations. Development under way.",
    cover: "/images/projects/lease-financing/laplante.png",
    overview:
      "Groupe Laplante, with five dealerships, needed a regulated platform. I ran the feasibility study, set the architecture and scoped delivery - with compliance (Québec's Law 25, FINTRAC) and banking integrations designed in from the start rather than bolted on.",
    problem:
      "Standing up regulated lease-financing across five dealerships, with strict privacy and anti-money-laundering obligations.",
    approach: [
      "Feasibility study and target architecture.",
      "Law 25 and FINTRAC compliance designed in from the start.",
      "Banking integrations and delivery scoping.",
    ],
    results: ["Architecture and compliance approach defined; development under way."],
    role: "Architect - feasibility and scoping.",
    stackGroups: [
      { label: "Design", items: ["Architecture", "Feasibility", "Delivery scoping"] },
      { label: "Compliance", items: ["Law 25", "FINTRAC", "Banking integrations"] },
    ],
    links: { site: "https://www.laplantegroupeauto.com" },
    stack: ["Architecture", "Compliance", "Integrations"],
    period: "2026",
  },
  {
    slug: "pharma-lims",
    name: "Pharmaceutical LIMS - Nancyclotep",
    kind: "client",
    tone: "pink",
    tagline: "Traceability under 21 CFR Part 11 and GAMP 5.",
    description:
      "Built the core of a pharmaceutical laboratory information management system at Nancyclotep (a molecular-imaging & radiopharmaceutical platform): inventory, industrial process and traceability, designed to 21 CFR Part 11 (electronic signatures, audit trails) and GAMP 5.",
    cover: "/images/projects/pharma-lims/nancyclotep.png",
    overview:
      "At Nancyclotep I built the core of a laboratory information management system for a regulated pharmaceutical environment - inventory, industrial process and traceability - with electronic signatures and audit trails designed to the standards that govern the domain.",
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
      { label: "Frontend", items: ["Vue.js", "Nuxt"] },
      { label: "Backend", items: ["PHP", "PostgreSQL", "Keycloak"] },
      { label: "Hosting", items: ["Internal NAS server", "Self-hosted"] },
      { label: "Regulated", items: ["21 CFR Part 11", "GAMP 5", "Audit trails"] },
    ],
    links: { site: "https://nancyclotep.com" },
    access: "Built at Nancyclotep, a molecular-imaging and radiopharmaceutical platform - a regulated environment with no public repository.",
    stack: ["Vue.js", "Nuxt", "PHP", "PostgreSQL", "Keycloak", "NAS"],
    period: "2025 - 2026",
  },
  {
    slug: "speedreporting",
    name: "SpeedReporting",
    kind: "archive",
    tone: "yellow",
    tagline: "Internal reporting, project and team management.",
    description:
      "Internal application built for SynapsIA: reporting, project management and team management with custom statistics.",
    overview:
      "An internal tool for SynapsIA bringing reporting, project management and team management together, with custom statistics for the team.",
    approach: [
      "Reporting and custom statistics.",
      "Project and team management.",
    ],
    role: "Full-stack developer.",
    stackGroups: [{ label: "Stack", items: ["PHP", "React", "MySQL", "Docker"] }],
    stack: ["PHP", "React", "MySQL", "Docker"],
    period: "2025",
    links: { site: "https://synapsia.fr", github: "https://github.com/Miche1-Pierre/speed-reporting" },
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
    tone: "red",
    tagline: "School administration: absences, EDM and chat.",
    description:
      "Administration tool built as an R&D project at Metz Numeric School: administrator management, online absence and lateness tracking, electronic document management and chat.",
    overview:
      "An R&D administration tool for Metz Numeric School: managing administrators, tracking absences and lateness online, electronic document management and an internal chat.",
    approach: [
      "Administrator management and online absence / lateness tracking.",
      "Electronic document management and chat.",
    ],
    role: "Full-stack developer.",
    stackGroups: [{ label: "Stack", items: ["Java", "Spring Boot", "MySQL", "Docker"] }],
    stack: ["Java", "Spring Boot", "MySQL", "Docker"],
    period: "2024",
    links: { github: "https://github.com/Miche1-Pierre/admin-mns" },
    cover: "/images/projects/adminmns/adminmns_1.png",
    images: [
      "/images/projects/adminmns/adminmns_1.png",
      "/images/projects/adminmns/adminmns_2.png",
      "/images/projects/adminmns/adminmns_3.png",
    ],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
export const featuredProjects = projects.filter((p) => p.featured);
export const archiveProjects = projects.filter((p) => p.kind === "archive");
export const clientProjects = projects.filter((p) => p.kind === "client" && !p.featured);
