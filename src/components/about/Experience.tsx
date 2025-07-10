import Badge, { BadgeColor } from "@/components/Badge";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type WorkExperienceItemProps = {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  linkWork?: string;
  technologies?: string[];
};

export default function WorkExperienceItem({
  company,
  role,
  startDate,
  endDate,
  description,
  imageSrc,
  imageAlt,
  linkWork,
  technologies,
}: WorkExperienceItemProps) {
  const getBadgeColor = (tech: string): BadgeColor => {
    switch (tech.toLowerCase()) {
      case "react":
        return "react";
      case "typescript":
      case "ts":
        return "ts";
      case "javascript":
      case "js":
        return "js";
      case "html":
        return "html";
      case "css":
        return "css";
      case "node":
      case "node.js":
      case "nodejs":
        return "node";
      case "next.js":
      case "next":
        return "next";
      case "tailwind":
      case "tailwindcss":
        return "tailwind";
      case "php":
        return "php";
      case "java":
        return "java";
      case "mysql":
        return "MySQL";
      case "docker":
        return "Docker";
      case "wampserver":
        return "WampServer";
      case "trello":
        return "Trello";
      case "python":
        return "python";
      case "gitlab":
        return "gitlab";
      case "github":
        return "github";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
      {imageSrc && (
        <div className="sm:w-1/3 flex-shrink-0">
          <Image
            src={imageSrc}
            alt={imageAlt || company || "Work experience image"}
            width={200}
            height={150}
            className="rounded-md object-cover"
          />
        </div>
      )}

      <div className="sm:w-2/3 flex flex-col justify-between">
        <h3 className="text-2xl font-semibold text-[#45d8ac]">{company}</h3>
        <p className="font-medium text-zinc-700 dark:text-zinc-300">
          {role} &nbsp;•&nbsp;{" "}
          <span className="italic">
            {startDate} - {endDate || "Present"}
          </span>
        </p>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>

        {technologies && technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {technologies.map((tech, i) => (
              <Badge key={i} color={getBadgeColor(tech)}>
                {tech}
              </Badge>
            ))}
          </div>
        )}

        {linkWork && (
          <a
            href={linkWork}
            className="mt-4 inline-block text-sm text-[#45d8ac] font-medium hover:underline"
          >
            Voir le projet <ArrowRight size={18} className="inline-block ml-1" />
          </a>
        )}
      </div>
    </div>
  );
}
