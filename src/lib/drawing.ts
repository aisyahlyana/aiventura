/**
 * Parametric "What the AI drew" cartoon. Reads hair colour/style, top colour and
 * trousers/skirt words from the prompt; anything missing, the "AI" guesses.
 * Optional hook: `imageGenerator` can later call a child-safe image API.
 */

export type Drawing = {
  hair: string;
  hairStyle: "wavy" | "long" | "bun";
  shirt: string;
  bottom: string;
  bottomType: "trousers" | "skirt";
  glasses: boolean;
  alt: string;
};

const COL: Record<string, string> = {
  brown: "#6b4226", black: "#25262e", blonde: "#e3b04b", blond: "#e3b04b", yellow: "#e3b04b", red: "#e5484d",
  ginger: "#b5502d", grey: "#b8bcc6", gray: "#b8bcc6", white: "#f4f4f4", blue: "#4a6fa5", green: "#4f9d69",
  pink: "#ff8fb1", purple: "#8a6cd1", orange: "#f08a3c", navy: "#2f4473",
};
const WORDS = Object.keys(COL).join("|");

export function buildDrawing(text: string, guess: Partial<Drawing> = {}): Drawing {
  const low = text.toLowerCase();
  const hairM =
    new RegExp(`\\b(${WORDS})\\b[^.,]{0,25}\\bhair\\b`).exec(low) || new RegExp(`\\bhair\\b[^.,]{0,12}\\b(${WORDS})\\b`).exec(low);
  const shirtM = new RegExp(`\\b(${WORDS})\\s+(shirt|top|t-shirt|jumper|sweater|blouse|dress)\\b`).exec(low);
  const botM = new RegExp(`\\b(${WORDS})\\s+(trousers|pants|jeans|skirt|shorts)\\b`).exec(low);
  const isJeans = /\bjeans\b/.test(low);
  const hairStyle = /\blong\b/.test(low) ? "long" : /\bbun\b/.test(low) ? "bun" : /\b(short|wavy|curly)\b/.test(low) ? "wavy" : guess.hairStyle ?? "bun";
  const hair = hairM ? COL[hairM[1]!]! : guess.hair ?? "#9aa3b2";
  const shirt = shirtM ? COL[shirtM[1]!]! : guess.shirt ?? "#4f9d69";
  const bottomWord = botM ? botM[2] : isJeans ? "jeans" : guess.bottomType ?? "skirt";
  const bottomType = bottomWord === "skirt" ? "skirt" : "trousers";
  const bottom = botM ? COL[botM[1]!]! : isJeans ? "#4a6fa5" : guess.bottom ?? "#2f4473";
  const glasses = /\bglasses\b/.test(low) || !!guess.glasses;
  const styleWord = hairStyle === "long" ? "long" : hairStyle === "bun" ? "a bun of" : "short wavy";
  const alt = `AI drawing of a teacher with ${styleWord} hair, a ${shirtM ? shirtM[1] : "guessed"} top and ${
    botM ? `${botM[1]} ${botM[2]}` : bottomType === "skirt" ? "a guessed skirt" : "guessed trousers"
  }${glasses ? ", wearing glasses" : ""}`;
  return { hair, hairStyle, shirt, bottom, bottomType, glasses, alt };
}

const STOP = new Set(["a", "an", "the", "and", "with", "comes", "from", "of", "is", "has", "wears", "wearing", "some"]);

/** A clue counts as found when all its meaningful words appear in the prompt. */
export function clueFound(clue: string, prompt: string) {
  const low = prompt.toLowerCase();
  const words = clue
    .toLowerCase()
    .replace(/[^a-záéíóúñ\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));
  if (!words.length) return false;
  return words.every((w) => {
    if (w === "trousers") return /\b(trousers|pants)\b/.test(low);
    return new RegExp(`\\b${w}\\b`).test(low);
  });
}

/** Future hook: replace with a call to a child-safe image API. */
export type ImageGenerator = (prompt: string) => Promise<string | null>;
export const imageGenerator: ImageGenerator | null = null;
