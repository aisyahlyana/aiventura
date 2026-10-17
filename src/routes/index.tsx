import { createFileRoute, Link } from "@tanstack/react-router";
import { CoverLogo } from "@/components/brand/CoverLogo";
import { BackLink } from "@/components/brand/BackButton";
import { Button } from "@/components/ui/button";
import { useCameFrom } from "@/lib/back";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "aiventura · Learn critically, be safely with AI" },
    { name: "description", content: "Write great prompts, spot mistakes and stay safe online, together as a class. An AI adventure for ages 10–12 and their teachers." },
    { property: "og:title", content: "aiventura · Start the adventure" },
    { property: "og:description", content: "Learn critically, be safely with AI. Start your whole-class adventure." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Cover,
});

function Cover() {
  const from = useCameFrom();
  return <div className="cover-page">
    <div className="cover-stars" aria-hidden="true">
      {Array.from({ length: 20 }, (_, i) => <svg key={i} className={`cover-star cover-star-${i}`} viewBox="0 0 20 20"><path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0Z" /></svg>)}
    </div>
    <header className="cover-header">{from && <BackLink to={from} />}</header>
    <main className="cover-content">
      <CoverLogo />
      <h1 className="cover-tagline">Learn critically, be safely with AI</h1>
      <p className="cover-subline">Write great prompts, spot mistakes and stay safe online, together as a class.</p>
      <div className="cover-cta-entrance"><div className="cover-cta-nudge">
        <Button asChild variant="adventure" size="adventure"><Link to="/journey">START THE ADVENTURE</Link></Button>
      </div></div>
      <nav className="cover-secondary" aria-label="Class activities">
        <Button asChild variant="coverLink" size="coverLink"><Link to="/play/host">Play in class</Link></Button>
        <span aria-hidden="true">·</span>
        <Button asChild variant="coverLink" size="coverLink"><Link to="/print/fix-the-prompt">Print for class</Link></Button>
      </nav>
    </main>
    <footer className="cover-footer">For ages 10–12 and their teachers · No accounts or real names needed</footer>
    <div className="cover-ground" aria-hidden="true" />
  </div>;
}