import type { Dag } from "@/lib/playbook/types";

// ============================================================
// playbook overrides — server-side helpers
//
// Founders kunnen via /instellingen/playbook teksten aanpassen
// zonder code-deploy. Deze helpers laden de overrides uit de DB
// en mergen ze met de hardcoded fallback uit lib/playbook/dagen.ts.
//
// NULL-velden in de override = vallen terug op de standaard tekst.
// ============================================================

export type DagOverride = {
  dag_nummer: number;
  titel: string | null;
  wat_je_leert: string | null;
  fase_doel: string | null;
  waarom_werkt_dit_tekst: string | null;
  waarom_werkt_dit_bron: string | null;
};

/**
 * Voeg een override (uit DB) samen met een hardcoded Dag (uit dagen.ts).
 * Velden die NULL of leeg zijn in de override gebruiken de standaard.
 */
export function pasOverrideToe(dag: Dag, override: DagOverride | null): Dag {
  if (!override) return dag;
  return {
    ...dag,
    titel: override.titel?.trim() || dag.titel,
    watJeLeert: override.wat_je_leert?.trim() || dag.watJeLeert,
    faseDoel: override.fase_doel?.trim() || dag.faseDoel,
    waaromWerktDit: {
      tekst:
        override.waarom_werkt_dit_tekst?.trim() || dag.waaromWerktDit.tekst,
      bron:
        override.waarom_werkt_dit_bron?.trim() ||
        dag.waaromWerktDit.bron,
    },
  };
}

/**
 * Haal overrides op voor een specifieke set dagnummers. Gebruikt de
 * RLS-policy die iedereen toelaat om SELECT te doen.
 */
export async function haalOverrides(
  // Loosely getypeerd zodat zowel server- als admin-clients passen
  supabase: {
    from: (t: string) => {
      select: (cols: string) => {
        in: (
          col: string,
          values: number[],
        ) => Promise<{ data: DagOverride[] | null; error: unknown }>;
      };
    };
  },
  dagNummers: number[],
): Promise<Map<number, DagOverride>> {
  const map = new Map<number, DagOverride>();
  if (dagNummers.length === 0) return map;
  const { data } = await supabase
    .from("playbook_overrides")
    .select(
      "dag_nummer, titel, wat_je_leert, fase_doel, waarom_werkt_dit_tekst, waarom_werkt_dit_bron",
    )
    .in("dag_nummer", dagNummers);
  for (const r of data || []) map.set(r.dag_nummer, r);
  return map;
}
