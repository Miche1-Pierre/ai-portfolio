import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} - ${site.title}`;
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
          backgroundColor: "#17120e",
          backgroundImage:
            "radial-gradient(900px 500px at 18% 0%, rgba(181,48,46,0.32), transparent 60%), radial-gradient(700px 420px at 100% 100%, rgba(230,163,58,0.22), transparent 60%)",
          color: "#f7f4ee",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#f7f4ee",
              color: "#17120e",
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
            <div style={{ fontSize: 20, color: "#b8ada0" }}>{site.title}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02, maxWidth: 980 }}>
            I take products from scoping to production.
          </div>
          <div style={{ fontSize: 28, color: "#cabfb2", maxWidth: 1000 }}>
            Architecture · Applied AI · LLM agents · Java / Spring Boot · Next.js
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, fontSize: 22, color: "#b8ada0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: 12, background: "#d24a3a" }} />
            {site.availability} · Montréal, QC
          </div>
          <div style={{ display: "flex", flexShrink: 0 }}>{site.url.replace("https://", "")}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
