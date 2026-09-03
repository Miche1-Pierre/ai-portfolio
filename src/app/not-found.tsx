import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container-x flex min-h-dvh flex-col items-center justify-center text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight">This page drifted off the map.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">The link may be outdated - everything now lives on the home page.</p>
      <Button render={<Link href="/" />} className="mt-8 h-11 rounded-full px-6">
        Back home
      </Button>
    </main>
  );
}
