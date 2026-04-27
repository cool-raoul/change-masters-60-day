import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  LIFEPLUS_PAKKETTEN,
  LIFEPLUS_RESET_PAKKETTEN,
  type PakketCategorie,
  type PakketNiveau,
} from "@/lib/lifeplus/pakketten";
import { CATEGORIE_LABEL } from "@/lib/zelftest/vragen";
import { BestellinkRow } from "./bestellink-row";

// ============================================================
// Settings — Mijn bestellinks
// URL: /instellingen/bestellinks
//
// Member kan per pakket een Lifeplus webshop-link plakken.
// Resultaatpagina van een test gebruikt deze om de bestelknop
// te vullen met een gevuld winkelwagentje van de member.
//
// Dag 2: fundament — toon lijst van alle pakket-keys + URL-veld per stuk.
// Dag 3: CRUD met save/delete + custom-keys voor maatwerk-adviezen.
// ============================================================

export const dynamic = "force-dynamic";

export default async function BestellinksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: bestellinks } = await supabase
    .from("member_bestellinks")
    .select("id, pakket_key, label, url, is_custom, updated_at")
    .eq("user_id", user.id);

  const linksMap = new Map(
    (bestellinks ?? []).map((b: any) => [b.pakket_key, b]),
  );

  // Categorie-pakketten gegroepeerd per categorie
  const categorieën: PakketCategorie[] = [
    "energie-focus",
    "stress-slaap",
    "afvallen-metabolisme",
    "hormoonbalans",
    "mannen-hormoonbalans",
    "sport-performance",
    "high-performance",
  ];

  const niveauVolgorde: PakketNiveau[] = ["complete", "plus", "essential"];

  const customLinks = (bestellinks ?? []).filter((b: any) => b.is_custom);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <header className="mb-6">
        <Link
          href="/instellingen"
          className="text-sm text-emerald-600 hover:underline"
        >
          ← Terug naar instellingen
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Mijn bestellinks
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Hier plak je per pakket de Lifeplus webshop-link met een gevuld
          winkelwagentje. Op het advies dat een prospect ziet, verschijnt jouw
          link automatisch als bestelknop.
        </p>
      </header>

      {/* Uitleg-blok */}
      <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
        <h2 className="text-base font-semibold text-emerald-900 mb-2">
          Hoe maak je een bestellink?
        </h2>
        <ol className="space-y-2 text-sm text-emerald-900">
          <li>
            <strong>1.</strong> Open je Lifeplus webshop (eigen subdomain).
          </li>
          <li>
            <strong>2.</strong> Voeg de producten van het pakket toe aan je
            winkelwagen.
          </li>
          <li>
            <strong>3.</strong> Kopieer de URL van je gevulde winkelwagen.
          </li>
          <li>
            <strong>4.</strong> Plak die hier bij het juiste pakket.
          </li>
        </ol>
        <p className="text-xs text-emerald-800 mt-3 italic">
          Zonder bestellinks ziet de prospect een fallback "Vraag mij voor de
          bestellink" knop. Met bestellinks: directe bestelknop.
        </p>
      </section>

      {/* Reset-pakketten */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Reset-pakketten
        </h2>
        <div className="space-y-3">
          {LIFEPLUS_RESET_PAKKETTEN.map((reset) => (
            <BestellinkRow
              key={reset.key}
              pakketKey={reset.key}
              naam={reset.naam}
              prijs={reset.totaalPrijs}
              ip={reset.totaalIP}
              huidige={linksMap.get(reset.key)}
            />
          ))}
        </div>
      </section>

      {/* Categorie-pakketten */}
      {categorieën.map((cat) => {
        const pakkettenInCat = niveauVolgorde
          .map((niveau) =>
            LIFEPLUS_PAKKETTEN.find(
              (p) => p.categorie === cat && p.niveau === niveau,
            ),
          )
          .filter((p): p is NonNullable<typeof p> => !!p);

        if (pakkettenInCat.length === 0) return null;

        return (
          <section key={cat} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {CATEGORIE_LABEL[cat]}
            </h2>
            <div className="space-y-3">
              {pakkettenInCat.map((p) => {
                const key = `${p.categorie}-${p.niveau}`;
                return (
                  <BestellinkRow
                    key={key}
                    pakketKey={key}
                    naam={`${niveauLabel(p.niveau)} — ${p.categorieLabel}`}
                    prijs={p.totaalPrijs}
                    ip={p.totaalIP}
                    huidige={linksMap.get(key)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Custom links */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Maatwerk-bestellinks
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Voor adviezen die niet uit een standaard pakket komen (bijvoorbeeld
          maatwerk via ELEVA Mentor) kun je hier eigen bestellinks toevoegen.
        </p>
        {customLinks.length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            Nog geen maatwerk-links. Komt in dag 3.
          </div>
        ) : (
          <div className="space-y-3">
            {customLinks.map((b: any) => (
              <BestellinkRow
                key={b.id}
                pakketKey={b.pakket_key}
                naam={b.label}
                prijs={null}
                ip={null}
                huidige={b}
                isCustom
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function niveauLabel(n: PakketNiveau): string {
  return n === "complete" ? "Complete" : n === "plus" ? "Plus" : "Essential";
}
