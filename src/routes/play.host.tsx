import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Lock, Search, ShieldCheck, Sandwich } from "lucide-react";
import { StarPage, Wordmark } from "@/components/brand/Brand";
import { BackLink } from "@/components/brand/BackButton";
import { KitchenScene } from "@/components/play/KitchenScene";
import { Button } from "@/components/ui/button";
import { CLASS_GAMES, canPlayClassGame } from "@/lib/classGames";
import { START } from "@/lib/sayItClearly";

export const Route = createFileRoute("/play/host")({
  head: () => ({ meta: [
    { title: "Play in class · Choose a game · aiventura" },
    { name: "description", content: "Choose a classroom AI adventure. Play the sandwich game with Bolt, with more classroom games coming soon." },
    { property: "og:title", content: "Play in class · Choose a game · aiventura" },
    { property: "og:description", content: "Make a sandwich with Bolt and your class. More AI adventures are coming soon." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ClassGames,
});

const GAME_ICONS = { sandwich: Sandwich, search: Search, shield: ShieldCheck };

function ClassGames() {
  const [selected, setSelected] = useState<string>("sandwich");
  const game = CLASS_GAMES.find((item) => item.id === selected);

  return <StarPage>
    <header className="relative border-b-2 border-line-strong">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link to="/" aria-label="aiventura cover"><Wordmark height={60} /></Link>
        <BackLink to="/" label="Back" />
      </div>
    </header>
    <main className="relative mx-auto flex max-w-[1100px] flex-col gap-7 px-6 pb-16 pt-7">
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
      {game && canPlayClassGame(game.id) && <section className="grid items-center gap-6 border-t-2 border-line-strong pt-7 lg:grid-cols-[1.5fr_1fr]" aria-label="Selected game">
        <div className="overflow-hidden rounded-lg border-[3px] border-ink bg-surface" role="img" aria-label="Bolt's sandwich kitchen with bread, peanut butter and jelly"><KitchenScene s={START} /></div>
        <div className="flex flex-col items-start gap-4">
          <span className="pill bg-sun-tint">Whole class</span>
          <h2 className="font-display text-[32px] leading-10 title-coral">Say It Clearly</h2>
          <p className="text-lg font-bold leading-7">Can your class give Bolt the steps to make a peanut butter and jelly sandwich?</p>
          <Button asChild variant="outline" className="btn-chunky btn-go h-auto min-h-14 w-full whitespace-normal px-6 py-4 sm:w-auto">
            <Link to="/game/say-it-clearly" search={{ classPlay: true }}>Play sandwich game <ArrowRight aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>}
    </main>
  </StarPage>;
}
