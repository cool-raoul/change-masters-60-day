// File: app/core-v9/structuur/page.tsx
//
// Founder-only structuur-overzicht van alle 21 Core V6-ankerstappen.
// Bedoeld voor Raoul + Gaby om in één scherm de volgorde en compleetheid
// te beoordelen voordat we substep-teksten gaan verrijken. Bevat Claude's
// observaties bovenaan met openstaande discussiepunten.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isCoreV9Actief } from "@/lib/feature-flags/core-v9";
import { CORE_V9_STAPPEN } from "@/lib/playbook/core-dagen-v9";

export const dynamic = "force-dynamic";

const FASE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Fundament (Stap 1 t/m 5)",
  2: "In beweging (Stap 6 t/m 14)",
  3: "Business-ritme (Stap 15 t/m 21)",
  4: "Doorgaande fase",
};

type Observatie = {
  titel: string;
  signaal: string;
  voorstel: string;
  ernst: "denk-richting" | "wel-overwegen" | "belangrijk";
  /** Waar komt deze observatie vandaan? */
  herkomst:
    | "sprint-volgorde-principe" // Sprint heeft een doordachte volgorde die ook in Core relevant is
    | "core-specifiek" // Iets dat Sprint niet kent, Core-eigen behoefte
    | "sprint-idee-mogelijk" // Sprint heeft iets dat in Core óók waardevol kan zijn (geen must)
    | "kennisbank-basis"; // Bron is de Core-kennisbank, niet Sprint
};

const OBSERVATIES: Observatie[] = [
  {
    titel: "Bezwaren-skills (Stap 14) ligt na de eerste 3-weg (Stap 11)",
    signaal:
      "Sprint heeft bezwaren-skills op DAG 5, ruim VOOR 3-weg-meesterclass (dag 9) en eerste 3-weg (dag 10). In V6 staat het op stap 14, NA de eerste 3-weg. Je doet je eerste 3-weg zonder voorbereiding op de meest voorkomende bezwaren.",
    voorstel:
      "Bezwaren-skills verplaatsen naar Stap 5 of 6 (ruim VOOR 3-weg-meesterclass). 3-weg-meesterclass schuift dan naar Stap 11, eerste 3-weg naar Stap 12.",
    ernst: "belangrijk",
    herkomst: "sprint-volgorde-principe",
  },
  {
    titel: "Pre-post + reactie-flow staat te laat (Stap 6) en mist substeps",
    signaal:
      "In de Core-kennisbank zit pre-post al in stap 1 van de eerste 2 uur. In V6 staat 'm op ankerstap 6, na productkennis en webshop-pivot. Plus alle reactie-vervolg-acties (reactie-script, reageren binnen uur, prospect naar Mini-ELEVA, film doorsturen) zijn niet als substeps gebouwd. Bij Stories, Brookes, eerste uitnodigingen geldt hetzelfde: reacties brengen substeps mee die nu niet bestaan.",
    voorstel:
      "Pre-post-flow eerder plaatsen (Stap 2 of 3) en uitsplitsen in substeps: voorbereiding lezen, tekst schrijven, upline-check ('puntjes op de i'), plaatsen, reactie-script-klaarzetten, reageren-routine. 21-dagen-post houden we op Stap 15 (komt 21 dagen na pre-post). Bij alle post-stappen vaste substeps 'reactie-script klaarzetten' + 'reageer binnen 1 uur' + 'stuur film' + 'prospect toevoegen aan Mini-ELEVA'.",
    ernst: "belangrijk",
    herkomst: "core-specifiek",
  },
  {
    titel: "Follow-up als concept zit versplinterd in V6 (vergelijk Sprint dag 6 + 15)",
    signaal:
      "Sprint heeft follow-up TWEE keer expliciet: dag 6 (24-48u-regel) en dag 15 (ritme-week). In V6 zit follow-up alleen op Stap 17 (opvolg-routine) en is het laat in het pad. Het volgorde-principe 'fortuin in de follow-up + 24-48u-regel' is universeel.",
    voorstel:
      "Follow-up-substeps toevoegen bij vroege ankerstappen (rond Stap 6-7, 24-48u-regel) en Stap 17 behouden als ritme-stap. Niet noodzakelijk twee aparte ankerstappen zoals Sprint, wel het PRINCIPE vroeg in beeld brengen.",
    ernst: "belangrijk",
    herkomst: "sprint-volgorde-principe",
  },
  {
    titel: "FORM-vragen mogelijk te vroeg in Stap 2",
    signaal:
      "Sprint heeft FORM-vragen pas op dag 13 als eigen dag, na alle basis (lijst, uitnodigen, bezwaren, 3-weg, follow-up). In V6 zit FORM in Stap 2, samen met top-20 opbouwen. Risico: FORM-context invullen vóór je echt weet welke contacten in beeld blijven, is investering die je later opnieuw moet doen.",
    voorstel:
      "Stap 2 alleen top-20 lijst opbouwen (zonder FORM). FORM-verdieping rond Stap 12-13 plaatsen, als eigen ankerstap, na de eerste echte 3-weg-ervaring.",
    ernst: "wel-overwegen",
    herkomst: "sprint-volgorde-principe",
  },
  {
    titel: "Edification mogelijk te vroeg, nu substep onder 3-weg-meesterclass",
    signaal:
      "Sprint heeft edification als eigen dag op DAG 18, na alle 3-weg-praktijk. In V6 zit edification als kleine substep onder Stap 10. Je schrijft een edification-zin VOOR je weet wat in praktijk werkt om je sponsor te introduceren. Vergelijkbaar volgorde-issue als bezwaren-skills.",
    voorstel:
      "Edification eigen ankerstap rond Stap 17-18, na meerdere 3-wegs. Stap 10 (3-weg-meesterclass) houden bij het PRINCIPE van edification, niet bij het schrijven van je eigen zin.",
    ernst: "wel-overwegen",
    herkomst: "sprint-volgorde-principe",
  },
  {
    titel: "Verdienmodel-basis (Stap 5) mogelijk te vroeg, basic-understanding-principe",
    signaal:
      "Eric Worre noemt het basic-understanding: snap zelf hoe je verdient voor je gesprekken voert. V6 heeft het op Stap 5 (Fundament). In praktijk vragen prospects pas tijdens de eerste 3-weg iets over verdienmodel. Stap 5 = te vroeg, niet vers in hoofd op moment dat het nodig is.",
    voorstel:
      "Verdienmodel-basis verschuiven naar rond Stap 9-10 (vlak voor de eerste 3-weg-meesterclass), zodat de les vers zit op het moment dat 'ie gevraagd wordt.",
    ernst: "wel-overwegen",
    herkomst: "kennisbank-basis",
  },
  {
    titel: "Pipeline / trechter-check ontbreekt in V6 (Sprint heeft dit dag 19)",
    signaal:
      "Sprint heeft op dag 19 een eigen reflectie-moment 'waar lekt je trechter?'. In Core is dit nóg waardevoller, omdat je via social media + freebies + klantomgeving meer instroom-bronnen hebt en patronen herkennen helpt om te focussen waar het werkt.",
    voorstel:
      "Pipeline-check ankerstap toevoegen rond Stap 18-19, met namenlijst-statuses + klantomgeving-overview + freebie-opt-in-cijfers. Mentor helpt patronen herkennen.",
    ernst: "wel-overwegen",
    herkomst: "sprint-idee-mogelijk",
  },
  {
    titel: "Drie verhalen (Stap 8) kan parallel aan webshop-pivot (Stap 4)",
    signaal:
      "Stap 4 schrijft de webshop-zin in jouw stem. Stap 8 schrijft drie verhalen (persoonlijk/product/business) ook in jouw stem. Twee stem-leermomenten los van elkaar kan voelen als twee keer iets nieuws beginnen. Sprint heeft 'drie verhalen' niet, dit is Core-eigen.",
    voorstel:
      "Drie verhalen verplaatsen naar Stap 5 (direct na webshop-pivot), of als ankerblok bij Stap 4 zelf. Webshop-zin + drie verhalen samen leren als één stem-blok.",
    ernst: "denk-richting",
    herkomst: "core-specifiek",
  },
  {
    titel: "One-pager / presentatie-keuze (Sprint dag 11) hoeft niet 1-op-1",
    signaal:
      "Sprint heeft 'one-pager of presentatie?' op dag 11 als bewuste keuze. In Core is de webshop het primaire frame en Mini-ELEVA het opvolg-pad. De one-pager-traditie past minder bij Core. Sprint-idee, niet per se nodig in Core.",
    voorstel:
      "Niet kopiëren. Eventueel als optionele substep onder de 3-weg-meesterclass: 'welke vorm van info werkt voor deze prospect, live 3-weg, Mini-ELEVA, of doorsturen van een film'.",
    ernst: "denk-richting",
    herkomst: "sprint-idee-mogelijk",
  },
];

// Sprint-volgorde als referentie. Door op /core-v9/structuur direct te zien
// welke Sprint-dag inhoudelijk overlapt met welke V6-ankerstap.
const SPRINT_REFERENTIE: Array<{
  dag: number;
  sprint: string;
  v6Match: string;
}> = [
  { dag: 1, sprint: "🚀 Welkom + fundament", v6Match: "Stap 1, vergelijkbaar" },
  { dag: 2, sprint: "👋 Open je hoofd, alle namen op de lijst", v6Match: "Stap 2 (top-20)" },
  { dag: 3, sprint: "📱 Socials goudmijn, 3 namen + 5 invites", v6Match: "(ontbreekt in V6)" },
  { dag: 4, sprint: "💬 Uitnodigen, 4 stappen die werken", v6Match: "Stap 4 (webshop-pivot)" },
  { dag: 5, sprint: "🛡️ Bezwaren, Feel-Felt-Found", v6Match: "Stap 14 (te laat in V6)" },
  { dag: 6, sprint: "🔄 Fortuin in follow-up, 24-48u", v6Match: "(versplinterd in V6)" },
  { dag: 7, sprint: "🎉 Week 1 reflectie", v6Match: "(ontbreekt expliciet)" },
  { dag: 8, sprint: "🚀 Snelheid wint van perfectie", v6Match: "(impliciet in V6)" },
  { dag: 9, sprint: "💪 3-weg-meesterclass, 5 stappen", v6Match: "Stap 10" },
  { dag: 10, sprint: "🤝 Eerstvolgende 3-weg starten", v6Match: "Stap 11" },
  { dag: 11, sprint: "🎯 One-pager of presentatie?", v6Match: "(ontbreekt in V6)" },
  { dag: 12, sprint: "🔄 Nee op business? Bied webshop", v6Match: "(impliciet in Core, want webshop = frame)" },
  { dag: 13, sprint: "🎙️ FORM in 5 minuten", v6Match: "Stap 2 (te vroeg in V6)" },
  { dag: 14, sprint: "🏁 Week 2 review", v6Match: "(ontbreekt expliciet)" },
  { dag: 15, sprint: "⏱️ Follow-up ritme-week", v6Match: "Stap 17" },
  { dag: 16, sprint: "🎯 5 types prospects", v6Match: "Stap 18" },
  { dag: 17, sprint: "🎯 Closing met DTT", v6Match: "Stap 19 (closingsvraag)" },
  { dag: 18, sprint: "✨ Edification eigen ankerstap", v6Match: "Stap 10 substep (te vroeg in V6)" },
  { dag: 19, sprint: "🔍 Pipeline-check", v6Match: "(ontbreekt in V6)" },
  { dag: 20, sprint: "💪 Vraag de beslissing", v6Match: "Stap 19 (mogelijk samen met closing)" },
  { dag: 21, sprint: "🏆 21 dagen reflectie", v6Match: "Stap 21" },
];

export default async function CoreV9StructuurPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v6Actief = await isCoreV9Actief(user.id);
  if (!v6Actief) redirect("/vandaag");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder =
    (profile as { role?: string } | null)?.role === "founder";
  if (!isFounder) redirect("/core-v9");

  const fasen: Array<{
    fase: 1 | 2 | 3;
    stappen: typeof CORE_V9_STAPPEN;
  }> = [
    { fase: 1, stappen: CORE_V9_STAPPEN.filter((s) => s.fase === 1) },
    { fase: 2, stappen: CORE_V9_STAPPEN.filter((s) => s.fase === 2) },
    { fase: 3, stappen: CORE_V9_STAPPEN.filter((s) => s.fase === 3) },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-cm-white">
      <header className="mb-8">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Founder-overzicht · Core V6
        </p>
        <h1 className="font-serif-warm text-3xl text-cm-white mt-2">
          Structuur-check van de 21 ankerstappen
        </h1>
        <p className="mt-3 text-cm-muted text-sm leading-relaxed">
          Loop in een keer de volgorde door. Scan per stap titel + doel + substeps,
          en vink mentaal af of het klopt voor Core. Mijn observaties staan
          hieronder, dan de volledige 21 stappen.
        </p>
      </header>

      {/* Mijn observaties */}
      <section className="mb-10 card border-cm-gold/40">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-2">
          🔎 Mijn observaties ({OBSERVATIES.length})
        </h2>
        <p className="text-cm-muted text-xs leading-relaxed mb-4">
          <strong className="text-cm-white/80">Belangrijk:</strong> Sprint en
          Core zijn verschillende paden. Sprint draait om dagelijks namen
          toevoegen + uitnodigen. Core is breder met social media, freebies,
          klantomgeving. Per observatie staat met een tag waar 'ie vandaan
          komt: <em>sprint-volgorde-principe</em> (universele les),{" "}
          <em>core-specifiek</em> (Core-eigen behoefte),{" "}
          <em>kennisbank-basis</em> (Core-bron), of <em>sprint-idee-mogelijk</em>{" "}
          (Sprint heeft iets dat in Core óók waardevol kan zijn, geen must).
        </p>
        <ol className="space-y-5">
          {OBSERVATIES.map((o, i) => {
            const ernstColor =
              o.ernst === "belangrijk"
                ? "text-amber-400"
                : o.ernst === "wel-overwegen"
                  ? "text-cm-gold/80"
                  : "text-cm-muted";
            const herkomstColor =
              o.herkomst === "sprint-volgorde-principe"
                ? "bg-cm-gold/15 text-cm-gold border-cm-gold/40"
                : o.herkomst === "core-specifiek"
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                  : o.herkomst === "kennisbank-basis"
                    ? "bg-sky-500/15 text-sky-300 border-sky-500/40"
                    : "bg-cm-muted/15 text-cm-muted border-cm-muted/40";
            return (
              <li
                key={i}
                className="border-l-2 border-cm-gold/30 pl-4 space-y-1.5"
              >
                <div className="flex items-start gap-2">
                  <span className="text-cm-gold font-bold flex-shrink-0">
                    {i + 1}.
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-cm-white font-medium text-sm">
                        {o.titel}
                      </h3>
                      <span className={`text-xs uppercase ${ernstColor}`}>
                        {o.ernst}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider border rounded px-1.5 py-0.5 ${herkomstColor}`}
                      >
                        {o.herkomst}
                      </span>
                    </div>
                    <p className="text-cm-muted text-xs leading-relaxed mt-1">
                      <span className="font-semibold text-cm-white/80">
                        Wat ik zie:
                      </span>{" "}
                      {o.signaal}
                    </p>
                    <p className="text-cm-muted text-xs leading-relaxed mt-1">
                      <span className="font-semibold text-cm-white/80">
                        Voorstel:
                      </span>{" "}
                      {o.voorstel}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-5 text-xs text-cm-muted italic">
          Bespreek deze observaties met Gaby. Geef me terug welke aanpassingen
          mogen door (titel + nieuwe positie + welke substeps eraan), dan
          herschrijf ik de structuur en pas substep-teksten daarna aan.
        </p>
      </section>

      {/* Sprint-referentie-tabel */}
      <section className="mb-10 card border-cm-gold/20">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
          🪟 Sprint-volgorde als referentie
        </h2>
        <p className="text-cm-muted text-xs mb-3 leading-relaxed">
          Sprint heeft 21 dagen in een specifieke volgorde, waar al veel
          denkwerk in zit. Hieronder per Sprint-dag wat het inhoudelijk is
          en waar het in Core V6 zit (of mist).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-cm-gold/80 text-left border-b border-cm-border">
                <th className="py-1.5 pr-2 font-semibold">Sprint</th>
                <th className="py-1.5 pr-2 font-semibold">Onderwerp</th>
                <th className="py-1.5 font-semibold">In V6</th>
              </tr>
            </thead>
            <tbody>
              {SPRINT_REFERENTIE.map((r) => {
                const ontbreekt = r.v6Match.includes("ontbreekt");
                const teLaatOfVroeg =
                  r.v6Match.includes("te laat") || r.v6Match.includes("te vroeg");
                const versplinterd = r.v6Match.includes("versplinterd");
                const flag = ontbreekt
                  ? "text-amber-400"
                  : teLaatOfVroeg || versplinterd
                    ? "text-cm-gold/80"
                    : "text-cm-white/70";
                return (
                  <tr
                    key={r.dag}
                    className="border-b border-cm-border/50 align-top"
                  >
                    <td className="py-1.5 pr-2 text-cm-muted whitespace-nowrap">
                      Dag {r.dag}
                    </td>
                    <td className="py-1.5 pr-2 text-cm-white/85">
                      {r.sprint}
                    </td>
                    <td className={`py-1.5 ${flag}`}>{r.v6Match}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-cm-muted italic">
          Amber = ontbreekt in V6. Goud = zit erin maar verkeerd geplaatst.
          Wit = klopt grotendeels.
        </p>
      </section>

      {/* De 21 ankerstappen per fase */}
      {fasen.map(({ fase, stappen }) => (
        <section key={fase} className="mb-8">
          <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
            {FASE_LABELS[fase]}
          </h2>
          <div className="space-y-3">
            {stappen.map((s) => (
              <div key={s.nummer} className="card">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <div>
                    <span className="text-cm-gold/80 text-xs font-semibold mr-2">
                      Stap {s.nummer}
                    </span>
                    <span className="text-cm-white font-medium text-base">
                      {s.titel}
                    </span>
                  </div>
                  <Link
                    href={`/core-v9/stap/${s.nummer}`}
                    className="text-xs text-cm-gold/70 hover:text-cm-gold underline flex-shrink-0"
                  >
                    Open stap →
                  </Link>
                </div>
                <p className="text-cm-muted text-sm italic leading-relaxed">
                  {s.faseDoel}
                </p>
                <details className="mt-3">
                  <summary className="text-cm-muted/80 text-xs cursor-pointer hover:text-cm-white">
                    {
                      s.vandaagDoen.filter(
                        (t) => !t.id.includes("sponsor-checkin") && !t.id.includes("momentum-radar") && !t.id.includes("partner-check"),
                      ).length
                    }{" "}
                    inhoudelijke substeps + 3 vaste afsluit-stappen (sponsor / momentum / partner)
                  </summary>
                  <ol className="mt-2 space-y-1 text-xs text-cm-white/80 list-decimal list-inside">
                    {s.vandaagDoen
                      .filter(
                        (t) =>
                          !t.id.includes("sponsor-checkin") &&
                          !t.id.includes("momentum-radar") &&
                          !t.id.includes("partner-check"),
                      )
                      .map((t) => (
                        <li key={t.id}>
                          {t.label}
                          {t.verplicht ? (
                            <span className="ml-1 text-cm-gold/60">
                              · verplicht
                            </span>
                          ) : null}
                        </li>
                      ))}
                  </ol>
                </details>
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-12 border-t border-cm-border pt-6 text-center text-xs text-cm-muted">
        <p>
          Klaar met scannen? Geef me per observatie of stap je akkoord of
          aanpassings-richting in chat. Ik herschrijf de structuur,
          daarna gaan we substep-teksten verrijken.
        </p>
      </footer>
    </main>
  );
}
