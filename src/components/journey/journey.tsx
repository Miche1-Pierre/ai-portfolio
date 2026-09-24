"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";

import { site } from "@/content/site";
import journeyPath from "@/data/journey-path.json";
import { JOURNEY_START_S, buildStations, type Station } from "@/components/journey/stations";

const JourneyScene = dynamic(() => import("@/components/journey/journey-scene").then((m) => m.JourneyScene), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#f6d9b8]" aria-hidden />,
});

/** Hauteur de la piste de scroll, en écrans : environ 40 m de route par écran. */
const TRACK_SCREENS = Math.max(7, Math.round(journeyPath.length / 40));

/** Le carnet de la halte courante, fixé à l'écran (un seul à la fois : deux haltes proches se
 *  chevauchaient). Les sections HTML de toutes les haltes restent dans la page, hors écran, pour le
 *  référencement et les ancres. */
function Carnet({ station, index }: { station: Station; index: number }) {
  const side = station.side === "left" ? "md:mr-auto" : "md:ml-auto";
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 top-0 z-10 flex items-end px-5 pb-16 sm:px-8 md:items-center md:pb-0">
      <motion.article
        key={station.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`${side} pointer-events-auto w-full max-w-md rounded-lg border border-border/70 bg-card/90 p-6 shadow-lg backdrop-blur-sm md:w-[40%] md:max-w-lg md:p-8`}
      >
        <p className="eyebrow text-brand-2">
          {String(index + 1).padStart(2, "0")} · {station.eyebrow}
        </p>
        <h2 className="mt-3 font-heading text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{station.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{station.body}</p>
        {station.cta ? (
          <Link
            href={station.cta.href}
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-brand/40 bg-brand px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110"
          >
            {station.cta.label}
            <span aria-hidden>→</span>
          </Link>
        ) : null}
      </motion.article>
    </div>
  );
}

export function Journey() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const stations = useMemo(() => buildStations(journeyPath.stations, journeyPath.length), []);
  const [metres, setMetres] = useState(JOURNEY_START_S);
  const [shadows, setShadows] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setShadows(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => setMetres(Math.round(JOURNEY_START_S + v * (journeyPath.length - JOURNEY_START_S))));

  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const currentIndex = stations.reduce((acc, s, i) => (metres / journeyPath.length >= s.t - 0.02 ? i : acc), 0);
  const current = stations[currentIndex];

  return (
    <div className="relative isolate bg-[#f6d9b8] text-foreground">
      <div className="fixed inset-0 -z-10" aria-hidden>
        <JourneyScene progress={scrollYProgress} damping={reduced ? 60 : 3.5} shadows={shadows} />
      </div>

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="font-heading text-sm font-semibold tracking-tight text-foreground/90">
          {site.name}
        </Link>
        <Link href="/" className="rounded-md border border-border/60 bg-card/80 px-3 py-1.5 text-xs font-medium backdrop-blur-sm hover:bg-card">
          Classic site
        </Link>
      </header>

      <div className="relative" style={{ height: `${TRACK_SCREENS * 100}vh` }}>
        {stations.map((station) => (
          <section
            key={station.id}
            id={station.id}
            aria-label={station.title}
            className="sr-only"
            style={{ position: "absolute", top: `${station.t * (TRACK_SCREENS - 1) * 100}vh` }}
          >
            <h2>{station.title}</h2>
            <p>{station.body}</p>
          </section>
        ))}
      </div>

      <Carnet station={current} index={currentIndex} />

      <motion.p
        style={{ opacity: hintOpacity }}
        className="pointer-events-none fixed inset-x-0 bottom-14 z-20 text-center font-mono text-xs uppercase tracking-[0.3em] text-foreground/70"
      >
        Scroll to drive
      </motion.p>

      <div className="pointer-events-none fixed bottom-6 left-5 z-20 font-mono text-xs text-foreground/70 sm:left-8">
        <span className="tabular-nums">{metres} m</span> / {Math.round(journeyPath.length)} m · {current.eyebrow}
      </div>
    </div>
  );
}
