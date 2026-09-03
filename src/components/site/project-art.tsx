import type { Project } from "@/content/projects";

/**
 * Per-project decorative "workflow" diagrams.
 * Theme-aware: every stroke/fill derives from `currentColor`, bound to the project accent
 * (or the foreground, for Taskforce's adaptive flagship). Subtly animated; animations are
 * disabled under `prefers-reduced-motion` (see globals.css). Centered in a 400×200 frame.
 */

function useAccent(project: Project) {
  return project.beamMode === "adaptive" ? undefined : project.accent;
}

const frame = "h-full w-full";
const vb = "0 0 400 200";
const mono = "var(--font-mono, monospace)";

function Glow({ id }: { id: string }) {
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

function Chip({ x, y, w, label, dim = false }: { x: number; y: number; w: number; label: string; dim?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="26" rx="8" fill="color-mix(in srgb, currentColor 8%, transparent)" stroke="currentColor" strokeOpacity={dim ? 0.28 : 0.55} />
      <text x={x + w / 2} y={y + 17} textAnchor="middle" fontSize="11" fontFamily={mono} fill="currentColor" fillOpacity={dim ? 0.55 : 0.9}>
        {label}
      </text>
    </g>
  );
}

function Taskforce({ gid }: { gid: string }) {
  const steps = [70, 110, 150, 190, 230, 270, 310];
  const done = 3;
  return (
    <svg viewBox={vb} className={frame} aria-hidden>
      <defs><Glow id={gid} /></defs>
      {/* pipeline rail */}
      <line x1="60" y1="56" x2="320" y2="56" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" />
      <line x1="60" y1="56" x2={steps[done]} y2="56" stroke="currentColor" strokeOpacity="0.7" strokeWidth="2" filter={`url(#${gid})`} />
      {/* animated flow along the rail */}
      <line x1="60" y1="56" x2="320" y2="56" stroke="currentColor" strokeOpacity="0.9" strokeWidth="2" strokeDasharray="2 14" strokeLinecap="round" className="animate-flow" />
      {steps.map((x, i) => (
        <circle key={x} cx={x} cy="56" r={i === done ? 6 : 4.5} fill={i <= done ? "currentColor" : "var(--stage-elevated, var(--card))"} stroke="currentColor" strokeOpacity={i <= done ? 1 : 0.4} />
      ))}
      <text x="60" y="34" fontSize="10.5" fontFamily={mono} fill="currentColor" fillOpacity="0.55">VISION</text>
      <text x="310" y="34" textAnchor="end" fontSize="10.5" fontFamily={mono} fill="currentColor" fillOpacity="0.55">QA · DEPLOY</text>

      {/* hub */}
      <g filter={`url(#${gid})`}>
        <circle cx="200" cy="120" r="30" fill="color-mix(in srgb, currentColor 10%, transparent)" stroke="currentColor" strokeOpacity="0.8" />
        <circle cx="200" cy="120" r="19" fill="none" stroke="currentColor" strokeOpacity="0.4" className="animate-breathe" />
        <circle cx="200" cy="120" r="5" fill="currentColor" />
      </g>
      {/* outcome in */}
      <path d="M92 120 H168" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" markerEnd={`url(#tf-arrow-${gid})`} />
      <Chip x={30} y={107} w={60} label="Outcome" />
      {/* fan-out to tools */}
      {[
        [318, 92, "Linear"],
        [318, 120, "GitHub"],
        [318, 148, "Claude"],
      ].map(([x, y, l]) => (
        <g key={l as string}>
          <path d={`M230 120 C 270 120, 280 ${y}, ${(x as number) - 4} ${y}`} fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.4" />
          <Chip x={x as number} y={(y as number) - 13} w={62} label={l as string} dim />
        </g>
      ))}
      {/* insight */}
      <text x="200" y="182" textAnchor="middle" fontSize="10" fontFamily={mono} fill="currentColor" fillOpacity="0.5">9 services · MCP · audit trail</text>
      <defs>
        <marker id={`tf-arrow-${gid}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" fillOpacity="0.6" />
        </marker>
      </defs>
    </svg>
  );
}

function BrainOs({ gid }: { gid: string }) {
  const nodes: [number, number, number][] = [
    [200, 96, 7], [140, 58, 4], [262, 66, 4], [96, 114, 4], [304, 124, 4],
    [168, 146, 3.5], [244, 144, 3.5], [120, 86, 3], [286, 92, 3],
  ];
  const edges: [number, number][] = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 7], [2, 8], [3, 5], [4, 6]];
  return (
    <svg viewBox={vb} className={frame} aria-hidden>
      <defs><Glow id={gid} /></defs>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.2" />
      ))}
      {nodes.map(([x, y, r], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill="currentColor"
          fillOpacity={i === 0 ? 1 : 0.7}
          filter={i === 0 ? `url(#${gid})` : undefined}
          className={i === 0 ? undefined : "animate-twinkle"}
          style={i === 0 ? undefined : { animationDelay: `${(i % 5) * 0.4}s` }}
        />
      ))}
      <circle cx="200" cy="96" r="16" fill="none" stroke="currentColor" strokeOpacity="0.45" className="animate-breathe" />
      <text x="200" y="180" textAnchor="middle" fontSize="10.5" fontFamily={mono} fill="currentColor" fillOpacity="0.6">always-fresh context · readable by AI</text>
    </svg>
  );
}

function Plania({ gid }: { gid: string }) {
  const bars = [26, 34, 30, 46, 52, 60, 72, 84, 96, 110];
  return (
    <svg viewBox={vb} className={frame} aria-hidden>
      <defs><Glow id={gid} /></defs>
      {bars.map((h, i) => (
        <rect key={i} x={44 + i * 26} y={150 - h} width="14" height={h} rx="3" fill="currentColor" fillOpacity={0.22 + (i / bars.length) * 0.6} />
      ))}
      <path d="M50 128 C 150 112, 210 96, 320 40" fill="none" stroke="currentColor" strokeOpacity="0.85" strokeWidth="2" filter={`url(#${gid})`} />
      <path d="M50 128 C 150 112, 210 96, 320 40" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.9" strokeDasharray="2 12" strokeLinecap="round" className="animate-flow" />
      <circle cx="320" cy="40" r="5" fill="currentColor" filter={`url(#${gid})`} className="animate-breathe" />
      <text x="44" y="176" fontSize="10.5" fontFamily={mono} fill="currentColor" fillOpacity="0.6">$12k MRR held · 5 sales / day</text>
      <text x="320" y="30" textAnchor="end" fontSize="11" fontFamily={mono} fill="currentColor" fillOpacity="0.9">13k users</text>
    </svg>
  );
}

function Ring({ gid, pct, label }: { gid: string; pct: number; label: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <g>
      <circle cx="320" cy="100" r={r} fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="8" />
      <circle cx="320" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 320 100)" filter={`url(#${gid})`} />
      <text x="320" y="98" textAnchor="middle" fontSize="18" fontWeight="600" fill="currentColor">{label}</text>
      <text x="320" y="114" textAnchor="middle" fontSize="8.5" fontFamily={mono} fill="currentColor" fillOpacity="0.6">TRAFFIC</text>
    </g>
  );
}

function SalesAgent({ gid }: { gid: string }) {
  return (
    <svg viewBox={vb} className={frame} aria-hidden>
      <defs><Glow id={gid} /></defs>
      <rect x="40" y="58" width="120" height="30" rx="12" fill="color-mix(in srgb, currentColor 10%, transparent)" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="70" y="98" width="120" height="30" rx="12" fill="currentColor" fillOpacity="0.85" />
      {[56, 70, 84].map((cx, i) => (
        <circle key={cx} cx={cx} cy="73" r="3" fill="currentColor" fillOpacity="0.6" className="animate-twinkle" style={{ animationDelay: `${i * 0.25}s` }} />
      ))}
      <rect x="86" y="109" width="70" height="8" rx="4" fill="var(--stage-elevated, var(--card))" fillOpacity="0.9" />
      <path d="M190 113 C 224 113, 224 100, 250 100" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" className="animate-flow" />
      <Ring gid={gid} pct={60} label="60%" />
      <text x="100" y="150" textAnchor="middle" fontSize="10.5" fontFamily={mono} fill="currentColor" fillOpacity="0.6">chat → quote · 1 in 4 converts</text>
    </svg>
  );
}

function Triage({ gid }: { gid: string }) {
  const stages = ["Report", "Classify", "Extract", "Route"];
  return (
    <svg viewBox={vb} className={frame} aria-hidden>
      <defs><Glow id={gid} /></defs>
      {stages.map((s, i) => {
        const x = 30 + i * 92;
        const active = i === 1 || i === 2;
        return (
          <g key={s}>
            <rect x={x} y="80" width="76" height="34" rx="9" fill="color-mix(in srgb, currentColor 8%, transparent)" stroke="currentColor" strokeOpacity={active ? 0.7 : 0.4} filter={active ? `url(#${gid})` : undefined} className={active ? "animate-breathe" : undefined} />
            <text x={x + 38} y="101" textAnchor="middle" fontSize="11" fontFamily={mono} fill="currentColor" fillOpacity="0.9">{s}</text>
            {i < stages.length - 1 ? (
              <path d={`M${x + 76} 97 H ${x + 92}`} stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" className="animate-flow" markerEnd={`url(#tri-${gid})`} />
            ) : null}
          </g>
        );
      })}
      <text x="30" y="150" fontSize="12" fontFamily={mono} fill="currentColor" fillOpacity="0.55">$1.93</text>
      <text x="72" y="150" fontSize="12" fontFamily={mono} fill="currentColor" fillOpacity="0.55">→</text>
      <text x="92" y="150" fontSize="12" fontWeight="600" fontFamily={mono} fill="currentColor">~$0</text>
      <text x="150" y="150" fontSize="11" fontFamily={mono} fill="currentColor" fillOpacity="0.55">· ~100h / month · ~$29k / yr</text>
      <defs>
        <marker id={`tri-${gid}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 z" fill="currentColor" fillOpacity="0.6" />
        </marker>
      </defs>
    </svg>
  );
}

function Shielded({ gid, tags, caption }: { gid: string; tags: string[]; caption: string }) {
  return (
    <svg viewBox={vb} className={frame} aria-hidden>
      <defs><Glow id={gid} /></defs>
      <g filter={`url(#${gid})`}>
        <path d="M200 44 L246 62 V104 C246 132 226 150 200 160 C174 150 154 132 154 104 V62 Z" fill="color-mix(in srgb, currentColor 9%, transparent)" stroke="currentColor" strokeOpacity="0.75" className="animate-breathe" />
        <path d="M182 104 l12 12 l24 -26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {tags.map((t, i) => (
        <Chip key={t} x={i === 0 ? 40 : 268} y={74} w={92} label={t} dim />
      ))}
      <text x="200" y="184" textAnchor="middle" fontSize="10.5" fontFamily={mono} fill="currentColor" fillOpacity="0.6">{caption}</text>
    </svg>
  );
}

function GenericUi({ gid, accent }: { gid: string; accent?: string }) {
  return (
    <svg viewBox={vb} className={frame} aria-hidden style={accent ? { color: accent } : undefined}>
      <defs><Glow id={gid} /></defs>
      <rect x="52" y="40" width="296" height="120" rx="12" fill="color-mix(in srgb, currentColor 6%, transparent)" stroke="currentColor" strokeOpacity="0.35" />
      <line x1="52" y1="66" x2="348" y2="66" stroke="currentColor" strokeOpacity="0.25" />
      <circle cx="66" cy="53" r="3.5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="78" cy="53" r="3.5" fill="currentColor" fillOpacity="0.35" />
      <circle cx="90" cy="53" r="3.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="66" y="80" width="70" height="66" rx="8" fill="color-mix(in srgb, currentColor 10%, transparent)" />
      <rect x="150" y="82" width="184" height="12" rx="6" fill="currentColor" fillOpacity="0.7" filter={`url(#${gid})`} />
      <rect x="150" y="104" width="150" height="9" rx="4.5" fill="currentColor" fillOpacity="0.35" />
      <rect x="150" y="120" width="170" height="9" rx="4.5" fill="currentColor" fillOpacity="0.3" />
      <rect x="150" y="136" width="110" height="9" rx="4.5" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

export function ProjectArt({ project, className }: { project: Project; className?: string }) {
  const accent = useAccent(project);
  const gid = `g-${project.slug}`;
  const style = accent ? { color: accent } : undefined; // undefined → inherits foreground (adaptive)

  const inner = (() => {
    switch (project.slug) {
      case "taskforce":
        return <Taskforce gid={gid} />;
      case "brain-os":
        return <BrainOs gid={gid} />;
      case "plania":
        return <Plania gid={gid} />;
      case "ai-sales-agent":
        return <SalesAgent gid={gid} />;
      case "incident-triage":
        return <Triage gid={gid} />;
      case "lease-financing":
        return <Shielded gid={gid} tags={["Law 25", "FINTRAC"]} caption="compliance by design" />;
      case "pharma-lims":
        return <Shielded gid={gid} tags={["21 CFR 11", "GAMP 5"]} caption="signatures · audit trails" />;
      default:
        return <GenericUi gid={gid} />;
    }
  })();

  return (
    <div className={className} style={style}>
      {inner}
    </div>
  );
}
