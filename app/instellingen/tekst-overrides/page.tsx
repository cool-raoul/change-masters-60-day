import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  OverridesLijst,
  type OverrideRij,
} from "@/components/instellingen/OverridesLijst";

// ============================================================
// /instellingen/tekst-overrides, founder-tool om alle actieve tekst-
// overrides te zien en te resetten naar de code-standaard.
//
// Waarom: zonder deze pagina is een founder-override "verborgen" zodra
// 'ie is gemaakt. Mijn (Claude's) code-aanpassingen aan de standaard
// komen daardoor niet zichtbaar. Met deze pagina kan founder per
// override beslissen: laat staan (eigen aanpassing wint) of resetten
// (mijn nieuwe standaard wordt zichtbaar).
//
// Sinds 2026-05-20 bedacht na de dag 2 watJeLeert-discussie waar de
// override de zichtbaarheid van een nieuwe slot-alinea blokkeerde.
// ============================================================

export const dynamic = "force-dynamic";

export default async function TekstOverridesPagina() {
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

  const { data: rijen } = await supabase
    .from("tekst_overrides")
    .select("namespace, sleutel, waarde, updated_at")
    .order("namespace", { ascending: true })
    .order("sleutel", { ascending: true });

  const overrides = (rijen ?? []) as OverrideRij[];

  // Groepeer per namespace, behoud server-volgorde binnen elke groep.
  const perNamespace = new Map<string, OverrideRij[]>();
  for (const r of overrides) {
    if (!perNamespace.has(r.namespace)) perNamespace.set(r.namespace, []);
    perNamespace.get(r.namespace)!.push(r);
  }
  const groepen = Array.from(perNamespace.entries());

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
          ✍️ Mijn tekst-overrides
        </h1>
        <p className="text-cm-white opacity-75 mt-2 leading-relaxed text-sm">
          Alle tekst-aanpassingen die jij via de ✍️ Bewerk-knop hebt gemaakt
          staan hier per namespace. Klik op "Toon" om de volledige tekst te
          zien. Klik op "Terug naar standaard" om een override te resetten,
          dan komt de code-tekst weer in beeld.
        </p>
        <p className="text-cm-white opacity-60 text-xs mt-2 leading-relaxed">
          Tip: als een nieuwe tekst van Claude er voor jou niet in komt,
          staat hier waarschijnlijk een override op die plek. Reset 'm en
          de nieuwe versie verschijnt.
        </p>
      </div>

      {overrides.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-cm-white opacity-70">
            Geen overrides actief. Alle teksten tonen de code-standaard.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-cm-gold/30 bg-cm-gold/5 px-4 py-3 text-sm text-cm-white opacity-90">
            <strong className="text-cm-gold">{overrides.length}</strong>{" "}
            actieve override{overrides.length === 1 ? "" : "s"} over{" "}
            <strong className="text-cm-gold">
              {perNamespace.size}
            </strong>{" "}
            namespace{perNamespace.size === 1 ? "" : "s"}.
          </div>
          <OverridesLijst groepen={groepen} />
        </>
      )}
    </div>
  );
}
