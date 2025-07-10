"use client";

import NavigationMenu from "@/components/NavigationMenu";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import ProjectCard from "@/components/work/ProjectCard";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import { projects } from "@/app/const";

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
