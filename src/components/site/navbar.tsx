"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { CommandMenu } from "@/components/site/command-menu";
import { navigation, site } from "@/content/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="container-x pt-3 sm:pt-4">
        <div
          className={cn(
            "flex h-14 items-center justify-between rounded-2xl border px-3 transition-all duration-300 sm:px-4",
            scrolled ? "glass border-border shadow-[0_8px_40px_-20px_rgba(0,0,0,0.6)]" : "border-transparent"
          )}
        >
          <Link href="#top" className="group flex items-center gap-2.5" aria-label="Back to top">
            <span className="relative grid size-8 place-items-center rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground">
              PM
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-brand ring-2 ring-background" />
            </span>
            <span className="hidden text-sm font-medium sm:inline">{site.name}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navigation.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <span className="mr-1 hidden items-center gap-2 rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground lg:inline-flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-pulse-ring rounded-full bg-brand" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              {site.availability}
            </span>
            <CommandMenu />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="glass mt-2 flex flex-col gap-1 rounded-2xl border p-2 md:hidden"
              aria-label="Mobile"
            >
              {navigation.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {n.label}
                </a>
              ))}
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
