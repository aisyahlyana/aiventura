import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";

const BACKABLE = ["/game/fix-the-prompt", "/game/say-it-clearly", "/print/fix-the-prompt", "/play/host", "/play/join"] as const;
export type BackableRoute = (typeof BACKABLE)[number];

let cameFrom: BackableRoute | null = null;

/** Runs on every page and remembers the last page you were on. */
export function useTrackBack() {
  const path = useLocation().pathname;
  useEffect(() => {
    if ((BACKABLE as readonly string[]).includes(path)) cameFrom = path as BackableRoute;
  }, [path]);
}

/** The page you came from, or null when the journey map is your first screen. */
export function useCameFrom(): BackableRoute | null {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? cameFrom : null;
}
