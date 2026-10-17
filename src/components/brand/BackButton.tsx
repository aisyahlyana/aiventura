import { Link } from "@tanstack/react-router";
import { BackIcon } from "@/components/brand/Icons";

/** Every page in the app, so a back button can always point somewhere real. */
export type AppRoute = "/" | "/game/fix-the-prompt" | "/print/fix-the-prompt" | "/play/host" | "/play/join";

const CLS = "btn-chunky tone-white !px-4 !py-2.5 !text-[15px]";
const EDGE = { boxShadow: "0 4px 0 var(--night-edge)" } as const;

/** Top-right back pill that leaves the current page. */
export function BackLink({ to, label = "Back", className = "" }: { to: AppRoute; label?: string; className?: string }) {
  return (
    <Link to={to} className={`${CLS} ${className}`.trim()} style={EDGE}>
      <BackIcon /> {label}
    </Link>
  );
}

/** Top-right back pill that leaves the current screen inside a page. */
export function BackScreen({ onClick, label = "Back", className = "" }: { onClick: () => void; label?: string; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`${CLS} ${className}`.trim()} style={EDGE}>
      <BackIcon /> {label}
    </button>
  );
}
