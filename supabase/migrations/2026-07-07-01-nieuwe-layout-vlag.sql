-- Schakelaar voor de nieuwe anti-overwhelm-layout (voorstel 1).
-- Per account aan/uit te zetten; alleen founders/testers zien de toggle.
-- Omzetten oud <-> nieuw is hiermee letterlijk one flip.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nieuwe_layout boolean NOT NULL DEFAULT false;
