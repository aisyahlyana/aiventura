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
      if (!text) {
        console.error("runBolt failed: AI returned no text");
        return { ok: false as const, error: "AI is not set up." };
      }
      const json = parseJson(text);
      if (!json) {
        console.error("runBolt failed: AI reply was not valid JSON", { replyLength: text.length });
        return { ok: false as const, error: "Bolt's answer didn't make sense." };
      }
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
    const model = process.env["BOLT_MODEL"] || "google/gemini-2.5-flash";
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${lovableKey}`,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const runId = res.headers.get("X-Lovable-AIG-Run-ID");
    if (!res.ok) {
      const detail = (await res.text()).split(lovableKey).join("[redacted]");
      console.error("runBolt: Lovable AI request failed", { status: res.status, model, runId, detail });
      throw new Error(`Lovable AI ${res.status}: ${detail}`);
    }
    const body = (await res.json()) as { choices?: { finish_reason?: string; message?: { content?: string; refusal?: string } }[] };
    const choice = body.choices?.[0];
    if (choice?.message?.refusal || !choice?.message?.content?.trim()) {
      console.error("runBolt: Lovable AI returned no answer", {
        status: res.status, model, runId, finishReason: choice?.finish_reason,
        refusal: choice?.message?.refusal,
      });
      throw new Error("Lovable AI returned no answer.");
    }
    return choice.message.content;
  }

  console.error("runBolt: AI is not configured; ANTHROPIC_API_KEY and LOVABLE_API_KEY are both missing");
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
