-- File: supabase/migrations/2026-05-22-04-mentor-escalaties.sql
--
-- Log van Mentor-escalaties naar sponsor. Bij claim-gevoelig of
-- emotioneel-zwaar signaal stuurt Laag 3 een handover-bericht
-- naar de sponsor met chat-context.

create table if not exists public.mentor_escalaties (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id) on delete cascade,
  sponsor_id uuid references auth.users(id) on delete set null,
  trigger_type text not null check (trigger_type in ('claim-gevoelig', 'emotioneel', 'mentor-onzeker', 'expliciet-verzoek')),
  chat_context jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open', 'opgepakt', 'afgerond', 'gesloten')),
  created_at timestamptz not null default now(),
  opgepakt_op timestamptz,
  afgerond_op timestamptz
);

create index if not exists mentor_escalaties_sponsor_status_idx
  on public.mentor_escalaties(sponsor_id, status);

create index if not exists mentor_escalaties_member_idx
  on public.mentor_escalaties(member_id);

alter table public.mentor_escalaties enable row level security;

create policy "member sees own escalaties" on public.mentor_escalaties
  for select using (auth.uid() = member_id);

create policy "sponsor sees assigned escalaties" on public.mentor_escalaties
  for select using (auth.uid() = sponsor_id);

create policy "system writes escalaties" on public.mentor_escalaties
  for insert with check (auth.uid() = member_id);

create policy "sponsor updates assigned escalaties" on public.mentor_escalaties
  for update using (auth.uid() = sponsor_id);

comment on table public.mentor_escalaties is
  'Laag 3 van drie-laags Mentor-architectuur. Log van sponsor-handover-events met chat-context.';
