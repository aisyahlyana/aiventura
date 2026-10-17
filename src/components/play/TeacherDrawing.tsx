import type { Drawing } from "@/lib/drawing";

const SKIN = "#e8b48a";
const INK = "var(--navy)";

export function TeacherDrawing({ d }: { d: Drawing }) {
  return (
    <svg role="img" aria-label={d.alt} viewBox="0 0 200 230" className="block h-[230px] w-full">
      <ellipse cx="100" cy="222" rx="54" ry="6" fill="var(--line)" />
      {d.bottomType === "skirt" ? (
        <>
          <rect x="86" y="196" width="11" height="22" rx="4" fill={SKIN} />
          <rect x="103" y="196" width="11" height="22" rx="4" fill={SKIN} />
          <path d="M72 160 L128 160 L138 200 L62 200 Z" fill={d.bottom} />
        </>
      ) : (
        <>
          <rect x="80" y="166" width="17" height="52" rx="7" fill={d.bottom} />
          <rect x="103" y="166" width="17" height="52" rx="7" fill={d.bottom} />
        </>
      )}
      <ellipse cx="88" cy="219" rx="12" ry="5" fill="#3b2a20" />
      <ellipse cx="112" cy="219" rx="12" ry="5" fill="#3b2a20" />
      {d.hairStyle === "long" && <path d="M68 92 Q66 50 100 48 Q134 50 132 92 L134 146 L66 146 Z" fill={d.hair} />}
      <path d="M66 172 Q64 124 100 120 Q136 124 134 172 Z" fill={d.shirt} />
      <path d="M70 132 Q54 150 60 170" fill="none" stroke={d.shirt} strokeWidth="15" strokeLinecap="round" />
      <path d="M130 132 Q146 150 140 170" fill="none" stroke={d.shirt} strokeWidth="15" strokeLinecap="round" />
      <circle cx="60" cy="173" r="8" fill={SKIN} />
      <circle cx="140" cy="173" r="8" fill={SKIN} />
      <rect x="93" y="104" width="14" height="18" rx="5" fill={SKIN} />
      <circle cx="100" cy="82" r="29" fill={SKIN} />
      {d.hairStyle === "wavy" && (
        <path d="M70 84 Q66 48 100 46 Q134 48 130 84 Q126 70 120 75 Q115 61 107 68 Q100 57 93 67 Q85 60 80 72 Q74 67 70 84Z" fill={d.hair} />
      )}
      {d.hairStyle === "long" && <path d="M72 84 Q71 56 100 55 Q129 56 128 84 Q120 65 100 65 Q80 65 72 84Z" fill={d.hair} />}
      {d.hairStyle === "bun" && (
        <>
          <circle cx="100" cy="44" r="13" fill={d.hair} />
          <path d="M71 82 Q70 52 100 52 Q130 52 129 82 Q122 64 100 64 Q78 64 71 82Z" fill={d.hair} />
        </>
      )}
      <circle cx="90" cy="86" r="3.6" fill={INK} />
      <circle cx="110" cy="86" r="3.6" fill={INK} />
      {d.glasses && (
        <>
          <circle cx="90" cy="86" r="8" fill="none" stroke={INK} strokeWidth="2.4" />
          <circle cx="110" cy="86" r="8" fill="none" stroke={INK} strokeWidth="2.4" />
          <path d="M98 86h4" stroke={INK} strokeWidth="2.4" />
        </>
      )}
      <ellipse cx="83" cy="97" rx="5" ry="3" fill="var(--cheek)" />
      <ellipse cx="117" cy="97" rx="5" ry="3" fill="var(--cheek)" />
      <path d="M92 98 Q100 105 108 98" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
