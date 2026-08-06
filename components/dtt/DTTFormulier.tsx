"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BRACKETS, type Bracket } from "@/lib/dtt/brackets";
import { bracketVoorUren } from "@/lib/dtt/advies";
import { rankVanafDoel } from "@/lib/dtt/rank-vanaf-doel";

// ============================================================
// Doel-Tijd-Termijn: ÉÉN formulier, twee plekken.
//
// Stond hiervoor dubbel: een uitgebreide versie op dag 0 (met je WHY,
// eerlijkheidscheck en status-richting) en een kale drie-velden-versie
// op /instellingen. Wie op dag 0 hoorde "aanpassen kan altijd via
// Instellingen" kwam daar dus op een heel ander scherm uit.
//
// Sinds 2026-08-06 gebruiken beide plekken deze component. Verschil zit
// alleen in de modus: "start" legt vast, "bijstellen" laat zien wat er nu
// staat en wat je verandering doet met je dag.
// ============================================================

export type DTTWaarden = {
  doel_per_maand: number;
  uren_per_week: number;
  termijn_maanden: number;
};

type Props = {
  /** "start" = dag 0, "bijstellen" = Instellingen. */
  modus: "start" | "bijstellen";
  /** Wat er nu staat. Null bij een eerste invulling. */
  beginwaarden?: DTTWaarden | null;
  /** Alleen bij "start": onboarding-stap afvinken. */
  opVoltooid?: () => void;
  /** Alleen bij "start": stap was al eerder gedaan. */
  alVoltooid?: boolean;
};

export function DTTFormulier({
  modus,
  beginwaarden = null,
  opVoltooid,
  alVoltooid = false,
}: Props) {
  const [doel, setDoel] = useState(
    beginwaarden?.doel_per_maand?.toString() ?? "",
  );
  const [uren, setUren] = useState(
    beginwaarden?.uren_per_week?.toString() ?? "",
  );
  const [termijn, setTermijn] = useState(
    beginwaarden?.termijn_maanden?.toString() ?? "",
  );
  const [bezig, setBezig] = useState(false);
  const [voltooid, setVoltooid] = useState(alVoltooid);
  // De eigen WHY erbij (Raoul 29 juli): een bedrag invullen is abstract,
  // tot je het koppelt aan waar je het vóór doet. Wie net verteld heeft
  // dat hij meer tijd met zijn dochter wil, krijgt hier dus niet "hoeveel
  // extra inkomen wil je", maar "hoeveel heb je nodig om meer tijd met je
  // dochter mogelijk te maken". Geldt op beide plekken: juist bij het
  // bijstellen wil je je WHY er weer naast hebben.
  const [why, setWhy] = useState<string | null>(null);
  const [kern, setKern] = useState<string | null>(null);
  const [beroep, setBeroep] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let gestopt = false;
    fetch("/api/why-kern")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (gestopt || !d) return;
        setWhy(d.why ?? null);
        setKern(d.kern ?? null);
        setBeroep(d.beroep ?? null);
      })
      .catch(() => {
        // Zonder WHY werkt de stap gewoon, alleen minder persoonlijk.
      });
    return () => {
      gestopt = true;
    };
  }, []);

  const urenNum = parseFloat(uren);
  const doelNum = parseFloat(doel);
  const termijnNum = parseFloat(termijn);
  const bracket: Bracket = !isNaN(urenNum)
    ? bracketVoorUren(urenNum)
    : "rustig";
  const bracketDef = BRACKETS[bracket];
  const rankSug = !isNaN(doelNum) && doelNum > 0 ? rankVanafDoel(doelNum) : null;

  // Wat er nu écht is opgeslagen, om te tonen dat je aan het verschuiven
  // bent. Zonder dit lijkt bijstellen op opnieuw invullen.
  const huidigeBracket = beginwaarden
    ? bracketVoorUren(beginwaarden.uren_per_week)
    : null;
  const tempoVerandert =
    huidigeBracket !== null && !isNaN(urenNum) && bracket !== huidigeBracket;

  // EERLIJKHEIDS-CHECK (Raoul 29 juli): veel geld, weinig uren, korte
  // termijn. Niets is onmogelijk, maar er moet wel tijd tegenover staan.
  // Dit blokkeert niets, het maakt alleen zichtbaar waar iemand ja tegen
  // zegt. Ruwe richtlijnen, bewust geen belofte over uitkomst.
  const urenRichtlijn =
    doelNum < 300 ? 4 : doelNum < 600 ? 6 : doelNum < 1500 ? 10 : 15;
  const maandenRichtlijn =
    doelNum < 300 ? 6 : doelNum < 600 ? 9 : doelNum < 1500 ? 12 : 18;
  const teWeinigUren = doelNum > 0 && urenNum > 0 && urenNum < urenRichtlijn;
  const teKorteTermijn =
    doelNum > 0 && termijnNum > 0 && termijnNum < maandenRichtlijn;
  const toonEerlijkheidsCheck =
    doelNum >= 300 && (teWeinigUren || teKorteTermijn);

  async function opslaan() {
    if (isNaN(doelNum) || isNaN(urenNum) || isNaN(termijnNum)) {
      toast.error("Vul alle drie de vragen in");
      return;
    }

    setBezig(true);
    try {
      const res = await fetch("/api/dtt/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doel_per_maand: doelNum,
          uren_per_week: urenNum,
          termijn_maanden: termijnNum,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        toast.error(d?.error ? `Opslaan mislukt: ${d.error}` : "Opslaan mislukt");
        return;
      }
      if (modus === "start") {
        setVoltooid(true);
        opVoltooid?.();
        toast.success("Doel-Tijd-Termijn opgeslagen");
      } else {
        toast.success("Bijgewerkt. Je dagelijkse aantallen schuiven mee.");
      }
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  if (voltooid && modus === "start") {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4">
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Doel-Tijd-Termijn ingevuld
        </p>
        <p className="text-cm-white opacity-80 text-xs mt-1">
          Aanpassen kan altijd via Instellingen. Daar staat precies dit
          scherm, met jouw antwoorden er alvast in.
        </p>
      </div>
    );
  }

  const isStart = modus === "start";

  return (
    <div
      className={
        isStart
          ? "rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-5 py-5 space-y-4"
          : "card space-y-4"
      }
    >
      <div>
        <h3
          className={
            isStart
              ? "text-cm-gold font-semibold text-base"
              : "text-sm font-semibold text-cm-white uppercase tracking-wider"
          }
        >
          🎯 Doel-Tijd-Termijn
        </h3>
        <p className="text-cm-white/85 text-sm mt-1">
          {isStart
            ? "Drie korte vragen. Daarmee weet ELEVA wat een realistische dag voor jou is, en krijg je aantallen die bij jouw leven passen in plaats van bij dat van iemand anders."
            : beginwaarden
              ? "Dit vulde je in bij de start. Verandert er iets in je leven of in wat je wilt, dan pas je het hier aan. Je dagelijkse aantallen schuiven direct mee."
              : "Hier stel je in wat een realistische dag voor jou is. Je dagelijkse aantallen schuiven daarin mee."}
        </p>
      </div>

      {/* Nooit ingevuld: dan draait de dag stilletjes op het standaard-
          tempo. Dat hoor je te weten, anders zie je aantallen zonder te
          begrijpen waar ze vandaan komen. */}
      {!isStart && !beginwaarden && (
        <div className="rounded-md border border-amber-500/40 bg-amber-900/20 px-3 py-2.5">
          <p className="text-amber-300 text-xs font-semibold mb-1">
            Je hebt dit nog niet ingevuld
          </p>
          <p className="text-cm-white/80 text-xs leading-relaxed">
            Zolang er niets staat rekent ELEVA met het rustige tempo (3 tot 6
            uur per week). Vul je het hieronder in, dan passen je dagelijkse
            aantallen zich aan op jouw situatie.
          </p>
        </div>
      )}

      {/* Je eigen WHY erbij, zodat je een bedrag invult vanuit waar je
          het vóór doet en niet vanuit een slag in de lucht. */}
      {why && (
        <div className="rounded-md border border-cm-gold/30 bg-cm-gold/5 px-3 py-3">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider mb-1">
            💛 Even je WHY erbij
          </p>
          <p className="text-cm-white/80 text-xs leading-relaxed whitespace-pre-line">
            {why}
          </p>
          <p className="text-cm-white/60 text-xs mt-2 italic">
            {kern
              ? `Houd dit vast bij de vragen hieronder. Het gaat je om ${kern}, en dat vertaal je nu naar wat je daarvoor nodig hebt.`
              : "Houd dit vast bij de vragen hieronder, dan vul je in wat je nodig hebt om dit mogelijk te maken."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-cm-white/85 text-sm mb-1">
            <strong>Doel</strong>:{" "}
            {kern
              ? `hoeveel extra inkomen per maand heb je nodig om ${kern} mogelijk te maken?`
              : why
                ? "hoeveel extra inkomen per maand heb je nodig om jouw WHY hierboven waar te maken?"
                : "hoeveel extra inkomen per maand wil je realistisch in 12 maanden?"}
          </label>
          <input
            type="number"
            min="0"
            step="50"
            placeholder="bv. 500"
            value={doel}
            onChange={(e) => setDoel(e.target.value)}
            className="input-cm"
          />
          <p className="text-cm-white/55 text-xs mt-1">euro per maand</p>
        </div>

        <div>
          <label className="block text-cm-white/85 text-sm mb-1">
            <strong>Tijd</strong>: hoeveel uur per week kun je hieraan besteden
            {beroep
              ? `, naast je werk als ${beroep}?`
              : ", naast alles wat je al doet?"}
          </label>
          <input
            type="number"
            min="0"
            step="1"
            /* 10 in plaats van 5 (Raoul 29 juli): wie de voorbeelden
               letterlijk invulde (500 / 5 / 12) kreeg meteen de
               te-weinig-uren-opmerking. Voorbeelden moeten onderling
               kloppen. */
            placeholder="bv. 10"
            value={uren}
            onChange={(e) => setUren(e.target.value)}
            className="input-cm"
          />
          <p className="text-cm-white/55 text-xs mt-1">
            uur per week. Dit getal bepaalt je dagelijkse aantallen.
          </p>
        </div>

        <div>
          <label className="block text-cm-white/85 text-sm mb-1">
            <strong>Termijn</strong>: binnen hoeveel maanden wil je dat het
            {kern
              ? ` zover is, zodat ${kern} ook echt kan?`
              : " er staat, zodat het voor jou de moeite waard is?"}
          </label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="bv. 12"
            value={termijn}
            onChange={(e) => setTermijn(e.target.value)}
            className="input-cm"
          />
          <p className="text-cm-white/55 text-xs mt-1">maanden</p>
        </div>
      </div>

      {(urenNum > 0 || doelNum > 0) && (
        <div className="rounded-md bg-cm-bg/60 border border-cm-border px-3 py-3 space-y-2">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            {isStart ? "Jouw advies op basis hiervan" : "Wat dit voor je dag betekent"}
          </p>
          {urenNum > 0 && (
            <p className="text-cm-white/85 text-xs">
              Tempo: <strong className="text-cm-white">{bracketDef.label}</strong>{" "}
              ({bracketDef.urenPerWeekRange}/week)
              <br />
              <span className="text-cm-white/60">{bracketDef.verwachting}</span>
            </p>
          )}

          {/* De brug tussen deze instelling en je dag. Zonder dit blijft
              "Gestaag" een woord; nu zie je wat je morgen te doen krijgt. */}
          {urenNum > 0 && <DagelijkseAantallen bracket={bracket} />}

          {tempoVerandert && (
            <p className="text-cm-gold/90 text-[11px] leading-relaxed">
              Je stond op <strong>{BRACKETS[huidigeBracket!].label}</strong> en
              gaat naar <strong>{bracketDef.label}</strong>. Vanaf het moment
              dat je opslaat staan deze aantallen op je dag-scherm.
            </p>
          )}

          {bracket === "minimaal" && (
            <p className="text-amber-200/80 text-[11px] italic">
              Met minder dan 3 uur per week kun je je producten terugverdienen:
              je inkomsten zijn dan ongeveer gelijk aan wat je zelf bestelt. Een
              netwerk opbouwen waarmee je meer doet dan dat, is in dit tempo
              niet realistisch. Overweeg 4 tot 6 uur per week.
            </p>
          )}
          {toonEerlijkheidsCheck && (
            <div className="rounded-md border border-amber-500/40 bg-amber-900/20 px-3 py-2.5 space-y-1.5">
              <p className="text-amber-300 text-[11px] font-semibold">
                Even eerlijk met je meedenken
              </p>
              <p className="text-cm-white/80 text-[11px] leading-relaxed">
                {`Je vult ${Math.round(doelNum)} euro per maand in`}
                {termijnNum > 0 ? ` binnen ${Math.round(termijnNum)} maanden` : ""}
                {urenNum > 0 ? ` met ${Math.round(urenNum)} uur per week` : ""}. Dat
                is een stevige combinatie. Niets is onmogelijk, maar er moet wel
                tijd tegenover staan. Mensen die zoiets voor elkaar krijgen,
                hebben er meestal rond de {urenRichtlijn} uur per week voor
                vrijgemaakt en zijn er langer dan {maandenRichtlijn} maanden mee
                bezig. Dat is geen rekensom en geen belofte, wel wat we in de
                praktijk zien.
              </p>
              <p className="text-cm-white/70 text-[11px] leading-relaxed">
                Je mag het zo laten staan, dan weet je in elk geval waar je ja
                tegen zegt. Wil je het comfortabeler? Schroef je uren wat op, of
                geef jezelf wat meer maanden.
                {isStart ? " Je kunt dit later altijd aanpassen via Instellingen." : ""}
              </p>
            </div>
          )}
          {rankSug && (
            <p className="text-cm-white/85 text-xs">
              Richting waar je aan kunt denken:{" "}
              <strong className="text-cm-white">{rankSug.label}</strong>
              <br />
              <span className="text-cm-white/60">{rankSug.toelichting}</span>
              <br />
              {/* "Rank" zegt een starter niets (Raoul 29 juli). Dus geen
                  jargon, maar uitleggen wat je eraan hebt. */}
              <span className="text-cm-white/50">
                Deze getallen zijn puur indicatief, ze geven je een idee welke
                status voor de komende tijd realistisch is om op te koersen.
                Later gaan we hier verder op in. Je kunt dit ook alvast
                bespreken met je sponsor of upline, degene via wie jij bent
                gestart.
              </span>
            </p>
          )}
          {/* Verplichte nuance bij alles wat naar inkomen verwijst
              (claim-ronde 30 juli, ACM). Eén keer onderaan het blok. */}
          <p className="text-cm-white/45 text-[11px] leading-relaxed border-t border-cm-border pt-2">
            Wat iemand opbouwt hangt af van eigen inzet, consistentie en hoe de
            groep zich ontwikkelt. Er is geen garantie en het verschilt per
            persoon.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={opslaan}
        disabled={bezig}
        className="btn-gold w-full py-2.5 text-sm font-semibold"
      >
        {/* Geen afkorting op de knop: "DTT" heeft een nieuw lid nog
            nooit gezien (claim-ronde 30 juli). */}
        {bezig
          ? "Bezig..."
          : isStart
            ? "✓ Mijn doel vastleggen"
            : "✓ Bijwerken"}
      </button>
    </div>
  );
}

/**
 * Wat het gekozen tempo concreet oplevert op je dag-scherm. Precies de
 * aantallen uit lib/dtt/dmo-stappen.ts, zodat wat je hier leest ook is
 * wat je morgen ziet staan.
 */
function DagelijkseAantallen({ bracket }: { bracket: Bracket }) {
  const m = BRACKETS[bracket].dmoMinimums;
  const regels: string[] = [];

  if (m.contactenPerDag > 0) {
    regels.push(
      `${m.contactenPerDag} ${m.contactenPerDag === 1 ? "nieuw persoon" : "nieuwe mensen"} aanspreken per dag`,
    );
  } else {
    regels.push("een paar mensen aanspreken per week, geen dagelijkse druk");
  }

  if (m.followUpsPerDag > 0) {
    regels.push(
      `${m.followUpsPerDag} ${m.followUpsPerDag === 1 ? "iemand" : "mensen"} opvolgen per dag`,
    );
  } else {
    regels.push("per week iemand opvolgen die nog niet besliste");
  }

  if (m.socialPostsPerWeek > 0) {
    regels.push(
      `${m.socialPostsPerWeek} ${m.socialPostsPerWeek === 1 ? "post" : "posts"} per week`,
    );
  }
  if (m.freebiesPerWeek > 0) {
    regels.push(
      `${m.freebiesPerWeek} keer per week je gratis test of freebie delen`,
    );
  }

  return (
    <div className="rounded-md border border-cm-border bg-cm-surface-2/60 px-3 py-2.5">
      <p className="text-cm-white/70 text-[11px] font-semibold mb-1.5">
        Op je dag-scherm komt dan te staan:
      </p>
      <ul className="space-y-1">
        {regels.map((r) => (
          <li
            key={r}
            className="text-cm-white/80 text-[11px] leading-relaxed flex gap-1.5"
          >
            <span className="text-cm-gold flex-shrink-0">•</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
      <p className="text-cm-white/50 text-[10px] mt-1.5 italic">
        Dit zijn minimums, meer mag altijd. Het ritme begint op dag 3.
      </p>
    </div>
  );
}
