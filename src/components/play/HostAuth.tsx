import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Campi } from "@/components/brand/Brand";

export function HostAuth() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ kind: "error", text: "That email and password didn't match. Try again." });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/play/host` },
      });
      if (error) setMsg({ kind: "error", text: error.message });
      else if (!data.session) setMsg({ kind: "info", text: "Check your email and click the link to confirm, then come back here." });
    }
    setBusy(false);
  }

  return (
    <section className="card-raised mx-auto flex w-full max-w-[460px] flex-col gap-4 p-7">
      <div className="flex items-center gap-4">
        <Campi width={80} />
        <div>
          <div className="kicker text-blue-deep">For teachers</div>
          <h1 className="m-0 font-display text-[28px] leading-[34px]">{mode === "in" ? "Sign in to open a room" : "Create a teacher account"}</h1>
        </div>
      </div>
      <p className="m-0 text-base font-bold text-ink-muted">Students never need an account. They join with a room code and a fun nickname.</p>
      <form className="flex flex-col gap-3" onSubmit={submit}>
        <label className="flex flex-col gap-1 text-[15px] font-extrabold">
          Email
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
        </label>
        <label className="flex flex-col gap-1 text-[15px] font-extrabold">
          Password
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
          />
        </label>
        {msg && (
          <div role={msg.kind === "error" ? "alert" : "status"} className={`rounded-xl px-3.5 py-3 text-[15px] font-bold ${msg.kind === "error" ? "bg-pink-tint" : "bg-blue-tint"}`}>
            {msg.text}
          </div>
        )}
        <button type="submit" className="btn-chunky tone-pink" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      <button type="button" className="btn-ghost" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }}>
        {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
      </button>
    </section>
  );
}
