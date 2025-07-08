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
  const baseStyles =
    "rounded-[6px] font-semibold focus:outline-none transition-transform transform cursor-pointer active:scale-95";

  const variantStyles = {
    primary: "bg-[#45d8ac] text-white hover:bg-[#3ac196] focus:ring-[#38b89f]",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    outline:
      "bg-transparent border border-gray-300 text-white hover:border-[#45d8ac] hover:text-[#45d8ac] hover:bg-[rgba(69,216,172,0.1)] focus:ring-[#38b89f]",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
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
