import Badge from "@/components/Badge";

const skills = {
  Frontend: ["html", "css", "js", "react", "tailwind"],
  Backend: ["java", "spring-boot", "php", "next.js", "express", "django","docker"],
  Utils: [
    "trello",
    "docker",
    "postman",
    "wampserver",
    "virtualbox",
    "teams",
    "microsoft365",
    "github",
  ],
  "Personal Qualities": [
    "curious",
    "leadership",
    "teamwork",
    "problem solving",
    "creativity",
    "communication",
    "empathy",
    "adaptability",
  ],
};

export default function SkillSection() {
  return (
    <section className="w-full">
      <h2 className="text-3xl font-bold mb-8">Skills</h2>
      <div className="space-y-10">
        {Object.entries(skills).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xl font-semibold text-[#45d8ac] mb-4">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {items.map((tech, i) => (
                <Badge key={i} color={getBadgeColor(tech)}>
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import { BadgeColor } from "@/components/Badge";
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
    case "spring boot":
      return "java";
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
      return "secondary";
    case "wampserver":
      return "WampServer";
    case "virtualbox":
      return "secondary";
    case "teams":
      return "secondary";
    case "microsoft365":
      return "secondary";
    case "github":
      return "secondary";

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
