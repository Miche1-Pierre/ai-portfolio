import React from "react";
import classNames from "classnames";

type Props = {
  children: React.ReactNode;
  size?: "xs" | "md" | "xl";
  className?: string;
};

const sizes = {
  xs: "text-lg font-semibold",
  md: "text-2xl font-bold",
  xl: "text-4xl font-extrabold",
};

export default function Heading({ children, size = "md", className }: Props) {
  return (
    <h2
      className={classNames(
        sizes[size],
        "text-black dark:text-white",
        className
      )}
    >
      {children}
    </h2>
  );
}
