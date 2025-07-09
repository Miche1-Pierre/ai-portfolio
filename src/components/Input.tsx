import React from "react";
import classNames from "classnames";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={classNames(
        "w-full rounded-full px-4 py-2 bg-white/80 dark:bg-zinc-900/80 border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#45d8ac] transition-all duration-200 backdrop-blur-sm z-1",
        className
      )}
      {...props}
    />
  );
}
