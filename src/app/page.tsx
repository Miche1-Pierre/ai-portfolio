"use client";

import NavigationMenu from "@/components/NavigationMenu";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Badge from "@/components/Badge";
import FloatingBadgeCloud from "@/components/FloatingBadgeCloud";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";
import Footer from "@/components/Footer";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const quickLinks = [
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

export default function Home() {
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
        {/* Hero */}
        <section className="max-w-3xl">
          <Badge>Home</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-4 leading-tight">
            I build <span className="text-[#45d8ac]">modern</span> web
            experiences that are
            <span className="text-[#45d8ac]"> fast</span>,{" "}
            <span className="text-[#45d8ac]">elegant</span> and{" "}
            <span className="text-[#45d8ac]">meaningful</span>.
          </h1>
          <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
            I&apos;m a junior web developer focused on creating clean and functional digital experiences while continuously learning and improving.
          </p>
        </section>

        {/* Tech Stack */}
        <section className="w-3xl">
          <Badge className="mb-8">Tech Stack</Badge>
          <FloatingBadgeCloud />
        </section>

        {/* Quick Links */}
        <section className="w-full max-w-5xl mx-auto px-6 sm:px-20 py-10 relative">
          <Badge>Explore More</Badge>

          {/* Spotlights */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 600,
              height: 200,
              background: "rgba(255, 255, 255, 0.1)",
              filter: "blur(70px)",
              boxShadow: "0 0 120px 80px rgba(255, 255, 255, 0.1)",
              top: "20%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 0,
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 500,
              height: 400,
              background: "rgba(255, 140, 0, 0.1)",
              filter: "blur(70px)",
              boxShadow: "0 0 100px 70px rgba(255, 140, 0, 0.1)",
              top: "80%",
              left: "0%",
              transform: "translate(-50%, -50%)",
              zIndex: 0,
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 500,
              height: 400,
              background: "rgba(0, 200, 255, 0.1)",
              filter: "blur(70px)",
              boxShadow: "0 0 110px 75px rgba(0, 200, 255, 0.1)",
              top: "80%",
              left: "100%",
              transform: "translate(-50%, -50%)",
              zIndex: 0,
            }}
          />

          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8 z-10">
            {quickLinks.map(({ title, description, href }) => (
              <Link key={href} href={href} className="block">
                <Card className="p-6 cursor-pointer bg-white dark:bg-zinc-800 transform transition-transform duration-300 hover:scale-105 hover:bg-[#45d8ac]/10 hover:shadow-lg hover:-translate-y-1 w-full h-48">
                  <h3 className="text-xl font-semibold mb-2 text-[#45d8ac]">
                    {title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact / Call to action */}
        <section className="w-3xl" id="contact">
          <Badge>Contact Me</Badge>
          <Card className="p-6 sm:p-8 text-center sm:text-left mt-8">
            <h2 className="text-2xl font-semibold mb-4">Start a project</h2>
            <p className="text-base mb-6 text-zinc-600 dark:text-zinc-400">
              Got an idea or need a dev ? Let&apos;s bring your vision to life.
            </p>
            <form className="flex flex-col gap-4">
              <Input type="text" placeholder="Your Name" required />
              <Input type="email" placeholder="Your Email" required />
              <Textarea
                rows={4}
                placeholder="Describe your project..."
                required
              />
              <Button className="mt-4" type="submit" variant="outline">
                Start Working Together !
              </Button>
            </form>
          </Card>
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
