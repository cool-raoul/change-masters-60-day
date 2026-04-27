import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPakkettenInCategorie,
  getResetPakket,
  type PakketCategorie,
  type PakketNiveau,
} from "@/lib/lifeplus/pakketten";
import { BEWUSTWORDING } from "@/lib/zelftest/bewustwording";
import { FASEN_UITLEG } from "@/lib/zelftest/fasen-uitleg";

// ============================================================
// Resultaatpagina van de productadvies-test
// URL: /test/[token]/resultaat
//
// Onderdelen:
//   1. Wat we zien (bewustwording)
//   2. Wat dat kan betekenen
//   3. Leefstijl-tips
//   4. Optionele opstart-suggestie (Darmen in Balans / Holistic Reset)
//   5. Pakket-advies in volgorde Complete → Plus → Essential
//      - 60-day route: alleen Complete prominent, andere klein eronder
//      - Reguliere route: alle drie naast elkaar, niveau-suggestie als badge
//   6. Bestelknop (member-link of fallback)
//   7. Spar-met-member knop
//   8. Disclaimer
// ============================================================

export const dynamic = "force-dynamic";

export default async function ResultaatPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: test, error } = await supabase
    .from("productadvies_tests")
    .select(
      "id, token, status, member_id, prospect_id, trigger_60day, geslacht, uitslag",
    )
    .eq("token", token)
    .single();

  if (error || !test) {
    notFound();
  }
  if (test.status !== "ingevuld" || !test.uitslag) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Deze test is nog niet ingevuld.{" "}
          <Link href={`/test/${token}`} className="text-emerald-600 underline">
            Vul de test eerst in.
          </Link>
        </p>
      </div>
    );
  }

  // Prospect-naam apart ophalen
  let prospectNaam: string | null = null;
  if (test.prospect_id) {
    const { data: prospect } = await supabase
      .from("prospects")
      .select("volledige_naam")
      .eq("id", test.prospect_id)
      .single();
    prospectNaam = prospect?.volledige_naam ?? null;
  }

  // Member-naam apart ophalen
  let memberNaam = "je member";
  if (test.member_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", test.member_id)
      .single();
    memberNaam = profile?.full_name ?? "je member";
  }

  const uitslag = test.uitslag as {
    categorie: PakketCategorie;
    categorieLabel: string;
    niveau: PakketNiveau;
    pakket_key: string;
    opstartSuggestie: "geen" | "darmen-in-balans" | "holistic-reset";
    fallback: boolean;
  };

  const trigger60day = test.trigger_60day as "ja" | "nee" | "weet_niet";
  const is60Day = trigger60day === "ja";

  const pakketten = getPakkettenInCategorie(uitslag.categorie);
  // UI volgorde: Complete bovenaan, Plus, Essential onderaan
  const niveauVolgorde: PakketNiveau[] = ["complete", "plus", "essential"];
  const gesorteerdePakketten = niveauVolgorde
    .map((niveau) => pakketten.find((p) => p.niveau === niveau))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const aanbevolenNiveau = uitslag.niveau;
  const bewustwording = BEWUSTWORDING[uitslag.categorie];

  // Opstart-suggestie (Darmen in Balans / Holistic Reset)
  const opstartPakket =
    uitslag.opstartSuggestie === "darmen-in-balans"
      ? getResetPakket("reset-darmen-basis")
      : uitslag.opstartSuggestie === "holistic-reset"
        ? getResetPakket("reset-holistic-m12")
        : null;

  // Member-bestellinks ophalen om bestelknoppen te vullen
  const { data: bestellinks } = await supabase
    .from("member_bestellinks")
    .select("pakket_key, url, label")
    .eq("user_id", test.member_id);

  const bestellinksMap = new Map(
    (bestellinks ?? []).map((b: any) => [b.pakket_key, b]),
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-6 text-center">
          <div className="text-emerald-600 text-sm font-medium uppercase tracking-wider">
            Jouw advies
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
            {prospectNaam ? `${prospectNaam.split(" ")[0]}, dit zien we voor jou` : "Dit zien we voor jou"}
          </h1>
          <p className="mt-3 text-gray-600">
            Op basis van wat je aangaf, ligt jouw zwaartepunt bij{" "}
            <strong>{uitslag.categorieLabel}</strong>.
          </p>
        </header>

        {/* Bewustwording */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Wat we zien
          </h2>
          <p className="text-gray-700 mb-5">{bewustwording.watWeZien}</p>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Wat dat kan betekenen
          </h2>
          <p className="text-gray-700 mb-5">{bewustwording.watDatKanBetekenen}</p>

          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Wat je zelf al kunt doen
          </h2>
          <ul className="space-y-2">
            {bewustwording.leefstijlTips.map((tip, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-gray-700 text-sm sm:text-base">{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Fasen-uitleg: traject, geen quick-fix */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {FASEN_UITLEG.introTitel}
          </h2>
          <p className="text-gray-700 mb-5">{FASEN_UITLEG.intro}</p>

          <h3 className="text-base font-semibold text-gray-900 mb-3">
            {FASEN_UITLEG.fasenTitel}
          </h3>
          <div className="space-y-3">
            {FASEN_UITLEG.fasen.map((fase, i) => (
              <div
                key={i}
                className="border-l-2 border-emerald-500 pl-4 py-1"
              >
                <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                  {fase.periode}
                </div>
                <div className="font-semibold text-gray-900 text-sm">
                  {fase.kop}
                </div>
                <div className="text-sm text-gray-600 mt-1">{fase.tekst}</div>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm text-gray-700 italic">
            {FASEN_UITLEG.afsluiter}
          </p>
        </section>

        {/* Optionele opstart-suggestie */}
        {opstartPakket && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 mb-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h2 className="text-lg font-semibold text-amber-900 mb-2">
                  Bijzonder advies voor jou
                </h2>
                <p className="text-sm text-amber-900 mb-3">
                  {uitslag.opstartSuggestie === "holistic-reset"
                    ? `Je geeft duidelijk aan dat je niet alleen een aanvulling zoekt, maar een echte verandering wilt aanpakken. Voor jouw situatie is de Holistic Reset (65 dagen, 4 fasen) een krachtig vertrekpunt voordat je met een pakket start.`
                    : `Veel mensen merken dat hun lichaam beter reageert op vervolgsupplementen na een 16-daagse darm-opfrissing. Dit kan een fijne start zijn voordat je met een pakket begint.`}
                </p>
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="font-semibold text-gray-900">
                    {opstartPakket.naam}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    €{opstartPakket.totaalPrijs.toFixed(2)} ASAP · {opstartPakket.totaalIP} IP · {opstartPakket.duurDagen} dagen
                  </div>
                  <div className="text-xs text-gray-500 mt-2 italic">
                    {opstartPakket.levensstijlAanpassing.split(".")[0]}.
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Pakket-advies */}
        <section className="mb-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {is60Day
              ? `Het 60 Day Run pakket dat bij je past`
              : `Pakketten die bij je passen`}
          </h2>
          {is60Day ? (
            <p className="text-sm text-gray-600 mb-4">
              Voor jouw aanpak werken we vanuit een fundament van ~200 IP. Dat
              levert gratis verzending op én een complete stack om in de
              komende weken resultaat te zien.
            </p>
          ) : (
            <p className="text-sm text-gray-600 mb-4">
              Drie niveaus om uit te kiezen. <strong>{niveauLabel(aanbevolenNiveau)}</strong>{" "}
              past het beste bij wat je aangaf, maar je kiest zelf wat past bij
              jouw situatie. Een niveau hoger of lager kan altijd, en je kunt
              later switchen.
            </p>
          )}

          <div className="space-y-4">
            {gesorteerdePakketten.map((p) => {
              const isAanbevolen = p.niveau === aanbevolenNiveau;
              const link = bestellinksMap.get(p.categorie + "-" + p.niveau);
              // 60-day route: alleen Complete prominent, Plus en Essential klein
              // Reguliere route: Essential klein (voor wie lichter wil starten),
              // Plus en Complete groot (Plus is de aanbevolen middenkeuze)
              const klein = is60Day
                ? p.niveau !== "complete"
                : p.niveau === "essential";
              return (
                <PakketCard
                  key={p.niveau}
                  pakket={p}
                  isAanbevolen={isAanbevolen}
                  bestellink={link}
                  memberNaam={memberNaam}
                  klein={klein}
                />
              );
            })}
          </div>
        </section>

        {/* Spar-met-member */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Wil je hierover sparren met {memberNaam}?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Soms helpt het om je advies eerst even door te spreken voordat je
            iets bestelt. {memberNaam} kijkt graag persoonlijk met je mee.
          </p>
          <button
            type="button"
            disabled
            className="w-full py-3 rounded-lg bg-gray-100 text-gray-500 font-medium cursor-not-allowed"
          >
            WhatsApp {memberNaam} (komt in dag 3)
          </button>
        </section>

        {/* Disclaimer */}
        <section className="bg-gray-50 rounded-2xl p-5 text-xs text-gray-600 leading-relaxed">
          <strong className="text-gray-700">Belangrijk om te weten</strong>
          <p className="mt-2">
            Dit advies is een algemene suggestie op basis van wat jij aangaf en
            is geen medisch advies. Lifeplus producten zijn voedingssupplementen,
            geen geneesmiddelen, en niet bedoeld om gezondheidsklachten te
            diagnosticeren, behandelen, genezen of voorkomen.
          </p>
          <p className="mt-2">
            Sta je onder behandeling van een arts, gebruik je medicatie, ben je
            zwanger of geef je borstvoeding? Bespreek dit advies dan eerst met je
            arts of apotheker voordat je iets nieuws start.
          </p>
        </section>
      </div>
    </div>
  );
}

function niveauLabel(n: PakketNiveau): string {
  return n === "complete" ? "Complete" : n === "plus" ? "Plus" : "Essential";
}

// ============================================================
// PakketCard
// ============================================================

function PakketCard({
  pakket,
  isAanbevolen,
  bestellink,
  memberNaam,
  klein,
}: {
  pakket: {
    naam?: string;
    niveau: PakketNiveau;
    categorieLabel: string;
    producten: { naam: string; asapPrijs: number; ip: number }[];
    totaalPrijs: number;
    totaalIP: number;
    gratisVerzending: boolean;
    waarom: string;
    resultaatTijdlijn?: string;
    notitie?: string;
  };
  isAanbevolen: boolean;
  bestellink: any;
  memberNaam: string;
  klein?: boolean;
}) {
  if (klein) {
    const isEssential = pakket.niveau === "essential";
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-baseline justify-between mb-1">
          <div className="font-semibold text-gray-800">
            {niveauLabel(pakket.niveau)}
            <span className="text-gray-500 font-normal text-sm ml-2">
              {pakket.categorieLabel}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-800">
            €{pakket.totaalPrijs.toFixed(2)}
            <span className="text-gray-500 font-normal ml-1">
              · {pakket.totaalIP} IP
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {isEssential
            ? "Voor wie lichter wil starten of een budget-vriendelijker instap zoekt."
            : "Ook beschikbaar als alternatief."}
        </p>
        {bestellink ? (
          <a
            href={bestellink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Bestel deze variant via {memberNaam}
          </a>
        ) : (
          <div className="mt-3 text-center text-xs text-gray-500">
            Vraag {memberNaam} om de bestellink van deze variant
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border-2 ${
        isAanbevolen
          ? "border-emerald-500 bg-emerald-50"
          : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">
            {niveauLabel(pakket.niveau)}
            {isAanbevolen && (
              <span className="ml-2 inline-block px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px]">
                Aanbevolen voor jou
              </span>
            )}
          </div>
          <div className="text-lg font-bold text-gray-900">
            {pakket.categorieLabel}
          </div>
        </div>
      </div>

      <div className="space-y-1 mt-3 mb-4">
        {pakket.producten.map((pr, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-700">{pr.naam}</span>
            <span className="text-gray-500">
              €{pr.asapPrijs.toFixed(2)} · {pr.ip} IP
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-3 flex justify-between items-center mb-3">
        <div className="font-bold text-gray-900">Totaal</div>
        <div className="text-right">
          <div className="font-bold text-gray-900">
            €{pakket.totaalPrijs.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            {pakket.totaalIP} IP ·{" "}
            {pakket.gratisVerzending
              ? "gratis verzending"
              : "+ €8,47 verzending"}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 italic">{pakket.waarom}</p>

      {pakket.notitie && (
        <p className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded">
          {pakket.notitie}
        </p>
      )}

      {bestellink ? (
        <a
          href={bestellink.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full text-center py-3 rounded-lg font-semibold ${
            isAanbevolen
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          Bestel via {memberNaam}
        </a>
      ) : (
        <div className="text-center py-3 rounded-lg bg-gray-100 text-gray-500 text-sm">
          Vraag {memberNaam} om je persoonlijke bestellink
        </div>
      )}
    </div>
  );
}
