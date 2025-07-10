"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Home,
  User,
  LayoutGrid,
  Phone,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: <Home size={16} /> },
  { href: "/about", label: "About", icon: <User size={16} /> },
  { href: "/work", label: "Work", icon: <LayoutGrid size={16} /> },
  { href: "/#contact", label: "Contact", icon: <Phone size={16} /> },
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
      className="fixed flex items-center 
      light:bg-white/80 text-zinc-900 
      dark:bg-zinc-900/80 dark:text-white
      rounded-full px-2 py-1 shadow-lg shadow-zinc-400/30 dark:shadow-black/30 backdrop-blur-sm 
      border border-zinc-300 dark:border-white/10 
      transition-colors duration-300 z-50"
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

      {/* Spotlight cyan */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 800,
          height: 400,
          background: "rgba(0, 200, 255, 0.15)",
          filter: "blur(80px)",
          boxShadow: "0 0 500px 200px rgba(0, 200, 255, 0.15)",
          top: "0",
          left: "100%",
          transform: "translateX(-30%)",
          zIndex: 0,
        }}
      />
    </div>
  );
}
