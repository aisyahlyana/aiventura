/**
 * Prompt safety guardrails for children's free-text prompts.
 * `checkPrompt` is the single entry point; swap `keywordModerator` for a real
 * moderation API later by implementing the same `Moderator` shape.
 */

export type SafetyIssueKind = "private" | "realName" | "unkind" | "offTopic" | "tooLong";
export type SafetyIssue = { kind: SafetyIssueKind; title: string; detail: string };
export type SafetyResult = { issues: SafetyIssue[]; tooShort: boolean; canSend: boolean };
export type Moderator = (text: string) => SafetyIssue[];

export const MAX_PROMPT_LENGTH = 260;
export const MIN_PROMPT_LENGTH = 15;

const PERSONAL = ["my name", "i am \\d+", "i'm \\d+", "\\d+ years old", "years old", "i live", "address", "phone", "street", "calle", "my school", "school is"];
const UNKIND = ["ugly", "stupid", "fat", "silly", "look funny", "looking funny", "weird", "dumb", "gross", "smelly", "giant nose", "big nose", "hate", "old lady", "old man", "scary"];
const OFF_TOPIC = ["dragon", "dragons", "unicorn", "zombie", "monster", "monsters", "laser", "lasers", "explosion", "fireworks", "castle", "spaceship", "alien", "blood", "weapon", "weapons", "gun", "guns", "sword"];
const TOO_MUCH = /\b(really really|very very|\d{3,} words|lots and lots|everything)\b/;
const REAL_NAME = /\b(mr|mrs|ms|miss|señor|señora|senor|senora|profe)\.?\s+[a-záéíóúñ]{2,}/i;
const EMAIL_OR_NUMBER = /@|\d{6,}/;

function hits(low: string, list: string[]) {
  return list.filter((w) => new RegExp("\\b" + w + "\\b").test(low));
}

export const keywordModerator: Moderator = (text) => {
  const low = text.toLowerCase();
  const issues: SafetyIssue[] = [];
  const personal = hits(low, PERSONAL);
  if (EMAIL_OR_NUMBER.test(low)) personal.push("a number or email");
  if (personal.length) {
    const what = personal[0]!.replace(/\\d\+/g, "…").replace(/\\/g, "");
    issues.push({ kind: "private", title: "Private info.", detail: `Take out names, ages, addresses and schools: “${what}”.` });
  }
  const real = REAL_NAME.exec(low);
  if (real) issues.push({ kind: "realName", title: "Real name.", detail: `Call them “our teacher”, not “${real[0]}”.` });
  const unkind = hits(low, UNKIND);
  if (unkind.length) issues.push({ kind: "unkind", title: "Keep it kind.", detail: `Describe our teacher nicely. Remove “${unkind[0]}”.` });
  const off = hits(low, OFF_TOPIC);
  if (off.length) issues.push({ kind: "offTopic", title: "Stay on mission.", detail: `Keep it about our teacher. Remove extras like “${off[0]}”.` });
  if (TOO_MUCH.test(low) || text.length > MAX_PROMPT_LENGTH)
    issues.push({ kind: "tooLong", title: "Too much.", detail: "Only add what the drawing needs. Short and clear wins!" });
  return issues;
};

export function checkPrompt(text: string, moderator: Moderator = keywordModerator): SafetyResult {
  const issues = moderator(text);
  const tooShort = text.trim().length < MIN_PROMPT_LENGTH;
  return { issues, tooShort, canSend: issues.length === 0 && !tooShort };
}

export function safetyTitle(text: string, r: SafetyResult) {
  if (r.issues.length) return `Safety check: fix ${r.issues.length} ${r.issues.length === 1 ? "thing" : "things"} first`;
  if (!text.trim()) return "Safety check: start typing your prompt";
  if (r.tooShort) return "Safety check: add a bit more detail";
  return "Safety check: all clear!";
}

/* ---------- The three parts for "Draw our teacher" ---------- */

export type DrawPartId = "who" | "what" | "why";
export const DRAW_PARTS: { id: DrawPartId; n: number; name: string; short: string; hint: string; tone: string }[] = [
  { id: "who", n: 1, name: "Who is it for?", short: "Who is it for?", hint: "Who will see or use the drawing?", tone: "tone-blue" },
  { id: "what", n: 2, name: "What do you want?", short: "What to draw?", hint: "What should the AI draw? Give the clues!", tone: "tone-pink" },
  { id: "why", n: 3, name: "Why do you need it?", short: "Why?", hint: "A card, a poster, a class book?", tone: "tone-sun" },
];
export const PART_RE: Record<DrawPartId, RegExp> = {
  who: /\b(we are|we're|our class|my class|the class|for (kids|children|students|everyone|our classmates)|primary|students?)\b/i,
  what: /\b(draw|drawing|picture|cartoon|portrait|sketch|paint)\b/i,
  why: /\b(card|poster|thank[- ]?you|birthday|display|class book|wall|because|so that|so we)\b/i,
};
export function detectParts(text: string): DrawPartId[] {
  return DRAW_PARTS.filter((p) => PART_RE[p.id].test(text)).map((p) => p.id);
}
