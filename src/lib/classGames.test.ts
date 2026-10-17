import { describe, expect, it } from "vitest";
import { CLASS_GAMES, canPlayClassGame } from "./classGames";

describe("classroom games", () => {
  it("makes only the sandwich game playable for now", () => {
    expect(CLASS_GAMES.filter((game) => canPlayClassGame(game.id)).map((game) => game.id)).toEqual(["sandwich"]);
  });
  it("keeps other games as unavailable placeholders", () => {
    expect(canPlayClassGame("mistakes")).toBe(false);
    expect(canPlayClassGame("safety")).toBe(false);
    expect(canPlayClassGame("unknown")).toBe(false);
  });
});