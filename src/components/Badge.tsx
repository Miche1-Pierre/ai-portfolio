import React from "react";
import classNames from "classnames";

export type BadgeColor =
  | "default"
  | "secondary"
  | "light"
  | "html"
  | "css"
  | "js"
  | "ts"
  | "react"
  | "next"
  | "tailwind"
  | "node"
  | "php"
  | "java";

type BadgeProps = {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
};

const colorClasses: Record<BadgeColor, string> = {
  default: `
    bg-[#fca96b]/20 
    text-[#fca96b] 
    border border-zinc-300 dark:border-white/10 
    hover:bg-[#fca96b]/30 
    dark:hover:bg-[#fca96b]/30
  `,
  secondary: `
    bg-[#45d8ac]/10 
    text-[#45d8ac] 
    border border-zinc-300 dark:border-white/10 
    hover:bg-[#45d8ac]/20
  `,
  light: `
    bg-white/80 
    text-zinc-900 
    dark:bg-zinc-900/80 
    dark:text-white 
    border border-zinc-300 dark:border-white/10
  `,

  // Tech-specific badges:
  java: `
    bg-[#e76f00]/10 
    text-[#e76f00] 
    border border-zinc-300 dark:border-white/10 
    hover:bg-[#e76f00]/20
  `,
  php: `
    bg-[#8993be]/10 
    text-[#8993be] 
    border border-zinc-300 dark:border-white/10 
    hover:bg-[#8993be]/20
  `,
  html: `
    bg-[#e44d26]/10 
    text-[#e44d26] 
    border border-zinc-300 dark:border-white/10 
    hover:bg-[#e44d26]/20
  `,
  css: `
    bg-[#2965f1]/10 
    text-[#2965f1] 
    border border-zinc-300 dark:border-white/10 
    hover:bg-[#2965f1]/20
  `,
  js: `
    bg-[#f7df1e]/20 
    text-[#f7df1e] 
    border border-zinc-300 dark:border-white/10 
    hover:bg-[#f7df1e]/30
  `,
  ts: `
    bg-[#3178c6]/10 
    text-[#3178c6] 
    border border-zinc-300 dark:border-white/10 
    hover:bg-[#3178c6]/20
  `,
  react: `
    bg-[#61dafb]/10 
    text-[#61dafb] 
    border border-zinc-300 dark:border-white/10 
    hover:bg-[#61dafb]/20
  `,
  next: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  tailwind: `
    bg-[#38bdf8]/10 
    text-[#38bdf8] 
    border border-zinc-300 dark:border-white/10 
    hover:bg-[#38bdf8]/20
  `,
  node: `
    bg-[#3c873a]/10 
    text-[#3c873a] 
    border border-zinc-300 dark:border-white/10 
    hover:bg-[#3c873a]/20
  `,
};

export default function Badge({
  children,
  color = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium transition-colors backdrop-blur-sm",
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
