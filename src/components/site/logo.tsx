import { cn } from "@/lib/utils";

/**
 * "PM" pixel monogram: four square blocks, no curves.
 * P = a cobalt stem + a yellow bracket bowl; M = a red "Π" + a short green middle leg.
 * `mono` renders every block in currentColor (footer, favicon on dark).
 */
export function PMMark({ className, mono = false }: { className?: string; mono?: boolean }) {
  const f = (cls: string) => (mono ? "fill-current" : cls);
  return (
    <svg viewBox="0 0 52 24" aria-hidden="true" focusable="false" className={cn("block h-6 w-auto shrink-0", className)}>
      {/* P */}
      <rect x="0" y="0" width="8" height="24" className={f("fill-shape-blue")} />
      <path d="M8 0H20V14H8V9H13V5H8Z" className={f("fill-shape-yellow")} />
      {/* M */}
      <path d="M23 0H52V24H44V6H31V24H23Z" className={f("fill-shape-red")} />
      <rect x="35" y="6" width="5" height="10" className={f("fill-shape-green")} />
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
