import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DAGEN } from "@/lib/playbook/dagen";
import { DagEditor } from "./dag-editor";

// ============================================================
// /instellingen/playbook — founder-only editor voor de 21-daagse
// teaching-content. Wijzigingen worden direct (zonder code-deploy)
// zichtbaar voor alle members.
// ============================================================

export const dynamic = "force-dynamic";

export default async function PlaybookEditorPagina() {
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

  const rol = (profiel as { role?: string | null } | null)?.role ?? "";

  if (rol !== "founder") {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Link href="/instellingen" className="btn-secondary text-sm">
          ← Terug naar instellingen
        </Link>
        <div className="card border-l-4 border-amber-500">
          <p className="text-cm-white">
            Deze pagina is alleen voor founders. Heb je een wijziging die je
            graag in het playbook wilt zien? Geef het door aan je sponsor — die
            kan het richting de hoofdbeheerder leggen.
          </p>
        </div>
      </div>
    );
  }

  // Haal alle bestaande overrides op voor de 21 dagen.
  // Als de tabel nog niet bestaat (SQL niet gedraaid): val terug op
  // een lege map en toon een waarschuwing, in plaats van crashen.
  type OverrideRij = {
    dag_nummer: number;
    titel: string | null;
    wat_je_leert: string | null;
    fase_doel: string | null;
    waarom_werkt_dit_tekst: string | null;
    waarom_werkt_dit_bron: string | null;
    updated_at: string;
  };

  let overrides: OverrideRij[] | null = null;
  let tabelOntbreekt = false;
  try {
    const { data, error } = await supabase
      .from("playbook_overrides")
      .select(
        "dag_nummer, titel, wat_je_leert, fase_doel, waarom_werkt_dit_tekst, waarom_werkt_dit_bron, updated_at",
      )
      .order("dag_nummer", { ascending: true });
    if (error) {
      tabelOntbreekt = true;
    } else {
      overrides = data as OverrideRij[];
    }
  } catch {
    tabelOntbreekt = true;
  }

  const overrideMap = new Map<number, OverrideRij>();
  for (const o of overrides || []) {
    overrideMap.set(o.dag_nummer, o);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            ✍️ Playbook bewerken
          </h1>
          <p className="text-cm-white opacity-60 mt-1">
            Founder-only. Aanpassingen die je hier maakt zijn ONMIDDELLIJK
            zichtbaar voor alle members. Wat je leeg laat, gebruikt de
            standaard tekst uit de code.
          </p>
        </div>
        <Link href="/instellingen" className="btn-secondary text-sm">
          ← Terug
        </Link>
      </div>

      {tabelOntbreekt && (
        <div className="card border-l-4 border-amber-500 space-y-2">
          <h2 className="text-amber-400 font-semibold">
            ⚠️ Database-tabel ontbreekt
          </h2>
          <p className="text-cm-white text-sm leading-relaxed">
            De tabel <code>playbook_overrides</code> bestaat nog niet. Voer de
            SQL uit{" "}
            <code className="text-xs bg-cm-surface-2 px-1.5 py-0.5 rounded">
              lib/supabase/migrations/playbook_overrides.sql
            </code>{" "}
            in de Supabase SQL Editor. Tot die tijd kun je de teksten hier wel
            bewerken, maar het opslaan zal mislukken.
          </p>
        </div>
      )}

      <div className="card border-gold-subtle">
        <h2 className="text-cm-gold font-semibold mb-2">Hoe het werkt</h2>
        <ul className="text-cm-white text-sm space-y-1.5 opacity-90">
          <li>
            • Per dag kun je 4 velden bewerken: <strong>titel</strong>,
            <strong> teaching</strong> ('Wat je leert'),
            <strong> fase-doel</strong>, en
            <strong> 'Waarom dit werkt'</strong>.
          </li>
          <li>
            • Lege velden = standaard tekst uit de code blijft zichtbaar voor
            members.
          </li>
          <li>
            • Wijzigingen zijn ONMIDDELLIJK live, zonder dat ik (de developer)
            iets hoef te doen.
          </li>
          <li>
            • Per dag staat een 'Terug naar standaard'-knop die jouw override
            verwijdert en de oorspronkelijke tekst herstelt.
          </li>
          <li>
            • <strong>Niet aanpasbaar via deze pagina:</strong> de checklist
            (taken), Waar-in-ELEVA-paden en inline-acties — die zijn structureel
            en hangen vast aan de logica. Daarvoor stuur je een wijzigverzoek
            naar de hoofdbeheerder.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        {DAGEN.map((dag) => (
          <DagEditor
            key={dag.nummer}
            dag={dag}
            override={overrideMap.get(dag.nummer) ?? null}
          />
        ))}
      </div>
    </div>
  );
}
