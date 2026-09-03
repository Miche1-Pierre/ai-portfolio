/**
 * Abstract "AI presence" visual that replaces the profile photo.
 * A neural constellation, brand-coloured, gently animated (twinkle / flow / breathe),
 * disabled under prefers-reduced-motion (globals.css). Pure SVG, no WebGL.
 */
const W = 320;
const H = 400;
const cx = 160;
const cy = 196;

type Node = { x: number; y: number; r: number; alt?: boolean };

function ring(count: number, radius: number, r: number, phase = 0, alt = false): Node[] {
  return Array.from({ length: count }, (_, i) => {
    const a = phase + (i / count) * Math.PI * 2;
    return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius * 1.12, r, alt: alt && i % 2 === 0 };
  });
}

const inner = ring(6, 58, 4.5, 0.3);
const mid = ring(9, 108, 3.6, 0.1, true);
const outer = ring(7, 158, 2.8, 0.6);
const nodes = [...inner, ...mid, ...outer];

// edges: core -> inner, inner -> mid, a few mid -> outer + cross links
const edges: [number, number][] = [];
inner.forEach((_, i) => edges.push([-1, i])); // core to inner (index -1 = core)
inner.forEach((_, i) => edges.push([i, 6 + ((i * 3) % 9)]));
mid.forEach((_, i) => { if (i % 2 === 0) edges.push([6 + i, 15 + (i % 7)]); });
edges.push([0, 3], [1, 4], [7, 11], [8, 13]);

export function AIPortrait() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full text-brand" aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="ap-core" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <filter id="ap-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ambient halo */}
      <circle cx={cx} cy={cy} r="150" fill="url(#ap-core)" opacity="0.20" />
      <circle cx={cx} cy={cy} r="176" fill="none" stroke="currentColor" strokeOpacity="0.12" />

      {/* edges */}
      {edges.map(([a, b], i) => {
        const from = a === -1 ? { x: cx, y: cy } : nodes[a];
        const to = nodes[b];
        if (!from || !to) return null;
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="currentColor"
            strokeOpacity="0.22"
            strokeWidth="1"
            strokeDasharray={i % 3 === 0 ? "2 8" : undefined}
            className={i % 3 === 0 ? "animate-flow" : undefined}
          />
        );
      })}

      {/* nodes */}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={n.alt ? "var(--brand-2)" : "currentColor"}
          fillOpacity={n.alt ? 0.95 : 0.8}
          className="animate-twinkle"
          style={{ animationDelay: `${(i % 6) * 0.35}s` }}
        />
      ))}

      {/* core */}
      <g filter="url(#ap-glow)">
        <circle cx={cx} cy={cy} r="16" fill="none" stroke="currentColor" strokeOpacity="0.6" className="animate-breathe" />
        <circle cx={cx} cy={cy} r="7" fill="currentColor" />
      </g>
    </svg>
  );
}
