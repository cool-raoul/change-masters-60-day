-- File: supabase/migrations/2026-05-25-01-freebie-mail-queue.sql
--
-- Skelet voor de 5-mail-sequence van Tweede Lente. Niet activeren tot
-- Resend-integratie + content van Gaby klaar zijn. Feature-flag
-- `freebie_mails_actief` op profiles default false → cron stuurt niet.
--
-- Werking als geactiveerd:
--   1. Bij voltooide opt-in van een freebie-bot: insert 5 rijen in
--      freebie_mail_queue (dag 1-5) met gepland_op = now() + N dagen.
--   2. Cron route /api/cron/freebie-mails draait dagelijks, leest
--      rijen waar gepland_op < now() en status = 'wacht', probeert te
--      versturen, update status.
--   3. Resend-API-key in env vars. Geen key = cron logt en slaat over.

create table if not exists public.freebie_mail_queue (
  id uuid primary key default gen_random_uuid(),
  opt_in_id uuid not null references public.freebie_opt_ins(id) on delete cascade,
  freebie_slug text not null,
  lead_email text not null,
  lead_naam text not null,
  member_id uuid not null references auth.users(id) on delete cascade,
  -- Welke dag in de sequence (1 t/m 5)
  dag integer not null check (dag between 1 and 5),
  -- Wanneer deze mail verstuurd moet worden
  gepland_op timestamptz not null,
  -- Wanneer hij daadwerkelijk verstuurd is (NULL = nog niet)
  verstuurd_op timestamptz,
  -- Status van de verzending
  status text not null default 'wacht'
    check (status in ('wacht', 'verstuurd', 'mislukt', 'overgeslagen')),
  -- Optionele foutmelding bij status='mislukt'
  foutmelding text,
  -- Aantal verzendpogingen (voor retry-logic)
  pogingen integer not null default 0,
  -- Unsubscribe-token zodat lead zich kan afmelden via persoonlijke URL
  unsubscribe_token text unique,
  created_at timestamptz not null default now()
);

create index if not exists freebie_mail_queue_gepland_idx
  on public.freebie_mail_queue (gepland_op)
  where status = 'wacht';

create index if not exists freebie_mail_queue_opt_in_idx
  on public.freebie_mail_queue (opt_in_id);

create index if not exists freebie_mail_queue_email_idx
  on public.freebie_mail_queue (lead_email);

alter table public.freebie_mail_queue enable row level security;

-- Geen RLS-policy voor anon. Alleen service-role-admin-client (cron) en
-- member zelf kunnen rijen lezen.
create policy "member sees own mail-queue" on public.freebie_mail_queue
  for select using (auth.uid() = member_id);

-- Feature-flag op profiles
alter table public.profiles
  add column if not exists freebie_mails_actief boolean not null default false;

comment on table public.freebie_mail_queue is
  'Wacht-queue voor de 5-mail-sequence van freebie-bots. Cron pikt rijen op die gepland_op verleden hebben en status=wacht. Skelet, niet actief tot feature-flag aan.';
comment on column public.profiles.freebie_mails_actief is
  'Feature-flag: wanneer true, worden bij voltooide freebie-opt-ins 5 mail-queue-rijen aangemaakt en gaat de cron ze versturen. Default false.';

-- Unsubscribed-tabel voor leads die zich afmelden (cross-freebie,
-- e-mailadres als identifier). Cron slaat over wanneer adres in deze
-- tabel staat.
create table if not exists public.freebie_mail_unsubscribed (
  email text primary key,
  reden text,
  afgemeld_op timestamptz not null default now()
);

comment on table public.freebie_mail_unsubscribed is
  'Leads die zich hebben afgemeld voor alle freebie-mailreeksen. Cron slaat ze over.';
