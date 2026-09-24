import { Bot, Car, FlaskConical, Landmark, LayoutDashboard, type LucideIcon } from "lucide-react";
import { toneInk, toneTint } from "@/components/site/shapes";
import type { Project } from "@/content/projects";
import { cn } from "@/lib/utils";

/** Fallback cover when a project has no screenshot: a themed icon on the project's tint. */
const ICONS: Record<string, LucideIcon> = {
  "ai-sales-agent": Bot,
  "incident-triage": Car,
  "lease-financing": Landmark,
  "pharma-lims": FlaskConical,
};

export function IconCover({ project, className }: { project: Project; className?: string }) {
  const Icon = ICONS[project.slug] ?? LayoutDashboard;
  return (
    <div className={cn("absolute inset-0 grid place-items-center", toneTint[project.tone], className)}>
      <div className={cn("grid place-items-center gap-3", toneInk[project.tone])}>
        <Icon strokeWidth={1.25} className="size-16 opacity-90" />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] opacity-70">
          {project.kind === "client" ? "Client work" : project.name}
        </span>
      </div>
    </div>
  );
}
