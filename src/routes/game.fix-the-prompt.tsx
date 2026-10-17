import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Campi, StarPage, StepPills } from "@/components/brand/Brand";
import { BackIcon, CheckIcon, CrossIcon, GripIcon, LockIcon, PlayIcon, PlusIcon, PrintIcon, StarIcon, WrenchIcon } from "@/components/brand/Icons";
import { PARTS, PIECES, SCORE_NOTES, START_PROMPT, scorePrompt, type PartId } from "@/lib/fixPrompt";
import { completeStep } from "@/lib/journey";

export const Route = createFileRoute("/game/fix-the-prompt")({
  head: () => ({
    meta: [
      { title: "Fix the Prompt · aiventura" },
      { name: "description", content: "A class game: learn the four parts of a good prompt, then improve one about climate change." },
      { property: "og:title", content: "Fix the Prompt · aiventura" },
      { property: "og:description", content: "Find out what makes a prompt work well. Pick the pieces that really help." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FixThePrompt,
});

function FixThePrompt() {
  const [learned, setLearned] = useState(false);
  const [checked, setChecked] = useState(false);
  const step = !learned ? 0 : checked ? 2 : 1;

  useEffect(() => {
    if (checked) completeStep(0);
  }, [checked]);

  return (
    <StarPage seed={11} count={18}>
      <header className="relative border-b-2 border-white/15">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="btn-chunky tone-white !px-4 !py-2.5 !text-[15px]" style={{ boxShadow: "0 4px 0 var(--night-edge)" }}>
            <BackIcon /> Journey map
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[15px] font-extrabold uppercase tracking-[.08em] text-pink-soft">Phase 1 · Game 1</span>
            <StepPills steps={["Lesson", "Practise", "Feedback"]} current={step} label={`Step ${step + 1} of 3: ${["Lesson", "Practise", "Feedback"][step]}`} />
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex max-w-[1100px] flex-col gap-6 px-6 pb-[72px] pt-7">
        <div className="flex flex-wrap items-center gap-[18px]">
          <div className="tone-pink flex h-[72px] w-[72px] flex-none items-center justify-center rounded-full" style={{ background: "var(--face)", boxShadow: "0 6px 0 var(--edge)" }}>
            <WrenchIcon />
          </div>
          <div className="min-w-0 flex-[1_1_360px]">
            <h1 className="m-0 font-display text-[44px] leading-[50px] text-surface">Fix the Prompt</h1>
            <p className="m-0 mt-1 text-[17px] font-bold leading-6 text-sky-text">Find out what makes a prompt work well. Pick the pieces that really help.</p>
          </div>
        </div>

        {!learned && <Lesson onDone={() => setLearned(true)} />}
        {learned && <Practise checked={checked} onCheck={() => setChecked(true)} onRetry={() => setChecked(false)} />}
      </main>
    </StarPage>
  );
}

function Lesson({ onDone }: { onDone: () => void }) {
  const [intro, setIntro] = useState(true);
  const [sel, setSel] = useState<PartId | null>(null);
  const [solved, setSolved] = useState<PartId[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [lastRight, setLastRight] = useState<string | null>(null);
  const [safe, setSafe] = useState<"add" | "skip" | null>(null);
  const quizDone = solved.length >= PARTS.length;
  const earned = solved.length + (safe === "skip" ? 1 : 0);
  const last = PARTS.find((p) => p.id === lastRight);
  const selPart = PARTS.find((p) => p.id === sel);
  const fbText = wrong === "none"
    ? "First tap a piece of the prompt above, then choose what it does."
    : wrong
      ? "Not quite! Try another job card."
      : last
        ? `Yes! “${last.text}” is part ${last.n}: ${last.name} Now tap another piece.`
        : "Tap a piece of the prompt, then tap the card that says what it does.";

  if (intro) {
    return (
      <section className="card-raised flex flex-col items-center gap-5 p-8 text-center">
        <Campi width={110} />
        <span className="font-display text-[22px] leading-[28px] text-ink-muted">Here is a short prompt:</span>
        <span className="font-display text-[40px] leading-[48px]">“Tell me about volcanoes.”</span>
        <p className="m-0 max-w-[520px] text-[19px] font-bold leading-[27px] text-ink-muted">It's too short — the AI has to guess what you really want, so the answer may not help you.</p>
        <button type="button" className="btn-chunky tone-pink min-w-[240px] !px-8 !py-4 !text-2xl" onClick={() => setIntro(false)}>
          Let's fix it!
        </button>
      </section>
    );
  }

  return (
    <section className="card-raised flex flex-col gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-col gap-1">
          <span className="font-display text-[18px] leading-[24px] text-ink-muted">Short prompt:</span>
          <span className="font-display text-[28px] leading-[36px]">“Tell me about volcanoes.”</span>
        </div>
        <div className="flex gap-1" role="img" aria-label={`${earned} of 5 class stars`}>
          {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} size={30} filled={i < earned} />)}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[18px] bg-surface-soft px-5 py-[18px]">
        <div className="font-display text-[24px] leading-[30px] text-blue-deep">Here is the same prompt, with more parts added. Match each piece to its job!</div>
        <div className="flex flex-wrap gap-2.5">
          {PARTS.map((p) => {
            const isSolved = solved.includes(p.id), cur = p.id === curId;
            return (
              <div
                key={p.id}
                className={`${p.tone} relative rounded-xl border-[3px] px-3 py-2 text-xl font-extrabold leading-7`}
                style={{
                  background: isSolved ? "var(--tint)" : cur ? "var(--surface)" : "var(--soft-grey)",
                  borderColor: isSolved ? "var(--face)" : cur ? "var(--navy)" : "var(--soft-grey)",
                  borderStyle: cur ? "dashed" : "solid",
                }}
              >
                {p.text}
                {isSolved && (
                  <span className="absolute -right-2.5 -top-3 h-6 min-w-6 rounded-full px-1.5 text-center font-display text-sm leading-6" style={{ background: "var(--face)" }}>
                    {p.n}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!quizDone && (
        <div className="flex flex-col gap-3.5">
          <div
            role="status"
            aria-live="polite"
            className={`flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3.5 ${wrong ? "bg-pink-tint" : last ? "bg-blue-tint" : "bg-sun-tint"}`}
          >
            <div className="font-display text-[22px] leading-7">Which part is this?</div>
            <div className="flex-[1_1_260px] text-base font-bold leading-[23px]">{fbText}</div>
          </div>
          <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
            {PARTS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`${p.tone} focus-ring flex flex-col gap-1.5 rounded-[18px] border-[3px] px-4 py-3.5 text-left transition-transform active:translate-y-1`}
                style={{ borderColor: wrong === p.id ? "var(--pink-edge)" : "var(--tint)", background: "var(--tint)", boxShadow: "0 5px 0 var(--face)" }}
                onClick={() => {
                  if (p.id === ASK_ORDER[qi]) { setQi(qi + 1); setWrong(null); setLastRight(p.id); }
                  else { setWrong(p.id); setLastRight(null); }
                }}
              >
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full font-display text-[17px]" style={{ background: "var(--face)" }}>{p.n}</span>
                <span className="font-display text-xl leading-[25px]">{p.name}</span>
                <span className="text-[15px] font-semibold leading-[21px]">{p.tip}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {quizDone && (
        <div className="tone-lilac flex flex-col gap-3.5 rounded-[18px] bg-lilac-tint px-5 py-[18px]">
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-lilac" style={{ boxShadow: "0 3px 0 var(--lilac-edge)" }}>
              <LockIcon />
            </div>
            <div className="min-w-0 flex-[1_1_300px]">
              <div className="text-[13px] font-black uppercase tracking-[.1em] text-lilac-deep">Bonus question</div>
              <div className="font-display text-[21px] leading-[27px]">Would you add this to your prompt?</div>
            </div>
          </div>
          <div className="rounded-xl bg-surface px-3.5 py-3 text-[19px] font-extrabold leading-[26px]">“My name is Leo and I go to Sunny Hill School.”</div>
          {safe !== "skip" && (
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-chunky tone-white flex-[1_1_180px]" style={{ boxShadow: "0 4px 0 var(--lilac)" }} onClick={() => setSafe("add")}>Add it</button>
              <button type="button" className="btn-chunky flex-[1_1_180px]" onClick={() => setSafe("skip")}>Leave it out</button>
            </div>
          )}
          <div role="status" aria-live="polite">
            {safe === "add" && (
              <div className="rounded-xl bg-pink-tint px-3.5 py-3 text-base font-bold leading-[23px]">Careful! A name and a school are personal information. Think again: does the AI need them?</div>
            )}
            {safe === "skip" && (
              <div className="rounded-xl bg-surface px-3.5 py-3 text-base font-bold leading-[23px]">
                <strong>Golden rule: keep it private.</strong> Never put your name, age, address or school in a prompt. The AI doesn't need them to help you.
              </div>
            )}
          </div>
        </div>
      )}

      {safe === "skip" && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button type="button" className="btn-chunky tone-blue min-w-[220px] !px-7 !py-4 !text-xl" onClick={onDone}>
            Next: let's practise
          </button>
        </div>
      )}
    </section>
  );
}

function Practise({ checked, onCheck, onRetry }: { checked: boolean; onCheck: () => void; onRetry: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const byId = Object.fromEntries(PIECES.map((p) => [p.id, p]));
  const add = (id: string) => { setPicked((ps) => (ps.includes(id) ? ps : [...ps, id])); setOver(false); };
  const tiles = PIECES.filter((p) => !picked.includes(p.id));
  const right = scorePrompt(picked);
  const promptText = [START_PROMPT, ...picked.map((id) => byId[id]!.text)].join(" ");

  return (
    <>
      <section className="card-raised flex flex-wrap items-center gap-5 px-6 py-5">
        <Campi width={104} />
        <div className="min-w-0 flex-[1_1_420px]">
          <div className="kicker text-pink-deep">Your mission</div>
          <p className="m-0 mt-1 text-[17px] font-bold leading-6 text-ink-muted">You're making a presentation about climate change. Here is our prompt:</p>
          <p className="m-0 mt-1 font-display text-[34px] leading-[42px]">“{START_PROMPT}”</p>
          <p className="m-0 mt-1.5 font-display text-[22px] leading-[28px] text-pink-deep">How do we make it better?</p>
        </div>
      </section>

      {!checked && (
        <>
          <div className="flex flex-wrap items-stretch gap-6">
            <section className="card-raised flex min-w-0 flex-[999_1_480px] flex-col gap-3.5 px-6 py-[22px]">
              <h2 className="kicker m-0 text-[15px] text-blue-deep">Your prompt</h2>
              <div className="rounded-2xl bg-blue-tint px-[18px] py-4 text-[22px] font-bold leading-8" aria-live="polite">
                <span>{START_PROMPT}</span>
                {picked.map((id) => (
                  <span key={id} className="ml-1 rounded-lg bg-sun-tint px-1.5">{byId[id]!.text}</span>
                ))}
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); if (!over) setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (byId[id]) add(id); else setOver(false); }}
                className="flex min-h-[190px] flex-1 flex-col gap-2.5 rounded-[18px] border-[3px] border-dashed p-4"
                style={{ borderColor: over ? "var(--pink)" : "var(--line-strong)", background: over ? "var(--pink-tint)" : "var(--surface-soft)" }}
              >
                {picked.length === 0 && (
                  <div className="m-auto max-w-[300px] text-center text-[17px] font-extrabold leading-6 text-ink-muted">Drag pieces here, or tap a piece to add it.</div>
                )}
                {picked.map((id) => (
                  <div key={id} className="flex items-center gap-2.5 rounded-[14px] border-2 border-b-4 border-pink bg-surface py-2.5 pl-4 pr-2.5">
                    <span className="flex-1 text-[17px] font-extrabold leading-[23px]">{byId[id]!.text}</span>
                    <button
                      type="button"
                      aria-label={`Remove: ${byId[id]!.text}`}
                      className="focus-ring flex h-9 w-9 flex-none items-center justify-center rounded-full border-0 bg-pink-tint"
                      onClick={() => setPicked((ps) => ps.filter((x) => x !== id))}
                    >
                      <CrossIcon color="var(--pink-deep)" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="card-raised flex min-w-0 flex-[1_1_340px] flex-col gap-3 px-6 py-[22px]">
              <h2 className="kicker m-0 text-[15px] text-pink-deep">Prompt pieces</h2>
              <p className="m-0 text-[15px] font-bold leading-[21px] text-ink-muted">Which ones would make the answer better for your presentation?</p>
              {tiles.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData("text/plain", t.id); e.dataTransfer.effectAllowed = "move"; }}
                  onClick={() => add(t.id)}
                  aria-label={`Add to prompt: ${t.text}`}
                  className="focus-ring flex w-full cursor-grab items-center gap-3 rounded-2xl border-0 bg-pink-soft px-4 py-3.5 text-left text-[17px] font-extrabold leading-[23px] transition-transform active:translate-y-1"
                  style={{ boxShadow: "0 4px 0 var(--pink-edge)" }}
                >
                  <GripIcon />
                  <span className="flex-1">{t.text}</span>
                  <PlusIcon size={20} />
                </button>
              ))}
              {tiles.length === 0 && <div className="text-[15px] font-bold text-ink-muted">You've used every piece. Is that really best?</div>}
            </section>
          </div>
          <div className="flex justify-end">
            <button type="button" className="btn-chunky tone-pink min-w-[220px] !px-7 !py-4 !text-xl" disabled={picked.length === 0} onClick={onCheck}>
              Check my prompt
            </button>
          </div>
        </>
      )}

      {checked && (
        <>
          <div className="flex flex-wrap items-start gap-6">
            <section className="card-raised flex min-w-0 flex-[1_1_380px] flex-col gap-3.5 px-6 py-[22px]">
              <h2 className="kicker m-0 text-[15px] text-blue-deep">Your new prompt</h2>
              <div className="rounded-2xl bg-blue-tint px-[18px] py-4 text-xl font-bold leading-[30px]">{promptText}</div>
              <div className="flex items-center gap-3 rounded-2xl bg-sun-tint px-4 py-3.5">
                <StarIcon size={34} />
                <div>
                  <div className="font-display text-2xl leading-[30px]">{right} of {PIECES.length} smart choices</div>
                  <div className="text-base font-bold leading-[22px] text-ink-muted">{SCORE_NOTES[right] ?? "Every editor learns by trying. Read the tips and try again!"}</div>
                </div>
              </div>
            </section>
            <section className="card-raised flex min-w-0 flex-[999_1_480px] flex-col gap-3 px-6 py-[22px]">
              <h2 className="kicker m-0 text-[15px] text-pink-deep">Aiventura explains</h2>
              {PIECES.map((o) => {
                const chose = picked.includes(o.id);
                const correct = chose === o.good;
                const verdict = chose ? (o.good ? "Great choice" : "Not this time") : o.good ? "You could add this" : "Good skip";
                const tone = correct ? "tone-blue" : chose ? "tone-pink" : "tone-sun";
                return (
                  <div key={o.id} className={`${tone} flex items-start gap-3 rounded-2xl px-4 py-3.5`} style={{ background: "var(--tint)" }}>
                    <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full" style={{ background: "var(--face)" }}>
                      {correct ? <CheckIcon size={18} /> : chose ? <CrossIcon /> : <PlusIcon />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-black uppercase tracking-[.08em] text-ink-muted">{verdict}</div>
                      <div className="text-[17px] font-extrabold leading-[23px]">“{o.text}”</div>
                      <div className="mt-0.5 text-base font-semibold leading-[23px]">{chose ? o.yes : o.no}</div>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          <section className="tone-sun panel-tone flex flex-wrap items-center gap-[18px] px-[26px] py-[22px]">
            <div className="min-w-0 flex-[1_1_420px]">
              <div className="kicker">What you learned</div>
              <p className="m-0 mt-1 font-display text-[28px] leading-[35px]">More information isn't always better. Relevant information is what matters.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-chunky tone-white" style={{ boxShadow: "0 4px 0 var(--sun-edge)" }} onClick={() => { setPicked([]); onRetry(); }}>
                Try again
              </button>
              <Link to="/" className="btn-chunky btn-night">Back to the map</Link>
            </div>
          </section>

          <section className="card-raised flex flex-col gap-4 px-[26px] py-[22px]">
            <div>
              <div className="kicker text-blue-deep">For teachers</div>
              <h2 className="m-0 mt-1 font-display text-[28px] leading-[34px]">Take it to your classroom</h2>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              <Link to="/print/fix-the-prompt" className="tone-blue panel-tint focus-ring flex items-center gap-4 px-5 py-[18px] no-underline transition-transform active:translate-y-1">
                <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full" style={{ background: "var(--face)" }}><PrintIcon /></span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-display text-[22px] leading-[27px]">Print for class</span>
                  <span className="text-[15px] font-bold leading-[21px]">Teacher guide, team worksheet and cut-out cards. No screens needed.</span>
                </span>
              </Link>
              <Link to="/play/host" className="tone-pink panel-tint focus-ring flex items-center gap-4 px-5 py-[18px] no-underline transition-transform active:translate-y-1">
                <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full" style={{ background: "var(--face)" }}><PlayIcon size={28} /></span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-display text-[22px] leading-[27px]">Play in class</span>
                  <span className="text-[15px] font-bold leading-[21px]">Students join with a room code, form teams and write a prompt for the AI to draw their teacher.</span>
                </span>
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  );
}
