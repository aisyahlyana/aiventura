import { PART_RE, type DrawPartId } from "./safety";

export type Seg = { text: string; part?: DrawPartId };

/** Split a prompt into plain and highlighted pieces where Aiventura found a part keyword. */
export function highlightParts(text: string): Seg[] {
  const ranges: { s: number; e: number; part: DrawPartId }[] = [];
  (Object.keys(PART_RE) as DrawPartId[]).forEach((part) => {
    const re = new RegExp(PART_RE[part].source, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      ranges.push({ s: m.index, e: m.index + m[0].length, part });
      if (m[0].length === 0) re.lastIndex++;
    }
  });
  ranges.sort((a, b) => a.s - b.s);
  const out: Seg[] = [];
  let i = 0;
  for (const r of ranges) {
    if (r.s < i) continue;
    if (r.s > i) out.push({ text: text.slice(i, r.s) });
    out.push({ text: text.slice(r.s, r.e), part: r.part });
    i = r.e;
  }
  if (i < text.length) out.push({ text: text.slice(i) });
  return out;
}
