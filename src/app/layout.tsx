import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const title = `${site.name} — ${site.title}`;
const description =
  "Full-stack software engineer moving into applied AI. Architecture, LLM agents and product design — from scoping to production. Relocating to Montréal, available from October 2026.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s — ${site.name}` },
  description,
  keywords: [
    "Pierre Michel",
    "Full-Stack Software Engineer",
    "Applied AI",
    "LLM agents",
    "RAG",
    "Next.js",
    "Spring Boot",
    "Montréal",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    title,
    description,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/images/og-image.png", width: 1200, height: 630, alt: title }],
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/images/og-image.png"] },
  robots: { index: true, follow: true },
  alternates: { canonical: site.url },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Full-Stack Software Engineer",
  email: `mailto:${site.email}`,
  url: site.url,
  sameAs: [site.socials.github.href, site.socials.linkedin.href],
  knowsAbout: ["Applied AI", "LLM agents", "Java", "Spring Boot", "Next.js", "PostgreSQL"],
  address: { "@type": "PostalAddress", addressCountry: "FR" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="9Vx6J3GIbxluE2__kWAbog-U-gc3-PSfxNK0OZFKSSo" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
