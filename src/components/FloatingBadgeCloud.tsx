"use client";

import Badge, { BadgeColor } from "./Badge";

const techs: { name: string; color: BadgeColor }[] = [
  { name: "Java", color: "java" },
  { name: "PHP", color: "php" },
  { name: "HTML", color: "html" },
  { name: "CSS", color: "css" },
  { name: "JavaScript", color: "js" },
  { name: "TypeScript", color: "ts" },
  { name: "React", color: "react" },
  { name: "Next.js", color: "next" },
  { name: "Tailwind", color: "tailwind" },
  { name: "Node.js", color: "node" },
];

export default function FloatingBadgeCloud() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 place-items-center">
      {techs.map((tech) => (
        <div
          key={tech.name}
          className="animate-float"
          style={{
            animationDelay: `${(Math.random() * 2).toFixed(2)}s`,
            animationDuration: `${(3 + Math.random() * 2).toFixed(2)}s`,
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[#ffffff]/15 blur-xl rounded-full z-0" />
            <div className="relative z-10">
              <Badge
                color={tech.color}
                className="hover:scale-120 transition-transform duration-300 cursor-pointer"
              >
                {tech.name}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
