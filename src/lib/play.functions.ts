import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkPrompt } from "./safety";
import { LIVE_TEAM, NICKNAMES } from "./play";

/**
 * Student actions. Students have no accounts, so these run on the server with
 * the admin client and only ever accept a room code, a nickname from our list,
 * and a prompt that passes the safety check.
 */

export const joinRoom = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => z.object({ code: z.string().regex(/^\d{6}$/) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: room } = await supabaseAdmin.from("rooms").select("id, code, stage").eq("code", data.code).maybeSingle();
    if (!room) return { ok: false as const, error: "We couldn't find that room. Check the code on the big screen." };
    const { data: teams } = await supabaseAdmin.from("teams").select("id, name, color, sort").eq("room_id", room.id).order("sort");
    return {
      ok: true as const,
      room: { id: room.id, code: room.code },
      teams: (teams ?? []).filter((t) => t.name !== LIVE_TEAM.name).map((t) => ({ id: t.id, name: t.name, color: t.color })),
    };
  });

export const joinTeam = createServerFn({ method: "POST" })
  .inputValidator((d: { roomId: string; teamId: string; nickname: string }) =>
    z.object({ roomId: z.string().uuid(), teamId: z.string().uuid(), nickname: z.enum(NICKNAMES as [string, ...string[]]) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: team } = await supabaseAdmin.from("teams").select("id, name").eq("id", data.teamId).eq("room_id", data.roomId).maybeSingle();
    if (!team || team.name === LIVE_TEAM.name) return { ok: false as const, error: "That team isn't in this room." };
    const { data: player, error } = await supabaseAdmin
      .from("players")
      .insert({ room_id: data.roomId, team_id: team.id, nickname: data.nickname })
      .select("id")
      .single();
    if (error || !player) return { ok: false as const, error: "Couldn't join right now. Try again." };
    return { ok: true as const, playerId: player.id, teamName: team.name };
  });

export const submitPrompt = createServerFn({ method: "POST" })
  .inputValidator((d: { playerId: string; text: string }) =>
    z.object({ playerId: z.string().uuid(), text: z.string().max(400) }).parse(d),
  )
  .handler(async ({ data }) => {
    const text = data.text.trim();
    const safety = checkPrompt(text);
    if (!safety.canSend) return { ok: false as const, error: "The safety check found something to fix first.", issues: safety.issues };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: player } = await supabaseAdmin.from("players").select("id, room_id, team_id").eq("id", data.playerId).maybeSingle();
    if (!player?.team_id) return { ok: false as const, error: "Please join a team first.", issues: [] };
    const { error } = await supabaseAdmin
      .from("prompts")
      .upsert({ room_id: player.room_id, team_id: player.team_id, player_id: player.id, text, created_at: new Date().toISOString() }, { onConflict: "team_id" });
    if (error) return { ok: false as const, error: "Couldn't send right now. Try again.", issues: [] };
    return { ok: true as const };
  });

/* ---------- Teacher screen (no login for now) ----------
 * The teacher's browser keeps a random host key; every host action must
 * present the room id + that key, which is stored as the room's teacher_id. */

const hostRef = z.object({ roomId: z.string().uuid(), hostKey: z.string().uuid() });

async function ownedRoom(roomId: string, hostKey: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("rooms").select("id").eq("id", roomId).eq("teacher_id", hostKey).maybeSingle();
  if (!data) throw new Error("Room not found");
  return supabaseAdmin;
}

export const hostOpenRoom = createServerFn({ method: "POST" })
  .inputValidator((d: { hostKey: string; fresh: boolean }) => z.object({ hostKey: z.string().uuid(), fresh: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { DEFAULT_CLUES, STUDENT_TEAMS } = await import("./play");
    if (!data.fresh) {
      const since = new Date(Date.now() - 12 * 3600 * 1000).toISOString();
      const { data: r } = await supabaseAdmin.from("rooms").select("id").eq("teacher_id", data.hostKey).gte("created_at", since)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (r) return { roomId: r.id };
    }
    for (let i = 0; i < 5; i++) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const { data: r, error } = await supabaseAdmin.from("rooms")
        .insert({ code, teacher_id: data.hostKey, stage: "join", clues: DEFAULT_CLUES }).select("id").single();
      if (r) {
        await supabaseAdmin.from("teams").insert([...STUDENT_TEAMS, LIVE_TEAM].map((t, sort) => ({ room_id: r.id, name: t.name, color: t.color, sort })));
        return { roomId: r.id };
      }
      if (error && error.code !== "23505") break;
    }
    throw new Error("Could not create a room");
  });

export const hostGetState = createServerFn({ method: "POST" })
  .inputValidator((d: { roomId: string; hostKey: string }) => hostRef.parse(d))
  .handler(async ({ data }) => {
    const db = await ownedRoom(data.roomId, data.hostKey);
    const [r, t, p, pr] = await Promise.all([
      db.from("rooms").select("id, code, stage, clues, favourite_team_id").eq("id", data.roomId).single(),
      db.from("teams").select("id, name, color, sort").eq("room_id", data.roomId).order("sort"),
      db.from("players").select("id, team_id, nickname").eq("room_id", data.roomId).order("created_at"),
      db.from("prompts").select("id, team_id, text").eq("room_id", data.roomId),
    ]);
    return {
      room: { ...r.data!, clues: r.data!.clues as string[] },
      teams: t.data ?? [], players: p.data ?? [], prompts: pr.data ?? [],
    };
  });

export const hostUpdateRoom = createServerFn({ method: "POST" })
  .inputValidator((d: { roomId: string; hostKey: string; stage?: string; clues?: string[]; favourite_team_id?: string | null }) =>
    hostRef.extend({
      stage: z.enum(["join", "write", "reveal"]).optional(),
      clues: z.array(z.string().max(80)).max(6).optional(),
      favourite_team_id: z.string().uuid().nullable().optional(),
    }).parse(d))
  .handler(async ({ data }) => {
    const db = await ownedRoom(data.roomId, data.hostKey);
    const { roomId, hostKey: _k, ...patch } = data;
    await db.from("rooms").update(JSON.parse(JSON.stringify(patch))).eq("id", roomId);
    return { ok: true };
  });

export const hostSendLive = createServerFn({ method: "POST" })
  .inputValidator((d: { roomId: string; hostKey: string; text: string }) => hostRef.extend({ text: z.string().max(400) }).parse(d))
  .handler(async ({ data }) => {
    const text = data.text.trim();
    if (!checkPrompt(text).canSend) return { ok: false as const };
    const db = await ownedRoom(data.roomId, data.hostKey);
    const { data: team } = await db.from("teams").select("id").eq("room_id", data.roomId).eq("name", LIVE_TEAM.name).single();
    if (!team) return { ok: false as const };
    await db.from("prompts").upsert({ room_id: data.roomId, team_id: team.id, text, created_at: new Date().toISOString() }, { onConflict: "team_id" });
    return { ok: true as const };
  });
