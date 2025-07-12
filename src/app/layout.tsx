import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pierre MICHEL - Fullstack Developer",
  description: "Personal portfolio of Pierre MICHEL, a Fullstack Developer.",
  metadataBase: new URL("https://ai-portfolio-pierre-michel.vercel.app"),
  openGraph: {
    title: "Pierre MICHEL - Fullstack Developer",
    description: "Explore my portfolio as a Fullstack developer.",
    url: "https://ai-portfolio-pierre-michel.vercel.app",
    siteName: "Pierre MICHEL Portfolio",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pierre MICHEL - Fullstack Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="9Vx6J3GIbxluE2__kWAbog-U-gc3-PSfxNK0OZFKSSo"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
