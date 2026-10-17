import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { StarPage, StepPills } from "@/components/brand/Brand";
import { BackLink, BackScreen } from "@/components/brand/BackButton";
import { CheckIcon, CrossIcon, LockIcon, PlusIcon, StarIcon } from "@/components/brand/Icons";
import { Bolt, KitchenScene } from "@/components/play/KitchenScene";
import { completeStep } from "@/lib/journey";
import {
  EXAMPLE_STEPS, GOALS, HELPER_WORDS, LEVELS, MAX_STEPS, MAX_STEP_LENGTH, PRO_STEPS, START,
  practiceBolt, starsFor, type BoltRun, type Kitchen, type Mood,
} from "@/lib/sayItClearly";
import { runBolt } from "@/lib/sayItClearly.functions";

export const Route = createFileRoute("/game/say-it-clearly")({
  head: () => ({
    meta: [
      { title: "Say It Clearly · aiventura" },
      { name: "description", content: "A class game: write exact steps for Bolt the robot chef, who does exactly what you say, nothing more." },
      { property: "og:title", content: "Say It Clearly · aiventura" },
      { property: "og:description", content: "Bolt follows your instructions exactly. Can your steps make a perfect sandwich?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SayItClearly,
});

type Screen = "write" | "watch" | "feedback";
const STEP_MS = 2900;

function SayItClearly() {
  const run = useServerFn(runBolt);
  const [screen, setScreen] = useState<Screen>("write");
  const [steps, setSteps] = useState<string[]>(EXAMPLE_STEPS);
  const [isExample, setIsExample] = useState(true);
  const [result, setResult] = useState<BoltRun | null>(null);
  const [usedAi, setUsedAi] = useState(false);
  const [shown, setShown] = useState(-1); // which step Bolt is acting out
  const [thinking, setThinking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInput = useRef<number | null>(null);

  const current = result && shown >= 0 ? result.steps[shown] : null;
  const kitchen: Kitchen = current ? current.state : START;
  const mood: Mood | "think" = thinking ? "think" : current ? current.mood : "happy";
  const final = result?.steps.at(-1)?.state ?? START;
  const pill = screen === "write" ? 0 : screen === "watch" ? 1 : 2;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  useEffect(() => {
    if (screen !== "watch" || !result) return;
    if (shown >= result.steps.length - 1) {
      timer.current = setTimeout(() => setScreen("feedback"), STEP_MS);
    } else {
      timer.current = setTimeout(() => setShown((n) => n + 1), shown < 0 ? 300 : STEP_MS);
    }
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [screen, shown, result]);

  useEffect(() => {
    if (screen === "feedback") completeStep(1);
  }, [screen]);

  const edit = (next: string[]) => { setSteps(next); setIsExample(false); };

  async function tellBolt() {
    const list = steps.map((s) => s.trim()).filter(Boolean);
    if (!list.length) { setNotice("Write at least one step for Bolt first!"); return; }
    setSteps(list);
    setNotice(null);
    setThinking(true);
    setResult(null);
    setShown(-1);
    let next: BoltRun | null = null;
    let ai = false;
    try {
      const res = await run({ data: { steps: list } });
      if (res.ok) { next = res.run; ai = true; }
      else if ("blocked" in res && res.blocked) { setNotice(res.error); setThinking(false); return; }
    } catch {
      /* fall back to the practice robot below */
    }
    setThinking(false);
    setUsedAi(ai);
    setResult(next ?? practiceBolt(list));
    setScreen("watch");
  }

  const back = () => {
    if (timer.current) clearTimeout(timer.current);
    setScreen("write");
    setShown(-1);
    setResult(null);
  };

  const bubble = thinking ? (
    <span className="pulse">Reading your steps…</span>
  ) : current ? (
    <>
      <span className="block text-sm font-extrabold text-ink-muted">
        <span className="kicker text-blue-deep">Step {shown + 1}</span> “{current.text}”
      </span>
      <span>{current.did}</span>
    </>
  ) : screen === "feedback" ? (
    starsFor(final) === 3 ? "A perfect sandwich! You said it exactly. Beep beep hooray!" : "Done! I did exactly what you wrote. Was that what you wanted?"
  ) : (
    <>Hi, I'm <strong>Bolt</strong>! I do <strong>exactly</strong> what you write. Nothing more, nothing less.</>
  );

  return (
    <StarPage seed={23} count={18}>
      <header className="relative border-b-2 border-white/15">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[15px] font-extrabold uppercase tracking-[.08em] text-pink-soft">Phase 1 · Game 2</span>
            <StepPills steps={["Write", "Watch", "Feedback"]} current={pill} label={`Step ${pill + 1} of 3: ${["Write", "Watch", "Feedback"][pill]}`} />
          </div>
          {screen === "write" ? <BackLink to="/journey" label="Journey map" /> : <BackScreen onClick={back} label="Edit steps" />}
        </div>
      </header>

      <main className="relative mx-auto flex max-w-[1100px] flex-col gap-6 px-6 pb-[72px] pt-7">
        <div className="flex flex-wrap items-center gap-[18px]">
          <div className="tone-blue flex h-[72px] w-[72px] flex-none items-center justify-center rounded-full" style={{ background: "var(--face)", boxShadow: "0 6px 0 var(--edge)" }}>
            <Bolt mood="happy" s={START} width={58} />
          </div>
          <div className="min-w-0 flex-[1_1_360px]">
            <h1 className="m-0 font-display text-[44px] leading-[50px] text-surface">Say It Clearly</h1>
            <p className="m-0 mt-1 text-[17px] font-bold leading-6 text-sky-text">Bolt the robot chef follows your steps exactly, just like an AI follows a prompt. Can you get a perfect sandwich?</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Levels">
          {LEVELS.map((l) => (
            <span key={l.n} className={`pill ${l.open ? "bg-sun" : "bg-line text-ink-muted"}`} aria-current={l.open ? "step" : undefined}>
              {l.open ? `Level ${l.n}` : <LockIcon size={14} color="var(--ink-muted)" />} {l.name}{!l.open && " · soon"}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-start gap-6">
          <section className="card-raised min-w-0 flex-[999_1_520px] overflow-hidden" aria-label="Bolt's kitchen">
            <KitchenScene s={kitchen} />
            <div className="flex items-center gap-3 border-t-2 border-line bg-blue-tint px-4 py-4">
              <div className={thinking ? "pulse" : undefined}><Bolt mood={mood} s={kitchen} width={96} /></div>
              <div role="status" aria-live="polite" className="relative min-h-[76px] flex-1 rounded-2xl border-2 border-b-4 border-line bg-surface px-4 py-3 text-[17px] font-bold leading-6">
                {bubble}
              </div>
            </div>
          </section>

          <section className="card-raised flex min-w-0 flex-[1_1_340px] flex-col gap-4 px-6 py-[22px]" aria-label="Your steps">
            <div>
              <h2 className="kicker m-0 text-[15px] text-pink-deep">Your steps for Bolt</h2>
              <p className="m-0 mt-1 text-[15px] font-bold leading-[21px] text-ink-muted">Make a peanut butter and jelly sandwich on the plate. Bolt can't guess, so say every little thing.</p>
            </div>
            {isExample && screen === "write" && (
              <div className="rounded-xl bg-sun-tint px-3.5 py-2.5 text-[15px] font-bold leading-[21px]">These are example steps. Tell Bolt to see what happens, then fix them!</div>
            )}
            <ol className="m-0 flex list-none flex-col gap-2 p-0">
              {steps.map((t, i) => {
                const played = result?.steps[i];
                const isNow = screen === "watch" && i === shown;
                const badge = isNow ? "bg-pink" : played && i <= shown ? (played.mood === "happy" ? "bg-blue" : "bg-pink-soft") : "bg-navy text-surface";
                return (
                  <li key={i} className={`flex items-center gap-2 rounded-2xl p-1 ${isNow ? "bg-sun-tint" : ""}`}>
                    <span className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full font-display text-[16px] ${badge}`}>{i + 1}</span>
                    <input
                      id={`bolt-step-${i}`}
                      className="field min-w-0 flex-1 !py-2.5 text-base"
                      value={t}
                      maxLength={MAX_STEP_LENGTH}
                      disabled={screen !== "write" || thinking}
                      aria-label={`Step ${i + 1}`}
                      placeholder={`Step ${i + 1}: tell Bolt exactly what to do`}
                      onFocus={() => { lastInput.current = i; }}
                      onChange={(e) => edit(steps.map((s, j) => (j === i ? e.target.value : s)))}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        if (i === steps.length - 1 && steps.length < MAX_STEPS) edit([...steps, ""]);
                        setTimeout(() => document.getElementById(`bolt-step-${i + 1}`)?.focus(), 0);
                      }}
                    />
                    <button
                      type="button"
                      aria-label={`Remove step ${i + 1}`}
                      disabled={screen !== "write" || thinking || steps.length <= 1}
                      className="focus-ring flex h-9 w-9 flex-none items-center justify-center rounded-full border-0 bg-pink-tint disabled:opacity-40"
                      onClick={() => edit(steps.filter((_, j) => j !== i))}
                    >
                      <CrossIcon color="var(--pink-deep)" />
                    </button>
                  </li>
                );
              })}
            </ol>

            {screen === "write" && (
              <>
                <div className="flex flex-wrap gap-2.5">
                  <button type="button" className="btn-ghost" disabled={thinking || steps.length >= MAX_STEPS} onClick={() => edit([...steps, ""])}>
                    <PlusIcon size={16} /> Add a step
                  </button>
                  <button type="button" className="btn-ghost" disabled={thinking} onClick={() => edit(["", "", ""])}>Clear all</button>
                </div>
                <div>
                  <div className="kicker mb-1.5 text-[13px] text-ink-muted">Words that help Bolt</div>
                  <div className="flex flex-wrap gap-1.5">
                    {HELPER_WORDS.map((w) => (
                      <button
                        key={w}
                        type="button"
                        className="pill focus-ring border-0 bg-blue-tint !text-[14px] transition-transform active:translate-y-0.5"
                        disabled={thinking}
                        onClick={() => {
                          const i = lastInput.current ?? steps.length - 1;
                          const v = (steps[i] ?? "").trim().replace(/[.!]$/, "");
                          edit(steps.map((s, j) => (j === i ? (v ? `${v} ${w}` : w).slice(0, MAX_STEP_LENGTH) : s)));
                          document.getElementById(`bolt-step-${i}`)?.focus();
                        }}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
                {notice && <div role="alert" className="rounded-xl bg-pink-tint px-3.5 py-2.5 text-[15px] font-bold leading-[21px]">{notice}</div>}
                <button type="button" className="btn-chunky tone-pink !py-4 !text-xl" disabled={thinking} onClick={tellBolt}>
                  {thinking ? "Bolt is reading…" : "Tell Bolt!"}
                </button>
              </>
            )}
            {screen === "watch" && (
              <button type="button" className="btn-ghost" onClick={() => { if (timer.current) clearTimeout(timer.current); setShown((result?.steps.length ?? 1) - 1); setScreen("feedback"); }}>
                Skip to the end
              </button>
            )}
          </section>
        </div>

        {screen === "feedback" && result && <Feedback run={result} final={final} usedAi={usedAi} onRetry={back} />}
      </main>
    </StarPage>
  );
}

function Feedback({ run, final, usedAi, onRetry }: { run: BoltRun; final: Kitchen; usedAi: boolean; onRetry: () => void }) {
  const [peek, setPeek] = useState(false);
  const stars = starsFor(final);
  const title = run.headline || (stars === 3 ? "Perfect sandwich!" : stars === 2 ? "So close!" : "That's one wild sandwich!");
  const tips = run.tips.length ? run.tips : stars === 3 ? ["Every step said what, how and where. That's how to talk to a robot, or an AI!"] : [];

  return (
    <>
      <section className="card-raised flex flex-col gap-4 px-6 py-[22px]" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 font-display text-[30px] leading-9">{title}</h2>
          <div className="flex gap-1" role="img" aria-label={`${stars} of 3 stars`}>
            {[0, 1, 2].map((i) => <StarIcon key={i} size={36} filled={i < stars} />)}
          </div>
        </div>
        <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {GOALS.map((g) => {
            const ok = g.met(final);
            return (
              <div key={g.label} className={`${ok ? "tone-blue" : "tone-pink"} flex items-center gap-3 rounded-2xl px-4 py-3`} style={{ background: "var(--tint)" }}>
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full" style={{ background: "var(--face)" }}>
                  {ok ? <CheckIcon size={16} /> : <CrossIcon />}
                </span>
                <span className="text-base font-extrabold leading-[22px]">{g.label}<span className="sr-only">{ok ? ": done" : ": not yet"}</span></span>
              </div>
            );
          })}
        </div>
        {tips.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-2xl bg-sun-tint px-5 py-4">
            <div className="kicker text-sun-deep">{stars === 3 ? "Why it worked" : "Bolt's tips"}</div>
            <ul className="m-0 flex flex-col gap-1 pl-5 text-[17px] font-bold leading-6">
              {tips.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        )}
        {peek && (
          <ol className="m-0 flex flex-col gap-1 rounded-2xl bg-blue-tint py-4 pl-10 pr-5 text-base font-bold leading-[23px]">
            {PRO_STEPS.map((p) => <li key={p}>{p}</li>)}
          </ol>
        )}
        <p className="m-0 text-sm font-bold text-ink-muted">
          {usedAi ? "Bolt is an AI here: it reads only the words you actually wrote, the same way a chatbot reads your prompt." : "Practice Bolt answered this time. It only knows a few kitchen words."}
        </p>
      </section>

      <section className="tone-sun panel-tone flex flex-wrap items-center gap-[18px] px-[26px] py-[22px]">
        <div className="min-w-0 flex-[1_1_420px]">
          <div className="kicker">What you learned</div>
          <p className="m-0 mt-1 font-display text-[28px] leading-[35px]">Robots and AIs can't read your mind. Say what, how and where.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-chunky tone-white" style={{ boxShadow: "0 4px 0 var(--sun-edge)" }} onClick={onRetry}>
            Fix my steps
          </button>
          {stars < 3 && (
            <button type="button" className="btn-chunky tone-white" style={{ boxShadow: "0 4px 0 var(--sun-edge)" }} onClick={() => setPeek((p) => !p)}>
              {peek ? "Hide pro answer" : "Peek at a pro answer"}
            </button>
          )}
          <Link to="/journey" className="btn-chunky btn-night">Back to the map</Link>
        </div>
      </section>
    </>
  );
}
