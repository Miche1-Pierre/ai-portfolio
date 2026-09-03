"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowUpRight,
  Briefcase,
  Copy,
  Github,
  Layers,
  Linkedin,
  Mail,
  Moon,
  Search,
  Sparkles,
  Sun,
  User,
  Wrench,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import { featuredProjects } from "@/content/projects";

const sections = [
  { id: "work", label: "Work", icon: Layers },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "about", label: "About", icon: User },
  { id: "contact", label: "Contact", icon: Mail },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };
  const go = (id: string) => () =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const openUrl = (url: string) => () => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden gap-2 rounded-full pr-1.5 text-muted-foreground md:inline-flex"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
      >
        <Search className="size-3.5" />
        <span className="text-xs">Search</span>
        <kbd className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open command menu"
      >
        <Search />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Navigate" description="Jump to a section or an action">
        <Command>
          <CommandInput placeholder="Jump to…" autoFocus />
          <CommandList>
            <CommandEmpty>Nothing found.</CommandEmpty>
            <CommandGroup heading="Sections">
              {sections.map((s) => (
                <CommandItem key={s.id} value={s.label} onSelect={() => run(go(s.id))}>
                  <s.icon />
                  {s.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {featuredProjects.map((p) => (
                <CommandItem key={p.slug} value={`project ${p.name}`} onSelect={() => run(() => router.push(`/work/${p.slug}`))}>
                  <ArrowUpRight />
                  {p.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem
                value="copy email"
                onSelect={() => run(() => navigator.clipboard?.writeText(site.email))}
              >
                <Copy />
                Copy email
                <CommandShortcut>{site.email}</CommandShortcut>
              </CommandItem>
              <CommandItem value="github" onSelect={() => run(openUrl(site.socials.github.href))}>
                <Github />
                Open GitHub
              </CommandItem>
              <CommandItem value="linkedin" onSelect={() => run(openUrl(site.socials.linkedin.href))}>
                <Linkedin />
                Open LinkedIn
              </CommandItem>
              <CommandItem value="taskforce" onSelect={() => run(openUrl(site.socials.taskforce.href))}>
                <Sparkles />
                Taskforce on GitHub
              </CommandItem>
              <CommandItem
                value="toggle theme"
                onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}
              >
                {resolvedTheme === "dark" ? <Sun /> : <Moon />}
                Toggle theme
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
