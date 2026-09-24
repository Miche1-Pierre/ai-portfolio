import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} - ${site.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// DA v3 palette (mirrors globals.css; next/og cannot read CSS variables).
const C = {
  paper: "#ffffff",
  ink: "#191715",
  muted: "#57534d",
  blue: "#1c91ff",
  blueTint: "#eaf6ff",
  blueInk: "#0a63b8",
  red: "#e14322",
  green: "#418b5c",
  lime: "#e2f78c",
  yellow: "#ffaa0d",
  pink: "#f99bc3",
  sky: "#9fdbff",
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

/** The PM monogram made of shapes (same geometry as <PMMark />, at 2x). */
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

const TAGLINE = "Architecture · Applied AI · LLM agents · Java / Spring Boot · Next.js";

export default async function OpenGraphImage() {
  const [regular, semibold] = await Promise.all([inter(400), inter(600)]);
  const fonts = [
    ...(regular ? [{ name: "Inter", data: regular, weight: 400 as const, style: "normal" as const }] : []),
    ...(semibold ? [{ name: "Inter", data: semibold, weight: 600 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: C.paper,
          color: C.ink,
          fontFamily: fonts.length ? "Inter" : "sans-serif",
          position: "relative",
        }}
      >
        {/* decorative shapes, top right (Dust-like platforms seen from above) */}
        <div style={{ position: "absolute", right: 72, top: 64, display: "flex", gap: 14, alignItems: "flex-end" }}>
          <div style={{ width: 92, height: 92, borderRadius: 9999, background: C.lime }} />
          <div style={{ width: 92, height: 92, borderTopRightRadius: 92, background: C.blue }} />
          <div style={{ width: 46, height: 92, borderTopRightRadius: 46, borderBottomRightRadius: 46, background: C.pink }} />
        </div>
        <div style={{ position: "absolute", right: 72, top: 170, display: "flex", gap: 14 }}>
          <div style={{ width: 150, height: 56, borderRadius: 28, background: C.sky }} />
          <div style={{ width: 92, height: 46, borderTopLeftRadius: 46, borderTopRightRadius: 46, background: C.yellow, alignSelf: "flex-end" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Mark />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.6 }}>{site.name}</div>
            <div style={{ fontSize: 20, color: C.muted }}>{site.title}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: -3.6, lineHeight: 1, maxWidth: 900 }}>{site.headline}</div>
          <div style={{ fontSize: 28, color: C.muted, maxWidth: 1000 }}>{TAGLINE}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, fontSize: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: C.blueTint,
              color: C.blueInk,
              borderRadius: 9999,
              padding: "10px 20px",
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
