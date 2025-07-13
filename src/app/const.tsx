{
  /* Menu */
}
import { Home, User, LayoutGrid, Phone } from "lucide-react";
export const navItems = [
  { href: "/", label: "Home", icon: <Home size={16} /> },
  { href: "/about", label: "About", icon: <User size={16} /> },
  { href: "/work", label: "Work", icon: <LayoutGrid size={16} /> },
  { href: "/#contact", label: "Contact", icon: <Phone size={16} /> },
];

{
  /* App */
}
import { BadgeColor } from "@/components/Badge";
export const techs: { name: string; color: BadgeColor }[] = [
  { name: "Java", color: "java" },
  { name: "PHP", color: "php" },
  { name: "HTML", color: "html" },
  { name: "CSS", color: "css" },
  { name: "JavaScript", color: "js" },
  { name: "TypeScript", color: "ts" },
  { name: "React", color: "react" },
  { name: "Next.js", color: "next" },
  { name: "Tailwind", color: "tailwind" },
  { name: "Node.js", color: "node" },
];

export const quickLinks = [
  {
    title: "About Me",
    description: "Learn more about who I am and my journey.",
    href: "/about",
  },
  {
    title: "My Work",
    description: "Check out projects I've built and contributed to.",
    href: "/work",
  },
];

{
  /* About */
}
export const experiences = [
  {
    company: "SynapsIA",
    role: "Fullstack Developer",
    startDate: "Apr 2025",
    endDate: "June 2025",
    description:
      "Complete development of an internal application for reporting, project management and team management, with customized statistics and a modern environment.",
    imageSrc: "",
    linkWork: "/work",
    technologies: [
      "php",
      "html",
      "css",
      "js",
      "mysql",
      "docker",
      "wampserver",
      "trello",
      "github",
    ],
  },
  {
    company: "LORIA",
    role: "Fullstack Developer",
    startDate: "May 2024",
    endDate: "July 2024",
    description:
      "Development of a Letter of Recommendation management application for LORIA applications",
    imageSrc: "",
    technologies: ["python", "html", "css", "js", "sqlite", "docker", "gitlab"],
  },
];

export const educations = [
  {
    institution: "Metz Numeric School",
    fieldOfStudy: "Master of Computer Engineering Development",
    startDate: "2023",
    endDate: "Present",
  },
];

export const skills = {
  Frontend: ["html", "css", "js", "react", "tailwind"],
  Backend: [
    "java",
    "spring-boot",
    "php",
    "next.js",
    "express",
    "django",
    "docker",
  ],
  Utils: [
    "trello",
    "docker",
    "postman",
    "wampserver",
    "virtualbox",
    "teams",
    "microsoft365",
    "github",
  ],
  "Personal Qualities": [
    "curious",
    "leadership",
    "teamwork",
    "problem solving",
    "creativity",
    "communication",
    "empathy",
    "adaptability",
  ],
};

{
  /* Work */
}
export const projects = [
  {
    title: "Personal Portfolio",
    description:
      "Complete development of my portfolio in Next.js with TailwindCSS, displaying my experience, projects and skills.",
    techs: ["next.js", "react", "tailwindcss", "ts", "github"],
    github: "https://github.com/Miche1-Pierre/ai-portfolio",
    demo: "",
    images: [
      "/images/projects/portfolio/portfolio_1.png",
      "/images/projects/portfolio/portfolio_2.png",
    ],
  },
  {
    title: "SpeedReporting",
    description: (
      <>
        Development of an internal application for{" "}
        <a
          href="https://synapsia.fr/"
          className="underline text-[#45d8ac]"
          target="_blank"
          rel="noopener noreferrer"
        >
          SynapsIA
        </a>{" "}
        during my 2nd year internship. Application for reporting, project
        management and team management.
      </>
    ),
    techs: [
      "php",
      "html",
      "css",
      "js",
      "mysql",
      "wampserver",
      "docker",
      "trello",
      "github",
    ],
    github: "https://github.com/Miche1-Pierre/speed-reporting",
    demo: "",
    images: [
      "/images/projects/speedreporting/speedreporting_1.png",
      "/images/projects/speedreporting/speedreporting_2.png",
      "/images/projects/speedreporting/speedreporting_3.png",
      "/images/projects/speedreporting/speedreporting_4.png",
      "/images/projects/speedreporting/speedreporting_5.png",
      "/images/projects/speedreporting/speedreporting_6.png",
      "/images/projects/speedreporting/speedreporting_7.png",
    ],
  },
  {
    title: "Admin MNS",
    description: (
      <>
        Administration tool developed as part of a research and development
        project during my 2nd year at{" "}
        <a
          href="https://www.metz-numeric-school.fr/"
          className="underline text-[#45d8ac]"
          target="_blank"
          rel="noopener noreferrer"
        >
          Metz Numeric School
        </a>
        . Application, administrator management of the application as well as
        online management of absences and late arrivals, EDM and online chat.
      </>
    ),
    techs: [
      "java",
      "springboot",
      "html",
      "css",
      "js",
      "mysql",
      "wampserver",
      "trello",
      "github",
    ],
    github: "https://github.com/Miche1-Pierre/admin-mns",
    demo: "",
    images: [
      "/images/projects/adminmns/adminmns_1.png",
      "/images/projects/adminmns/adminmns_2.png",
      "/images/projects/adminmns/adminmns_3.png",
      "/images/projects/adminmns/adminmns_4.png",
      "/images/projects/adminmns/adminmns_5.png",
      "/images/projects/adminmns/adminmns_6.png",
    ],
  },
];

{
  /* Contact Form */
}
export const contactFormText = {
  placeholders: {
    name: "Your Name",
    email: "Your Email",
    message: "Describe your project...",
  },
  button: {
    idle: "Start Working Together!",
    sending: "Sending...",
  },
  status: {
    success: "🎉 Message sent successfully! I will get back to you soon.",
    error: "⚠️ Oops, something went wrong. Please try again.",
  },
};

{
  /* Footer */
}
export const siteMetadata = {
  author: "Pierre MICHEL",
  email: "pierre.michel.work@gmail.com",
  year: new Date().getFullYear(),
  copyright: (name: string, year: number) =>
    `© ${year} ${name}. All rights reserved.`,
  socials: {
    github: {
      href: "https://github.com/Miche1-Pierre",
      label: "Visit my GitHub profile",
    },
    linkedin: {
      href: "https://www.linkedin.com/in/pierre-michel-6424a8240/",
      label: "Visit my LinkedIn profile",
    },
    mail: {
      href: "mailto:pierre.michel.work@gmail.com",
      label: "Send me an email",
    },
  },
};
