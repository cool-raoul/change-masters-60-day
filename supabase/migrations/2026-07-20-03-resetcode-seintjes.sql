-- Seintjes-logboek (feedback Raoul 20 juli): een pushbericht is
-- vluchtig; wie erop klikt moet op de bestemming (klantenkaart /
-- Mijn klanten) dezelfde informatie terugzien. Elk seintje naar de
-- begeleider wordt daarom ook hier bewaard.
create table if not exists public.resetcode_seintjes (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.resetcode_klant_links(id) on delete cascade,
  titel text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists resetcode_seintjes_link_idx
  on public.resetcode_seintjes(link_id, created_at desc);

alter table public.resetcode_seintjes enable row level security;
drop policy if exists "member leest seintjes van eigen klant-links" on public.resetcode_seintjes;
create policy "member leest seintjes van eigen klant-links" on public.resetcode_seintjes
  for select using (
    exists (
      select 1 from public.resetcode_klant_links l
      where l.id = link_id and l.member_id = auth.uid()
    )
  );
