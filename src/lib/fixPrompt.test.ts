import { describe, expect, it } from "vitest";
import { scorePrompt } from "./fixPrompt";

describe("Fix the Prompt scoring", () => {
  it("gives 6 of 6 for the four helpful pieces only", () => {
    expect(scorePrompt(["who", "simple", "three", "everyday"])).toBe(6);
  });
  it("loses a point for adding personal information", () => {
    expect(scorePrompt(["who", "simple", "three", "everyday", "alicia"])).toBe(5);
  });
  it("scores 2 when nothing is added (two good skips)", () => {
    expect(scorePrompt([])).toBe(2);
  });
});
