import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";

const BACKABLE = ["/", "/journey", "/game/fix-the-prompt", "/print/fix-the-prompt", "/play/host", "/play/join"] as const;
export type BackableRoute = (typeof BACKABLE)[number];
let current: BackableRoute | null = null;
let cameFrom: BackableRoute | null = null;

/** Track the previous distinct page, without inventing a back destination. */
export function useTrackBack() {
  const path = useLocation().pathname;
  useEffect(() => {
    const next = BACKABLE.find((route) => route === path);
    if (next && next !== current) { cameFrom = current; current = next; }
  }, [path]);
}

export function useCameFrom(): BackableRoute | null {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? cameFrom : null;
}
