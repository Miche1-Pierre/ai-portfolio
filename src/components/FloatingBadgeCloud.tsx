"use client";

import { useEffect, useState } from "react";
import Badge from "./Badge";
import { techs } from "@/app/const";

export default function FloatingBadgeCloud() {
  const [animValues, setAnimValues] = useState<
    { delay: string; duration: string }[]
  >([]);

  useEffect(() => {
    const values = techs.map(() => ({
      delay: `${(Math.random() * 2).toFixed(2)}s`,
      duration: `${(3 + Math.random() * 2).toFixed(2)}s`,
    }));
    setAnimValues(values);
  }, []);

  if (animValues.length !== techs.length) return null; // évite le flash

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 place-items-center relative">
      {techs.map((tech, i) => (
        <div
          key={tech.name}
          className="relative animate-float"
          style={{
            animationDelay: animValues[i].delay,
            animationDuration: animValues[i].duration,
          }}
        >
          <div className="absolute inset-0 bg-sky-300/20 blur-xl rounded-full z-0" />
          <div className="relative z-10">
            <Badge
              color={tech.color}
              className="hover:scale-110 transition-transform duration-300"
            >
              {tech.name}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
