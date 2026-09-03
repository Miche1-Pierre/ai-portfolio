import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          backgroundColor: "#0b0f16",
          backgroundImage:
            "radial-gradient(900px 500px at 20% 0%, rgba(69,216,172,0.22), transparent 60%), radial-gradient(700px 400px at 100% 100%, rgba(150,110,255,0.22), transparent 60%)",
          color: "#f2f4f8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#f2f4f8",
              color: "#0b0f16",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            PM
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 600 }}>{site.name}</div>
            <div style={{ fontSize: 20, color: "#9aa4b5" }}>{site.title}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02, maxWidth: 980 }}>
            I take products from scoping to production.
          </div>
          <div style={{ fontSize: 28, color: "#b7c0cf", maxWidth: 1000 }}>
            Architecture · Applied AI · LLM agents · Java / Spring Boot · Next.js
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, fontSize: 22, color: "#9aa4b5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: 12, background: "#45d8ac" }} />
            {site.availability} · Montréal, QC
          </div>
          <div style={{ display: "flex", flexShrink: 0 }}>{site.url.replace("https://", "")}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
