"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// Aceternity UI "Text Generate Effect": words fade + un-blur in sequence.
// `accentFrom` colours the words from that index onward with the brand gradient.
export function TextGenerateEffect({
  words,
  className,
  accentFrom,
}: {
  words: string;
  className?: string;
  accentFrom?: number;
}) {
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();
  const arr = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: "blur(0px)" },
      { duration: reduce ? 0 : 0.6, delay: reduce ? 0 : stagger(0.12) }
    );
  }, [animate, reduce]);

  return (
    <div className={cn(className)}>
      <div ref={scope}>
        {arr.map((word, i) => {
          const accent = accentFrom !== undefined && i >= accentFrom;
          return (
            <motion.span
              key={word + i}
              className={cn("opacity-0", accent && "text-gradient")}
              style={{ filter: reduce ? "none" : "blur(8px)" }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}

export default TextGenerateEffect;
