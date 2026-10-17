import { ShieldIcon } from "@/components/brand/Icons";
import { DRAW_PARTS, detectParts, safetyTitle, type SafetyResult } from "@/lib/safety";

export function PartChips({ text, short, size = "md" }: { text: string; short?: boolean; size?: "sm" | "md" }) {
  const found = detectParts(text);
  return (
    <>
      {DRAW_PARTS.map((p) => {
        const ok = found.includes(p.id);
        return (
          <span
            key={p.id}
            className={`${p.tone} flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-extrabold ${size === "sm" ? "text-[13px]" : "text-sm"}`}
            style={{ background: ok ? "var(--tint)" : "var(--surface)", borderColor: ok ? "var(--face)" : "var(--line)" }}
          >
            <span className="font-display" aria-hidden="true">{ok ? "✓" : p.n}</span>
            {short ? p.short : p.name}
            <span className="sr-only">{ok ? " found" : " not found yet"}</span>
          </span>
        );
      })}
    </>
  );
}

export function SafetyPanel({ text, result, small }: { text: string; result: SafetyResult; small?: boolean }) {
  const clear = result.issues.length === 0;
  return (
    <div role="status" aria-live="polite" className={`flex flex-col gap-1.5 rounded-2xl px-3.5 py-2.5 ${clear ? "bg-blue-tint" : "bg-lilac-tint"}`}>
      <div className={`flex items-center gap-2 font-black ${small ? "text-sm" : "text-[15px]"}`}>
        <ShieldIcon /> {safetyTitle(text, result)}
      </div>
      {result.issues.map((is) => (
        <div key={is.kind} className={`rounded-[10px] bg-surface px-2.5 py-1.5 font-bold ${small ? "text-[13px] leading-[18px]" : "text-sm leading-5"}`}>
          <strong>{is.title}</strong> {is.detail}
        </div>
      ))}
    </div>
  );
}
