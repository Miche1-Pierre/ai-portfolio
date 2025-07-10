{/* App */}
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


{/* About */}
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

{/* Work */}
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