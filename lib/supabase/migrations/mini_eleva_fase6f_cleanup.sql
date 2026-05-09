-- ============================================================
-- Mini-ELEVA Fase 6f cleanup: oude data opruimen
--
-- De backfill in 6e miste sommige edge-cases:
--   - Prospect-vragen waar het AI-antwoord langer dan 5 min duurde
--   - Prospect-vragen waar de hele AI-call faalde (geen ai_mentor-rij)
--
-- Plus: 'haal-erbij'-knop is verwijderd uit de UI, maar oude rijen
-- met "🤝 [haal-erbij]"-content vervuilen de mens-chat.
--
-- Deze cleanup is veilig om meerdere keren te draaien (idempotent).
-- ============================================================

-- 1. Alle prospect-rijen die GEEN haal-erbij zijn EN waar er ai_mentor
--    rijen zijn voor dezelfde uitnodiging -> waarschijnlijk waren 't
--    mentor-vragen, naar 'mentor' kanaal verplaatsen.
UPDATE mini_eleva_chats c
  SET kanaal = 'mentor'
  WHERE c.rol = 'prospect'
    AND c.kanaal = 'mens'
    AND c.content NOT LIKE '🤝 [haal-erbij]%'
    AND EXISTS (
      SELECT 1 FROM mini_eleva_chats ai
      WHERE ai.rol = 'ai_mentor'
        AND ai.invitation_id = c.invitation_id
    );

-- 2. Verwijder 'haal-erbij'-berichten uit mini_eleva_chats. Ze waren
--    een passieve melding-mechaniek die nu vervangen is door echte
--    chat-berichten. Notificaties die hun bron daar hadden zijn al
--    in mini_eleva_notificaties geland en blijven gewoon werken.
DELETE FROM mini_eleva_chats
  WHERE content LIKE '🤝 [haal-erbij]%';
