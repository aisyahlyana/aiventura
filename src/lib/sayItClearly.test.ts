import { describe, expect, it } from "vitest";
import { EXAMPLE_STEPS, PRO_STEPS, START, cleanState, normalizeRun, practiceBolt, starsFor } from "./sayItClearly";

describe("Say it clearly", () => {
  it("makes a perfect sandwich from the pro steps", () => {
    const final = practiceBolt(PRO_STEPS).steps.at(-1)!.state;
    expect(starsFor(final)).toBe(3);
  });
  it("follows the vague example steps literally", () => {
    const final = practiceBolt(EXAMPLE_STEPS).steps.at(-1)!.state;
    expect(final.bag).toBe("ripped");
    expect(final.pb).toBe("jar_on_bread");
    expect(final.sandwich).toBe("inside_out");
    expect(starsFor(final)).toBe(1);
  });
  it("ignores unknown values from the AI", () => {
    const s = cleanState(START, { bag: "exploded", slices: 99, pb: "spread" });
    expect(s.bag).toBe("closed");
    expect(s.slices).toBe(4);
    expect(s.pb).toBe("spread");
  });
  it("gives one step per student step even when the AI skips some", () => {
    const run = normalizeRun({ steps: [] }, ["a", "b"]);
    expect(run.steps).toHaveLength(2);
    expect(run.steps[1]!.mood).toBe("confused");
  });
});
