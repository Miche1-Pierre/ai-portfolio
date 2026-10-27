export const site = {
  name: "Pierre Michel",
  firstName: "Pierre",
  title: "Full-Stack Software Engineer · Applied AI",
  headline: "I take products from scoping to production.",
  subheadline:
    "Architecture, applied AI and product design, across startups and established companies, a research lab and a regulated environment.",
  location: "France · open to remote & relocation",
  availability: "Available from October 2026",
  email: "pierre.michel.work@gmail.com",
  url: "https://ai-portfolio-pierre-michel.vercel.app",
  languages: ["French (native)", "English (professional)"],
  socials: {
    github: { href: "https://github.com/Miche1-Pierre", label: "GitHub" },
    linkedin: {
      href: "https://www.linkedin.com/in/pierre-michel-work/",
      label: "LinkedIn",
    },
    taskforce: {
      href: "https://github.com/taskforce-project",
      label: "Taskforce on GitHub",
    },
  },
  /** Client names from the CV are hidden on the public site until explicitly allowed. */
  showClientNames: true,
} as const;

export const metrics = [
  { value: 3, suffix: "", label: "enterprise accounts shipped in 7 months" },
  { value: 13, suffix: "k", label: "registered users on the SaaS I lead" },
  { value: 60, suffix: "%", label: "of a carrier's traffic handled by an AI agent I shipped" },
  { value: 100, prefix: "~", suffix: "h", label: "of manual work freed every month by AI triage" },
] as const;

type Organization = {
  name: string;
  kind: "employer" | "client";
  slug?: string;
  /** Pierre's role there, short */
  role: string;
  /** the organisation's field, up to three short tags (acronyms where the field uses one) */
  domains: string[];
};

/**
 * Teams Pierre has shipped with (employers and, through TechGuys, clients), for the "trusted by"
 * row, with his role and the field each one works in. `slug` links the matching case study. Client
 * names follow `site.showClientNames`.
 */
const allOrganizations: Organization[] = [
  { name: "TechGuys", kind: "employer", role: "Tech Lead", domains: ["Consulting", "AI"] },
  { name: "Plania", kind: "employer", slug: "plania", role: "Head of Engineering", domains: ["SaaS", "AI"] },
  { name: "Safex Transport", kind: "client", slug: "ai-sales-agent", role: "Tech Lead", domains: ["Freight", "Logistics"] },
  { name: "Communauto", kind: "client", slug: "incident-triage", role: "Tech Lead", domains: ["Automotive", "Mobility"] },
  { name: "Groupe Laplante", kind: "client", slug: "lease-financing", role: "Architect", domains: ["Finance", "Automotive"] },
  { name: "Nancyclotep", kind: "employer", slug: "pharma-lims", role: "Full-Stack Developer", domains: ["Nuclear medicine", "Pharma", "GxP"] },
  { name: "SynapsIA", kind: "employer", slug: "speedreporting", role: "Full-Stack Developer", domains: ["Consulting", "AI"] },
  { name: "LORIA", kind: "employer", role: "Full-Stack Intern", domains: ["Research lab", "CNRS", "Inria"] },
];
export const organizations = allOrganizations.filter((o) => site.showClientNames || o.kind === "employer");

export const navigation = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
] as const;
