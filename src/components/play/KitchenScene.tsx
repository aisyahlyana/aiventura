import type { ReactNode } from "react";
import type { Kitchen, Mood, Spread } from "@/lib/sayItClearly";

/** Cartoon kitchen and Bolt the robot, drawn only from a Kitchen state. */

const INK = "var(--navy)";
const PB = "#c07a3a";
const GRAPE = "#8e3fb0";
const CRUST = "#d9a14e";
const CRUMB = "#fbe6b0";
const LOAF = "#e8b25e";
const SL = "M-46 48 L-46 -18 C-62 -30 -52 -58 -24 -54 C-12 -66 12 -66 24 -54 C52 -58 62 -30 46 -18 L46 48 Q46 54 40 54 L-40 54 Q-46 54 -46 48 Z";
const DISPLAY = "Titan One, Nunito, system-ui, sans-serif";

const spreadable = (s: Spread) => (s === "spread" || s === "glob" ? s : null);

function Topping({ kind, color }: { kind: "spread" | "glob" | null; color: string }) {
  if (kind === "spread")
    return (
      <>
        <path d={SL} transform="scale(.74)" fill={color} stroke={INK} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <path d="M-22 -20 Q-8 -30 10 -24" stroke="#fff" strokeOpacity={0.5} strokeWidth={5} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </>
    );
  if (kind === "glob")
    return (
      <>
        <g fill={color} stroke={INK} strokeWidth={2}>
          <circle cx={-14} cy={-6} r={22} vectorEffect="non-scaling-stroke" />
          <circle cx={14} cy={10} r={17} vectorEffect="non-scaling-stroke" />
          <circle cx={8} cy={-22} r={12} vectorEffect="non-scaling-stroke" />
        </g>
        <path d="M-30 -2 L-4 -14 M-26 10 L0 -2 M-20 22 L6 10" stroke="#fff" strokeOpacity={0.45} strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </>
    );
  return null;
}

function Slice({ x, y, children }: { x: number; y: number; children?: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) scale(.95 .52)`}>
      <path d={SL} fill={CRUST} stroke={INK} strokeWidth={4} vectorEffect="non-scaling-stroke" />
      <path d={SL} transform="scale(.84)" fill={CRUMB} />
      {children}
    </g>
  );
}

function Jar({ x, yb, kind, open, sc = 1 }: { x: number; yb: number; kind: "pb" | "jelly"; open: boolean; sc?: number }) {
  const body = kind === "pb" ? PB : GRAPE;
  return (
    <g transform={`translate(${x} ${yb}) scale(${sc})`}>
      <rect x={-40} y={-100} width={80} height={100} rx={16} fill={body} stroke={INK} strokeWidth={4} />
      <rect x={-30} y={-88} width={10} height={60} rx={5} fill="#fff" opacity={0.35} />
      <rect x={-32} y={-66} width={64} height={32} rx={6} fill="#fff" stroke={INK} strokeWidth={3} />
      <text x={0} y={-42} textAnchor="middle" fontFamily={DISPLAY} fontSize={kind === "pb" ? 20 : 14} fill={INK}>{kind === "pb" ? "PB" : "JELLY"}</text>
      <rect x={-34} y={-112} width={68} height={14} rx={4} fill={body} stroke={INK} strokeWidth={4} />
      {open ? (
        <ellipse cx={0} cy={-112} rx={30} ry={7} fill={kind === "pb" ? "#8a5222" : "#5e2378"} stroke={INK} strokeWidth={3} />
      ) : (
        <>
          <rect x={-44} y={-132} width={88} height={24} rx={8} fill={kind === "pb" ? "var(--pink)" : "var(--sun)"} stroke={INK} strokeWidth={4} />
          <path d="M-30 -126 v12 M-15 -126 v12 M0 -126 v12 M15 -126 v12 M30 -126 v12" stroke={INK} strokeWidth={2} opacity={0.4} />
        </>
      )}
    </g>
  );
}

function Lid({ x, y, color }: { x: number; y: number; color: string }) {
  return <rect x={x - 40} y={y - 11} width={80} height={22} rx={8} fill={color} stroke={INK} strokeWidth={4} transform={`rotate(-10 ${x} ${y})`} />;
}

function Splat({ x, y, color, r = 22 }: { x: number; y: number; color: string; r?: number }) {
  return (
    <g fill={color} stroke={INK} strokeWidth={3}>
      <ellipse cx={x} cy={y} rx={r * 1.4} ry={r * 0.6} />
      <circle cx={x + r * 1.7} cy={y - 6} r={5} />
      <circle cx={x - r * 1.8} cy={y + 4} r={4} />
      <circle cx={x + r} cy={y + r * 0.7} r={3.5} />
    </g>
  );
}

function Crumbs({ x, y }: { x: number; y: number }) {
  return (
    <g fill={CRUST} stroke={INK} strokeWidth={1.5}>
      <circle cx={x} cy={y} r={4} />
      <circle cx={x + 14} cy={y + 6} r={3} />
      <circle cx={x - 10} cy={y + 9} r={3.5} />
      <circle cx={x + 26} cy={y - 2} r={2.5} />
    </g>
  );
}

function Bag({ s }: { s: Kitchen }) {
  const loafTop = 172 + Math.min(4, s.slices) * 20;
  const lines = [0, 1, 2, 3, 4].map((i) => loafTop + 22 + i * 22).filter((yy) => yy < 286);
  const shape =
    s.bag === "open"
      ? "M60 300 Q50 300 50 288 L52 160 Q50 142 70 140 L160 140 Q180 142 178 160 L180 288 Q180 300 168 300 Z"
      : "M60 300 Q50 300 50 288 L56 172 Q60 152 95 142 L104 124 L126 124 L135 142 Q170 152 174 172 L180 288 Q180 300 168 300 Z";
  return (
    <g>
      <path d={shape} fill="#dcefff" fillOpacity={0.85} stroke={INK} strokeWidth={4} />
      {s.bag === "open" && <ellipse cx={115} cy={142} rx={56} ry={9} fill="var(--sky)" stroke={INK} strokeWidth={3} />}
      <rect x={66} y={loafTop} width={98} height={292 - loafTop} rx={22} fill={LOAF} stroke="#b9782e" strokeWidth={3} />
      {lines.map((yy) => <path key={yy} d={`M72 ${yy} H158`} stroke="#b9782e" strokeWidth={2.5} />)}
      <rect x={56} y={262} width={118} height={26} rx={6} fill="var(--blue-deep)" stroke={INK} strokeWidth={3} />
      <text x={115} y={281} textAnchor="middle" fontFamily={DISPLAY} fontSize={16} fill="#fff">BREAD</text>
      {s.bag === "open" ? (
        <rect x={188} y={316} width={34} height={8} rx={4} fill="var(--sun)" stroke={INK} strokeWidth={2.5} transform="rotate(18 205 320)" />
      ) : (
        <>
          <rect x={97} y={126} width={36} height={11} rx={5} fill="var(--sun)" stroke={INK} strokeWidth={3} />
          <path d="M97 131 l-10 -8 M133 131 l10 -8" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </>
      )}
      {s.bag === "ripped" && (
        <>
          <path d="M176 182 L160 194 L174 206 L156 220 L172 232 L158 244 L178 252" fill={LOAF} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <Crumbs x={196} y={318} />
        </>
      )}
    </g>
  );
}

function Sandwich({ s, cx, cy }: { s: Kitchen; cx: number; cy: number }) {
  if (s.slices <= 0) return null;
  const pbTop = spreadable(s.pb);
  const jTop = spreadable(s.jelly);
  const extra = (x: number, y: number) =>
    Array.from({ length: Math.max(0, s.slices - 2) }, (_, i) => <Slice key={`x${i}`} x={x} y={y - i * 10} />);

  if (s.sandwich === "smashed" && s.slices >= 2)
    return (
      <g>
        <Splat x={cx - 70} y={cy + 14} color={pbTop ? PB : LOAF} r={16} />
        <Splat x={cx + 74} y={cy + 10} color={jTop ? GRAPE : LOAF} r={14} />
        <path
          d={`M${cx - 92} ${cy + 6} Q${cx - 60} ${cy - 22} ${cx} ${cy - 14} Q${cx + 70} ${cy - 24} ${cx + 94} ${cy + 4} Q${cx + 60} ${cy + 28} ${cx} ${cy + 22} Q${cx - 66} ${cy + 30} ${cx - 92} ${cy + 6} Z`}
          fill={LOAF} stroke={INK} strokeWidth={4}
        />
        <path d={`M${cx - 40} ${cy - 2} l10 -6 l8 8 l12 -8 M${cx + 18} ${cy + 4} l10 -6 l8 8`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        {extra(cx + 150, cy)}
      </g>
    );

  if ((s.sandwich === "closed" || s.sandwich === "inside_out") && s.slices >= 2) {
    const closed = s.sandwich === "closed";
    return (
      <g>
        <Slice x={cx} y={cy + 12} />
        {closed && pbTop && <path d={SL} transform={`translate(${cx} ${cy + 4}) scale(1 .5)`} fill={PB} stroke={INK} strokeWidth={3} vectorEffect="non-scaling-stroke" />}
        {closed && jTop && <path d={SL} transform={`translate(${cx + 3} ${cy}) scale(.98 .5)`} fill={GRAPE} stroke={INK} strokeWidth={3} vectorEffect="non-scaling-stroke" />}
        <Slice x={cx} y={cy - 6}>
          {!closed && <Topping kind={pbTop ?? jTop} color={pbTop ? PB : GRAPE} />}
          {!closed && pbTop && jTop && <g transform="translate(14 14) scale(.6)"><Topping kind={jTop} color={GRAPE} /></g>}
        </Slice>
        {!closed && (pbTop || jTop) && <path d={`M${cx + 30} ${cy + 18} q4 14 0 20`} stroke={jTop ? GRAPE : PB} strokeWidth={7} strokeLinecap="round" fill="none" />}
        {extra(cx + 150, cy)}
      </g>
    );
  }

  const xs = s.slices === 1 ? [cx] : [cx - 62, cx + 62];
  return (
    <g>
      {xs.map((x, i) => (
        <Slice key={x} x={x} y={cy}>
          {s.slices === 1 ? (
            <>
              <Topping kind={pbTop} color={PB} />
              {jTop && <g transform="translate(10 8) scale(.6)"><Topping kind={jTop} color={GRAPE} /></g>}
            </>
          ) : (
            <Topping kind={i === 0 ? pbTop : jTop} color={i === 0 ? PB : GRAPE} />
          )}
        </Slice>
      ))}
      {extra(cx + 62, cy - 10)}
      {s.pb === "jar_on_bread" && <Jar x={xs[0]!} yb={cy + 8} kind="pb" open={s.pbJar === "open"} sc={0.62} />}
      {s.jelly === "jar_on_bread" && <Jar x={xs[xs.length - 1]! + (xs.length === 1 ? 26 : 0)} yb={cy + 8} kind="jelly" open={s.jellyJar === "open"} sc={0.62} />}
    </g>
  );
}

function describeKitchen(s: Kitchen) {
  const parts = [`Bread bag ${s.bag}`, `${s.slices} slices out${s.slices ? " on the " + s.where : ""}`, `peanut butter jar ${s.pbJar}`, `jelly jar ${s.jellyJar}`];
  if (s.pb !== "none") parts.push(`peanut butter: ${s.pb.replace(/_/g, " ")}`);
  if (s.jelly !== "none") parts.push(`jelly: ${s.jelly.replace(/_/g, " ")}`);
  if (s.slices >= 2 && s.sandwich !== "open") parts.push(`sandwich ${s.sandwich.replace(/_/g, " ")}`);
  return parts.join(", ");
}

export function KitchenScene({ s }: { s: Kitchen }) {
  const onTable = s.where === "table";
  const messColor = s.jelly !== "none" ? GRAPE : PB;
  return (
    <svg viewBox="0 0 800 440" role="img" aria-label={describeKitchen(s)} className="block h-auto w-full">
      <defs>
        <pattern id="bolt-tiles" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="var(--blue-tint)" />
          <path d="M50 0 V50 M0 50 H50" stroke="var(--sky)" strokeWidth={3} />
        </pattern>
      </defs>
      <rect width={800} height={300} fill="url(#bolt-tiles)" />
      <rect x={315} y={30} width={170} height={44} rx={10} fill="#fff" stroke={INK} strokeWidth={4} />
      <text x={400} y={60} textAnchor="middle" fontFamily={DISPLAY} fontSize={19} fill={INK}>BOLT'S KITCHEN</text>
      <rect y={290} width={800} height={150} fill="var(--sun)" />
      <rect y={286} width={800} height={16} fill="var(--sun-tint)" stroke={INK} strokeWidth={4} />
      <path d="M0 340 H800 M0 392 H800" stroke="var(--sun-edge)" strokeWidth={3} opacity={0.5} />

      {s.pb === "on_table" && <Splat x={250} y={395} color={PB} />}
      {s.jelly === "on_table" && <Splat x={330} y={418} color={GRAPE} r={18} />}
      {s.mess >= 2 && <Crumbs x={520} y={410} />}
      {s.mess >= 3 && (
        <>
          <Crumbs x={90} y={400} />
          <Splat x={470} y={425} color={messColor} r={10} />
        </>
      )}

      <Bag s={s} />
      {s.slices === 0 && s.pb === "jar_on_bread" && <Jar x={100} yb={150} kind="pb" open={s.pbJar === "open"} sc={0.55} />}
      {s.slices === 0 && s.jelly === "jar_on_bread" && <Jar x={140} yb={150} kind="jelly" open={s.jellyJar === "open"} sc={0.55} />}

      <ellipse cx={400} cy={340} rx={150} ry={40} fill="#fff" stroke={INK} strokeWidth={4} />
      <ellipse cx={400} cy={337} rx={108} ry={25} fill="none" stroke="var(--line)" strokeWidth={3} />
      <Sandwich s={s} cx={400} cy={onTable ? 400 : 324} />

      {s.pb !== "jar_on_bread" && <Jar x={630} yb={300} kind="pb" open={s.pbJar === "open"} />}
      {s.jelly !== "jar_on_bread" && <Jar x={728} yb={300} kind="jelly" open={s.jellyJar === "open"} />}
      {s.pbJar === "open" && <Lid x={640} y={344} color="var(--pink)" />}
      {s.jellyJar === "open" && <Lid x={738} y={352} color="var(--sun-edge)" />}

      <g transform="translate(610 398) rotate(-6)">
        <rect x={-74} y={-8} width={52} height={16} rx={7} fill="var(--lilac-deep)" stroke={INK} strokeWidth={3} />
        <path d="M-22 -7 L58 -7 Q74 -6 74 0 Q72 7 58 7 L-22 7 Z" fill="#d8e1ea" stroke={INK} strokeWidth={3} />
        {s.knife === "messy" && <circle cx={34} cy={0} r={8} fill={s.pb === "spread" ? PB : GRAPE} stroke={INK} strokeWidth={2} />}
        {s.knife === "messy" && s.pb === "spread" && s.jelly === "spread" && <circle cx={50} cy={1} r={6} fill={GRAPE} stroke={INK} strokeWidth={2} />}
      </g>
    </svg>
  );
}

export function Bolt({ mood, s, width = 120 }: { mood: Mood | "think"; s: Kitchen; width?: number }) {
  const eye = "#6ff2c2";
  return (
    <svg viewBox="0 0 150 160" width={width} role="img" aria-label={mood === "think" ? "Bolt is thinking" : `Bolt looks ${mood}`} className="block h-auto flex-none">
      <path d="M50 42 L50 28 C38 26 38 6 56 10 C60 -2 90 -2 94 10 C112 6 112 26 100 28 L100 42 Z" fill="#fff" stroke={INK} strokeWidth={4} />
      <rect x={35} y={40} width={80} height={56} rx={16} fill="var(--sky)" stroke={INK} strokeWidth={4} />
      <rect x={45} y={48} width={60} height={38} rx={10} fill={INK} />
      {mood === "oops" && (
        <>
          <path d="M57 58 L67 68 M67 58 L57 68 M83 58 L93 68 M93 58 L83 68" stroke={eye} strokeWidth={4} strokeLinecap="round" />
          <path d="M62 79 L67 75 L72 79 L77 75 L82 79 L87 75" stroke={eye} strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === "confused" && (
        <>
          <circle cx={62} cy={64} r={4} fill={eye} />
          <circle cx={88} cy={63} r={7} fill="none" stroke={eye} strokeWidth={3} />
          <path d="M65 79 L85 76" stroke={eye} strokeWidth={3} strokeLinecap="round" />
          <text x={122} y={44} fontFamily={DISPLAY} fontSize={30} fill="var(--pink)" stroke={INK} strokeWidth={1.5}>?</text>
        </>
      )}
      {mood === "think" && (
        <>
          <path d="M56 64 H68 M82 64 H94" stroke={eye} strokeWidth={4} strokeLinecap="round" />
          <circle cx={75} cy={78} r={3} fill={eye} />
        </>
      )}
      {mood === "happy" && (
        <>
          <path d="M56 67 Q62 58 68 67 M82 67 Q88 58 94 67" stroke={eye} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M65 75 Q75 83 85 75" stroke={eye} strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      )}
      <rect x={68} y={95} width={14} height={9} fill="var(--blue)" stroke={INK} strokeWidth={3} />
      <path d="M42 112 L20 124 M108 112 L130 124" stroke={INK} strokeWidth={11} strokeLinecap="round" />
      <path d="M42 112 L20 124 M108 112 L130 124" stroke="var(--sky)" strokeWidth={5} strokeLinecap="round" />
      <rect x={40} y={102} width={70} height={48} rx={12} fill="var(--pink)" stroke={INK} strokeWidth={4} />
      <circle cx={75} cy={124} r={8} fill="var(--sun)" stroke={INK} strokeWidth={3} />
      <circle cx={18} cy={126} r={11} fill="var(--blue)" stroke={INK} strokeWidth={3} />
      <circle cx={132} cy={126} r={11} fill="var(--blue)" stroke={INK} strokeWidth={3} />
      {s.hands === "messy" && (
        <>
          <circle cx={13} cy={130} r={6} fill={s.pb === "glob" ? PB : GRAPE} stroke={INK} strokeWidth={2} />
          <circle cx={138} cy={130} r={5} fill={s.jelly === "glob" ? GRAPE : PB} stroke={INK} strokeWidth={2} />
        </>
      )}
      {s.pb === "on_bot" && <circle cx={58} cy={118} r={9} fill={PB} stroke={INK} strokeWidth={2} />}
      {s.jelly === "on_bot" && <circle cx={93} cy={136} r={8} fill={GRAPE} stroke={INK} strokeWidth={2} />}
    </svg>
  );
}
