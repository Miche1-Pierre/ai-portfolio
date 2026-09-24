"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Github, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { CommandMenu } from "@/components/site/command-menu";
import { Logo } from "@/components/site/logo";
import { cta } from "@/components/site/cta";
import { navigation, site } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Dust-style top bar: full width, transparent over the hero, paper + hairline once scrolled.
 * `base="/"` on sub-pages so the section anchors point back to the home page.
 */
export function Navbar({ base = "" }: { base?: "" | "/" }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        solid ? "glass border-border" : "border-transparent"
      )}
    >
      <div className="container-wide flex h-16 items-center gap-6 lg:gap-10">
        <Link href={base ? "/" : "#top"} className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label={base ? "Home" : "Back to top"}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {navigation.map((n) => (
            <a
              key={n.href}
              href={`${base}${n.href}`}
              className="rounded-lg px-3 py-2 text-[15px] text-foreground/70 transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <CommandMenu />
          <ThemeToggle />
          <a
            href={site.socials.github.href}
            target="_blank"
            rel="noreferrer"
            className={cta({ variant: "secondary", size: "sm", className: "hidden md:inline-flex" })}
          >
            <Github />
            GitHub
          </a>
          {/* below 400px the header only keeps its icons; the hero and the menu still offer contact */}
          <a href={`${base}#contact`} className={cta({ variant: "primary", size: "sm", className: "hidden min-[400px]:inline-flex" })}>
            Get in touch
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="container-wide flex flex-col pb-4 lg:hidden"
            aria-label="Mobile"
          >
            {navigation.map((n) => (
              <a
                key={n.href}
                href={`${base}${n.href}`}
                onClick={() => setOpen(false)}
                className="border-b border-border/70 py-3 text-base text-foreground/80 last:border-b-0 hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
