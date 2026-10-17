import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Lock, Search, ShieldCheck, Sandwich } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLASS_GAMES, canPlayClassGame } from "@/lib/classGames";
import { useServerFn } from "@tanstack/react-start";
import { hostGetState, hostOpenRoom } from "@/lib/play.functions";
import { StarPage, Wordmark } from "@/components/brand/Brand";
import { BackLink } from "@/components/brand/BackButton";
import { LockIcon } from "@/components/brand/Icons";
import { DEMO_TEAMS, LIVE_TEAM, formatCode } from "@/lib/play";

export const Route = createFileRoute("/play/host")({
  head: () => ({
    meta: [
      { title: "Play in class · Choose a game · aiventura" },
      { name: "description", content: "Choose a classroom game, then invite teams with your QR code and room code." },
      { property: "og:title", content: "Play in class · Choose a game · aiventura" },
      { property: "og:description", content: "Choose a game and get your class ready with a shared room and teams." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HostPage,
});

type Room = { id: string; code: string; stage: string; clues: string[]; favourite_team_id: string | null };
type Team = { id: string; name: string; color: string; sort: number };
type Player = { id: string; team_id: string | null; nickname: string };

const TONE: Record<string, string> = { pink: "tone-pink", blue: "tone-blue", sun: "tone-sun", lilac: "tone-lilac" };

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
      {hostKey ? <Host hostKey={hostKey} /> : <div className="p-10 text-center font-extrabold text-ink-muted">Loading…</div>}
    </StarPage>
  );
}

function HostHeader() {
  return (
    <header className="relative border-b-2 border-white/15">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex flex-wrap items-center gap-[18px]">
          <Link to="/journey" aria-label="Back to the journey map"><Wordmark height={60} /></Link>
          <span className="text-[15px] font-extrabold uppercase tracking-[.08em] text-ink-muted">Play in class</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <BackLink to="/journey" label="Journey map" />
        </div>
      </div>
    </header>
  );
}

const GAME_ICONS = { sandwich: Sandwich, search: Search, shield: ShieldCheck };

function GameChooser() {
  const [selected, setSelected] = useState<string>("sandwich");
  return <section aria-label="Choose a classroom game" className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-[40px] leading-tight title-ground">Play in class</h1>
        <h2 className="mt-3 font-display text-2xl">Choose your game</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3" role="group" aria-label="Classroom games">
        {CLASS_GAMES.map((item) => {
          const Icon = GAME_ICONS[item.icon];
          const active = selected === item.id;
          return <Button key={item.id} variant="outline" disabled={!item.available} aria-pressed={active}
            onClick={() => { if (canPlayClassGame(item.id)) setSelected(item.id); }}
            className={`${item.tone} panel-tint relative h-auto min-h-[160px] flex-col items-start gap-3 whitespace-normal p-5 text-left !opacity-100 disabled:border-dashed ${active ? "ring-4 ring-coral ring-offset-4 ring-offset-ground" : ""}`}>
            <div className="flex w-full items-center justify-between gap-2">
              <Icon className="!h-8 !w-8" aria-hidden="true" />
              {active ? <Check className="!h-6 !w-6" aria-label="Selected" /> : <Lock aria-hidden="true" />}
            </div>
            <span className="font-display text-[23px] leading-7">{item.title}</span>
            <span className="text-sm font-bold">{item.available ? item.subtitle : "Coming soon"}</span>
          </Button>;
        })}
      </div>
  </section>;
}

function Host({ hostKey }: { hostKey: string }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const openFn = useServerFn(hostOpenRoom);
  const stateFn = useServerFn(hostGetState);

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
      setRoom(s.room);
      setTeams(s.teams); setPlayers(s.players);
    } catch { /* keep last state */ }
  }, [roomId, hostKey, stateFn]);

  // Students' phones send prompts to the server; the big screen checks every 2 seconds.
  useEffect(() => {
    if (!roomId) return;
    loadLists();
    const t = window.setInterval(loadLists, 2000);
    return () => window.clearInterval(t);
  }, [roomId, loadLists]);

  return (
    <>
      <HostHeader />
      <main className="relative mx-auto flex max-w-[1180px] flex-col gap-6 px-6 pb-[72px] pt-7">
        <GameChooser />
        {error && <div role="alert" className="card-raised p-5 font-bold">{error}</div>}
        {!room && !error && <div className="p-10 text-center font-extrabold text-ink-muted">Opening your room…</div>}
        {room && <JoinStage room={room} teams={teams} players={players} />}
      </main>
    </>
  );
}

/* ---------------- Stage 1: Join ---------------- */

function JoinStage({ room, teams, players }: { room: Room; teams: Team[]; players: Player[] }) {
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
        <div className="rounded-[18px] bg-sun-tint px-[22px] py-3" style={{ boxShadow: "4px 4px 0 var(--ink)" }}>
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
          <div className="tone-lilac flex flex-col gap-2 rounded-[18px] border-[3px] border-dashed border-lilac-edge bg-lilac-tint px-3.5 py-3" style={{ boxShadow: "4px 4px 0 var(--ink)" }}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-[21px] leading-[26px]">{LIVE_TEAM.name}</span>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-sm font-extrabold">Live team</span>
            </div>
            <div className="text-sm font-bold leading-5">This team plays together with the class.</div>
          </div>
        </div>
      </section>
    </div>
  );
}

