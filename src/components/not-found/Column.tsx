import React from "react";
import type { JSX } from "react";
import classNames from "classnames";

type Props = {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  fill?: boolean;
  center?: boolean;
  paddingBottom?: string;
  className?: string;
};

export default function Column({
  children,
  as: Tag = "div",
  fill,
  center,
  paddingBottom,
  className,
}: Props) {
  const classes = classNames(
    "flex flex-col px-4",
    fill && "min-h-screen",
    center && "items-center justify-center text-center",
    paddingBottom && `pb-${paddingBottom}`,
    className
  );

  return <Tag className={classes}>{children}</Tag>;
}
