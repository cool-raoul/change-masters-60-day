-- ============================================================
-- Mini-ELEVA Fase 6e: kanaal-scheiding mentor-chat vs mens-chat
--
-- Probleem: prospect-vragen aan de ELEVA-mentor (AI) en
-- prospect-berichten in de mens-chat (member/sponsor) worden beide
-- opgeslagen met rol='prospect'. Filteren op rol alleen werkt niet,
-- waardoor mentor-vragen lekken in de mens-chat-UI.
--
-- Fix: nieuwe kolom 'kanaal' op mini_eleva_chats:
--   - 'mentor' = AI-gesprek tussen prospect en ELEVA-mentor (privé)
--   - 'mens'   = drie-persoonschat prospect/member/sponsor
--
-- AVG-keuze A blijft van kracht: mentor-kanaal blijft volledig privé
-- voor de prospect, member en sponsor zien daar niets van.
-- ============================================================

ALTER TABLE mini_eleva_chats
  ADD COLUMN IF NOT EXISTS kanaal TEXT NOT NULL DEFAULT 'mens'
  CHECK (kanaal IN ('mentor', 'mens'));

CREATE INDEX IF NOT EXISTS mini_eleva_chats_kanaal_idx
  ON mini_eleva_chats(invitation_id, kanaal, created_at);

-- Backfill voor bestaande rijen:
--
-- 1. ai_mentor-antwoorden zijn altijd 'mentor'.
UPDATE mini_eleva_chats
  SET kanaal = 'mentor'
  WHERE rol = 'ai_mentor';

-- 2. prospect-vragen die binnen 5 minuten gevolgd worden door een
--    ai_mentor-antwoord op dezelfde uitnodiging waren mentor-vragen,
--    behalve de 'haal-erbij'-berichten (die hoorden bij de mens-flow).
UPDATE mini_eleva_chats c
  SET kanaal = 'mentor'
  WHERE c.rol = 'prospect'
    AND c.content NOT LIKE '🤝 [haal-erbij]%'
    AND EXISTS (
      SELECT 1 FROM mini_eleva_chats ai
      WHERE ai.rol = 'ai_mentor'
        AND ai.invitation_id = c.invitation_id
        AND ai.created_at > c.created_at
        AND ai.created_at < c.created_at + INTERVAL '5 minutes'
    );

COMMENT ON COLUMN mini_eleva_chats.kanaal IS
  'mentor = AI-gesprek (prive AVG-Keuze A) | mens = drie-persoonschat (consent via expliciet versturen)';
