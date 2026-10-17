import type { ReactNode } from "react";
import boltAsset from "@/assets/bolt-mark.svg.asset.json";

/** Bolt, the robot who does exactly what the class writes. Name kept for existing call sites. */
export function Campi({ width = 96, alt = "Bolt the robot", className }: { width?: number; alt?: string; className?: string }) {
  const w = Math.max(width, 57); // never smaller than 64px tall
  return <img src={boltAsset.url} alt={alt} width={w} style={{ width: w, height: "auto" }} className={className} />;
}
export const Bolt = Campi;

/** Two-colour bubble wordmark: "ai" coral, "ventura" golden, ink outline and drop. */
export function Wordmark({ height = 92 }: { height?: number }) {
  const size = Math.round(height * 0.62);
  return (
    <span className="wordmark block" style={{ fontSize: size }} aria-label="aiventura" role="img">
      <span className="wordmark-ai">ai</span><span className="wordmark-ventura">ventura</span>
    </span>
  );
}

/** Sky-blue page with the brand's dotted ground. */
export function StarPage({ children }: { children: ReactNode; seed?: number; count?: number }) {
  return <div className="sky-ground relative min-h-screen overflow-hidden text-navy">{children}</div>;
}

export function StepPills({ steps, current, label }: { steps: string[]; current: number; label: string }) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-label={label}>
      {steps.map((s, i) => (
        <span
          key={s}
          className={`pill ${i === current ? "bg-sun" : i < current ? "bg-lilac" : "bg-surface"}`}
          aria-current={i === current ? "step" : undefined}
        >
          {i + 1} {s}
        </span>
      ))}
    </div>
  );
}
