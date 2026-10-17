import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Campi, StarPage, Wordmark } from "@/components/brand/Brand";
import { BackLink, BackScreen } from "@/components/brand/BackButton";
import { PartChips, SafetyPanel } from "@/components/play/PromptChecks";
import { joinRoom, joinTeam, movePlayer, submitPrompt } from "@/lib/play.functions";
import { NICKNAMES, formatCode, normaliseCode } from "@/lib/play";
import { MAX_PROMPT_LENGTH, checkPrompt } from "@/lib/safety";

export const Route = createFileRoute("/play/join")({
  validateSearch: (s: Record<string, unknown>) => ({ code: s["code"] != null ? String(s["code"]) : undefined }),
  head: () => ({
    meta: [
      { title: "Join the game · aiventura" },
      { name: "description", content: "Type the room code from the big screen, get a fun nickname and help your team write a prompt." },
      { property: "og:title", content: "Join the game · aiventura" },
      { property: "og:description", content: "Join your class game with a room code. No real names, ever." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Join,
});

type Team = { id: string; name: string; color: string };
const TONE: Record<string, string> = { pink: "tone-pink", blue: "tone-blue", sun: "tone-sun", lilac: "tone-lilac" };

function Join() {
  const search = Route.useSearch();
  const [stage, setStage] = useState<"join" | "team" | "write" | "sent">("join");
  const [code, setCode] = useState(search.code ? formatCode(normaliseCode(search.code)) : "");
  const [room, setRoom] = useState<{ id: string; code: string } | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [nick, setNick] = useState(0);
  const [team, setTeam] = useState<Team | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const joinRoomFn = useServerFn(joinRoom);
  const joinTeamFn = useServerFn(joinTeam);
  const moveFn = useServerFn(movePlayer);
  const submitFn = useServerFn(submitPrompt);

  useEffect(() => setNick(Math.floor(Math.random() * NICKNAMES.length)), []);
  useEffect(() => { if (search.code) setCode(formatCode(normaliseCode(search.code))); }, [search.code]);

  const safety = checkPrompt(text);

  async function doJoin() {
    const c = normaliseCode(code);
    if (c.length !== 6) return setError("The room code has 6 numbers.");
    setBusy(true); setError(null);
    try {
      const r = await joinRoomFn({ data: { code: c } });
      if (!r.ok) setError(r.error);
      else { setRoom(r.room); setTeams(r.teams); setStage("team"); }
    } catch { setError("Couldn't connect. Try again."); }
    setBusy(false);
  }
  async function ready() {
    if (!room || !team) return;
    setBusy(true); setError(null);
    try {
      if (playerId) {
        const m = await moveFn({ data: { playerId, teamId: team.id } });
        if (!m.ok) setError(m.error);
        else setStage("write");
      } else {
        const r = await joinTeamFn({ data: { roomId: room.id, teamId: team.id, nickname: NICKNAMES[nick % NICKNAMES.length]! } });
        if (!r.ok) setError(r.error);
        else { setPlayerId(r.playerId); setStage("write"); }
      }
    } catch { setError("Couldn't connect. Try again."); }
    setBusy(false);
  }

  /** Back one step, or to the journey map when the code screen is showing. */
  function goBack() {
    setError(null);
    if (stage === "team") { setStage("join"); setRoom(null); setTeams([]); setTeam(null); }
    else if (stage === "write") setStage("team");
    else if (stage === "sent") setStage("write");
  }
  async function send() {
    if (!playerId || !safety.canSend) return;
    setBusy(true); setError(null);
    try {
      const r = await submitFn({ data: { playerId, text } });
      if (!r.ok) setError(r.error);
      else setStage("sent");
    } catch { setError("Couldn't send. Try again."); }
    setBusy(false);
  }

  return (
    <StarPage seed={5} count={12}>
      <div className="relative mx-auto flex min-h-screen max-w-[440px] flex-col">
        <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-[18px]">
          <Wordmark height={40} />
          <div className="flex items-center gap-2.5">
            {room && (
              <span className="text-[13px] font-extrabold uppercase tracking-[.08em] text-pink-soft">
                Room {formatCode(room.code)}
              </span>
            )}
            {stage === "join" ? <BackLink to="/" label="Back" /> : <BackScreen onClick={goBack} label="Back" />}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-3 px-[18px] pb-5 pt-2">
          {error && <div role="alert" className="rounded-2xl bg-pink-tint px-4 py-3 text-[15px] font-bold">{error}</div>}

          {stage === "join" && (
            <>
              <div className="mt-10 flex flex-col items-center gap-2.5 text-center">
                <Campi width={130} />
                <h1 className="m-0 font-display text-[32px] leading-[38px] text-surface">Join the game</h1>
                <p className="m-0 text-base font-bold leading-[23px] text-sky-text">Type the room code from the big screen.</p>
              </div>
              <form className="card-raised flex flex-col gap-3.5 p-5" onSubmit={(e) => { e.preventDefault(); doJoin(); }}>
                <label htmlFor="code" className="text-[13px] font-black uppercase tracking-[.1em] text-ink-muted">Room code</label>
                <input
                  id="code"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={7}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="field text-center font-display !text-[38px] tracking-[.14em]"
                />
                <button type="submit" className="btn-chunky tone-pink !py-4 !text-xl" disabled={busy}>Join</button>
              </form>
            </>
          )}

          {stage === "team" && (
            <>
              <div className="card-raised flex flex-col items-center gap-2 px-5 py-[18px] text-center">
                <div className="text-[13px] font-black uppercase tracking-[.1em] text-ink-muted">Your secret nickname</div>
                <div className="font-display text-[34px] leading-10" aria-live="polite">{NICKNAMES[nick % NICKNAMES.length]}</div>
                <button type="button" className="btn-ghost" onClick={() => setNick(nick + 1)}>Shuffle</button>
                <div className="text-sm font-bold text-ink-muted">We never use your real name.</div>
              </div>
              <h2 className="m-0 mt-1 font-display text-2xl leading-[30px] text-surface">Pick your team</h2>
              <div className="grid grid-cols-2 gap-3">
                {teams.map((t) => {
                  const chosen = team?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={chosen}
                      onClick={() => setTeam(t)}
                      className={`${TONE[t.color] ?? "tone-blue"} focus-ring min-h-[92px] rounded-[18px] border-4 p-2.5 font-display text-[19px] leading-[23px] transition-transform active:translate-y-1`}
                      style={{ background: "var(--face)", borderColor: chosen ? "var(--surface)" : "var(--face)", boxShadow: "0 5px 0 var(--edge)" }}
                    >
                      {t.name}{chosen ? " ✓" : ""}
                    </button>
                  );
                })}
              </div>
              <button type="button" className="btn-chunky tone-pink mt-auto !py-4 !text-xl" disabled={!team || busy} onClick={ready}>I'm ready</button>
            </>
          )}

          {stage === "write" && (
            <>
              <div className="card-raised flex flex-col gap-1 px-4 py-3" style={{ boxShadow: "0 5px 0 var(--night-edge)" }}>
                <div className="text-[12px] font-black uppercase tracking-[.1em] text-pink-deep">Team mission · {team?.name}</div>
                <div className="font-display text-xl leading-[25px]">Write a prompt so the AI can draw our teacher</div>
                <div className="text-[15px] font-bold leading-5 text-ink-muted">Look at the clues on the big screen. Write in your own words!</div>
              </div>
              <div className="card-raised flex flex-col gap-2 px-4 py-3">
                <div className="flex items-baseline justify-between">
                  <label htmlFor="prompt" className="text-[13px] font-black uppercase tracking-[.1em] text-blue-deep">Your team's prompt</label>
                  <span className={`text-[13px] font-extrabold ${text.length > MAX_PROMPT_LENGTH ? "text-pink-deep" : "text-ink-muted"}`}>{text.length} / {MAX_PROMPT_LENGTH}</span>
                </div>
                <textarea
                  id="prompt"
                  rows={4}
                  maxLength={320}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. We are a class. Draw our teacher with…"
                  className="field resize-none !text-base"
                  style={{ borderColor: safety.issues.length ? "var(--lilac-edge)" : undefined }}
                />
                <div className="text-[13px] font-extrabold text-ink-muted">Aiventura spots the parts as you type:</div>
                <div className="flex flex-wrap gap-1.5"><PartChips text={text} short size="sm" /></div>
              </div>
              <SafetyPanel text={text} result={safety} small />
              <button type="button" className="btn-chunky tone-sun !py-3.5" disabled={!safety.canSend || busy} onClick={send}>Send to the big screen</button>
            </>
          )}

          {stage === "sent" && (
            <>
              <div className="mt-14 flex flex-col items-center gap-3.5 text-center">
                <Campi width={150} />
                <h1 className="m-0 font-display text-[32px] leading-[38px] text-surface">Prompt sent!</h1>
                <p className="m-0 text-[17px] font-bold leading-6 text-sky-text">Great teamwork. Look up at the big screen to see what the AI drew for every team.</p>
              </div>
              <div className="card-raised px-[18px] py-4">
                <div className="text-[13px] font-black uppercase tracking-[.1em] text-blue-deep">{team?.name ?? "Your team"} wrote</div>
                <div className="mt-1.5 text-[17px] font-extrabold leading-6">“{text.trim()}”</div>
              </div>
              <button type="button" className="btn-chunky tone-white" style={{ boxShadow: "0 4px 0 var(--night-edge)" }} onClick={() => setStage("write")}>Edit our prompt</button>
            </>
          )}
        </main>
      </div>
    </StarPage>
  );
}
