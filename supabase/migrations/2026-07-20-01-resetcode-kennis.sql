-- Kennis-lus voor de Resetcode-Mentor (akkoord Raoul 20 juli):
-- 1. Weet de Mentor iets echt niet, dan geeft hij dat toe en komt de
--    vraag hier terecht (status open) + push naar de founders.
-- 2. Founder beantwoordt (of wijst af) op /resetcode-kennis, en kan
--    ook zelf vraag+antwoord-paren toevoegen (bron founder).
-- 3. Beantwoorde items gaan automatisch mee in het Mentor-brein
--    (prompt-injectie per programma) en de klant die de vraag stelde
--    krijgt bij het volgende bezoek een terugkom-bericht.

create table if not exists public.resetcode_kennis (
  id uuid primary key default gen_random_uuid(),
  -- 'darm' | 'reset' | 'producten' | 'algemeen'
  programma text not null default 'algemeen',
  vraag text not null,
  antwoord text,
  status text not null default 'open'
    check (status in ('open', 'beantwoord', 'afgewezen')),
  bron text not null default 'klant' check (bron in ('klant', 'founder')),
  -- Voor het terugkom-bericht; klant-naam bewaren we bewust NIET hier.
  link_id uuid references public.resetcode_klant_links(id) on delete set null,
  terugkoppeling_gedaan boolean not null default false,
  created_at timestamptz not null default now(),
  beantwoord_op timestamptz,
  beantwoord_door uuid
);

create index if not exists resetcode_kennis_status_idx
  on public.resetcode_kennis(status, created_at desc);
create index if not exists resetcode_kennis_link_idx
  on public.resetcode_kennis(link_id)
  where status = 'beantwoord' and not terugkoppeling_gedaan;

alter table public.resetcode_kennis enable row level security;
-- Alleen founders lezen/beheren via de app; alle schrijfacties lopen
-- server-side via de admin-client met founder-check in de route.
drop policy if exists "founder leest kennis" on public.resetcode_kennis;
create policy "founder leest kennis" on public.resetcode_kennis
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'founder'
    )
  );

comment on table public.resetcode_kennis is
  'Kennis-lus Resetcode-Mentor: onbeantwoorde klantvragen + founder-antwoorden die de Mentor direct meeneemt.';
