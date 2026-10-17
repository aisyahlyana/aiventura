import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Campi, StarPage, Wordmark } from "@/components/brand/Brand";
import { CheckIcon, FlagIcon, LockIcon, PlayIcon, StarIcon, TentIcon, TrophyIcon } from "@/components/brand/Icons";
import { PHASES, STARS_PER_STEP, TOTAL_STEPS, useProgress } from "@/lib/journey";
import { BackLink } from "@/components/brand/BackButton";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "aiventura · Journey map" },
      { name: "description", content: "A classroom journey that teaches 10–12 year olds to write good prompts, spot AI mistakes and keep private information safe." },
      { property: "og:title", content: "aiventura · Journey map" },
      { property: "og:description", content: "Write great prompts, spot the mistakes, stay safe: an AI adventure for the whole class." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JourneyMap,
});

const DX = [0, 70, 108, 70, 0];

function JourneyMap() {
  const { progress, setProgress } = useProgress();
  const [open, setOpen] = useState<number | null>(null);
  const navigate = useNavigate();
  const finished = progress >= TOTAL_STEPS;
  let g = 0;

  return (
    <StarPage seed={7} count={22}>
      <header className="relative border-b-2 border-white/15">
        <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-between gap-4 px-6 py-[18px]">
          <h1 className="m-0">
            <Wordmark height={92} />
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="pill bg-blue-tint px-4 py-2 text-base">
              <FlagIcon /> <span>{progress} of {TOTAL_STEPS} steps</span>
            </div>
            <div className="pill bg-sun-tint px-4 py-2 text-base">
              <StarIcon /> <span>{progress * STARS_PER_STEP} class stars</span>
            </div>
            <button type="button" className="btn-ghost" onClick={() => { setProgress(0); setOpen(null); }}>
              Start over
            </button>
            <BackLink to="/" label="Back" />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[760px] px-5 pb-24 pt-8">
        {PHASES.map((ph) => {
          const startIndex = g;
          const doneHere = ph.lessons.filter((_, li) => startIndex + li < progress).length;
          const nodes = ph.lessons.map((l, li) => {
            const gi = g++;
            const done = gi < progress, cur = gi === progress, locked = gi > progress;
            const isOpen = open === gi;
            const size = l.challenge ? 92 : 76;
            const dx = DX[li] ?? 0;
            const tone = locked ? "tone-locked" : ph.tone;
            const status = done ? "done" : cur ? "next up" : "locked";
            return (
              <div key={gi} className={`relative ${tone}`} style={{ left: dx, width: size, height: size }}>
                {cur && <div aria-hidden="true" className="absolute -inset-3 rounded-full border-[6px]" style={{ borderColor: "var(--tint)" }} />}
                {cur && !isOpen && (
                  <div
                    aria-hidden="true"
                    className="bob absolute left-1/2 whitespace-nowrap rounded-[14px] border-2 border-b-4 border-line bg-surface px-3.5 py-1.5 text-[15px] font-black tracking-[.06em]"
                    style={{ bottom: "calc(100% + 18px)", color: "var(--deep)" }}
                  >
                    START
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : gi)}
                  aria-label={`${l.title}, ${status}`}
                  aria-expanded={isOpen}
                  className="focus-ring relative flex items-center justify-center rounded-full border-0 p-0 transition-transform active:translate-y-2 active:!shadow-none"
                  style={{ width: size, height: size, background: "var(--face)", boxShadow: "8px 8px 0 var(--ink)" }}
                >
                  {locked && <LockIcon size={30} color="var(--ink-locked)" />}
                  {!locked && l.challenge && <TrophyIcon />}
                  {done && !l.challenge && <CheckIcon size={36} />}
                  {cur && !l.challenge && <TentIcon />}
                </button>
                {cur && (
                  <div aria-hidden="true" className="pointer-events-none absolute -top-[34px]" style={{ left: dx > 0 ? -150 : size + 30, width: 118 }}>
                    <Campi width={118} alt="" />
                  </div>
                )}
                {isOpen && (
                  <div
                    role="dialog"
                    aria-label={l.title}
                    className="absolute left-1/2 z-30 flex w-[300px] -translate-x-1/2 flex-col gap-2 rounded-[20px] border-2 border-b-[6px] bg-surface p-[18px] pb-5 text-left"
                    style={{ top: "calc(100% + 26px)", borderColor: "var(--edge)" }}
                  >
                    <div aria-hidden="true" className="absolute -top-[11px] left-1/2 -ml-[9px] h-[18px] w-[18px] rotate-45 border-l-2 border-t-2 bg-surface" style={{ borderColor: "var(--edge)" }} />
                    <div className="text-[13px] font-extrabold uppercase tracking-[.08em] text-ink-muted">
                      {(l.challenge ? "Phase challenge" : `Step ${li + 1}`) + ` · ${l.time} · ${l.who}`}
                    </div>
                    <h3 className="m-0 font-display text-[23px] leading-7">{l.title}</h3>
                    <p className="m-0 text-base font-semibold leading-[23px]">{l.desc}</p>
                    {l.game && !locked && (
                      <Link to={l.game} className="btn-chunky tone-sun mt-2">
                        <PlayIcon /> Play the game
                      </Link>
                    )}
                    {cur && (
                      <button
                        type="button"
                        className="btn-chunky mt-2"
                        onClick={() => {
                          if (l.lesson) navigate({ to: l.lesson });
                          else { setProgress(gi + 1); setOpen(null); }
                        }}
                      >
                        {l.challenge ? "Start challenge" : "Start lesson"}
                      </button>
                    )}
                    {done && (
                      <button
                        type="button"
                        className="btn-ghost mt-2 py-3 text-lg"
                        onClick={() => (l.lesson ? navigate({ to: l.lesson }) : setOpen(null))}
                      >
                        Learn again
                      </button>
                    )}
                    {locked && (
                      <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-surface-soft px-3 py-2.5 text-[15px] font-bold leading-[21px] text-ink-muted">
                        <LockIcon size={20} color="var(--ink-muted)" />
                        <span>Finish the steps before this one to unlock it.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          });
          return (
            <section key={ph.kicker} className="mb-6">
              <div className={`${ph.tone} panel-tone flex flex-wrap items-center justify-between gap-3 px-6 py-5`}>
                <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
                  <div className="kicker">{ph.kicker}</div>
                  <h2 className="m-0 font-display text-[32px] leading-[38px]">{ph.title}</h2>
                  <p className="m-0 mt-0.5 text-base font-bold leading-[23px]">{ph.blurb}</p>
                </div>
                <div className="whitespace-nowrap rounded-full bg-surface px-3.5 py-2 text-[15px] font-extrabold">
                  {doneHere} of {ph.lessons.length} done
                </div>
              </div>
              <div className="flex flex-col items-center gap-[30px] pb-14 pt-16">{nodes}</div>
            </section>
          );
        })}

        <div className="card-raised flex flex-wrap items-center gap-5 p-6">
          <div
            className={`${finished ? "tone-sun" : "tone-locked"} flex h-[72px] w-[72px] flex-none items-center justify-center rounded-full`}
            style={{ background: "var(--face)", boxShadow: "6px 6px 0 var(--ink)" }}
          >
            <FlagIcon size={36} />
          </div>
          <div className="min-w-0 flex-[1_1_280px]">
            <h2 className="m-0 mb-1 font-display text-[26px] leading-8">{finished ? "Journey complete!" : "The finish line"}</h2>
            <p className="m-0 text-base font-bold leading-[23px] text-ink-muted">
              {finished
                ? "Your class can now write good prompts, spot mistakes and stay safe. Time to celebrate together."
                : "Finish all three phases and the whole class earns the aiventura badge."}
            </p>
          </div>
        </div>
      </main>
    </StarPage>
  );
}
