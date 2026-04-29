-- ============================================================
-- Dag-voltooiingen — checkbox-tracking voor het 21-daagse playbook
--
-- Eén rij per voltooide taak per gebruiker. We slaan dus alleen
-- voltooid op (geen 'overgeslagen' / 'open'); ontbrekende rijen
-- betekent gewoon 'nog niet afgevinkt'.
--
-- De rij wordt aangemaakt op het moment van afvinken. Bij uitvinken
-- (gebruiker klikt opnieuw op de checkbox) wordt de rij verwijderd.
--
-- Belangrijk: GEEN verplichte blokkering — de gebruiker mag elke
-- stap overslaan. Dashboard toont reminders voor onvoltooide
-- admin-stappen van vorige dagen totdat ze toch zijn afgevinkt.
-- ============================================================

CREATE TABLE IF NOT EXISTS dag_voltooiingen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  /** Dag in de 60-day-run, 1-60. */
  dag_nummer INTEGER NOT NULL,
  /** Stabiele taak-id uit lib/playbook/dagen.ts, bv. 'dag2-webshop'. */
  taak_id TEXT NOT NULL,
  /** Tijdstip van afvinken. */
  voltooid_op TIMESTAMPTZ NOT NULL DEFAULT now(),
  /** Eén voltooiing per (user, dag, taak) — voorkomt duplicate rijen. */
  UNIQUE (user_id, dag_nummer, taak_id)
);

CREATE INDEX IF NOT EXISTS idx_dag_voltooiingen_user
  ON dag_voltooiingen (user_id);
CREATE INDEX IF NOT EXISTS idx_dag_voltooiingen_user_dag
  ON dag_voltooiingen (user_id, dag_nummer);

-- ============================================================
-- Row Level Security
-- Alleen eigen voltooiingen lezen/schrijven. Sponsor-zicht via
-- aparte query met admin client (server-side).
-- ============================================================

ALTER TABLE dag_voltooiingen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eigen_voltooiingen_select" ON dag_voltooiingen;
CREATE POLICY "eigen_voltooiingen_select"
  ON dag_voltooiingen FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_voltooiingen_insert" ON dag_voltooiingen;
CREATE POLICY "eigen_voltooiingen_insert"
  ON dag_voltooiingen FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "eigen_voltooiingen_delete" ON dag_voltooiingen;
CREATE POLICY "eigen_voltooiingen_delete"
  ON dag_voltooiingen FOR DELETE
  USING (auth.uid() = user_id);
