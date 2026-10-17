type P = { size?: number; className?: string };
const N = "var(--navy)";

export function StarIcon({ size = 22, filled = true }: P & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill={filled ? "var(--sun)" : "var(--soft-grey)"}
        stroke={filled ? "var(--sun-edge)" : "var(--line-strong)"}
        strokeWidth="1.6"
        strokeLinejoin="round"
        d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"
      />
    </svg>
  );
}
export function CheckIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={N} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function CrossIcon({ size = 16, color = N }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}
export function PlusIcon({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke={N} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}
export function LockIcon({ size = 22, color = N }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="none" stroke={color} strokeWidth="2.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
export function TentIcon({ size = 42 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6.2V2" stroke={N} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12.4 2.1l4 1.3-4 1.3z" fill="#ffffff" stroke={N} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M12 6 L3.6 19.6 H20.4 Z" fill="#ffffff" stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 11.2 L9.2 19.6 H14.8 Z" fill="var(--sun-tint)" stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="11" cy="16.6" r=".9" fill={N} />
      <circle cx="13" cy="16.6" r=".9" fill={N} />
    </svg>
  );
}
export function TrophyIcon({ size = 44 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" fill="#ffffff" stroke={N} strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 6H4.5a3 3 0 0 0 3 4M17 6h2.5a3 3 0 0 1-3 4M12 14v3M8.5 20h7M9.5 17h5v3h-5z" fill="none" stroke={N} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function FlagIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 21V4M5 4h11l-2 4 2 4H5" fill="none" stroke={N} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function PlayIcon({ size = 20 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l10.5-6.5z" fill={N} stroke={N} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
export function BackIcon({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" fill="none" stroke={N} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function ShieldIcon({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none" }}>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" fill="none" stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}
export function PrintIcon({ size = 28 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v7H7z" fill="none" stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}
export function WrenchIcon({ size = 38 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3.8 17.2a1.6 1.6 0 0 0 2.3 2.3l5.7-5.7a4 4 0 0 0 5.2-5.2l-2.4 2.4-2.3-.6-.6-2.3z" fill="#ffffff" stroke={N} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
export function HeartIcon({ size = 24, filled }: P & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 22" aria-hidden="true">
      <path d="M12 20 C5 15 2 11.5 2 7.5 C2 4.5 4.3 2.3 7 2.3 C9 2.3 10.9 3.5 12 5.2 C13.1 3.5 15 2.3 17 2.3 C19.7 2.3 22 4.5 22 7.5 C22 11.5 19 15 12 20Z" fill={filled ? "var(--pink)" : "#ffffff"} stroke={N} strokeWidth="1.8" />
    </svg>
  );
}
export function GripIcon({ size = 18 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flex: "none" }}>
      {[6, 12, 18].map((y) => (
        <g key={y}>
          <circle cx="8" cy={y} r="1.8" fill={N} />
          <circle cx="16" cy={y} r="1.8" fill={N} />
        </g>
      ))}
    </svg>
  );
}
