import Link from "next/link";
import { Pill } from "@/components/site/pill";
import { Shape } from "@/components/site/shapes";
import { cta } from "@/components/site/cta";

export default function NotFound() {
  return (
    <main className="container-x flex min-h-dvh flex-col items-center justify-center text-center">
      <div aria-hidden className="flex items-end gap-1.5">
        <Shape kind="square" className="size-10 text-shape-red" />
        <Shape kind="step" className="size-10 text-shape-blue" />
        <Shape kind="notch" className="size-10 text-shape-lime" />
        <Shape kind="rect" className="h-5 w-10 text-shape-yellow" />
      </div>
      <Pill tone="red" className="mt-10">
        404
      </Pill>
      <h1 className="display mt-6 text-[clamp(2.4rem,5vw,4rem)]">This page drifted off the map.</h1>
      <p className="mt-5 max-w-md text-lg text-muted-foreground">The link may be outdated - everything now lives on the home page.</p>
      <Link href="/" className={cta({ size: "lg", className: "mt-9" })}>
        Back home
      </Link>
    </main>
  );
}
