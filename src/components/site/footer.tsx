import { Github, Linkedin, Mail, Navigation } from "lucide-react";
import { MagicButton } from "@/components/aceternity/magic-button";
import { site } from "@/content/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t pb-10 pt-20">
      {/* dot grid, faded */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid-dots absolute inset-0" />
        <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_8%,black_68%)]" />
      </div>

      <div className="container-x relative z-10 flex flex-col items-center text-center">
        <h2 className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Ready to build something with <span className="text-gradient">AI</span>?
        </h2>
        <p className="mt-5 max-w-md text-muted-foreground">
          {site.availability}, Montréal and remote. The fastest way to reach me is a short email, I reply within a day.
        </p>
        <a href={`mailto:${site.email}`} className="mt-8">
          <MagicButton title="Let's get in touch" icon={<Navigation className="size-4" />} position="right" />
        </a>
      </div>

      <div className="container-x relative z-10 mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {year} {site.name} · {site.title}
        </p>
        <div className="flex items-center gap-2">
          {[
            { href: site.socials.github.href, label: "GitHub", Icon: Github },
            { href: site.socials.linkedin.href, label: "LinkedIn", Icon: Linkedin },
            { href: `mailto:${site.email}`, label: "Email", Icon: Mail },
          ].map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              aria-label={label}
              className="grid size-9 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
