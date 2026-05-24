-- File: supabase/migrations/2026-05-24-09-tweede-lente-bot.sql
--
-- Tweede Lente bot (pilot voor freebie-bot-architectuur).
-- Twee onderdelen:
--   1. Tabel freebie_bot_member_tokens: per (member, bot) een unieke
--      16-char hex tracking-token die in de publieke bot-URL staat.
--   2. Uitbreiding freebie_opt_ins met bot_antwoorden jsonb +
--      spiegel_tekst text, zodat we weten welke antwoorden de lead gaf
--      en welke spiegel de bot heeft getoond.

create table if not exists public.freebie_bot_member_tokens (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id) on delete cascade,
  bot_slug text not null,
  token text unique not null,
  created_at timestamptz not null default now(),
  unique (member_id, bot_slug)
);

create index if not exists freebie_bot_member_tokens_token_idx
  on public.freebie_bot_member_tokens(token);

create index if not exists freebie_bot_member_tokens_member_idx
  on public.freebie_bot_member_tokens(member_id);

alter table public.freebie_bot_member_tokens enable row level security;

create policy "member sees own tokens" on public.freebie_bot_member_tokens
  for select using (auth.uid() = member_id);

create policy "member writes own tokens" on public.freebie_bot_member_tokens
  for insert with check (auth.uid() = member_id);

create policy "anyone reads token by value via service role" on public.freebie_bot_member_tokens
  for select using (false);
-- Publieke bot-route gebruikt service-role-admin-client om token op te
-- zoeken. RLS-policy voor 'anon' is dus expres restrictief.

alter table public.freebie_opt_ins
  add column if not exists bot_antwoorden jsonb,
  add column if not exists spiegel_tekst text;

comment on table public.freebie_bot_member_tokens is 'Per (member, bot_slug) unieke tracking-token voor publieke bot-URL.';
comment on column public.freebie_opt_ins.bot_antwoorden is 'JSON met de multi-choice-antwoorden uit de bot (per vraag).';
comment on column public.freebie_opt_ins.spiegel_tekst is 'AI-gegenereerde spiegel-tekst die de prospect te zien kreeg.';
