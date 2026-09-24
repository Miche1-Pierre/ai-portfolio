import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} - ${site.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// DA v3.3 palette (mirrors globals.css; next/og cannot read CSS variables).
const C = {
  paper: "#ffffff",
  ink: "#191715",
  muted: "#57534d",
  blue: "#2f6bf6",
  blueTint: "#eef3ff",
  blueInk: "#1e4fc4",
  red: "#e14322",
  green: "#418b5c",
  yellow: "#ffaa0d",
  pink: "#f99bc3",
};

/**
 * Inter for the card, fetched from Google Fonts as TTF. The site font is Geist, but Satori (next/og)
 * mis-measures Geist's kerning and leaves wide gaps after long words; Inter is visually close and
 * renders cleanly. If the network is unavailable at build time, next/og's default font is used.
 */
async function inter(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!src) return null;
    const res = await fetch(src[1]);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** The hero's pipeline scene (light theme, from scripts/gen-hero-iso.py) as a data URI. */
async function scene(): Promise<string | null> {
  try {
    const svg = await readFile(join(process.cwd(), "public", "illustrations", "hero-iso.svg"));
    return `data:image/svg+xml;base64,${svg.toString("base64")}`;
  } catch {
    return null;
  }
}

// the scene's view box is 629.0 x 433.8 (see RATIO in src/components/site/hero-iso.tsx)
const ART_W = 600;
const ART_H = Math.round((ART_W * 433.8) / 629.0);

/** The "PM" monogram made of shapes (same geometry as <PMMark />, at 2x). */
function Mark() {
  return (
    <div style={{ position: "relative", width: 104, height: 48, display: "flex" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 16, height: 48, borderRadius: 2, background: C.green }} />
      <div style={{ position: "absolute", left: 16, top: 0, width: 24, height: 28, borderTopRightRadius: 14, borderBottomRightRadius: 14, background: C.yellow }} />
      <div style={{ position: "absolute", left: 46, top: 0, width: 16, height: 48, borderRadius: 2, background: C.red }} />
      <div style={{ position: "absolute", left: 62, top: 0, width: 26, height: 13, borderBottomLeftRadius: 13, borderBottomRightRadius: 13, background: C.pink }} />
      <div style={{ position: "absolute", left: 88, top: 0, width: 16, height: 48, borderRadius: 2, background: C.blue }} />
    </div>
  );
}

// two lines, broken between the practice and the stack
const TAGLINE = ["Architecture · Applied AI · LLM agents", "Java / Spring Boot · Next.js"];

export default async function OpenGraphImage() {
  const [regular, semibold, art] = await Promise.all([inter(400), inter(600), scene()]);
  const fonts = [
    ...(regular ? [{ name: "Inter", data: regular, weight: 400 as const, style: "normal" as const }] : []),
    ...(semibold ? [{ name: "Inter", data: semibold, weight: 600 as const, style: "normal" as const }] : []),
  ];
  // the last word of the headline takes the accent colour, as on the site
  const words = site.headline.replace(/\.$/, "").split(" ");
  const last = words.pop();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          backgroundColor: C.paper,
          color: C.ink,
          fontFamily: fonts.length ? "Inter" : "sans-serif",
          position: "relative",
        }}
      >
        {/* the pipeline scene of the hero, on the right (its floor fades into the paper) */}
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art} width={ART_W} height={ART_H} alt="" style={{ position: "absolute", right: 36, top: 92 }} />
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Mark />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.6 }}>{site.name}</div>
            <div style={{ fontSize: 20, color: C.muted }}>{site.title}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: 18, rowGap: 2, fontSize: 70, fontWeight: 600, letterSpacing: -3, lineHeight: 1.02, maxWidth: 560 }}>
            {words.map((w, i) => (
              <span key={`${w}-${i}`}>{w}</span>
            ))}
            <span style={{ display: "flex" }}>
              <span style={{ color: C.blue }}>{last}</span>
              <span>.</span>
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 24, color: C.muted, lineHeight: 1.35 }}>
            {TAGLINE.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, fontSize: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: C.blueTint,
              color: C.blueInk,
              padding: "10px 18px",
              fontSize: 20,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 10, background: C.blue }} />
            {site.availability}
          </div>
          <div style={{ display: "flex", flexShrink: 0, color: C.muted }}>{site.url.replace("https://", "")}</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
