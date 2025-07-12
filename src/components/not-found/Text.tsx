import React from "react";
import classNames from "classnames";

type Props = {
  children: React.ReactNode;
  variant?: "body" | "label" | "caption";
  className?: string;
};

const variants = {
  body: "text-base text-black dark:text-white",
  label: "text-4xl font-bold tracking-tight",
  caption: "text-sm text-gray-400",
};

export default function Text({ children, variant = "body", className }: Props) {
  return <p className={classNames(variants[variant], className)}>{children}</p>;
}
