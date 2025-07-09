import React from "react";
import classNames from "classnames";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={classNames(
        "w-full rounded-xl px-4 py-2 bg-white/80 dark:bg-zinc-900/80 border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#45d8ac] transition-all duration-200 backdrop-blur-sm resize-none",
        className
      )}
      {...props}
    />
  );
}
