import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MentorTrainenForm } from "./mentor-trainen-form";

// ============================================================
// /instellingen/mentor-trainen, alleen voor founders.
//
// Founder voegt vraag-antwoord-voorbeelden toe waarvan de Mentor leert.
// Bij elke vraag in /coach pakt ELEVA top-5 relevante voorbeelden en
// plakt ze als few-shot context in de system-prompt. Mentor matcht
// de toon en aanpak van de founders.
// ============================================================

export const dynamic = "force-dynamic";

export default async function MentorTrainenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profielRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isFounder =
    (profielRow as { role?: string | null } | null)?.role === "founder";
  if (!isFounder) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/instellingen"
          className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1"
        >
          ← Terug naar instellingen
        </Link>
        <div className="card border-l-4 border-amber-500">
          <p className="text-cm-white">
            Mentor-training is een founder-functie. Heb je een suggestie voor
            een goede reactie op een veelvoorkomende vraag? Stuur 'm naar je
            sponsor, die kan 'm in het systeem zetten.
          </p>
        </div>
      </div>
    );
  }

  const { data: voorbeelden } = await supabase
    .from("coach_voorbeelden")
    .select("*")
    .order("created_at", { ascending: false });

  type VoorbeeldRij = {
    id: string;
    categorie: string;
    vraag: string;
    goed_antwoord: string;
    tags: string[];
    actief: boolean;
    created_at: string;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/instellingen"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1"
      >
        ← Terug naar instellingen
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          🧠 Train de Mentor
        </h1>
        <p className="text-cm-white opacity-80 text-sm mt-2 leading-relaxed">
          Voeg vraag-antwoord-voorbeelden toe uit echte WhatsApp-gesprekken.
          De ELEVA Mentor leert direct van jouw aanpak en gebruikt de
          voorbeelden als context bij vragen van members. Werkt direct na
          opslaan, geen retraining nodig.
        </p>
      </div>

      <MentorTrainenForm />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          Bestaande voorbeelden ({voorbeelden?.length ?? 0})
        </h2>
        {(!voorbeelden || voorbeelden.length === 0) && (
          <p className="text-cm-white opacity-50 text-sm italic">
            Nog geen voorbeelden toegevoegd. Voeg er een toe via het formulier
            hierboven.
          </p>
        )}
        {(voorbeelden as VoorbeeldRij[] | null)?.map((v) => (
          <details
            key={v.id}
            className="card group"
          >
            <summary className="cursor-pointer list-none flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold/20 text-cm-gold font-bold">
                    {v.categorie}
                  </span>
                  {!v.actief && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-surface-2 text-cm-white opacity-60">
                      uit
                    </span>
                  )}
                  {v.tags.length > 0 && (
                    <span className="text-cm-white opacity-50 text-[11px]">
                      {v.tags.map((t) => `#${t}`).join(" ")}
                    </span>
                  )}
                </div>
                <p className="text-cm-white text-sm font-medium mt-1.5 line-clamp-2">
                  {v.vraag}
                </p>
              </div>
              <span className="text-cm-gold text-xs transition-transform group-open:rotate-180 flex-shrink-0">
                ▼
              </span>
            </summary>
            <div className="mt-3 pt-3 border-t border-cm-border space-y-2">
              <div>
                <p className="text-cm-gold text-[10px] font-semibold uppercase tracking-wider">
                  Vraag
                </p>
                <p className="text-cm-white text-sm whitespace-pre-wrap">
                  {v.vraag}
                </p>
              </div>
              <div>
                <p className="text-cm-gold text-[10px] font-semibold uppercase tracking-wider">
                  Goed antwoord
                </p>
                <p className="text-cm-white text-sm whitespace-pre-wrap leading-relaxed">
                  {v.goed_antwoord}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <form action="/api/mentor-trainen/toggle" method="post">
                  <input type="hidden" name="id" value={v.id} />
                  <input
                    type="hidden"
                    name="actief"
                    value={v.actief ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="text-cm-white opacity-60 hover:opacity-100 text-xs underline-offset-2 hover:underline"
                  >
                    {v.actief ? "Pauzeren" : "Activeren"}
                  </button>
                </form>
                <form action="/api/mentor-trainen/verwijder" method="post">
                  <input type="hidden" name="id" value={v.id} />
                  <button
                    type="submit"
                    className="text-red-400 opacity-70 hover:opacity-100 text-xs underline-offset-2 hover:underline"
                  >
                    🗑️ Verwijderen
                  </button>
                </form>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
