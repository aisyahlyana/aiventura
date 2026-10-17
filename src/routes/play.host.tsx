import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { StarPage, StepPills, Wordmark } from "@/components/brand/Brand";
import { CheckIcon, HeartIcon, LockIcon, ShieldIcon, StarIcon } from "@/components/brand/Icons";
import { HostAuth } from "@/components/play/HostAuth";
import { PartChips, SafetyPanel } from "@/components/play/PromptChecks";
import { TeacherDrawing } from "@/components/play/TeacherDrawing";
import { buildDrawing, clueFound } from "@/lib/drawing";
import { highlightParts } from "@/lib/highlight";
import { DEFAULT_CLUES, DEMO_TEAMS, LIVE_TEAM, STUDENT_TEAMS, formatCode, type DemoTeam } from "@/lib/play";
import { DRAW_PARTS, checkPrompt, detectParts, type DrawPartId } from "@/lib/safety";

export const Route = createFileRoute("/play/host")({
  head: () => ({
    meta: [
      { title: "Play in class · Draw our teacher · aiventura" },
      { name: "description", content: "A live class game: teams join with a room code and write a prompt so the AI can draw their teacher." },
      { property: "og:title", content: "Play in class · Draw our teacher · aiventura" },
      { property: "og:description", content: "Same mission, different prompts, very different pictures. Talk about why." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HostPage,
});

type Stage = "join" | "write" | "reveal";
type Room = { id: string; code: string; stage: string; clues: string[]; favourite_team_id: string | null };
type Team = { id: string; name: string; color: string; sort: number };
type Player = { id: string; team_id: string | null; nickname: string };
type Prompt = { id: string; team_id: string; text: string };

const TONE: Record<string, string> = { pink: "tone-pink", blue: "tone-blue", sun: "tone-sun", lilac: "tone-lilac" };
const PART_TONE = Object.fromEntries(DRAW_PARTS.map((p) => [p.id, p.tone])) as Record<DrawPartId, string>;

const HOST_KEY = "aiventura-host-key";

function HostPage() {
  const [hostKey, setHostKey] = useState<string | null>(null);
  useEffect(() => {
    let k = window.localStorage.getItem(HOST_KEY);
    if (!k) { k = crypto.randomUUID(); window.localStorage.setItem(HOST_KEY, k); }
    setHostKey(k);
  }, []);

  return (
    <StarPage seed={23} count={18}>
      {hostKey ? <Host hostKey={hostKey} /> : <div className="p-10 text-center font-extrabold text-sky-text">Loading…</div>}
    </StarPage>
  );
}

function HostHeader({ stage }: { stage: Stage | null }) {
  const idx = stage === "join" ? 0 : stage === "write" ? 1 : 2;
  return (
    <header className="relative border-b-2 border-white/15">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex flex-wrap items-center gap-[18px]">
          <Link to="/" aria-label="Back to the journey map"><Wordmark height={60} /></Link>
          <span className="text-[15px] font-extrabold uppercase tracking-[.08em] text-pink-soft">Play in class · Draw our teacher</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {stage && <StepPills steps={["Join", "Write", "Reveal"]} current={idx} label={`Stage ${idx + 1} of 3: ${["Join", "Write", "Reveal"][idx]}`} />}
        </div>
      </div>
    </header>
  );
}

function Host({ hostKey }: { hostKey: string }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const openFn = useServerFn(hostOpenRoom);
  const stateFn = useServerFn(hostGetState);
  const updateFn = useServerFn(hostUpdateRoom);
  const liveFn = useServerFn(hostSendLive);

  const openRoom = useCallback(async (fresh: boolean) => {
    setError(null);
    try {
      const r = await openFn({ data: { hostKey, fresh } });
      setRoomId(r.roomId);
    } catch {
      setError("We couldn't open a room. Please refresh and try again.");
    }
  }, [hostKey, openFn]);

  useEffect(() => { openRoom(false); }, [openRoom]);

  const loadLists = useCallback(async () => {
    if (!roomId) return;
    try {
      const s = await stateFn({ data: { roomId, hostKey } });
      setRoom((cur) => (cur && cur.id === s.room.id ? { ...s.room, stage: cur.stage, clues: cur.clues, favourite_team_id: cur.favourite_team_id } : s.room));
      setTeams(s.teams); setPlayers(s.players); setPrompts(s.prompts);
    } catch { /* keep last state */ }
  }, [roomId, hostKey, stateFn]);

  // Students' phones send prompts to the server; the big screen checks every 2 seconds.
  useEffect(() => {
    if (!roomId) return;
    loadLists();
    const t = window.setInterval(loadLists, 2000);
    return () => window.clearInterval(t);
  }, [roomId, loadLists]);

  async function updateRoom(patch: Partial<Pick<Room, "stage" | "clues" | "favourite_team_id">>) {
    if (!room) return;
    setRoom({ ...room, ...patch });
    await updateFn({ data: { roomId: room.id, hostKey, ...patch } });
  }

  async function sendLive(text: string) {
    if (!room) return false;
    const r = await liveFn({ data: { roomId: room.id, hostKey, text } });
    await loadLists();
    return r.ok;
  }

  const stage = (room?.stage ?? "join") as Stage;

  return (
    <>
      <HostHeader stage={stage} onSignOut={signOut} />
      <main className="relative mx-auto flex max-w-[1180px] flex-col gap-6 px-6 pb-[72px] pt-7">
        {error && <div role="alert" className="card-raised p-5 font-bold">{error}</div>}
        {!room && !error && <div className="p-10 text-center font-extrabold text-sky-text">Opening your room…</div>}
        {room && stage === "join" && <JoinStage room={room} teams={teams} players={players} onNext={() => updateRoom({ stage: "write" })} />}
        {room && stage === "write" && (
          <WriteStage
            room={room}
            teams={teams}
            players={players}
            prompts={prompts}
            onClues={(clues) => updateRoom({ clues })}
            onSent={loadLists}
            onNext={() => updateRoom({ stage: "reveal" })}
          />
        )}
        {room && stage === "reveal" && (
          <RevealStage
            room={room}
            teams={teams}
            prompts={prompts}
            onFav={(id) => updateRoom({ favourite_team_id: room.favourite_team_id === id ? null : id })}
            onBack={() => updateRoom({ stage: "write" })}
            onAgain={() => { setRoom(null); setTeams([]); setPlayers([]); setPrompts([]); openRoom(true); }}
          />
        )}
      </main>
    </>
  );
}

/* ---------------- Stage 1: Join ---------------- */

function JoinStage({ room, teams, players, onNext }: { room: Room; teams: Team[]; players: Player[]; onNext: () => void }) {
  const [qr, setQr] = useState("");
  const [joinUrl, setJoinUrl] = useState("");
  useEffect(() => {
    const url = `${window.location.origin}/play/join?code=${room.code}`;
    setJoinUrl(`${window.location.host}/play/join`);
    QRCode.toString(url, { type: "svg", margin: 0, color: { dark: "#22325c", light: "#ffffff" } }).then(setQr);
  }, [room.code]);
  const realCount = players.length;

  return (
    <div className="flex flex-wrap items-stretch gap-6">
      <section className="card-raised flex min-w-0 flex-[1_1_360px] flex-col items-center gap-3.5 p-[26px] text-center">
        <h1 className="m-0 font-display text-[30px] leading-9">Join the room</h1>
        <p className="m-0 text-[17px] font-bold leading-6 text-ink-muted">
          Scan the code, or go to <strong className="text-navy">{joinUrl}</strong> and type the room code.
        </p>
        <div role="img" aria-label={`QR code to join room ${formatCode(room.code)}`} className="box-border h-[216px] w-[216px] rounded-[20px] border-[3px] border-navy p-3.5 [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
        <div className="rounded-[18px] bg-sun-tint px-[22px] py-3" style={{ boxShadow: "0 4px 0 var(--sun)" }}>
          <div className="text-[13px] font-black uppercase tracking-[.1em] text-ink-muted">Room code</div>
          <div className="font-display text-[52px] leading-[58px] tracking-[.08em]">{formatCode(room.code)}</div>
        </div>
      </section>

      <section className="card-raised flex min-w-0 flex-[2_1_560px] flex-col gap-4 p-[26px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-display text-[28px] leading-[34px]">Teams are forming</h2>
          <div className="pill bg-blue-tint !px-3.5 !py-2 text-base" aria-live="polite">
            <span className="pulse h-2.5 w-2.5 rounded-full bg-blue-edge" />
            {realCount} {realCount === 1 ? "player" : "players"} joined + 1 live team
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-[14px] bg-lilac-tint px-3.5 py-2.5 text-[15px] font-bold leading-[21px]">
          <LockIcon size={20} /> Everyone plays with a fun nickname. No real names, ever.
        </div>
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {teams.filter((t) => t.name !== LIVE_TEAM.name).map((t) => {
            const real = players.filter((p) => p.team_id === t.id).map((p) => p.nickname);
            const demo = DEMO_TEAMS[t.name];
            const list = real.length ? real : demo?.players ?? [];
            return (
              <div key={t.id} className={`${TONE[t.color]} panel-tint flex flex-col gap-2.5 px-4 py-3.5`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-[21px] leading-[26px]">{t.name}</span>
                  <span className="rounded-full bg-surface px-2.5 py-0.5 text-sm font-extrabold">{list.length} players</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((n, i) => <span key={n + i} className="rounded-full bg-surface px-2.5 py-1 text-sm font-extrabold">{n}</span>)}
                </div>
                {!real.length && <div className="text-[13px] font-bold text-ink-muted">Example players until your students join</div>}
              </div>
            );
          })}
          <div className="tone-lilac flex flex-col gap-2 rounded-[18px] border-[3px] border-dashed border-lilac-edge bg-lilac-tint px-3.5 py-3" style={{ boxShadow: "0 4px 0 var(--lilac)" }}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-[21px] leading-[26px]">{LIVE_TEAM.name}</span>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-sm font-extrabold">Live team</span>
            </div>
            <div className="text-sm font-bold leading-5">This team is real: type their prompt on the next screen and see what the AI draws.</div>
          </div>
        </div>
        <div className="mt-auto flex justify-end">
          <button type="button" className="btn-chunky tone-pink min-w-[240px] !px-7 !py-4 !text-xl" onClick={onNext}>Start the challenge</button>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Stage 2: Write ---------------- */

function WriteStage({
  room, teams, players, prompts, onClues, onSent, onNext,
}: {
  room: Room; teams: Team[]; players: Player[]; prompts: Prompt[];
  onClues: (c: string[]) => void; onSent: () => void; onNext: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(room.clues);
  const live = teams.find((t) => t.name === LIVE_TEAM.name);
  const livePrompt = prompts.find((p) => p.team_id === live?.id);
  const [liveText, setLiveText] = useState(livePrompt?.text ?? "");
  const [sentText, setSentText] = useState<string | null>(livePrompt?.text ?? null);
  const safety = checkPrompt(liveText);
  const isSent = sentText !== null && sentText === liveText;

  async function sendLive() {
    if (!live || !safety.canSend) return;
    const text = liveText.trim();
    await supabase.from("prompts").upsert({ room_id: room.id, team_id: live.id, text, created_at: new Date().toISOString() }, { onConflict: "team_id" });
    setLiveText(text);
    setSentText(text);
    onSent();
  }

  return (
    <>
      <div className="flex flex-wrap items-stretch gap-6">
        <section className="card-raised flex min-w-0 flex-[3_1_560px] flex-col gap-3.5 p-7">
          <div className="kicker text-[15px] text-pink-deep">Team mission</div>
          <h1 className="m-0 font-display text-[42px] leading-[48px]">Write a prompt so the AI can draw our teacher</h1>
          <p className="m-0 text-[19px] font-bold leading-[27px] text-ink-muted">Write it in your own words. The better your prompt, the more the drawing will look like your teacher!</p>
          <div className="mt-1.5 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {DRAW_PARTS.map((p) => (
              <div key={p.id} className={`${p.tone} panel-tint flex flex-col gap-1 px-3.5 py-3`} style={{ borderRadius: 16 }}>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full font-display" style={{ background: "var(--face)" }}>{p.n}</span>
                  <span className="font-display text-[19px] leading-6">{p.name}</span>
                </div>
                <span className="text-[15px] font-bold leading-5">{p.hint}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="tone-sun flex min-w-0 flex-[2_1_340px] flex-col gap-3 rounded-3xl bg-sun-tint p-6" style={{ boxShadow: "0 6px 0 var(--sun-edge)" }}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="kicker m-0">Our teacher today</h2>
            <button
              type="button"
              className="btn-ghost !py-1.5"
              onClick={() => {
                if (editing) onClues(draft.map((c) => c.trim()).filter(Boolean));
                else setDraft(room.clues);
                setEditing(!editing);
              }}
            >
              {editing ? "Done" : "Edit clues"}
            </button>
          </div>
          {editing ? (
            <div className="flex flex-col gap-2">
              {draft.map((c, i) => (
                <label key={i} className="flex flex-col text-[13px] font-extrabold text-ink-muted">
                  Clue {i + 1}
                  <input className="field !py-2 !text-[17px]" value={c} onChange={(e) => setDraft(draft.map((x, j) => (j === i ? e.target.value : x)))} />
                </label>
              ))}
              {draft.length < 6 && <button type="button" className="btn-ghost" onClick={() => setDraft([...draft, ""])}>Add a clue</button>}
            </div>
          ) : (
            <ul className="m-0 pl-5 text-[19px] font-extrabold leading-[30px]">
              {room.clues.map((c) => <li key={c}>{c}</li>)}
            </ul>
          )}
          <div className="mt-auto rounded-[14px] bg-surface px-3 py-2.5 text-[15px] font-bold leading-5">
            Teachers: change these clues to describe yourself before you play. Students call you “our teacher”, never by name.
          </div>
        </section>
      </div>

      <section className="tone-lilac flex flex-col gap-3 rounded-3xl border-[3px] border-dashed border-lilac-edge bg-surface px-[26px] py-[22px]" style={{ boxShadow: "0 6px 0 var(--lilac-edge)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-display text-[26px] leading-8">{LIVE_TEAM.name} · live team</h2>
          <span className={`rounded-full px-3.5 py-1.5 text-[15px] font-extrabold ${isSent ? "bg-blue-tint" : "bg-sun-tint"}`}>
            {isSent ? "Sent ✓" : liveText.trim() ? "Writing…" : "Waiting"}
          </span>
        </div>
        <label htmlFor="livePrompt" className="text-[15px] font-extrabold text-ink-muted">Type the team's prompt in their own words:</label>
        <textarea
          id="livePrompt"
          rows={3}
          maxLength={320}
          value={liveText}
          onChange={(e) => setLiveText(e.target.value)}
          placeholder="e.g. We are a class. Draw our teacher with…"
          className="field resize-y !text-xl !leading-7"
          style={{ borderColor: safety.issues.length ? "var(--lilac-edge)" : undefined }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-extrabold text-ink-muted">Aiventura spots:</span>
          <PartChips text={liveText} />
        </div>
        <SafetyPanel text={liveText} result={safety} />
        <div className="flex justify-end">
          <button type="button" className="btn-chunky min-w-[220px]" disabled={!safety.canSend || isSent} onClick={sendLive}>
            {isSent ? "Sent!" : "Send prompt"}
          </button>
        </div>
      </section>

      <section className="card-raised flex flex-col gap-3.5 px-[26px] py-[22px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-display text-[26px] leading-8">Team progress</h2>
          <span className="text-base font-extrabold text-ink-muted">Take your time. Talk it over as a team!</span>
        </div>
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }} aria-live="polite">
          {teams.filter((t) => t.name !== LIVE_TEAM.name).map((t) => {
            const real = players.some((p) => p.team_id === t.id);
            const prompt = prompts.find((p) => p.team_id === t.id);
            const demo = DEMO_TEAMS[t.name];
            const sent = !!prompt || (!real && !!demo?.sent);
            const blocked = !prompt && !real && demo?.blocked;
            return (
              <div key={t.id} className={`${TONE[t.color]} flex flex-col gap-2 rounded-[18px] border-[3px] px-4 py-3.5`} style={{ borderColor: "var(--face)" }}>
                <div className="flex items-center justify-between gap-2.5">
                  <span className="font-display text-xl leading-[25px]">{t.name}</span>
                  {sent ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-blue-tint px-3 py-1 text-[15px] font-extrabold"><CheckIcon size={16} />Sent</span>
                  ) : (
                    <span className="pulse rounded-full bg-sun-tint px-3 py-1 text-[15px] font-extrabold">Writing…</span>
                  )}
                </div>
                {blocked && (
                  <div className="flex items-center gap-2 rounded-xl bg-lilac-tint px-2.5 py-2 text-sm font-bold leading-[19px]">
                    <ShieldIcon size={16} /> Safety check caught something. The team is fixing it.
                  </div>
                )}
                {!real && !prompt && <div className="text-[13px] font-bold text-ink-muted">Example team</div>}
              </div>
            );
          })}
        </div>
        <div className="flex justify-end">
          <button type="button" className="btn-chunky tone-sun min-w-[240px] !px-7 !py-4 !text-xl" onClick={onNext}>Reveal the drawings</button>
        </div>
      </section>
    </>
  );
}

/* ---------------- Stage 3: Reveal ---------------- */

type Card = { team: Team; text: string; demo: DemoTeam | null; isLive: boolean };

function RevealStage({
  room, teams, prompts, onFav, onBack, onAgain,
}: { room: Room; teams: Team[]; prompts: Prompt[]; onFav: (id: string) => void; onBack: () => void; onAgain: () => void }) {
  const cards: (Card | { team: Team; empty: true })[] = useMemo(
    () =>
      teams.map((t) => {
        const real = prompts.find((p) => p.team_id === t.id);
        const isLive = t.name === LIVE_TEAM.name;
        if (real) return { team: t, text: real.text, demo: null, isLive };
        const demo = DEMO_TEAMS[t.name];
        if (demo) return { team: t, text: demo.segs.map((s) => s[0]).join(" "), demo, isLive };
        return { team: t, empty: true as const };
      }),
    [teams, prompts],
  );

  let stars = 0;
  for (const c of cards) {
    if ("empty" in c) continue;
    stars += detectParts(c.text).length + room.clues.filter((cl) => clueFound(cl, c.text)).length;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="m-0 font-display text-[40px] leading-[46px] text-surface">Which drawing looks most like our teacher?</h1>
          <p className="m-0 mt-1.5 text-lg font-bold leading-[25px] text-sky-text">Same mission, different prompts, very different pictures. Tap the heart to pick the class favourite.</p>
        </div>
        <div className="flex items-center gap-2.5 rounded-full bg-sun-tint px-[18px] py-2.5 text-lg font-black"><StarIcon size={24} /> {stars} class stars</div>
      </div>

      <div className="grid items-start gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))" }}>
        {cards.map((c) => {
          const t = c.team;
          const tone = TONE[t.color];
          const isFav = room.favourite_team_id === t.id;
          if ("empty" in c) {
            return (
              <article key={t.id} className={`${tone} flex flex-col gap-3 rounded-[22px] border-[3px] border-dashed border-lilac-edge bg-surface p-[18px]`} style={{ boxShadow: "0 6px 0 var(--face)" }}>
                <div className="flex items-center justify-between gap-2.5">
                  <span className="font-display text-[22px] leading-7">{t.name}</span>
                  <span className="rounded-full bg-lilac-tint px-3 py-1 text-sm font-extrabold">Live team</span>
                </div>
                <div className="rounded-2xl bg-surface-soft px-[18px] py-7 text-center text-base font-extrabold leading-[23px] text-ink-muted">
                  No prompt sent yet. Go back to Write, type the team's prompt and press Send.
                </div>
                <button type="button" className="btn-ghost" onClick={onBack}>Back to Write</button>
              </article>
            );
          }
          const drawing = buildDrawing(c.text, c.demo?.guess ?? {});
          const found = detectParts(c.text);
          const clueHits = room.clues.map((cl) => ({ cl, ok: clueFound(cl, c.text) }));
          const nOk = clueHits.filter((x) => x.ok).length;
          const note =
            nOk === clueHits.length && found.length === 3
              ? "Amazing! Every clue and all three parts. The AI drew our teacher."
              : nOk === clueHits.length
                ? "Every clue is there! Add the missing parts so the AI also knows who it is for and why."
                : nOk === 0
                  ? "The AI could not find our teacher’s clues, so it guessed. Add the hair, shirt and trousers!"
                  : "Getting close! The AI guessed whatever was missing. Which clue would you add?";
          const segs = c.demo ? c.demo.segs.map(([text, part]) => ({ text, part })) : highlightParts(c.text);
          return (
            <article
              key={t.id}
              className={`${tone} flex flex-col gap-3 rounded-[22px] border-[3px] bg-surface p-[18px] ${c.isLive ? "border-dashed" : ""}`}
              style={{ boxShadow: "0 6px 0 var(--face)", borderColor: isFav ? "var(--pink-edge)" : c.isLive ? "var(--lilac-edge)" : "var(--surface)" }}
            >
              <div className="flex items-center justify-between gap-2.5">
                <span className="font-display text-[22px] leading-7">{t.name}</span>
                <div className="flex items-center gap-2">
                  {c.demo && <span className="rounded-full bg-surface-soft px-2.5 py-1 text-[13px] font-extrabold text-ink-muted">Example</span>}
                  {c.isLive && <span className="rounded-full bg-lilac-tint px-2.5 py-1 text-[13px] font-extrabold">Live team</span>}
                  <button
                    type="button"
                    aria-label={(isFav ? "Class favourite: " : "Pick as class favourite: ") + t.name}
                    aria-pressed={isFav}
                    onClick={() => onFav(t.id)}
                    className="focus-ring flex h-12 w-12 items-center justify-center rounded-full border-0 transition-transform active:translate-y-[3px]"
                    style={{ background: isFav ? "var(--pink-tint)" : "var(--surface-soft)", boxShadow: "0 3px 0 var(--pink-edge)" }}
                  >
                    <HeartIcon filled={isFav} />
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl bg-surface-soft">
                <div className="px-3 pt-2.5 text-[12px] font-black uppercase tracking-[.1em] text-ink-muted">What the AI drew</div>
                <TeacherDrawing d={drawing} />
              </div>
              <div className="flex flex-col gap-2 border-t-2 border-line pt-3">
                <div className="text-[12px] font-black uppercase tracking-[.1em] text-ink-muted">Their prompt · the parts Aiventura found</div>
                <div className="text-base font-bold leading-[27px]">
                  {segs.map((s, i) =>
                    s.part ? (
                      <span key={i} className={`${PART_TONE[s.part]} rounded-[5px] px-[3px] py-px`} style={{ background: "var(--tint)", boxShadow: "inset 0 -3px 0 var(--face)" }}>
                        {s.text}
                      </span>
                    ) : (
                      <span key={i}>{s.text}</span>
                    ),
                  ).reduce<React.ReactNode[]>((acc, el, i) => (c.demo && i > 0 ? [...acc, " ", el] : [...acc, el]), [])}
                </div>
                <div className="flex flex-wrap gap-1.5"><PartChips text={c.text} size="sm" /></div>
                <div className="flex flex-wrap gap-1.5">
                  {clueHits.map(({ cl, ok }) => (
                    <span key={cl} className={`pill !py-1 text-[13px] ${ok ? "bg-blue-tint" : "bg-pink-tint"}`}>
                      <span className="font-display" aria-hidden="true">{ok ? "✓" : "✗"}</span> {cl}
                      <span className="sr-only">{ok ? " in the prompt" : " missing"}</span>
                    </span>
                  ))}
                </div>
                {c.demo?.blocked && (
                  <div className="flex items-start gap-2 rounded-xl bg-lilac-tint px-2.5 py-2 text-sm font-bold leading-5">
                    <ShieldIcon size={16} /> <span>{c.demo.blocked}</span>
                  </div>
                )}
                <div className="text-[15px] font-bold leading-[22px]"><span className="font-black text-blue-deep">Aiventura says: </span>{note}</div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="tone-sun panel-tone flex flex-wrap items-center gap-[18px] px-6 py-5">
        <div className="min-w-0 flex-[1_1_420px]">
          <div className="kicker">Talk about it</div>
          <p className="m-0 mt-1 font-display text-2xl leading-[31px]">Why do the drawings look so different? Which words made the biggest change?</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-chunky tone-white" style={{ boxShadow: "0 4px 0 var(--sun-edge)" }} onClick={onAgain}>Play again</button>
          <Link to="/" className="btn-chunky btn-night">Back to the map</Link>
        </div>
      </section>
    </>
  );
}
