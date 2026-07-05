-- Idempotentie-marker voor de dagelijkse ochtend-bundel (mail + push).
-- Een her-run van de hourly cron (GitHub-retry of handmatige dispatch)
-- binnen hetzelfde uur stuurde voorheen dubbele mails/pushes; de
-- send-route slaat gebruikers met een recente marker nu over.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS laatste_dagelijkse_push_op timestamptz;
