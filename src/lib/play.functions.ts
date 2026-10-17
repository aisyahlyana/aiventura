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
