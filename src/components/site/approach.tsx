import { Section } from "@/components/site/section";

const phases = [
  {
    n: "Phase 1",
    title: "Scope & architecture",
    blurb: "We align on the outcome, the constraints and the architecture before a line of code, so the build has a spine.",
    tint: "#c0392b",
  },
  {
    n: "Phase 2",
    title: "Build in the loop",
    blurb: "Ship in governed increments, with the right tools in the loop, human approval at each gate, and a real audit trail.",
    tint: "#e07b1a",
  },
  {
    n: "Phase 3",
    title: "Harden & launch",
    blurb: "Security, observability and QA through to production, with the documentation that keeps it maintainable.",
    tint: "#d6a516",
  },
];

export function Approach() {
  return (
    <Section
      id="approach"
      index="04"
      eyebrow="My approach"
      title="How I take an idea to something in production."
      description="Three phases, the same discipline whether it's a startup MVP or a regulated platform."
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {phases.map((p) => (
          <div
            key={p.n}
            className="group relative flex h-[22rem] items-center justify-center overflow-hidden rounded-3xl border bg-card p-8 lg:h-[26rem]"
          >
            {/* revealed on hover: a warm dot field washing in */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `radial-gradient(120% 120% at 50% 0%, ${p.tint} 0%, color-mix(in srgb, ${p.tint} 40%, #140f0c) 45%, #120d0b 100%)` }}
            />
            <div
              aria-hidden
              className="bg-grid-dots absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-70"
            />

            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground opacity-0 transition-all duration-500 group-hover:-translate-y-1 group-hover:text-white/70 group-hover:opacity-100">
                {p.n}
              </span>
              <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight transition-all duration-500 group-hover:text-white sm:text-3xl">
                {p.title}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground opacity-0 transition-all duration-500 group-hover:text-white/85 group-hover:opacity-100">
                {p.blurb}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
