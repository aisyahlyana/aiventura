import { useCallback, useEffect, useState } from "react";

export type GameRoute = "/game/fix-the-prompt" | "/game/say-it-clearly";
export type Lesson = { title: string; desc: string; time: string; who: string; game?: GameRoute; challenge?: boolean };
export type Phase = { kicker: string; title: string; blurb: string; tone: string; lessons: Lesson[] };

export const PHASES: Phase[] = [
  {
    kicker: "Phase 1", title: "Write great prompts", tone: "tone-pink",
    blurb: "A clear question gets a better answer. Learn the parts of a good prompt.",
    lessons: [
      { title: "Fix the prompt", desc: "Game: learn the four parts of a good prompt, then improve one about climate change.", time: "15 min", who: "Groups of 4", game: "/game/fix-the-prompt" },
      { title: "Say it clearly", desc: "Game: write exact steps for Bolt the robot chef, who does only what you say. Can you get a perfect sandwich?", time: "15 min", who: "Pairs", game: "/game/say-it-clearly" },
      { title: "Pick the right style", desc: "Ask for steps, a list, a story or a table, then compare the answers.", time: "15 min", who: "Groups of 4" },
      { title: "Ask a follow-up", desc: "Not happy with the answer? Practise asking again in a better way.", time: "10 min", who: "Pairs" },
      { title: "Prompt master", desc: "Write a prompt for a class project that gets a useful answer first time. Finishes Phase 1.", time: "20 min", who: "Groups of 4", challenge: true },
    ],
  },
  {
    kicker: "Phase 2", title: "Spot the mistakes", tone: "tone-blue",
    blurb: "AI can sound very sure and still be wrong. Learn to check what it says.",
    lessons: [
      { title: "Meet the assistant", desc: "See how an AI writes its answers, and why they can sound so sure.", time: "10 min", who: "Whole class" },
      { title: "True or not true?", desc: "Raise Keep or Check for five AI facts, then talk about why.", time: "15 min", who: "Groups of 4" },
      { title: "Find a source", desc: "Check one AI answer against a book or a trusted website.", time: "15 min", who: "Groups of 4" },
      { title: "Fix the facts", desc: "Rewrite a wrong answer so it says what is really true.", time: "15 min", who: "Pairs" },
      { title: "Mistake hunt", desc: "Find every mistake hiding in one AI story. Finishes Phase 2.", time: "20 min", who: "Groups of 4", challenge: true },
    ],
  },
  {
    kicker: "Phase 3", title: "Stay safe", tone: "tone-lilac",
    blurb: "Find the names, addresses and secrets that should never be shared with an AI.",
    lessons: [
      { title: "What is private?", desc: "Sort the cards: a name, a favourite colour, a home address, a password.", time: "10 min", who: "Groups of 4" },
      { title: "Spot the secret", desc: "Find the private details hiding inside an AI answer.", time: "15 min", who: "Groups of 4" },
      { title: "Ask first", desc: "Practise asking a trusted grown-up before sharing anything personal.", time: "10 min", who: "Pairs" },
      { title: "Clean it up", desc: "Remove the private details and keep the useful part of the answer.", time: "15 min", who: "Groups of 4" },
      { title: "Safety badge", desc: "Your final mission: edit three AI answers so they are true and nothing private is left.", time: "25 min", who: "Groups of 4", challenge: true },
    ],
  },
];

export const TOTAL_STEPS = PHASES.reduce((n, p) => n + p.lessons.length, 0);
export const STARS_PER_STEP = 3;

const KEY = "aiventura-progress";

/** Class progress (steps done), stored on this device. */
export function useProgress() {
  const [progress, setProgressState] = useState(0);
  useEffect(() => {
    const v = Number(window.localStorage.getItem(KEY));
    if (Number.isFinite(v)) setProgressState(Math.max(0, Math.min(TOTAL_STEPS, v)));
  }, []);
  const setProgress = useCallback((v: number) => {
    const c = Math.max(0, Math.min(TOTAL_STEPS, v));
    setProgressState(c);
    window.localStorage.setItem(KEY, String(c));
  }, []);
  return { progress, setProgress };
}

/** Mark a step complete if it is the current one. */
export function completeStep(index: number) {
  const v = Number(window.localStorage.getItem(KEY)) || 0;
  if (v === index) window.localStorage.setItem(KEY, String(index + 1));
}
