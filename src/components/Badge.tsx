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
  | "java"
  | "springboot"
  | "express"
  | "django"
  | "MySQL"
  | "Docker"
  | "WampServer"
  | "Trello"
  | "python"
  | "gitlab"
  | "github"
  | "postman"
  | "virtualbox"
  | "teams"
  | "microsoft365"
  | "curious"
  | "leadership"
  | "teamwork"
  | "communication"
  | "problem_solving"
  | "adaptability"
  | "creativity"
  | "time_management"
  | "critical_thinking"
  | "attention_to_detail"
  | "empathy"
  | "resilience";

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
  springboot: `
    bg-[#6db33f]/10
    text-[#6db33f]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#6db33f]/20
  `,
  express: `
    bg-[#000000]/10
    text-[#000000]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#000000]/20
  `,
  django: `
    bg-[#092e20]/10
    text-[#092e20]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#092e20]/20
  `,
  MySQL: `
    bg-[#f49f2f]/10 
    text-[#f49f2f]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#f49f2f]/20
  `,
  Docker: `
    bg-[#1c90ed]/10
    text-[#1c90ed]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#1c90ed]/20
  `,
  WampServer: `
    bg-[#ff0099]/10
    text-[#ff0099]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#ff0099]/20
  `,
  Trello: `
    bg-[#0079bf]/10
    text-[#0079bf]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#0079bf]/20
  `,
  python: `
    bg-[#ffe05d]/10
    text-[#ffe05d]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#ffe05d]/20
  `,
  gitlab: `
    bg-[#e24329]/10
    text-[#e24329]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#e24329]/20
  `,
  github: `
    bg-[#f0f6fc]/10
    text-[#f0f6fc]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#f0f6fc]/20
  `,
  postman: `
    bg-[#ff6c37]/10
    text-[#ff6c37]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#ff6c37]/20
  `,
  virtualbox: `
    bg-[#183a9e]/10
    text-[#183a9e]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#183a9e]/20
  `,
  teams: `
    bg-[#6264a7]/10
    text-[#6264a7]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#6264a7]/20
  `,
  microsoft365: `
    bg-[#0078d4]/10
    text-[#0078d4]
    border border-zinc-300 dark:border-white/10
    hover:bg-[#0078d4]/20
  `,
  curious: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  leadership: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  teamwork: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  communication: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  problem_solving: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  adaptability: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  creativity: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  time_management: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  critical_thinking: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  attention_to_detail: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  empathy: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
  `,
  resilience: `
    bg-zinc-800/10 
    text-zinc-800 dark:text-white 
    border border-zinc-300 dark:border-white/10 
    hover:bg-zinc-800/20 dark:hover:bg-white/10
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
