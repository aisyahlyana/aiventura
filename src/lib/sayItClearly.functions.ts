import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { keywordModerator } from "./safety";
import { MAX_STEPS, MAX_STEP_LENGTH, buildBoltPrompt, normalizeRun } from "./sayItClearly";

/**
 * Ask the AI to play Bolt. Uses Claude when ANTHROPIC_API_KEY is set, otherwise
 * Lovable AI when LOVABLE_API_KEY is set. With neither, or on any failure, it
 * answers `{ ok: false }` and the page falls back to the offline practice robot.
 */
export const runBolt = createServerFn({ method: "POST" })
  .inputValidator((d: { steps: string[] }) =>
    z.object({ steps: z.array(z.string().max(MAX_STEP_LENGTH)).min(1).max(MAX_STEPS) }).parse(d),
  )
  .handler(async ({ data }) => {
    const steps = data.steps.map((s) => s.trim()).filter(Boolean);
    if (!steps.length) return { ok: false as const, error: "Write at least one step first." };
    const issue = steps
      .flatMap((s) => keywordModerator(s))
      .find((i) => i.kind === "private" || i.kind === "realName");
    if (issue) return { ok: false as const, error: `${issue.title} Keep names, ages, addresses and schools out of your steps.`, blocked: true };

    const prompt = buildBoltPrompt(steps);
    try {
      const text = await askAi(prompt);
      if (!text) return { ok: false as const, error: "AI is not set up." };
      const json = parseJson(text);
      if (!json) return { ok: false as const, error: "Bolt's answer didn't make sense." };
      return { ok: true as const, run: normalizeRun(json, steps) };
    } catch (e) {
      console.error("runBolt failed", e);
      return { ok: false as const, error: "Bolt couldn't reach the AI." };
    }
  });

async function askAi(prompt: string): Promise<string | null> {
  const anthropicKey = process.env["ANTHROPIC_API_KEY"];
  if (anthropicKey) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env["BOLT_MODEL"] || "claude-haiku-5-5",
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    const body = (await res.json()) as { content?: { type: string; text?: string }[] };
    return (body.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
  }

  const lovableKey = process.env["LOVABLE_API_KEY"];
  if (lovableKey) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${lovableKey}` },
      body: JSON.stringify({
        model: process.env["BOLT_MODEL"] || "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Lovable AI ${res.status}: ${await res.text()}`);
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return body.choices?.[0]?.message?.content ?? "";
  }

  return null;
}

/** Read the reply as JSON: whole text, a fenced block, or the outermost {...}. */
function parseJson(text: string): unknown | null {
  const tries = [text, /```(?:json)?\s*([\s\S]*?)```/.exec(text)?.[1], text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)];
  for (const t of tries) {
    if (!t) continue;
    try { return JSON.parse(t); } catch { /* try the next shape */ }
  }
  return null;
}
