import type { Metadata } from "next";

import { Journey } from "@/components/journey/journey";

export const metadata: Metadata = {
  title: "Journey",
  description: "Low Tide: the portfolio as a road going up. Prototype.",
  robots: { index: false, follow: false },
};

export default function JourneyPage() {
  return <Journey />;
}
