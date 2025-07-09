"use client";

import NavigationMenu from "@/components/NavigationMenu";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import ProjectCard from "@/components/work/ProjectCard";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const projects = [
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

export default function Work() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="p-6 sm:p-10 flex justify-center">
        <NavigationMenu />
      </header>

      <main className="flex-grow px-6 sm:px-20 py-10 mt-20 space-y-10">
        {/* Work Section */}
        <section className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">My Projects</h1>
          {projects.map((proj, i) => (
            <ProjectCard key={i} {...proj} />
          ))}
        </section>
      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          variant="outline"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#45d8ac] hover:bg-[#3dc09b] text-white shadow-lg"
        >
          <ArrowUp size={18} />
        </Button>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
