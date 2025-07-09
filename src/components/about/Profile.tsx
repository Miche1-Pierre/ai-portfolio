import React from "react";
import Badge from "@/components/Badge";
import Image from "next/image";

import { Globe, Github, Linkedin, Mail } from "lucide-react";

export default function Profile() {
  return (
    <section className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-12 items-start">
      {/* Colonne gauche */}
      <div className="flex flex-col items-center sm:items-start sm:w-1/3">
        <Image
          src="/images/profile.png"
          alt="Pierre Michel"
          width={150}
          height={150}
          className="rounded-full border-2 border-white shadow-lg"
        />

        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mt-4">
          <Globe size={18} />
          <span>Metz, France</span>
        </div>

        <div className="flex gap-2 mt-2">
          <Badge>FR</Badge>
          <Badge>EN</Badge>
        </div>
      </div>

      {/* Colonne droite */}
      <div className="sm:w-2/3 flex flex-col">
        <h1 className="text-4xl font-bold">Pierre MICHEL</h1>
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
    </section>
  );
}
