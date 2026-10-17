import { createFileRoute } from "@tanstack/react-router";
import { BackLink } from "@/components/brand/BackButton";
import { Wordmark } from "@/components/brand/Brand";

export const Route = createFileRoute("/play/host")({
  head: () => ({
    meta: [
      { title: "Play in class · aiventura" },
      { name: "description", content: "Open the classroom demo: the sandwich challenge on the projector and the student's phone side by side." },
      { property: "og:title", content: "Play in class · aiventura" },
      { property: "og:description", content: "Open the classroom demo: the sandwich challenge on the projector and the student's phone side by side." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HostPage,
});

function HostPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-ground">
      <header className="border-b-2 border-white/15">
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 py-3">
          <div className="flex flex-wrap items-center gap-[18px]">
            <Wordmark height={48} />
            <span className="text-[15px] font-extrabold uppercase tracking-[.08em] text-ink-muted">Play in class</span>
          </div>
          <BackLink to="/journey" label="Journey map" />
        </div>
      </header>
      <iframe
        src="/AIventura_Prototype.html"
        title="AIventura classroom demo"
        className="min-h-0 w-full flex-1 border-0"
      />
    </div>
  );
}
