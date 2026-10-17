import type { ReactNode } from "react";
import campiAsset from "@/assets/campi-color.svg.asset.json";
import wordmarkAsset from "@/assets/aiventura-wordmark-color.svg.asset.json";

export function Campi({ width = 96, alt = "Campi the tent", className }: { width?: number; alt?: string; className?: string }) {
  return <img src={campiAsset.url} alt={alt} width={width} style={{ width, height: "auto" }} className={className} />;
}

export function Wordmark({ height = 92 }: { height?: number }) {
  return <img src={wordmarkAsset.url} alt="aiventura" style={{ height, width: "auto", maxWidth: "100%" }} className="block" />;
}

const STAR_TINTS = ["#ffffff", "#ffffff", "var(--sun)", "var(--sky)", "var(--pink-soft)"];

function makeStars(count: number, seed0: number) {
  let seed = seed0;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  return Array.from({ length: count }, () => ({
    x: rnd() * 96 + 1,
    y: rnd() * 97 + 1,
    size: Math.round(6 + rnd() * 8),
    o: 0.45 + rnd() * 0.45,
    c: STAR_TINTS[Math.floor(rnd() * STAR_TINTS.length)],
  }));
}

/** Navy page with ~20 tiny four-point stars. Deterministic so SSR matches. */
export function StarPage({ children, seed = 7, count = 20 }: { children: ReactNode; seed?: number; count?: number }) {
  const stars = makeStars(count, seed);
  return (
    <div className="relative min-h-screen overflow-hidden bg-navy text-navy">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {stars.map((s, i) => (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className="absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.o }}
          >
            <path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0Z" fill={s.c} />
          </svg>
        ))}
      </div>
      {children}
    </div>
  );
}

export function StepPills({ steps, current, label }: { steps: string[]; current: number; label: string }) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-label={label}>
      {steps.map((s, i) => (
        <span
          key={s}
          className={`pill ${i === current ? "bg-pink-soft" : i < current ? "bg-sky" : "bg-line"}`}
          aria-current={i === current ? "step" : undefined}
        >
          {i + 1} {s}
        </span>
      ))}
    </div>
  );
}
