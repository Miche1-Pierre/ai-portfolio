export const site = {
  name: "Pierre Michel",
  firstName: "Pierre",
  title: "Full-Stack Software Engineer · Applied AI",
  headline: "I take products from scoping to production.",
  subheadline:
    "Architecture, applied AI and product design, across startups and established companies, a research lab and a regulated environment.",
  location: "France · relocating to Montréal, QC",
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
  showClientNames: false,
} as const;

export const metrics = [
  { value: 3, suffix: "", label: "enterprise accounts shipped in 7 months" },
  { value: 13, suffix: "k", label: "registered users on the SaaS I lead" },
  { value: 60, suffix: "%", label: "of a carrier's traffic handled by an AI agent I shipped" },
  { value: 100, prefix: "~", suffix: "h", label: "of manual work freed every month by AI triage" },
] as const;

export const navigation = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
] as const;
