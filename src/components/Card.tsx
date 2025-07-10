import React from "react";
import classNames from "classnames";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={classNames(
        "rounded-2xl p-5 shadow-sm border border-zinc-300 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm transition-colors z-1",
        className
      )}
    >
      {children}
    </div>
  );
}
