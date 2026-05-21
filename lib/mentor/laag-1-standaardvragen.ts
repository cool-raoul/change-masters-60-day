// File: lib/mentor/laag-1-standaardvragen.ts
//
// Laag 1 van drie-laags Mentor-architectuur. Trefwoord-matcher die
// een inkomende vraag probeert te koppelen aan een vooraf-geredigeerd
// antwoord uit de standaardvragen-tabel. Returnt null bij geen match,
// dan zakt het door naar Laag 2 (AI-Mentor).

import { createClient } from "@/lib/supabase/server";

export type StandaardvraagMatch = {
  id: string;
  antwoord: string;
  categorie: "bezwaar" | "product" | "business" | "praktisch" | "persoonlijk";
};

/** Normaliseert tekst voor trefwoord-matching: lowercase, leestekens weg. */
function normaliseer(tekst: string): string {
  return tekst.toLowerCase().replace(/[^\w\sàáâäèéêëìíîïòóôöùúûü]/g, " ").trim();
}

/**
 * Zoek de beste standaard-vraag-match. Strategie: trefwoord-overlap.
 * Trefwoorden zijn in DB lowercase opgeslagen. Match-score = aantal
 * gevonden trefwoorden in de vraag. Hoogste score boven drempel wint.
 */
export async function vindStandaardvraag(
  vraag: string,
  modus: "sprint" | "core" | "pro",
  drempel = 2,
): Promise<StandaardvraagMatch | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("standaardvragen")
      .select("id, vraag_patroon, trefwoorden, antwoord, categorie, modus")
      .eq("actief", true);

    if (!data || data.length === 0) return null;

    const genormaliseerd = normaliseer(vraag);
    let beste: StandaardvraagMatch | null = null;
    let besteScore = drempel - 1;

    for (const rij of data) {
      const r = rij as {
        id: string;
        trefwoorden: string[];
        antwoord: string;
        categorie: StandaardvraagMatch["categorie"];
        modus: string[];
      };
      if (!r.modus.includes(modus)) continue;
      const score = r.trefwoorden.filter((tw) =>
        genormaliseerd.includes(tw.toLowerCase()),
      ).length;
      if (score > besteScore) {
        besteScore = score;
        beste = { id: r.id, antwoord: r.antwoord, categorie: r.categorie };
      }
    }

    return beste;
  } catch {
    return null;
  }
}
