import Card from "@/components/Card";
import Badge, { BadgeColor } from "@/components/Badge";
import Image from "next/image";
import { useState } from "react";

import { ExternalLink, Github } from "lucide-react";

type Project = {
  title: string;
  description: React.ReactNode;
  techs: string[];
  github?: string;
  demo?: string;
  images?: string[];
};

export default function ProjectCard({
  title,
  description,
  techs,
  github,
  demo,
  images = [],
}: Project) {
  const [current, setCurrent] = useState(0);

  return (
    <Card className="space-y-4">
      {/* Slider */}
      {images.length > 0 && (
        <div className="relative w-full rounded-xl overflow-hidden">
          <Image
            src={images[current]}
            alt={`Screenshot ${current + 1}`}
            width={1200}
            height={675}
            className="rounded-xl object-cover w-full h-auto"
            sizes="(max-width: 768px) 100vw, 768px"
            quality={100}
            unoptimized
            priority={current === 0}
          />
          {/* Navigation boutons */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-3 h-3 rounded-full ${
                    i === current ? "bg-[#45d8ac]" : "bg-zinc-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Titre & liens */}
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-xl font-semibold text-zinc-800 dark:text-white">
          {title}
        </h3>
        <div className="flex gap-2">
          {demo && (
            <a
              href={demo}
              target="_blank"
              rel="noopener noreferrer"
              title="Voir la démo"
            >
              <ExternalLink size={18} className="text-[#45d8ac]" />
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              title="Voir le code"
              className="text-zinc-700 dark:text-zinc-300 hover:text-[#45d8ac] flex items-center gap-1 border border-zinc-300 dark:border-zinc-600 hover:border-[#45d8ac] rounded-full px-2 py-1 hover:bg-zinc-800 dark:hover:bg-zinc-800 transition-colors"
            >
              <Github size={18} />
              Voir le code
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {techs.map((tech, i) => (
          <Badge key={i} color={getBadgeColor(tech)} className="text-xs">
            {tech}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

const getBadgeColor = (tech: string): BadgeColor => {
  switch (tech.toLowerCase()) {
    case "html":
      return "html";
    case "css":
      return "css";
    case "javascript":
    case "js":
      return "js";
    case "react":
      return "react";
    case "tailwind":
    case "tailwindcss":
      return "tailwind";

    case "java":
      return "java";
    case "spring-boot":
      return "springboot";
    case "php":
      return "php";
    case "next.js":
    case "next":
      return "next";
    case "express":
      return "node";
    case "django":
      return "python";

    case "trello":
      return "Trello";
    case "docker":
      return "Docker";
    case "postman":
      return "postman";
    case "wampserver":
      return "WampServer";
    case "virtualbox":
      return "default";
    case "teams":
      return "teams";
    case "microsoft365":
      return "microsoft365";
    case "github":
      return "github";

    case "curious":
      return "curious";
    case "leadership":
      return "leadership";
    case "teamwork":
      return "teamwork";
    case "problem solving":
      return "problem_solving";
    case "creativity":
      return "creativity";
    case "communication":
      return "communication";
    case "empathy":
      return "empathy";
    case "adaptability":
      return "adaptability";
    case "time management":
      return "time_management";
    case "critical thinking":
      return "critical_thinking";
    case "attention to detail":
      return "attention_to_detail";
    case "resilience":
      return "resilience";

    default:
      return "secondary";
  }
};
