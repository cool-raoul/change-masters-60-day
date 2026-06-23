-- ============================================================
-- Fase 2 "Jouw gezonde start": eigen welkomstfilm per lid.
-- Reeds toegepast in productie 2026-06-23. Hier vastgelegd voor de repo.
-- ============================================================

-- 1. Storage-bucket (publiek leesbaar voor afspelen op de publieke bot-pagina,
--    200 MB limiet, alleen video-types).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('welkomstfilms', 'welkomstfilms', true, 209715200,
        array['video/mp4','video/quicktime','video/webm','video/x-m4v'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 2. RLS: een lid mag ALLEEN in z'n eigen map (eerste pad-segment = auth.uid()).
drop policy if exists "welkomstfilms_insert_eigen" on storage.objects;
create policy "welkomstfilms_insert_eigen" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'welkomstfilms' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "welkomstfilms_update_eigen" on storage.objects;
create policy "welkomstfilms_update_eigen" on storage.objects
  for update to authenticated
  using (bucket_id = 'welkomstfilms' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "welkomstfilms_delete_eigen" on storage.objects;
create policy "welkomstfilms_delete_eigen" on storage.objects
  for delete to authenticated
  using (bucket_id = 'welkomstfilms' and (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Per-lid filmkeuze op de bestaande token-rij. soort = youtube|vimeo|upload.
alter table freebie_bot_member_tokens
  add column if not exists welkomstfilm_url text,
  add column if not exists welkomstfilm_soort text;
