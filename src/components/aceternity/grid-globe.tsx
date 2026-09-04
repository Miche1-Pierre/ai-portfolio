"use client";

/**
 * 3D globe — adapted from Aceternity UI / adrianhajdin's GridGlobe (MIT), built on three-globe +
 * @react-three/fiber. Country hex-polygons come from /data/globe.json fetched at runtime (kept out
 * of the JS bundle). Arc/point colours are warm to match the palette.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useThree, type ThreeElement } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ThreeGlobe from "three-globe";
import * as THREE from "three";
import countriesFallback from "@/data/globe-min.json";

extend({ ThreeGlobe });

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: ThreeElement<typeof ThreeGlobe>;
  }
}

const RING_PROPAGATION_SPEED = 3;
const cameraZ = 300;

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

export type Position = {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
};

type CountryData = { features: object[] };

function Globe({ globeConfig, data }: { globeConfig: GlobeConfig; data: Position[] }) {
  const globeRef = useRef<ThreeGlobe | null>(null);
  const [countries, setCountries] = useState<CountryData>(countriesFallback as CountryData);

  const cfg = useMemo<Required<Pick<GlobeConfig, "pointSize" | "atmosphereAltitude" | "globeColor" | "showAtmosphere" | "atmosphereColor" | "polygonColor" | "emissive" | "emissiveIntensity" | "shininess" | "arcTime" | "arcLength" | "rings" | "maxRings">>>(
    () => ({
      pointSize: 1,
      atmosphereAltitude: 0.1,
      globeColor: "#1a1210",
      showAtmosphere: true,
      atmosphereColor: "#f0b199",
      polygonColor: "rgba(240,180,150,0.7)",
      emissive: "#1a1210",
      emissiveIntensity: 0.1,
      shininess: 0.9,
      arcTime: 2000,
      arcLength: 0.9,
      rings: 1,
      maxRings: 3,
      ...globeConfig,
    }),
    [globeConfig]
  );

  // Full country set (nicer hex land) fetched at runtime; falls back to the tiny bundled set.
  useEffect(() => {
    let alive = true;
    fetch("/data/globe.json")
      .then((r) => r.json())
      .then((d) => alive && d?.features && setCountries(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      buildMaterial();
      buildData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries]);

  const buildMaterial = () => {
    if (!globeRef.current) return;
    const mat = globeRef.current.globeMaterial() as THREE.MeshPhongMaterial;
    mat.color = new THREE.Color(cfg.globeColor);
    mat.emissive = new THREE.Color(cfg.emissive);
    mat.emissiveIntensity = cfg.emissiveIntensity;
    mat.shininess = cfg.shininess;
  };

  const buildData = () => {
    const globe = globeRef.current;
    if (!globe) return;

    const arcs = data;
    const points: { size: number; order: number; color: string; lat: number; lng: number }[] = [];
    for (const arc of arcs) {
      points.push({ size: cfg.pointSize, order: arc.order, color: arc.color, lat: arc.startLat, lng: arc.startLng });
      points.push({ size: cfg.pointSize, order: arc.order, color: arc.color, lat: arc.endLat, lng: arc.endLng });
    }
    const filtered = points.filter(
      (v, i, a) => a.findIndex((v2) => v2.lat === v.lat && v2.lng === v.lng) === i
    );

    globe
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(cfg.showAtmosphere)
      .atmosphereColor(cfg.atmosphereColor)
      .atmosphereAltitude(cfg.atmosphereAltitude)
      .hexPolygonColor(() => cfg.polygonColor);

    globe
      .arcsData(arcs)
      .arcStartLat((d) => (d as Position).startLat)
      .arcStartLng((d) => (d as Position).startLng)
      .arcEndLat((d) => (d as Position).endLat)
      .arcEndLng((d) => (d as Position).endLng)
      .arcColor((d: object) => (d as Position).color)
      .arcAltitude((d) => (d as Position).arcAlt)
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      .arcDashLength(cfg.arcLength)
      .arcDashInitialGap((d) => (d as Position).order)
      .arcDashGap(15)
      .arcDashAnimateTime(() => cfg.arcTime);

    globe
      .pointsData(filtered)
      .pointColor((e) => (e as { color: string }).color)
      .pointsMerge(true)
      .pointAltitude(0.0)
      .pointRadius(2);

    globe
      .ringsData([])
      .ringColor(() => cfg.polygonColor)
      .ringMaxRadius(cfg.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod((cfg.arcTime * cfg.arcLength) / cfg.rings);
  };

  // Animate the rings following random arcs.
  useEffect(() => {
    if (!globeRef.current || !data.length) return;
    const globe = globeRef.current;
    const interval = setInterval(() => {
      const n = Math.floor((data.length * 4) / 5);
      const idx = genRandomNumbers(0, data.length, n);
      globe.ringsData(data.filter((_, i) => idx.includes(i)).map((d) => ({ lat: d.startLat, lng: d.startLng, color: d.color })));
    }, 2000);
    return () => clearInterval(interval);
  }, [data]);

  return <threeGlobe ref={globeRef} />;
}

function RendererConfig() {
  const { gl, size } = useThree();
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gl.setSize(size.width, size.height);
    gl.setClearColor(0x000000, 0);
  }, [gl, size]);
  return null;
}

export function World({ globeConfig, data }: { globeConfig: GlobeConfig; data: Position[] }) {
  const scene = useMemo(() => {
    const s = new THREE.Scene();
    s.fog = new THREE.Fog(0x1a1210, 400, 2000);
    return s;
  }, []);

  return (
    <Canvas scene={scene} camera={{ fov: 50, near: 180, far: 1800, position: [0, 0, cameraZ] }}>
      <RendererConfig />
      <ambientLight color={globeConfig.ambientLight ?? "#f0b199"} intensity={0.6} />
      <directionalLight color={globeConfig.directionalLeftLight ?? "#ffffff"} position={[-400, 100, 400]} />
      <directionalLight color={globeConfig.directionalTopLight ?? "#ffffff"} position={[-200, 500, 200]} />
      <pointLight color={globeConfig.pointLight ?? "#ffffff"} position={[-200, 500, 200]} intensity={0.8} />
      <Globe globeConfig={globeConfig} data={data} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minDistance={cameraZ}
        maxDistance={cameraZ}
        autoRotate={globeConfig.autoRotate ?? true}
        autoRotateSpeed={globeConfig.autoRotateSpeed ?? 0.8}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI - Math.PI / 3}
      />
    </Canvas>
  );
}

function genRandomNumbers(min: number, max: number, count: number) {
  const arr: number[] = [];
  while (arr.length < count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    if (!arr.includes(r)) arr.push(r);
  }
  return arr;
}

export default World;
