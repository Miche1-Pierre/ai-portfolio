import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Off on purpose: StrictMode double-invokes effects in dev, which churns the WebGL context in
  // LaserFlow (mount/cleanup/mount) and fought proper GPU cleanup. Prod is unaffected either way.
  reactStrictMode: false,
  experimental: {
    optimizeCss: true,
  },
  redirects: async () => [
    { source: "/about", destination: "/#about", permanent: true },
    { source: "/work", destination: "/#work", permanent: true },
  ],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
};

export default nextConfig;
