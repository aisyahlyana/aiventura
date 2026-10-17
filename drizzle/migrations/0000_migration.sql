CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  teacher_id uuid NOT NULL,
  stage text NOT NULL DEFAULT 'join',
  clues jsonb NOT NULL DEFAULT '["Comes from Spain","Short, wavy brown hair","A red shirt","Black trousers"]'::jsonb,
  favourite_team_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL,
  sort int NOT NULL DEFAULT 0
);
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  nickname text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id)
);
CREATE INDEX ON public.teams(room_id);
CREATE INDEX ON public.players(room_id);
CREATE INDEX ON public.prompts(room_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms, public.teams, public.players, public.prompts TO authenticated;
GRANT ALL ON public.rooms, public.teams, public.players, public.prompts TO service_role;

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.owns_room(_room uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.rooms WHERE id = _room AND teacher_id = auth.uid())
$$;

CREATE POLICY "Teachers manage own rooms" ON public.rooms FOR ALL TO authenticated
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Teachers manage teams in own rooms" ON public.teams FOR ALL TO authenticated
  USING (public.owns_room(room_id)) WITH CHECK (public.owns_room(room_id));
CREATE POLICY "Teachers manage players in own rooms" ON public.players FOR ALL TO authenticated
  USING (public.owns_room(room_id)) WITH CHECK (public.owns_room(room_id));
CREATE POLICY "Teachers manage prompts in own rooms" ON public.prompts FOR ALL TO authenticated
  USING (public.owns_room(room_id)) WITH CHECK (public.owns_room(room_id));

ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prompts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;