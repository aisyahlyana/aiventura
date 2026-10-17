/** Shared, browser-safe data for "Play in class: Draw our teacher". */

export const NICKNAMES = [
  "Brave Fox", "Swift Otter", "Calm Koala", "Bright Comet", "Jolly Panda", "Clever Crab", "Mighty Ant", "Rocket Hare",
  "Quick Lynx", "Tiny Whale", "Lucky Moth", "Happy Yak", "Sunny Seal", "Kind Owl", "Bold Badger", "Merry Mole",
];

export const STUDENT_TEAMS = [
  { name: "Pink Tents", color: "pink" },
  { name: "Blue Rockets", color: "blue" },
  { name: "Sunny Stars", color: "sun" },
] as const;
export const LIVE_TEAM = { name: "Lilac Explorers", color: "lilac" } as const;

export const DEFAULT_CLUES = ["Comes from Spain", "Short, wavy brown hair", "A red shirt", "Black trousers"];

export type DemoTeam = {
  name: string;
  players: string[];
  segs: [string, "who" | "what" | "why"][];
  blocked?: string;
  guess?: { hairStyle?: "long" | "bun" | "wavy"; bottomType?: "trousers" | "skirt"; bottom?: string; glasses?: boolean };
  sent: boolean;
};

/** Example teams shown until real students send prompts for that team. */
export const DEMO_TEAMS: Record<string, DemoTeam> = {
  "Pink Tents": {
    name: "Pink Tents", players: ["Brave Fox", "Swift Otter", "Calm Koala", "Bright Comet"], sent: true,
    segs: [["We are a primary school class.", "who"], ["Draw our teacher with short, wavy brown hair, a red shirt and black trousers,", "what"], ["for a thank-you card.", "why"], ["Just one simple, friendly cartoon.", "what"]],
  },
  "Blue Rockets": {
    name: "Blue Rockets", players: ["Jolly Panda", "Quick Lynx", "Tiny Whale", "Lucky Moth"], sent: true,
    segs: [["Draw a teacher.", "what"]],
    guess: { glasses: true },
  },
  "Sunny Stars": {
    name: "Sunny Stars", players: ["Happy Yak", "Clever Crab", "Mighty Ant", "Rocket Hare"], sent: false,
    segs: [["Draw our teacher with brown hair and a red shirt", "what"], ["for our class poster.", "why"]],
    blocked: "The safety check stopped “make her look funny with a giant nose” before it was sent. Keep it kind!",
    guess: { hairStyle: "long", bottomType: "trousers", bottom: "#4a6fa5" },
  },
};

export function formatCode(code: string) {
  return code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
}
export function normaliseCode(input: string) {
  return input.replace(/\D/g, "").slice(0, 6);
}
