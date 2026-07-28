-- Team-seintjes: elk pushbericht over een teamlid wordt hier ook
-- opgeslagen, zodat de ontvanger (sponsor/leider) het volledige bericht
-- altijd kan teruglezen op /team (akkoord Raoul 28 juli 2026).
create table if not exists team_seintjes (
  id uuid primary key default gen_random_uuid(),
  ontvanger_id uuid not null references profiles(id) on delete cascade,
  lid_id uuid references profiles(id) on delete set null,
  titel text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists team_seintjes_ontvanger_idx
  on team_seintjes (ontvanger_id, created_at desc);

alter table team_seintjes enable row level security;

-- Alleen de ontvanger leest zijn eigen seintjes; schrijven gebeurt
-- uitsluitend server-side via de service-role (geen insert-policy).
drop policy if exists "eigen team-seintjes lezen" on team_seintjes;
create policy "eigen team-seintjes lezen"
  on team_seintjes for select
  to authenticated
  using (auth.uid() = ontvanger_id);
