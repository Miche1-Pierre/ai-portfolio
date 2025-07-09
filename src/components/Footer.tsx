import React from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 px-6 sm:px-20 py-10 border-t border-zinc-300 dark:border-white/10 text-sm text-zinc-600 dark:text-zinc-400 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p>© {new Date().getFullYear()} Pierre MICHEL. All rights reserved.</p>
      <div className="flex gap-4">
        <Link
          href="https://github.com/Miche1-Pierre"
          target="_blank"
          aria-label="GitHub"
          className="hover:text-[#45d8ac] transition-colors p-2 border rounded-full"
        >
          <Github
            className="hover:text-[#45d8ac] transition-colors"
            size={18}
          />
        </Link>
        <Link
          href="https://www.linkedin.com/in/pierre-michel-6424a8240/"
          target="_blank"
          aria-label="LinkedIn"
          className="hover:text-[#45d8ac] transition-colors p-2 border rounded-full"
        >
          <Linkedin
            className="hover:text-[#45d8ac] transition-colors"
            size={18}
          />
        </Link>
        <Link
          href="mailto:pierre.michel.work@gmail.com"
          aria-label="Email"
          className="hover:text-[#45d8ac] transition-colors p-2 border rounded-full"
        >
          <Mail className="hover:text-[#45d8ac] transition-colors" size={18} />
        </Link>
      </div>
    </footer>
  );
}
