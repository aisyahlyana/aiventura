import { afterEach, describe, expect, it, vi } from "vitest";
import { START } from "./sayItClearly";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    inputValidator: () => ({ handler: (handler: unknown) => handler }),
  }),
}));

import { runBolt } from "./sayItClearly.functions";

const steps = ["Take out two pieces of bread.", "Put the peanut butter on the bread."];

describe("Bolt AI connection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses the gateway chat response for the requested round", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("LOVABLE_API_KEY", "test-key");
    vi.stubEnv("BOLT_MODEL", "");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        steps: steps.map(() => ({ did: "I followed that step.", mood: "oops", state: START })),
        headline: "A sandwich experiment", tips: [],
      }) } }],
    })));
    vi.stubGlobal("fetch", fetchMock);
    const result = await runBolt({ data: { steps } });
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected an AI result");
    expect(result.run.steps.map((s) => s.text)).toEqual(steps);
    const [url, request] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://ai.gateway.lovable.dev/v1/chat/completions");
    expect(request.headers.authorization).toBe("Bearer test-key");
    expect(request.headers["X-Lovable-AIG-SDK"]).toBe("fetch");
    expect(JSON.parse(request.body).model).toBe("google/gemini-2.5-flash");
  });

  it("logs the gateway status and reason without retrying or leaking its key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("LOVABLE_API_KEY", "test-key");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue(new Response("Permission denied test-key", {
      status: 403, headers: { "X-Lovable-AIG-Run-ID": "gateway-run" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await runBolt({ data: { steps } })).ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("runBolt: Lovable AI request failed", expect.objectContaining({
      status: 403, runId: "gateway-run", detail: "Permission denied [redacted]",
    }));
    expect(JSON.stringify(log.mock.calls)).not.toContain("test-key");
  });

  it("logs missing runtime configuration instead of silently falling back", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("LOVABLE_API_KEY", "");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await runBolt({ data: { steps } })).ok).toBe(false);
    expect(log).toHaveBeenCalledWith("runBolt: AI is not configured; ANTHROPIC_API_KEY and LOVABLE_API_KEY are both missing");
  });
});