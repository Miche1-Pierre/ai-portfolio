import { Bot, Car, FlaskConical, Landmark, LayoutDashboard, type LucideIcon } from "lucide-react";
import type { Project } from "@/content/projects";

/**
 * Clean cover for projects without a real screenshot (anonymised client work):
 * a large themed icon on an accent wash. Replaces the old workflow diagrams.
 */
const ICONS: Record<string, LucideIcon> = {
  "ai-sales-agent": Bot,
  "incident-triage": Car,
  "lease-financing": Landmark,
  "pharma-lims": FlaskConical,
};

export function IconCover({ project, className }: { project: Project; className?: string }) {
  const Icon = ICONS[project.slug] ?? LayoutDashboard;
  const accent = project.beamMode === "adaptive" ? "var(--stage-fg)" : project.accent;
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: `radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, ${accent} 22%, transparent), transparent 70%)`,
      }}
    >
      <div style={{ display: "grid", placeItems: "center", gap: 14, color: accent }}>
        <Icon strokeWidth={1.25} style={{ width: 64, height: 64, opacity: 0.9 }} />
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          {project.kind === "client" ? "Client work" : project.name}
        </span>
      </div>
    </div>
  );
}
