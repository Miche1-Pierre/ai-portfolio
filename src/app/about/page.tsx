"use client";

import NavigationMenu from "@/components/NavigationMenu";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import Profile from "@/components/about/Profile";
import WorkExperienceItem from "@/components/about/Experience";
import EducationItem from "@/components/about/Education";
import SkillSection from "@/components/about/Skills";

import { useEffect, useState } from "react";
import { ArrowUp, Github, Linkedin, Mail } from "lucide-react";
import { experiences, educations } from "@/app/const";

export default function About() {
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

      <main className="flex-grow px-6 sm:px-20 py-10 mt-20">
        <div className="relative max-w-7xl mx-auto px-6 flex gap-10">
          {/* Colonne gauche */}
          <aside className="sticky top-20 w-60 self-start">
            <Profile />
          </aside>

          {/* Colonne centrale */}
          <section className="flex-1 max-w-3xl mx-auto flex flex-col gap-28">
            <div className="sm:w-2/3 flex flex-col">
              <h1 className="text-6xl font-bold">Pierre MICHEL</h1>
              <p className="text-xl text-[#45d8ac] font-semibold mt-2">
                Fullstack Developer
              </p>

              <div className="flex gap-6 text-white mt-4">
                <a
                  href="https://github.com/Miche1-Pierre"
                  aria-label="GitHub"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#fca96b]  flex items-center gap-2 transition-colors border border-zinc-700 rounded-full p-2"
                >
                  <Github size={14} />
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/pierre-michel-6424a8240/"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#fca96b] flex items-center gap-2 transition-colors border border-zinc-700 rounded-full p-2"
                >
                  <Linkedin size={14} />
                  LinkedIn
                </a>
                <a
                  href="mailto:pierre.michel.work@gmail.com"
                  aria-label="Email"
                  className="hover:text-[#fca96b] flex items-center gap-2 transition-colors border border-zinc-700 rounded-full p-2"
                >
                  <Mail size={14} />
                  Email
                </a>
              </div>

              <p className="mt-6 max-w-xl text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Passionate about web development and always ready to take on new
                challenges, I create high-performance, elegant applications.
              </p>
            </div>

            {/* Work Experience Section */}
            <section className="w-full">
              <h2 className="text-3xl font-bold mb-8">Work Experiences</h2>
              <div className="space-y-8">
                {experiences.map((exp, index) => (
                  <WorkExperienceItem
                    key={index}
                    company={exp.company}
                    role={exp.role}
                    startDate={exp.startDate}
                    endDate={exp.endDate}
                    description={exp.description}
                    imageSrc={exp.imageSrc}
                    imageAlt={`${exp.company} logo`}
                    linkWork={exp.linkWork}
                    technologies={exp.technologies}
                  />
                ))}
              </div>
            </section>

            {/* Education Section */}
            <section className="w-full">
              <h2 className="text-3xl font-bold mb-8">Education</h2>
              <div className="space-y-6">
                {educations.map((edu, index) => (
                  <EducationItem
                    key={index}
                    institution={edu.institution}
                    fieldOfStudy={edu.fieldOfStudy}
                    startDate={edu.startDate}
                    endDate={edu.endDate}
                  />
                ))}
              </div>
            </section>

            {/* Skills Section */}
            <SkillSection />
          </section>
        </div>
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
