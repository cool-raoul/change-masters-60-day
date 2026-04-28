import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getPakkettenInCategorie,
  getResetPakket,
  type PakketCategorie,
  type PakketNiveau,
} from "@/lib/lifeplus/pakketten";
import { BEWUSTWORDING } from "@/lib/zelftest/bewustwording";
import { FASEN_UITLEG } from "@/lib/zelftest/fasen-uitleg";
import { PakketAccordionCard } from "./PakketAccordionCard";

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
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ debug?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const debug = sp.debug === "1";
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

  // Member-naam apart ophalen. Telefoon zit (nog) niet op profiles, dus
  // de WhatsApp-knop opent zonder ingebakken nummer — prospect zoekt zijn
  // member dan zelf op via zijn eigen telefoon-contacten of inboundkanaal.
  let memberNaam = "je member";
  if (test.member_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", test.member_id)
      .single();
    memberNaam = profile?.full_name ?? "je member";
  }

  // Auth-check: is dit de member die de test heeft verstuurd? Dan tonen we
  // een terug-knop naar de prospect-kaart. Anders (prospect): geen back-knop.
  let isMember = false;
  try {
    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();
    isMember = !!user && user.id === test.member_id;
  } catch (e) {
    isMember = false;
  }

  const uitslag = test.uitslag as {
    categorie: PakketCategorie;
    categorieLabel: string;
    niveau: PakketNiveau;
    pakket_key: string;
    opstartSuggestie: "geen" | "darmen-in-balans" | "holistic-reset";
    fallback: boolean;
  };

  // Darmvragenlijst-uitslag (optioneel) — als de prospect die al ingevuld
  // heeft, tonen we hier zijn bucket terug zodat hij niet opnieuw klikt.
  const { data: testFull } = await supabase
    .from("productadvies_tests")
    .select("darmvragenlijst_uitslag")
    .eq("id", test.id)
    .single();
  const darmUitslag = (testFull as any)?.darmvragenlijst_uitslag as
    | { bucket: "basis" | "plus"; bucket_label: string }
    | null;

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

  // Voor afvallen-categorie geldt een speciale narrative: de Holistic Reset
  // wordt ALTIJD prominent getoond, want de echte verandering komt uit
  // leefstijl, niet uit pillen alleen. Pakketten worden secundair getoond
  // ('als je liever niet met intensieve leefstijl-aanpassing aan de slag
  // wilt'). Geldt niet voor 60-day route — die heeft Complete als advies.
  const isAfvallen = uitslag.categorie === "afvallen-metabolisme";
  const afvallenLeefstijlEerst = isAfvallen && !is60Day;

  // Sterke opstart-suggestie (uit het algoritme)
  const opstartPakket =
    uitslag.opstartSuggestie === "darmen-in-balans"
      ? getResetPakket("reset-darmen-basis")
      : uitslag.opstartSuggestie === "holistic-reset"
        ? getResetPakket("reset-holistic-m12")
        : null;

  // Voor afvallen: forceer Holistic Reset als prominente eerste keuze.
  const afvallenHolisticPakket = afvallenLeefstijlEerst
    ? getResetPakket("reset-holistic-m12")
    : null;

  // Zachte algemene darm-aanbeveling: tonen als er geen sterke trigger is.
  // Niet tonen als afvallen-leefstijl-eerst van toepassing is, want dan
  // krijgen we al de Holistic Reset prominent.
  const toonAlgemeenDarmBlok =
    uitslag.opstartSuggestie === "geen" && !afvallenLeefstijlEerst;
  const algemeenDarmPakket = toonAlgemeenDarmBlok
    ? getResetPakket("reset-darmen-basis")
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
      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
        {/* Top-bar met navigatie. Alleen voor member zichtbaar. Prospect
            gebruikt browser-back. */}
        {isMember && test.prospect_id && (
          <div className="mb-4">
            <Link
              href={`/namenlijst/${test.prospect_id}`}
              className="inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-900 font-medium"
            >
              ← Terug naar prospect-kaart
            </Link>
          </div>
        )}

        {/* Header — categorie groot/dominant, intro klein */}
        <header className="mb-6 text-center">
          <div className="text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">
            Jouw advies
          </div>
          <p className="text-base text-gray-600 mb-2">
            {prospectNaam
              ? `${prospectNaam.split(" ")[0]}, op basis van wat je aangaf ligt je zwaartepunt bij:`
              : "Op basis van wat je aangaf ligt je zwaartepunt bij:"}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            {uitslag.categorieLabel}
          </h1>
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

        {/* Voor afvallen-categorie: Holistic Reset als prominente eerste keuze.
            Leefstijl is de kern, afvallen is het gevolg. */}
        {afvallenHolisticPakket && !opstartPakket && (
          <section className="bg-gradient-to-br from-emerald-50 to-amber-50 border-2 border-emerald-300 rounded-2xl p-5 sm:p-6 mb-5">
            <div className="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
              Onze eerste aanbeveling voor jou
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Leefstijl is de kern. Afvallen is het cadeautje.
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              Echt en blijvend afvallen lukt zelden met alleen supplementen of
              een dieet. Het lichaam moet zijn metabolisme weer leren omschakelen
              van suiker- naar vetverbranding, en daarbij is leefstijl de
              hoofdfactor. De <strong>Holistic Reset</strong> is een 65-dagen
              traject in 4 fases dat dit proces ondersteunt. Veel mensen die op
              andere manieren niet konden afvallen, vinden hier wél hun balans.
            </p>
            <div className="bg-white rounded-lg p-3 border border-emerald-200 mb-3">
              <div className="font-semibold text-gray-900">
                {afvallenHolisticPakket.naam}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                €{afvallenHolisticPakket.totaalPrijs.toFixed(2)} ASAP per maand
                · {afvallenHolisticPakket.totaalIP} IP per maand · 65 dagen
              </div>
              <div className="text-xs text-gray-500 mt-2 italic">
                3 maanden in totaal. Vraagt om een leefstijl-aanpassing tijdens
                het traject (calorie-tracking, vetvrije verzorging, geen suiker
                of bewerkte producten).
              </div>
            </div>
            <p className="text-xs text-emerald-800 italic">
              Vraag {memberNaam} om mee te kijken of dit traject bij jouw
              situatie past.
            </p>
          </section>
        )}

        {/* Sterke opstart-suggestie (Holistic Reset of Darmen prominent) */}
        {opstartPakket && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 mb-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-amber-900 mb-2">
                  {uitslag.opstartSuggestie === "holistic-reset"
                    ? "Een krachtige eerste stap voor jou"
                    : "Een goede start voor jouw lichaam"}
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
                    €{opstartPakket.totaalPrijs.toFixed(2)} · {opstartPakket.duurDagen} dagen
                  </div>
                  <div className="text-xs text-gray-500 mt-2 italic">
                    {opstartPakket.levensstijlAanpassing.split(".")[0]}.
                  </div>
                </div>
                {uitslag.opstartSuggestie === "darmen-in-balans" && (
                  <div className="mt-4 bg-white rounded-lg border-2 border-amber-300 p-4">
                    <div className="text-sm font-semibold text-amber-900 mb-1">
                      Welk programma past bij jou?
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Er zijn twee Darmen in Balans-programma's: <strong>basis</strong>{" "}
                      (16 dagen) en <strong>plus</strong> (uitgebreider). Doe de
                      korte vervolg-check om te zien welke voor jou het beste past.
                    </p>
                    {darmUitslag ? (
                      <div className="bg-amber-100 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
                        <strong>✓ Check ingevuld:</strong> {darmUitslag.bucket_label}
                        .{" "}
                        <Link
                          href={`/test/${token}/darm-keuze`}
                          className="underline hover:no-underline font-semibold"
                        >
                          Bekijk uitkomst
                        </Link>
                      </div>
                    ) : (
                      <Link
                        href={`/test/${token}/darm-keuze`}
                        className="block w-full text-center py-3 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700"
                      >
                        Doe de vervolg-check (15 vragen · 3 min)
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Algemene darm-aanbeveling (alleen als er geen sterke trigger is) */}
        {algemeenDarmPakket && (
          <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 sm:p-6 mb-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌿</span>
              <div>
                <h2 className="text-lg font-semibold text-emerald-900 mb-2">
                  De darmen: het tweede brein van je lichaam
                </h2>
                <p className="text-sm text-emerald-900 mb-2">
                  Onze darmen worden ook wel het tweede brein genoemd. Ze staan
                  in directe verbinding met je hele lichaam: hoe je je voelt,
                  hoe goed je voedingsstoffen opneemt, hoe je weerstand werkt,
                  zelfs je stemming.
                </p>
                <p className="text-sm text-emerald-900 mb-3">
                  Net zoals je auto regelmatig een APK krijgt, is een
                  opschoonmoment voor je lichaam slim om af en toe te doen. Een
                  16-daagse darm-opfrissing is daar een mooi moment voor: even
                  afvalstoffen lekker eruit, ruimte voor een fris startpunt.
                </p>
                <p className="text-sm text-emerald-900 mb-3">
                  Het advies hieronder werkt op zichzelf prima. Een darmprogramma
                  is geen voorwaarde, wel <strong>een raadzame aanvulling</strong>
                  {" "}als je het overweegt. Eventueel kan dat ook prima later, een
                  paar maanden na de start van je pakket.
                </p>
                <div className="mt-4 bg-white rounded-lg border-2 border-emerald-300 p-4">
                  <div className="text-sm font-semibold text-emerald-900 mb-1">
                    Welk programma past bij jou?
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    Er zijn twee Darmen in Balans-programma's:{" "}
                    <strong>basis</strong> (16 dagen) en <strong>plus</strong>{" "}
                    (uitgebreider). Doe de korte vervolg-check om te zien welke
                    voor jou het beste past.
                  </p>
                  {darmUitslag ? (
                    <div className="bg-emerald-100 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-900">
                      <strong>✓ Check ingevuld:</strong>{" "}
                      {darmUitslag.bucket_label}.{" "}
                      <Link
                        href={`/test/${token}/darm-keuze`}
                        className="underline hover:no-underline font-semibold"
                      >
                        Bekijk uitkomst
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={`/test/${token}/darm-keuze`}
                      className="block w-full text-center py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                    >
                      Doe de vervolg-check (15 vragen · 3 min)
                    </Link>
                  )}
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
              : afvallenLeefstijlEerst
                ? `Of, zonder leefstijl-aanpassing: deze pakketten`
                : `Pakketten die bij je passen`}
          </h2>
          {is60Day ? (
            <p className="text-sm text-gray-600 mb-4">
              Voor jouw aanpak werken we met een complete stack zodat je in de
              komende weken resultaat ziet. Tik op een kaart om te zien wat
              erin zit.
            </p>
          ) : afvallenLeefstijlEerst ? (
            <p className="text-sm text-gray-600 mb-4">
              Wil je liever niet (of nog niet) met intensieve leefstijl-
              aanpassingen aan de slag? Dan zijn dit drie pakketten die je
              metabolisme én bloedsuiker dagelijks ondersteunen, met{" "}
              <strong>{niveauLabel(aanbevolenNiveau)}</strong> als beste match
              voor wat je aangaf. Tik op een kaart om te zien wat erin zit.
            </p>
          ) : (
            <p className="text-sm text-gray-600 mb-4">
              Drie niveaus om uit te kiezen.{" "}
              <strong>{niveauLabel(aanbevolenNiveau)}</strong> past het beste
              bij wat je aangaf, maar je kiest zelf wat past bij jouw situatie.
              Tik op een kaart om te zien wat erin zit.
            </p>
          )}

          <div className="space-y-3">
            {gesorteerdePakketten.map((p) => {
              const isAanbevolen = p.niveau === aanbevolenNiveau;
              const link = bestellinksMap.get(p.categorie + "-" + p.niveau);
              return (
                <PakketAccordionCard
                  key={p.niveau}
                  pakket={{
                    niveau: p.niveau,
                    niveauLabel: niveauLabel(p.niveau),
                    categorieLabel: p.categorieLabel,
                    producten: p.producten.map((pr) => ({
                      naam: pr.naam,
                      asapPrijs: pr.asapPrijs,
                    })),
                    totaalPrijs: p.totaalPrijs,
                    gratisVerzending: p.gratisVerzending,
                    waarom: p.waarom,
                    notitie: p.notitie,
                  }}
                  isAanbevolen={isAanbevolen}
                  bestellink={link as { url: string } | undefined}
                  memberNaam={memberNaam}
                  defaultOpen={isAanbevolen}
                />
              );
            })}
          </div>
        </section>

        {/* Member krijgt automatisch een herinnering bij submit. Geen
            verzend-knop voor de prospect — verlaagt de drempel. */}
        <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 sm:p-6 mb-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <h2 className="text-base font-semibold text-emerald-900 mb-1">
                {memberNaam} ziet je advies automatisch
              </h2>
              <p className="text-sm text-emerald-900">
                Je hoeft niets meer te doen. {memberNaam} krijgt direct een
                melding dat je de vragenlijst hebt ingevuld en neemt zelf
                contact met je op om dit samen door te spreken.
              </p>
            </div>
          </div>
        </section>

        {/* Vragenlijst opnieuw invullen — staat onderaan zodat het niet vaste
            actie is, maar wel beschikbaar als de prospect zich bedacht heeft. */}
        <section className="text-center mb-5">
          <Link
            href={`/test/${token}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            Toch iets anders aanvinken? Vul de vragenlijst opnieuw in
          </Link>
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
