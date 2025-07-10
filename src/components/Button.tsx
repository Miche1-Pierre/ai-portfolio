"use client";

import React from "react";
import classNames from "classnames";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = `
    rounded-full 
    backdrop-blur-sm 
    border 
    px-2 py-1 
    text-sm font-medium 
    transition-colors duration-300 
    shadow-sm 
    focus:outline-none 
    active:scale-95 
    cursor-pointer
    z-1
  `;

  const variantStyles = {
    primary: `
      bg-[#45d8ac] 
      text-white 
      border-transparent 
      hover:bg-[#3ac196] 
      dark:bg-[#45d8ac] 
      dark:hover:bg-[#3ac196]
    `,
    secondary: `
      bg-white/80 
      text-zinc-900 
      dark:bg-zinc-900/80 
      dark:text-white 
      border-zinc-300 
      dark:border-white/10 
      hover:bg-[#45d8ac]/10 
      hover:border-[#45d8ac] 
      hover:text-[#45d8ac] 
      dark:hover:bg-[#45d8ac]/10
    `,
    outline: `
      bg-transparent 
      text-zinc-900 
      dark:text-white 
      border-gray-300 
      hover:border-[#45d8ac] 
      hover:text-[#45d8ac] 
      hover:bg-[#45d8ac]/10 
      dark:hover:bg-[#45d8ac]/10
    `,
    danger: `
      bg-red-500 
      text-white 
      border-transparent 
      hover:bg-red-600
    `,
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const classes = classNames(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className
  );

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
