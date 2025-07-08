"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Home, User, LayoutGrid, FileText, Sun, Moon } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: <Home size={16} /> },
  { href: "/about", label: "About", icon: <User size={16} /> },
  { href: "/work", label: "Work", icon: <LayoutGrid size={16} /> },
  { href: "/blog", label: "Blog", icon: <FileText size={16} /> },
];

export default function NavigationMenu() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div
      className="flex items-center 
      bg-white/80 text-zinc-900 
      dark:bg-zinc-900/80 dark:text-white
      rounded-full px-2 py-1 shadow-sm backdrop-blur-sm 
      border border-zinc-300 dark:border-white/10 
      transition-colors duration-300"
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full 
            hover:bg-[#45d8ac]/10 hover:text-[#45d8ac] 
            transition-colors text-sm font-medium"
        >
          {item.icon}
          {item.label}
        </Link>
      ))}

      <div className="mx-2 w-px h-5 bg-zinc-300 dark:bg-white/20" />

      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700/60 transition-colors"
        aria-label="Toggle theme"
      >
        {mounted ? (
          theme === "dark" ? (
            <Sun size={16} />
          ) : (
            <Moon size={16} />
          )
        ) : null}
      </button>
    </div>
  );
}
