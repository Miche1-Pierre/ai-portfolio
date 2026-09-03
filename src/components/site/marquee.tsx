import { techMarquee } from "@/content/skills";

export function Marquee() {
  const items = [...techMarquee, ...techMarquee];
  return (
    <div className="container-x">
      <div className="mask-fade-x overflow-hidden border-y py-4">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap [&:hover]:[animation-play-state:paused]">
          {items.map((t, i) => (
            <span key={`${t}-${i}`} className="inline-flex items-center gap-3 text-sm text-muted-foreground">
              <span className="size-1 rounded-full bg-brand/70" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
