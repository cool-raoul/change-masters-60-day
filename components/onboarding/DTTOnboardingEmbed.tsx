"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BRACKETS, type Bracket } from "@/lib/dtt/brackets";
import { bracketVoorUren } from "@/lib/dtt/advies";
import { rankVanafDoel } from "@/lib/dtt/rank-vanaf-doel";

// ============================================================
// DTT-onboarding-embed voor Core dag 1.
// Drie vragen: doel/tijd/termijn. Toont direct bracket + rank-suggestie.
// Bewaart in profiles.core_dtt (JSONB).
// ============================================================

type Props = {
  alVoltooid: boolean;
  opVoltooid: () => void;
};

export function DTTOnboardingEmbed({ alVoltooid, opVoltooid }: Props) {
  const [doel, setDoel] = useState<string>("");
  const [uren, setUren] = useState<string>("");
  const [termijn, setTermijn] = useState<string>("");
  const [bezig, setBezig] = useState(false);
  const [voltooid, setVoltooid] = useState(alVoltooid);
  // De eigen WHY erbij halen (Raoul 29 juli): een bedrag invullen is
  // abstract, tot je het koppelt aan waar je het vóór doet. Wie net
  // verteld heeft dat hij meer tijd met zijn dochter wil, krijgt hier
  // dus niet "hoeveel extra inkomen wil je", maar "hoeveel heb je nodig
  // om meer tijd met je dochter mogelijk te maken".
  const [why, setWhy] = useState<string | null>(null);
  const [kern, setKern] = useState<string | null>(null);
  const [beroep, setBeroep] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

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

  if (voltooid) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4">
        <p className="text-emerald-300 font-semibold text-sm">
          ✓ Doel-Tijd-Termijn ingevuld
        </p>
        <p className="text-cm-white opacity-80 text-xs mt-1">
          Aanpassen kan altijd via Instellingen.
        </p>
      </div>
    );
  }

  const urenNum = parseFloat(uren);
  const doelNum = parseFloat(doel);
  const termijnNum = parseFloat(termijn);
  const bracket: Bracket = !isNaN(urenNum) ? bracketVoorUren(urenNum) : "rustig";
  const bracketDef = BRACKETS[bracket];
  const rankSug = !isNaN(doelNum) && doelNum > 0 ? rankVanafDoel(doelNum) : null;

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
    const dttData = {
      doel_per_maand: parseFloat(doel),
      uren_per_week: parseFloat(uren),
      termijn_maanden: parseFloat(termijn),
    };

    if (
      isNaN(dttData.doel_per_maand) ||
      isNaN(dttData.uren_per_week) ||
      isNaN(dttData.termijn_maanden)
    ) {
      toast.error("Vul alle drie de vragen in");
      return;
    }

    setBezig(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Niet ingelogd");
      setBezig(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ core_dtt: dttData })
      .eq("id", user.id);

    if (error) {
      toast.error("Opslaan mislukt: " + error.message);
      setBezig(false);
      return;
    }

    setVoltooid(true);
    opVoltooid();
    toast.success("Doel-Tijd-Termijn opgeslagen");
    router.refresh();
    setBezig(false);
  }

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-5 py-5 space-y-4">
      <div>
        <h3 className="text-cm-gold font-semibold text-base">
          🎯 Doel-Tijd-Termijn
        </h3>
        <p className="text-cm-white/85 text-sm mt-1">
          Drie korte vragen. Daarmee weet ELEVA wat een realistische dag
          voor jou is, en krijg je aantallen die bij jouw leven passen in
          plaats van bij dat van iemand anders.
        </p>
      </div>

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
            {beroep ? `, naast je werk als ${beroep}?` : ", naast alles wat je al doet?"}
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
          <p className="text-cm-white/55 text-xs mt-1">uur per week</p>
        </div>

        <div>
          <label className="block text-cm-white/85 text-sm mb-1">
            <strong>Termijn</strong>: binnen hoeveel maanden wil je dat het
            {kern ? ` zover is, zodat ${kern} ook echt kan?` : " er staat, zodat het voor jou de moeite waard is?"}
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
            Jouw advies op basis hiervan
          </p>
          {urenNum > 0 && (
            <p className="text-cm-white/85 text-xs">
              Tempo: <strong className="text-cm-white">{bracketDef.label}</strong> ({bracketDef.urenPerWeekRange}/week)
              <br />
              <span className="text-cm-white/60">{bracketDef.verwachting}</span>
            </p>
          )}
          {bracket === "minimaal" && (
            <p className="text-amber-200/80 text-[11px] italic">
              Met minder dan 3 uur per week kun je je producten terugverdienen: je inkomsten zijn dan ongeveer gelijk aan wat je zelf bestelt. Een netwerk opbouwen waarmee je meer doet dan dat, is in dit tempo niet realistisch. Overweeg 4 tot 6 uur per week.
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
                is een stevige combinatie. Niets is onmogelijk, maar er moet
                wel tijd tegenover staan. Mensen die zoiets voor elkaar
                krijgen, hebben er meestal rond de {urenRichtlijn} uur per week
                voor vrijgemaakt en zijn er langer dan {maandenRichtlijn}{" "}
                maanden mee bezig. Dat is geen rekensom en geen belofte, wel
                wat we in de praktijk zien.
              </p>
              <p className="text-cm-white/70 text-[11px] leading-relaxed">
                Je mag het zo laten staan, dan weet je in elk geval waar je ja
                tegen zegt. Wil je het comfortabeler? Schroef je uren wat op,
                of geef jezelf wat meer maanden. Je kunt dit later altijd
                aanpassen via Instellingen.
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
        {bezig ? "Bezig..." : "✓ Mijn doel vastleggen"}
      </button>
    </div>
  );
}
