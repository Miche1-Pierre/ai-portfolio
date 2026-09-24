import { cn } from "@/lib/utils";

/**
 * "PM" monogram built from shapes (the round details of a square DA):
 * P = a green stem + a yellow "dee" bowl, M = a red stem, a pink half disc and a cobalt stem.
 * `mono` renders every shape in currentColor (footer, favicon on dark).
 */
export function PMMark({ className, mono = false }: { className?: string; mono?: boolean }) {
  const f = (cls: string) => (mono ? "fill-current" : cls);
  return (
    <svg viewBox="0 0 52 24" aria-hidden="true" focusable="false" className={cn("block h-6 w-auto shrink-0", className)}>
      {/* P */}
      <rect x="0" y="0" width="8" height="24" rx="1" className={f("fill-shape-green")} />
      <path d="M8 0h5a7 7 0 0 1 0 14H8Z" className={f("fill-shape-yellow")} />
      {/* M */}
      <rect x="23" y="0" width="8" height="24" rx="1" className={f("fill-shape-red")} />
      <path d="M31 0h13a6.5 6.5 0 0 1-13 0Z" className={f("fill-shape-pink")} />
      <rect x="44" y="0" width="8" height="24" rx="1" className={f("fill-shape-blue")} />
    </svg>
  );
}

/** Mark + name, as in the header (name hidden on small screens). */
export function Logo({ className, showName = true }: { className?: string; showName?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <PMMark className="h-[22px]" />
      {showName ? <span className="hidden whitespace-nowrap text-[15px] font-semibold tracking-[-0.02em] sm:inline">Pierre Michel</span> : null}
    </span>
  );
}
