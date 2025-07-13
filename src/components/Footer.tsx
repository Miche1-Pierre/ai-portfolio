import React from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { siteMetadata } from "@/app/const";

export default function Footer() {
  const { author, year, socials } = siteMetadata;
  return (
    <footer className="relative mt-10 px-6 sm:px-20 py-10 border-t border-zinc-300 dark:border-white/10 text-sm text-zinc-600 dark:text-zinc-400 flex flex-col sm:flex-row justify-between items-center gap-4 overflow-hidden z-1">
      <p>{siteMetadata.copyright(author, year)}</p>

      <div className="flex gap-4">
        <Link
          href={socials.github.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={socials.github.label}
          className="hover:text-[#45d8ac] transition-colors p-2 border rounded-full"
        >
          <Github size={18} />
        </Link>
        <Link
          href={socials.linkedin.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={socials.linkedin.label}
          className="hover:text-[#45d8ac] transition-colors p-2 border rounded-full"
        >
          <Linkedin size={18} />
        </Link>
        <Link
          href={socials.mail.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={socials.mail.label}
          className="hover:text-[#45d8ac] transition-colors p-2 border rounded-full"
        >
          <Mail size={18} />
        </Link>
      </div>

      {/* Spotlights */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600,
          height: 200,
          background: "rgba(255, 140, 0, 0.1)",
          filter: "blur(70px)",
          boxShadow: "0 0 200px 10px rgba(255, 140, 0, 0.1)",
          bottom: "0%",
          left: "20%",
          transform: "translateX(-50%)",
          zIndex: 0,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 200,
          background: "rgba(0, 200, 255, 0.15)",
          filter: "blur(80px)",
          boxShadow: "0 0 500px 200px rgba(0, 200, 255, 0.2)",
          bottom: "0%",
          left: "65%",
          transform: "translateX(-50%)",
          zIndex: 0,
        }}
      />
    </footer>
  );
}
