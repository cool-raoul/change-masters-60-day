-- Doorgroei-route + eigen programma voor members (akkoord Raoul 21 juli).
-- 1. klant_user_id: koppelt een klant-link aan een ELEVA-account, zodat
--    een member zijn eigen programma-Mentor op het dashboard heeft
--    (sponsor = begeleider, privacy-schild blijft voor de sponsor).
-- 2. vrijgegeven: programma-slugs die de begeleider heeft vrijgegeven
--    als vervolg (slot op het Groeipad tot die tijd). Zelfde link,
--    zelfde chat, zelfde geheugen over de hele reis.
alter table public.resetcode_klant_links
  add column if not exists klant_user_id uuid references auth.users(id) on delete set null,
  add column if not exists vrijgegeven jsonb not null default '[]'::jsonb;

create index if not exists resetcode_links_klant_user_idx
  on public.resetcode_klant_links(klant_user_id)
  where klant_user_id is not null;
