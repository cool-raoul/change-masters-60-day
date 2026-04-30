import { createClient } from "@/lib/supabase/server";
import { Prospect } from "@/lib/supabase/types";
import { NamenlijstToggle } from "@/components/namenlijst/NamenlijstToggle";
import { OpenTestlinkKnop } from "@/components/namenlijst/OpenTestlinkKnop";
import { RealtimeProspectsRefresh } from "@/components/namenlijst/RealtimeProspectsRefresh";
import { ElevaGeheugen } from "@/components/namenlijst/ElevaGeheugen";
import { getServerTaal, v } from "@/lib/i18n/server";
import Link from "next/link";

export default async function NamenlijstPagina({
  searchParams,
}: {
  searchParams: { setup?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const taal = await getServerTaal();
  const vanuitSetup = searchParams.setup === "true";

  const [{ data: prospects }, { data: eigenProfiel }, { data: openHerinneringen }] =
    await Promise.all([
      supabase
        .from("prospects")
        .select("*")
        .eq("user_id", user.id)
        .eq("gearchiveerd", false)
        .order("updated_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single(),
      // Alle openstaande herinneringen die aan een prospect hangen, gesorteerd
      // op vervaldatum oplopend. Zo kunnen we per prospect de EERSTVOLGENDE
      // open herinnering bepalen — single source of truth ongeacht of die door
      // de voice-FAB, het prospect-form of de productadvies-vragenlijst werd
      // aangemaakt.
      supabase
        .from("herinneringen")
        .select("prospect_id, titel, vervaldatum")
        .eq("user_id", user.id)
        .eq("voltooid", false)
        .not("prospect_id", "is", null)
        .order("vervaldatum", { ascending: true }),
    ]);

  const ruweProspects = (prospects as Prospect[]) || [];
  const memberNaam = (eigenProfiel as any)?.full_name ?? "je member";

  // Map eerstvolgende open herinnering per prospect (eerste hit wint dankzij
  // ascending sort). Daarna mergen we die in elke prospect zodat de pipeline-
  // kaart en namenlijst altijd de actuele datum tonen.
  const eersteHerinneringPerProspect = new Map<
    string,
    { titel: string; vervaldatum: string }
  >();
  for (const h of (openHerinneringen ?? []) as Array<{
    prospect_id: string | null;
    titel: string;
    vervaldatum: string;
  }>) {
    if (!h.prospect_id) continue;
    if (!eersteHerinneringPerProspect.has(h.prospect_id)) {
      eersteHerinneringPerProspect.set(h.prospect_id, {
        titel: h.titel,
        vervaldatum: h.vervaldatum,
      });
    }
  }

  const alleProspects: Prospect[] = ruweProspects.map((p) => {
    const eerstvolgende = eersteHerinneringPerProspect.get(p.id);
    if (!eerstvolgende) return p;
    // Overschrijf de denormalized velden met de werkelijke eerstvolgende
    // open herinnering. Zo werkt de PipelineKanban (die deze velden leest)
    // automatisch met de live data zonder dat we hem hoeven aan te passen.
    return {
      ...p,
      volgende_actie_datum: eerstvolgende.vervaldatum,
      volgende_actie_notitie: eerstvolgende.titel,
    };
  });

  return (
    <div className="space-y-6">
      {/* Live: abonneer op wijzigingen aan prospects/herinneringen/etc en
          triggert auto-refresh wanneer er iets verandert (voice, form,
          drag-drop, productadvies-submit, etc.) */}
      <RealtimeProspectsRefresh userId={user.id} />

      {/* Banner: terug naar setup */}
      {vanuitSetup && (
        <Link
          href="/onboarding"
          className="flex items-center gap-3 bg-[#D4AF37]/15 border-2 border-[#D4AF37]/50 rounded-xl p-4 hover:bg-[#D4AF37]/20 transition-colors"
        >
          <span className="text-2xl">←</span>
          <div>
            <p className="text-[#D4AF37] font-bold text-sm">Terug naar de setup</p>
            <p className="text-cm-white text-xs opacity-70">Namen toegevoegd? Tik hier om verder te gaan met stap 4 →</p>
          </div>
        </Link>
      )}

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            {v("namenlijst.titel", taal)}
          </h1>
          <p className="text-cm-white mt-1">
            {alleProspects.length} {v("namenlijst.contacten_in_pipeline", taal)}
          </p>
        </div>
        <OpenTestlinkKnop memberNaam={memberNaam} />
      </div>

      <ElevaGeheugen />

      <NamenlijstToggle prospects={alleProspects} />
    </div>
  );
}
