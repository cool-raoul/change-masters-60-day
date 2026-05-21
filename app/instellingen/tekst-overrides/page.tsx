import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  OverridesLijst,
  PlaybookOverridesLijst,
  ScriptOverridesLijst,
  type OverrideRij,
  type PlaybookOverrideRij,
  type ScriptOverrideRij,
} from "@/components/instellingen/OverridesLijst";

// ============================================================
// /instellingen/tekst-overrides, founder-tool om ALLE aanpassingen op
// één plek te zien en te resetten. Sinds 2026-05-21 toont deze pagina
// drie soorten overrides naast elkaar:
//
// 1. tekst_overrides, voor EditableTekst/EditableBlok teksten op de
//    hele site (les van de dag, welkomstpagina, knop-labels, etc.)
// 2. playbook_overrides, voor dag-eigenschappen van Sprint (titel,
//    watJeLeert, faseDoel) via het oude /playbook UI-pad
// 3. script_overrides, voor /scripts pagina aanpassingen
//
// Eén pagina, drie secties, één reset-knop per stuk. Geen verwarring
// meer welk override-systeem op welke plek werkt.
// ============================================================

export const dynamic = "force-dynamic";

export default async function AanpassingenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isFounder =
    (profiel as { role?: string | null } | null)?.role === "founder";
  if (!isFounder) redirect("/instellingen");

  // 1. tekst_overrides ophalen
  const { data: tekstRijen } = await supabase
    .from("tekst_overrides")
    .select("namespace, sleutel, waarde, updated_at")
    .order("namespace", { ascending: true })
    .order("sleutel", { ascending: true });

  const tekstOverrides = (tekstRijen ?? []) as OverrideRij[];
  const perNamespace = new Map<string, OverrideRij[]>();
  for (const r of tekstOverrides) {
    if (!perNamespace.has(r.namespace)) perNamespace.set(r.namespace, []);
    perNamespace.get(r.namespace)!.push(r);
  }
  const tekstGroepen = Array.from(perNamespace.entries());

  // 2. playbook_overrides ophalen (Sprint-dag-aanpassingen via oud pad)
  const { data: playbookRijen } = await supabase
    .from("playbook_overrides")
    .select(
      "dag_nummer, titel, wat_je_leert, fase_doel, waarom_werkt_dit_tekst, waarom_werkt_dit_bron, updated_at",
    )
    .order("dag_nummer", { ascending: true });

  const playbookOverrides = (playbookRijen ?? []) as PlaybookOverrideRij[];

  // 3. script_overrides ophalen (aanpassingen op /scripts)
  const { data: scriptRijen } = await supabase
    .from("script_overrides")
    .select("script_id, titel, inhoud, updated_at")
    .order("script_id", { ascending: true });

  const scriptOverrides = (scriptRijen ?? []) as ScriptOverrideRij[];

  const totaal =
    tekstOverrides.length + playbookOverrides.length + scriptOverrides.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Link
        href="/instellingen"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm inline-flex items-center gap-1"
      >
        ← Terug naar instellingen
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          ✍️ Mijn aanpassingen
        </h1>
        <p className="text-cm-white opacity-75 mt-2 leading-relaxed text-sm">
          Eén plek voor alle tekst- en content-aanpassingen die jij hebt
          gemaakt op ELEVA. Per stuk een reset-knop, dan komt de code-
          standaard weer in beeld.
        </p>
        <p className="text-cm-white opacity-60 text-xs mt-2 leading-relaxed">
          Tip: als een nieuwe tekst van Claude niet doorkomt, staat hier
          waarschijnlijk een aanpassing van jou op die plek. Reset 'm en
          de nieuwe versie verschijnt.
        </p>
      </div>

      {totaal === 0 ? (
        <div className="card text-center py-12">
          <p className="text-cm-white opacity-70">
            Geen aanpassingen actief. Alle teksten tonen de code-standaard.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-cm-gold/30 bg-cm-gold/5 px-4 py-3 text-sm text-cm-white opacity-90">
            <strong className="text-cm-gold">{totaal}</strong> aanpassing
            {totaal === 1 ? "" : "en"} actief, verdeeld over drie soorten:
            <ul className="mt-2 ml-4 text-xs opacity-80 space-y-0.5 list-disc">
              <li>
                {tekstOverrides.length} losse tekst-aanpassing
                {tekstOverrides.length === 1 ? "" : "en"} (knoppen, kopjes,
                lesteksten, etc.)
              </li>
              <li>
                {playbookOverrides.length} Sprint-dag-aanpassing
                {playbookOverrides.length === 1 ? "" : "en"} (titel,
                watJeLeert, faseDoel per dag)
              </li>
              <li>
                {scriptOverrides.length} script-aanpassing
                {scriptOverrides.length === 1 ? "" : "en"} (op /scripts)
              </li>
            </ul>
          </div>

          {tekstOverrides.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
                🪶 Tekst-aanpassingen
              </h2>
              <p className="text-cm-white opacity-60 text-xs mb-3 leading-relaxed">
                Per losse tekst gewijzigd via de ✍️ Bewerk-knop ergens op
                de site.
              </p>
              <OverridesLijst groepen={tekstGroepen} />
            </section>
          )}

          {playbookOverrides.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
                📖 Sprint-dag-aanpassingen
              </h2>
              <p className="text-cm-white opacity-60 text-xs mb-3 leading-relaxed">
                Dag-niveau aanpassingen aan Sprint-playbook (oude pad).
                Reset = terug naar code-standaard uit dagen.ts.
              </p>
              <PlaybookOverridesLijst rijen={playbookOverrides} />
            </section>
          )}

          {scriptOverrides.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
                📋 Script-aanpassingen
              </h2>
              <p className="text-cm-white opacity-60 text-xs mb-3 leading-relaxed">
                Aanpassingen aan de scripts op /scripts.
              </p>
              <ScriptOverridesLijst rijen={scriptOverrides} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
