// File: app/core-v6/structuur/page.tsx
//
// Founder-only structuur-overzicht van alle 21 Core V6-ankerstappen.
// Bedoeld voor Raoul + Gaby om in één scherm de volgorde en compleetheid
// te beoordelen voordat we substep-teksten gaan verrijken. Bevat Claude's
// observaties bovenaan met openstaande discussiepunten.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isCoreV6Actief } from "@/lib/feature-flags/core-v6";
import { CORE_V6_STAPPEN } from "@/lib/playbook/core-dagen-v6";

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
};

const OBSERVATIES: Observatie[] = [
  {
    titel: "Pre-post / 21-dagen-post staat te laat (Stap 6)",
    signaal:
      "In de kennisbank zit pre-post al in stap 1 van de eerste 2 uur. In V6 staat 'm op ankerstap 6, na productkennis en de webshop-pivot. Maar als iemand net gestart is, doet 'ie juist een post DAT 'ie gestart is. En reacties + opvolging brengen weer eigen substeps mee (voorbereiding-PDF, schrijven, naar upline, plaatsen, reactie-script klaar, reageren binnen uur).",
    voorstel:
      "Pre-post-flow eerder plaatsen (Stap 2 of 3) en uitsplitsen in 4-6 substeps: voorbereiding lezen, tekst schrijven, upline check, plaatsen, reactie-script-klaarzetten, reageren-routine. 21-dagen-post houden we op Stap 15 want die komt pas 21 dagen na de pre-post.",
    ernst: "belangrijk",
  },
  {
    titel: "Verdienmodel-basis (Stap 5) komt mogelijk te vroeg",
    signaal:
      "Stap 5 zit nu nog in het Fundament-blok. Maar in praktijk vragen prospects pas vanaf de eerste echte gesprekken iets over verdienmodel. Te vroeg betekent: les vergeten tegen de tijd dat 'ie relevant wordt.",
    voorstel:
      "Verdienmodel-basis verschuiven naar rond Stap 9 of 10 (vlak voor de eerste 3-weg), zodat de basic-understanding-les vers in het hoofd zit op het moment dat 'ie gevraagd wordt.",
    ernst: "wel-overwegen",
  },
  {
    titel: "Drie verhalen (Stap 8) kan parallel aan webshop-pivot (Stap 4)",
    signaal:
      "Stap 4 schrijft de webshop-zin in jouw stem. Stap 8 schrijft persoonlijk / product / business-verhaal. Die stem ontstaat in beide. Ze los van elkaar leren kan het gevoel geven van twee keer iets nieuws beginnen.",
    voorstel:
      "Drie verhalen verplaatsen naar Stap 4 als ankerblok 4b (dezelfde dag), of als opvolger van Stap 4 (Stap 5 dus). Webshop-zin + drie verhalen samen leren als één stem-blok.",
    ernst: "denk-richting",
  },
  {
    titel: "Bezwaren-skills (Stap 14) ligt na de eerste 3-weg (Stap 11)",
    signaal:
      "Eerste 3-weg in Stap 11, bezwaren-bibliotheek pas in Stap 14. Dat betekent dat je je eerste 3-weg doet zonder voorbereiding op de meest voorkomende bezwaren. Onnodig stressmoment.",
    voorstel:
      "Bezwaren-skills VOOR de eerste 3-weg plaatsen, bijvoorbeeld als Stap 10 (vlak voor of na de 3-weg-meesterclass). De 3-weg-praktijk komt dan met meer rugdekking.",
    ernst: "belangrijk",
  },
  {
    titel: "Reactie-opvolging als losse substeps mist overal",
    signaal:
      "Bij Stap 6 (post plaatsen), Stap 7 (Brookes + freebie), Stap 9 (warme uitnodigingen), Stap 12 (Stories) en Stap 15 (resultaat-post) komen ALLEMAAL reacties binnen waar je weer wat mee moet. Nu staat er telkens losjes 'reageer binnen 1 uur'. Niet als concrete substep met script.",
    voorstel:
      "Per post-stap een vaste substep 'Reactie-script klaarzetten' en 'Reageer binnen 1 uur op alles wat binnenkomt'. Inline-embed naar /scripts/reageer-script. Plus mogelijke vervolg-substeps 'Stuur film door' en 'Prospect toevoegen aan Mini-ELEVA'.",
    ernst: "wel-overwegen",
  },
];

export default async function CoreV6StructuurPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v6Actief = await isCoreV6Actief(user.id);
  if (!v6Actief) redirect("/vandaag");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder =
    (profile as { role?: string } | null)?.role === "founder";
  if (!isFounder) redirect("/core-v6");

  const fasen: Array<{
    fase: 1 | 2 | 3;
    stappen: typeof CORE_V6_STAPPEN;
  }> = [
    { fase: 1, stappen: CORE_V6_STAPPEN.filter((s) => s.fase === 1) },
    { fase: 2, stappen: CORE_V6_STAPPEN.filter((s) => s.fase === 2) },
    { fase: 3, stappen: CORE_V6_STAPPEN.filter((s) => s.fase === 3) },
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
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
          🔎 Mijn observaties ({OBSERVATIES.length})
        </h2>
        <ol className="space-y-5">
          {OBSERVATIES.map((o, i) => {
            const ernstColor =
              o.ernst === "belangrijk"
                ? "text-amber-400"
                : o.ernst === "wel-overwegen"
                  ? "text-cm-gold/80"
                  : "text-cm-muted";
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
                    href={`/core-v6/stap/${s.nummer}`}
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
