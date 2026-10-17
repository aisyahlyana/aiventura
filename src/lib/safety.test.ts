import { describe, expect, it } from "vitest";
import { checkPrompt, detectParts } from "./safety";

const kinds = (t: string) => checkPrompt(t).issues.map((i) => i.kind);

describe("prompt safety", () => {
  it("blocks private info such as names and ages", () => {
    expect(kinds("My name is Alicia and I'm 11 years old, draw our teacher")).toContain("private");
  });
  it("blocks the teacher's real name", () => {
    expect(kinds("Draw Mr Garcia with brown hair for a poster")).toContain("realName");
  });
  it("blocks unkind words", () => {
    expect(kinds("Draw our teacher with a big nose for a card")).toContain("unkind");
  });
  it("blocks off-topic extras", () => {
    expect(kinds("Draw our teacher riding a dragon for a poster")).toContain("offTopic");
  });
  it("blocks prompts over 260 characters", () => {
    expect(kinds("Draw our teacher ".repeat(20))).toContain("tooLong");
  });
  it("keeps Send locked for very short prompts", () => {
    expect(checkPrompt("Draw a teacher").canSend).toBe(false);
  });
  it("lets a kind, complete prompt through", () => {
    const t = "We are a primary school class. Draw our teacher with short wavy brown hair for a thank-you card.";
    expect(checkPrompt(t).canSend).toBe(true);
    expect(detectParts(t)).toEqual(["who", "what", "why"]);
  });
});
