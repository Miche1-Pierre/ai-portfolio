"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import Badge, { BadgeColor } from "./Badge";

const techs: { name: string; color: BadgeColor }[] = [
  { name: "Java", color: "java" },
  { name: "PHP", color: "php" },
  { name: "HTML", color: "html" },
  { name: "CSS", color: "css" },
  { name: "JavaScript", color: "js" },
  { name: "TypeScript", color: "ts" },
  { name: "React", color: "react" },
  { name: "Next.js", color: "next" },
  { name: "Tailwind", color: "tailwind" },
  { name: "Node.js", color: "node" },
];

const MIN_DISTANCE = 90;
const RADIUS = 180;
const MAX_TRIES = 100;

function getRandomPosition(radius: number) {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radius;
  return {
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
  };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function generatePositions(): { x: number; y: number }[] | null {
  const placedPositions: { x: number; y: number }[] = [];

  for (let i = 0; i < techs.length; i++) {
    let pos: { x: number; y: number } | null = null;
    let tries = 0;

    while (tries < MAX_TRIES) {
      const candidate = getRandomPosition(RADIUS);
      const tooClose = placedPositions.some(
        (p) => distance(p, candidate) < MIN_DISTANCE
      );

      if (!tooClose) {
        pos = candidate;
        break;
      }
      tries++;
    }

    if (pos === null) {
      return null;
    }
    placedPositions.push(pos);
  }

  return placedPositions;
}

export default function FloatingBadgeCloud() {
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let attempts = 0;
    let newPositions = null;

    while (attempts < 10) {
      newPositions = generatePositions();
      if (newPositions) break;
      attempts++;
    }

    if (newPositions) setPositions(newPositions);
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect();
      setContainerSize({ width, height });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  if (
    positions.length === 0 ||
    containerSize.width === 0 ||
    containerSize.height === 0
  ) {
    return (
      <div
        ref={containerRef}
        className="relative mx-auto"
        style={{ width: 600, height: 400 }}
      />
    );
  }

  return (
    <div
      className="relative mx-auto"
      style={{ width: 600, height: 400 }}
      ref={containerRef}
    >
      {/* Spot light blanc */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600,
          height: 200,
          background: "rgba(255, 255, 255, 0.1)",
          filter: "blur(70px)",
          boxShadow: "0 0 120px 80px rgba(255, 255, 255, 0.1)",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      />

      {/* Spot light orange rétro */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500,
          height: 400,
          background: "rgba(255, 140, 0, 0.1)",
          filter: "blur(70px)",
          boxShadow: "0 0 100px 70px rgba(255, 140, 0, 0.1)",
          top: "80%",
          left: "0%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      />

      {/* Spot light cyan */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500,
          height: 400,
          background: "rgba(0, 200, 255, 0.1)",
          filter: "blur(70px)",
          boxShadow: "0 0 110px 75px rgba(0, 200, 255, 0.1)",
          top: "80%",
          left: "100%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
      />

      {/* Lignes entre les badges */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={containerSize.width}
        height={containerSize.height}
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        style={{ zIndex: 0 }}
      >
        {positions.flatMap((from, i) =>
          positions
            .slice(i + 1)
            .map((to, j) => (
              <line
                key={`line-${i}-${j}`}
                x1={containerSize.width / 2 + from.x}
                y1={containerSize.height / 2 + from.y}
                x2={containerSize.width / 2 + to.x}
                y2={containerSize.height / 2 + to.y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={1}
              />
            ))
        )}
      </svg>

      {/* Badges */}
      {techs.map((tech, i) => (
        <div
          key={tech.name}
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: `translate(${positions[i].x}px, ${positions[i].y}px) translate(-50%, -50%)`,
            zIndex: 1,
          }}
        >
          <div
            style={{
              animation: `float 3s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <Badge color={tech.color}>{tech.name}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
