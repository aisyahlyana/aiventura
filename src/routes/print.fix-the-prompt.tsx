import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Campi, Wordmark } from "@/components/brand/Brand";
import { BackIcon, PrintIcon } from "@/components/brand/Icons";
import { PARTS, PIECES, PRACTICES, WORKSHEET_KEY, type Practice } from "@/lib/fixPrompt";

export const Route = createFileRoute("/print/fix-the-prompt")({
  head: () => ({
    meta: [
      { title: "Fix the Prompt print pack · aiventura" },
      { name: "description", content: "12 printable A4 pages: teacher guide, team worksheet, cut-out cards, four extra practices and an answer key." },
      { property: "og:title", content: "Fix the Prompt print pack · aiventura" },
      { property: "og:description", content: "Run Fix the Prompt with paper cards. No screens needed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrintPack,
});

function PrintPack() {
  return (
    <div className="print-root min-h-screen bg-navy px-4 pb-10">
      <div className="no-print mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 py-5">
        <Link to="/game/fix-the-prompt" className="btn-chunky tone-white !px-4 !py-2.5 !text-[15px]" style={{ boxShadow: "0 4px 0 var(--night-edge)" }}>
          <BackIcon /> Back to the game
        </Link>
        <span className="text-[15px] font-extrabold text-sky-text">12 A4 pages · print one per sheet</span>
        <button type="button" className="btn-chunky tone-sun" onClick={() => window.print()}>
          <PrintIcon size={22} /> Print
        </button>
      </div>
      <TeacherGuide />
      <Worksheet />
      <Cards />
      {PRACTICES.map((p) => (
        <PracticePages key={p.n} p={p} />
      ))}
      <AnswerKey />
    </div>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <section className="a4">{children}</section>;
}
function H2({ children }: { children: ReactNode }) {
  return <h2 className="m-0 font-display text-[19px] leading-6">{children}</h2>;
}
function Footer({ children }: { children: ReactNode }) {
  return <div className="mt-auto text-center text-[13px] font-bold text-ink-muted">{children}</div>;
}
function TeamName() {
  return (
    <div className="flex items-end gap-2 text-[15px] font-extrabold">
      <span>Team name:</span>
      <span className="inline-block w-[60mm] border-b-2 border-navy" />
    </div>
  );
}
function Lines({ n }: { n: number }) {
  return (
    <div className="flex flex-col gap-[9mm] pt-2">
      {Array.from({ length: n }, (_, i) => <div key={i} className="border-b-2 border-line-strong" />)}
    </div>
  );
}
function Box() {
  return <span className="inline-block h-5 w-5 flex-none rounded-md border-[2.5px] border-navy" />;
}

function TeacherGuide() {
  const steps = [
    ["Warm-up · 5 min", "Write “Tell me about volcanoes.” on the board. Ask: what would make this question clearer? Collect ideas."],
    ["Match the parts · 8 min", "Teams lay out the four Part cards and match each phrase in worksheet Task 1 to its part: who it is for, what you want, how to explain, how much."],
    ["Fix the prompt · 12 min", "Read the mission: a presentation about climate change. Teams sort the six Piece cards into “Add it” and “Leave it out”, then write their new prompt in Task 2."],
    ["Share and discuss · 10 min", "Each team reads its prompt aloud. Use the answer key below and the questions to talk about why each choice helps or not."],
  ];
  return (
    <Page>
      <div className="flex items-start justify-between gap-4">
        <Wordmark height={54} />
        <div className="text-right text-[13px] font-extrabold uppercase tracking-[.08em] text-ink-muted">Phase 1 · Game 1<br />Teacher guide · page 1 of 3</div>
      </div>
      <div>
        <h1 className="m-0 font-display text-[30px] leading-9">Fix the Prompt: offline lesson</h1>
        <p className="m-0 mt-1 text-base font-semibold">Children learn the four parts of a good prompt, then improve a weak one, with paper cards instead of screens.</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[["Time", "35 minutes"], ["Groups", "Teams of 4"], ["Age", "10 to 12"], ["Screens", "None needed"]].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-blue-tint px-3 py-2">
            <div className="text-[12px] font-black uppercase tracking-[.1em] text-ink-muted">{k}</div>
            <div className="text-base font-extrabold">{v}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-line p-3">
          <H2>You will need</H2>
          <ul className="m-0 mt-1 pl-5 text-[15px] font-semibold leading-[22px]">
            <li>One team worksheet (page 2) per team</li>
            <li>One set of cut-out cards (page 3) per team</li>
            <li>Pencils, scissors, a board to write on</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-sun-tint p-3">
          <H2>Learning goal</H2>
          <p className="m-0 mt-1 text-[15px] font-semibold leading-[22px]">More information isn't always better. Relevant information is what matters, and personal information never goes in a prompt.</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <H2>How to run it</H2>
        {steps.map(([t, d], i) => (
          <div key={t} className="flex gap-3">
            <div className="tone-pink flex h-8 w-8 flex-none items-center justify-center rounded-full font-display" style={{ background: "var(--face)" }}>{i + 1}</div>
            <div>
              <div className="text-[15px] font-black">{t}</div>
              <div className="text-[15px] font-semibold leading-[21px]">{d}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <H2>Answer key</H2>
        <KeyColumns add={WORKSHEET_KEY.add} out={WORKSHEET_KEY.out} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <H2>Questions to ask</H2>
          <ul className="m-0 mt-1 pl-5 text-[15px] font-semibold leading-[22px]">
            <li>Why is a longer prompt not always a better one?</li>
            <li>Which piece would help you most, and why?</li>
            <li>What could the AI do with your name and age?</li>
          </ul>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-lilac-tint p-3">
          <Campi width={64} alt="" />
          <div>
            <div className="text-[13px] font-black uppercase tracking-[.1em] text-lilac-deep">Golden rule</div>
            <p className="m-0 text-[15px] font-semibold leading-[21px]">Never put your name, age, address or school in a prompt. The AI doesn't need them to help you.</p>
          </div>
        </div>
      </div>
    </Page>
  );
}

function KeyColumns({ add, out }: { add: string[]; out: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-blue-tint p-3">
        <div className="text-[13px] font-black uppercase tracking-[.1em] text-blue-deep">Add it ✓</div>
        <ul className="m-0 mt-1 pl-4 text-[14px] font-semibold leading-5">{add.map((a) => <li key={a}>{a}</li>)}</ul>
      </div>
      <div className="rounded-xl bg-pink-tint p-3">
        <div className="text-[13px] font-black uppercase tracking-[.1em] text-pink-deep">Leave it out ✗</div>
        <ul className="m-0 mt-1 pl-4 text-[14px] font-semibold leading-5">{out.map((a) => <li key={a}>{a}</li>)}</ul>
      </div>
    </div>
  );
}

function TeamCheck({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl bg-sun-tint p-3">
      <H2>Team check</H2>
      <div className="mt-1 flex flex-col gap-1.5">
        {items.map((t) => <div key={t} className="flex items-center gap-2 text-[15px] font-bold"><Box />{t}</div>)}
      </div>
    </div>
  );
}

function Worksheet() {
  return (
    <Page>
      <div className="flex items-center justify-between gap-4"><Wordmark height={48} /><TeamName /></div>
      <div className="flex items-center gap-4">
        <Campi width={70} alt="" />
        <div>
          <h1 className="m-0 font-display text-[30px] leading-9">Fix the Prompt</h1>
          <p className="m-0 text-[15px] font-bold text-ink-muted">Use only your team name. Never write real names on this sheet, just like in a prompt!</p>
        </div>
      </div>
      <section className="rounded-2xl border-2 border-line p-4">
        <H2>Task 1 · Match the parts</H2>
        <p className="m-0 mb-3 text-[15px] font-semibold">Draw a line from each phrase to the part of a good prompt it shows.</p>
        <div className="grid grid-cols-2 gap-x-[30mm]">
          <div className="flex flex-col gap-3">
            {["“Explain how volcanoes work.”", "“Give me 3 key facts.”", "“I'm a primary school student.”", "“Use simple examples.”"].map((t) => (
              <div key={t} className="rounded-xl bg-surface-soft px-3 py-2 text-[15px] font-extrabold">{t}</div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {PARTS.map((p) => (
              <div key={p.id} className={`${p.tone} flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] font-extrabold`} style={{ background: "var(--tint)" }}>
                <span className="flex h-6 w-6 items-center justify-center rounded-full font-display text-sm" style={{ background: "var(--face)" }}>{p.n}</span>{p.name}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="rounded-2xl border-2 border-line p-4">
        <H2>Task 2 · Fix the prompt</H2>
        <p className="m-0 mb-2 text-[15px] font-semibold"><strong>Mission:</strong> you're preparing a presentation about climate change. Your prompt is “Tell me about climate change.” Tick the pieces that make it better.</p>
        <div className="grid grid-cols-2 gap-2">
          {["I'm a primary school student.", "My name is Alicia and I'm 11 years old.", "Explain climate change using simple examples.", "Give me 3 important causes.", "Write a 2,000-word scientific essay.", "Include one example from everyday life."].map((t) => (
            <div key={t} className="flex items-center gap-2 text-[15px] font-bold"><Box />{t}</div>
          ))}
        </div>
        <div className="mt-3 text-[15px] font-black">Write your new prompt:</div>
        <Lines n={4} />
      </section>
      <section className="grid grid-cols-[1.4fr_1fr] gap-3">
        <div className="rounded-2xl border-2 border-line p-4">
          <H2>Task 3 · Why did you leave pieces out?</H2>
          <Lines n={2} />
        </div>
        <TeamCheck items={["Our prompt says who it is for", "It says what and how much", "Nothing private is in it"]} />
      </section>
      <Footer>aiventura · Phase 1 · Fix the Prompt · page 2 of 3</Footer>
    </Page>
  );
}

function PieceCard({ text, label }: { text: string; label: string }) {
  return (
    <div className="cut flex flex-col gap-2 p-3">
      <div className="text-[12px] font-black uppercase tracking-[.1em] text-pink-deep">{label}</div>
      <div className="flex-1 text-[17px] font-extrabold leading-[23px]">“{text}”</div>
      <div className="flex gap-4 text-[13px] font-extrabold">
        <span className="flex items-center gap-1.5"><Box />Add it</span>
        <span className="flex items-center gap-1.5"><Box />Leave it out</span>
      </div>
    </div>
  );
}

function Cards() {
  const order = ["who", "simple", "three", "essay", "alicia", "everyday"];
  return (
    <Page>
      <div className="flex items-end justify-between gap-4">
        <h1 className="m-0 font-display text-[30px] leading-9">Cut-out cards</h1>
        <div className="text-[14px] font-extrabold text-ink-muted">One set per team · cut along the dashed lines</div>
      </div>
      <div className="kicker text-blue-deep">Part cards · use in Task 1</div>
      <div className="grid grid-cols-2 gap-3">
        {PARTS.map((p) => (
          <div key={p.id} className={`${p.tone} cut flex flex-col gap-1.5 p-3`} style={{ background: "var(--tint)" }}>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full font-display" style={{ background: "var(--face)" }}>{p.n}</span>
              <span className="font-display text-xl">{p.name}</span>
            </div>
            <div className="text-[15px] font-semibold leading-[21px]">{p.cardTip}</div>
            <div className="text-[14px] font-bold text-ink-muted">e.g. “{p.text}”</div>
          </div>
        ))}
      </div>
      <div className="kicker text-pink-deep">Piece cards · use in Task 2</div>
      <div className="grid grid-cols-2 gap-3">
        {order.map((id) => <PieceCard key={id} text={PIECES.find((p) => p.id === id)!.text} label="Prompt piece" />)}
      </div>
      <Footer>aiventura · Phase 1 · Fix the Prompt · page 3 of 3</Footer>
    </Page>
  );
}

function PracticePages({ p }: { p: Practice }) {
  return (
    <>
      <Page>
        <div className="flex items-center justify-between gap-4"><Wordmark height={48} /><TeamName /></div>
        <div className={`${p.tone} flex items-center gap-4`}>
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full font-display text-2xl" style={{ background: "var(--face)", boxShadow: "0 4px 0 var(--edge)" }}>{p.n}</div>
          <div>
            <div className="text-[13px] font-black uppercase tracking-[.1em] text-ink-muted">Fix the Prompt · practice {p.n} of 4 · cards on the next page</div>
            <h1 className="m-0 font-display text-[30px] leading-9">{p.title}</h1>
          </div>
        </div>
        <section className={`${p.tone} rounded-2xl p-4`} style={{ background: "var(--tint)" }}>
          <div className="kicker">Your mission</div>
          <p className="m-0 mt-1 text-[17px] font-bold leading-6">{p.mission}</p>
          <div className="mt-2 inline-block rounded-xl bg-surface px-3 py-2 text-[16px] font-extrabold">Starting prompt: “{p.start}”</div>
        </section>
        <section className="rounded-2xl border-2 border-line p-4">
          <H2>Step 1 · Tick the pieces that make it better</H2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {p.pieces.map((t) => <div key={t} className="flex items-center gap-2 text-[15px] font-bold"><Box />{t}</div>)}
          </div>
        </section>
        <section className="rounded-2xl border-2 border-line p-4">
          <H2>Step 2 · Write your new prompt</H2>
          <Lines n={4} />
        </section>
        <section className="grid grid-cols-[1.4fr_1fr] gap-3">
          <div className="rounded-2xl border-2 border-line p-4">
            <H2>Step 3 · Why did you leave pieces out?</H2>
            <Lines n={2} />
          </div>
          <TeamCheck items={["It says who it is for", "It says what, how and how much", "Nothing private or unkind"]} />
        </section>
      </Page>
      <Page>
        <div className="flex items-end justify-between gap-4">
          <div className={`${p.tone} flex items-center gap-3`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full font-display text-xl" style={{ background: "var(--face)" }}>{p.n}</div>
            <div>
              <div className="text-[13px] font-black uppercase tracking-[.1em] text-ink-muted">Cut-out cards · practice {p.n}</div>
              <h1 className="m-0 font-display text-[28px] leading-8">{p.title}</h1>
            </div>
          </div>
          <div className="text-[14px] font-extrabold text-ink-muted">One set per team · cut along the dashed lines</div>
        </div>
        <div className="rounded-xl bg-surface-soft px-3 py-2 text-[15px] font-semibold">
          Starting prompt: <strong>“{p.start}”</strong> Sort the cards into two piles: <strong>Add it</strong> and <strong>Leave it out</strong>.
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3">
          {p.pieces.map((t) => <PieceCard key={t} text={t} label={`Prompt piece · practice ${p.n}`} />)}
        </div>
        <Footer>aiventura · Phase 1 · Fix the Prompt</Footer>
      </Page>
    </>
  );
}

function AnswerKey() {
  const blocks = [
    { n: "★", title: "Team worksheet: climate change", tone: "tone-sun", add: WORKSHEET_KEY.add, out: WORKSHEET_KEY.out },
    ...PRACTICES.map((p) => ({ n: String(p.n), title: `Practice ${p.n}: ${p.title}`, tone: p.tone, add: p.add, out: p.out })),
  ];
  return (
    <Page>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="kicker text-pink-deep">For teachers only</div>
          <h1 className="m-0 font-display text-[30px] leading-9">Answer key</h1>
        </div>
        <Wordmark height={48} />
      </div>
      <p className="m-0 text-[15px] font-semibold">There is room for discussion: if a team can explain a different choice well, praise the thinking. The private-information pieces are always “leave it out”.</p>
      {blocks.map((b) => (
        <section key={b.title} className="flex flex-col gap-1.5">
          <div className={`${b.tone} flex items-center gap-2`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-full font-display text-sm" style={{ background: "var(--face)" }}>{b.n}</span>
            <h2 className="m-0 font-display text-[17px]">{b.title}</h2>
          </div>
          <KeyColumns add={b.add} out={b.out} />
        </section>
      ))}
      <Footer>aiventura · Phase 1 · Fix the Prompt · last page</Footer>
    </Page>
  );
}
