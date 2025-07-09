"use client";

import NavigationMenu from "@/components/NavigationMenu";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import Profile from "@/components/about/Profile";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

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

      <main className="flex-grow px-6 sm:px-20 py-10 flex flex-col gap-28 items-center text-left mt-20">
        {/* Profile Section */}
        <section className="max-w-3xl">
          <Profile />
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
