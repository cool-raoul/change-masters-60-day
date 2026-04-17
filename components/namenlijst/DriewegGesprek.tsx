"use client";

import React, { useState } from "react";

interface Props {
  prospectNaam: string;
  prospectSituatie?: string;
  sponsorNaam?: string;
}

type TabType = "product" | "business";

interface StapConfig {
  nummer: number;
  titel: string;
  context: string;
  type: "bericht" | "terug" | "follow-up";
  bericht?: string;
  berichten?: { label: string; tekst: string }[];
}

type Geslacht = "v" | "m";

function vervangVariabelen(
  tekst: string,
  voornaam: string,
  volledigeNaam: string,
  situatie: string | undefined,
  sponsorNaam: string,
  sponsorPeriode: string,
  geslacht: Geslacht
): string {
  let result = tekst;

  // Namen
  result = result.replace(/\[naam prospect\]/g, volledigeNaam);
  result = result.replace(/\[naam\]/g, voornaam);
  if (sponsorNaam) result = result.replace(/\[naam sponsor\]/g, sponsorNaam);
  if (sponsorPeriode) result = result.replace(/\[periode sponsor\]/g, sponsorPeriode);
  if (situatie) result = result.replace(/\[situatie\]/g, situatie);

  // Geslacht sponsor — altijd vervangen (geslacht is altijd "v" of "m")
  const zij   = geslacht === "v" ? "zij"      : "hij";
  const Zij   = geslacht === "v" ? "Zij"      : "Hij";
  const haar  = geslacht === "v" ? "haar"     : "hem";
  const vriend = geslacht === "v" ? "vriendin" : "vriend";

  result = result.replace(/\[Zij\/Hij\]/g, Zij);
  result = result.replace(/\[zij\/hij\]/g, zij);
  result = result.replace(/\[haar\/hem\]/g, haar);
  result = result.replace(/\[vriendin\/vriend\]/g, vriend);

  return result;
}

function KopieKnop({ tekst }: { tekst: string }) {
  const [gekopieerd, setGekopieerd] = useState(false);

  async function kopieer() {
    await navigator.clipboard.writeText(tekst);
    setGekopieerd(true);
    setTimeout(() => setGekopieerd(false), 2000);
  }

  return (
    <button
      onClick={kopieer}
      className={`btn-gold text-xs px-3 py-1.5 transition-all ${gekopieerd ? "opacity-80" : ""}`}
    >
      {gekopieerd ? "✓ Gekopieerd!" : "Kopieer"}
    </button>
  );
}

function WhatsAppKnop({ tekst }: { tekst: string }) {
  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(tekst)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs px-3 py-1.5 rounded-lg bg-green-900/40 border border-green-600/30 text-green-400 hover:bg-green-900/60 transition-colors"
    >
      WhatsApp
    </a>
  );
}

// Splits tekst op [placeholder] tokens en rendert placeholders als grijze badges
function renderMetPlaceholders(tekst: string): React.ReactNode {
  const delen = tekst.split(/(\[[^\]]+\])/g);
  return delen.map((deel, i) =>
    /^\[.+\]$/.test(deel) ? (
      <span key={i} className="not-italic text-cm-white opacity-40 bg-cm-surface-2 px-1 rounded">
        {deel}
      </span>
    ) : (
      <span key={i}>{deel}</span>
    )
  );
}

function BerichtBlok({
  tekst,
}: {
  tekst: string;
}) {
  const heeftPlaceholder = /\[[^\]]+\]/.test(tekst);

  return (
    <div className="space-y-2">
      <div className="bg-cm-surface rounded-xl p-4 text-cm-white text-sm leading-relaxed italic border-l-2 border-cm-gold/40 whitespace-pre-wrap">
        {heeftPlaceholder ? renderMetPlaceholders(tekst) : tekst}
      </div>
      <div className="flex gap-2">
        <KopieKnop tekst={tekst} />
        <WhatsAppKnop tekst={tekst} />
      </div>
    </div>
  );
}

function StapKaart({
  stap,
  voornaam,
  volledigeNaam,
  situatie,
  sponsorNaam,
  sponsorPeriode,
  geslacht,
}: {
  stap: StapConfig;
  voornaam: string;
  volledigeNaam: string;
  situatie: string | undefined;
  sponsorNaam: string;
  sponsorPeriode: string;
  geslacht: Geslacht;
}) {
  function verwerk(tekst: string) {
    return vervangVariabelen(tekst, voornaam, volledigeNaam, situatie, sponsorNaam, sponsorPeriode, geslacht);
  }

  return (
    <div className="bg-cm-surface-2 rounded-xl p-4 space-y-3">
      {/* Stap header */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-cm-gold/20 border border-cm-gold/40 flex items-center justify-center text-cm-gold text-xs font-bold flex-shrink-0">
          {stap.nummer}
        </div>
        <h3 className="text-cm-white text-sm font-semibold">{stap.titel}</h3>
      </div>

      {/* Context */}
      <p className="text-cm-white text-xs opacity-50">{verwerk(stap.context)}</p>

      {/* Inhoud per type */}
      {stap.type === "terug" && (
        <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-4 text-amber-300 text-sm">
          ⚠️ Niet meer reageren tenzij de sponsor je uitnodigt. Laat de sponsor het werk doen.
        </div>
      )}

      {stap.type === "bericht" && stap.bericht && (
        <BerichtBlok
          tekst={verwerk(stap.bericht)}
        />
      )}

      {stap.type === "follow-up" && stap.berichten && (
        <div className="space-y-3">
          {stap.berichten.map((optie, i) => {
            const verwerktTekst = verwerk(optie.tekst);
            return (
              <div key={i} className="space-y-2">
                <p className="text-cm-white text-xs opacity-50 font-medium">{optie.label}</p>
                <div className="bg-cm-surface rounded-xl p-4 text-cm-white text-sm leading-relaxed italic border-l-2 border-cm-gold/40">
                  {verwerktTekst}
                </div>
                <div className="flex gap-2">
                  <KopieKnop tekst={verwerktTekst} />
                  <WhatsAppKnop tekst={verwerktTekst} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const PRODUCT_STAPPEN: StapConfig[] = [
  {
    nummer: 1,
    titel: "Stap 1 — Aankondiging",
    context: "Stuur dit aan [naam] vóór je het groepje aanmaakt",
    type: "bericht",
    bericht:
      "Leuk dat je geïnteresseerd bent 😃 Om jou zo goed mogelijk te kunnen helpen maak ik een whats app groep aan met [naam sponsor] erbij. [Zij/Hij] heeft mij en vele andere geholpen met het holistische vitaliteitsprogramma dat ik heb gevolgd. Zo kunnen we jou het allerbeste advies geven. Allemaal geheel vrijblijvend uiteraard! 🍀",
  },
  {
    nummer: 2,
    titel: "Stap 2 — Introductie in het groepje",
    context: "Stuur dit in het nieuwe groepje — edifieer de sponsor eerst",
    type: "bericht",
    bericht:
      "Hi [naam prospect]! 😊 Dit is [naam sponsor] — mijn [vriendin/vriend] en mentor. [Zij/Hij] heeft zelf fantastische resultaten behaald. [Zij/Hij] helpt mij nu ook en heeft al heel veel mensen begeleid met precies wat jij zoekt 🥰\n\n[naam sponsor], dit is [naam prospect]. Ze is op zoek naar [situatie]. Wil jij [haar/hem] even verder helpen? 🙏",
  },
  {
    nummer: 3,
    titel: "Stap 3 — Stap terug ⚠️",
    context: "Nu ben jij klaar. Zeg niets meer tenzij de sponsor je vraagt. Jij = student, sponsor = expert.",
    type: "terug",
  },
  {
    nummer: 4,
    titel: "Stap 4 — Sponsor opent",
    context: "Dit bericht stuurt de sponsor als opening — deel dit met je sponsor als tip",
    type: "bericht",
    bericht:
      "Hey [naam]! Wat leuk dat ik aan je voorgesteld word 🥰 Ik heb even gelezen wat er speelt bij jou — herkenbaar! Vertel eens, hoe lang speelt dit al bij je en wat heb je al geprobeerd? 😊",
  },
  {
    nummer: 5,
    titel: "Stap 5 — Follow-up",
    context: "Stuur dit apart aan [naam] binnen 24 uur na het gesprek in het groepje",
    type: "follow-up",
    berichten: [
      {
        label: "Optie A",
        tekst: "Hey [naam] 😊 Wat sprak je het meeste aan van wat je tot nu toe hebt gezien? 🥰",
      },
      {
        label: "Optie B",
        tekst: "Hey [naam] 😊 Zie je hoe dit je kan helpen om jouw doel te bereiken? 💛",
      },
    ],
  },
];

const BUSINESS_STAPPEN: StapConfig[] = [
  {
    nummer: 1,
    titel: "Stap 1 — Aankondiging",
    context: "Stuur dit aan [naam] vóór je het groepje aanmaakt",
    type: "bericht",
    bericht:
      "Top 👍🏽 Ik maak even een whatsapp groepje aan met [naam sponsor], [zij/hij] is degene waar ik mee samenwerk 😄\n[Zij/Hij] heeft zelf ook super mooi resultaat behaald en kan even met ons mee kijken, meer uitleg geven en eventuele vragen beantwoorden 👍🏽\n\nAllemaal vrijblijvend 😃",
  },
  {
    nummer: 2,
    titel: "Stap 2 — Introductie in het groepje",
    context: "Stuur dit in het nieuwe groepje — edifieer de sponsor eerst",
    type: "bericht",
    bericht:
      "Hi [naam prospect]! 😊 Dit is [naam sponsor] — mijn mentor. [Zij/Hij] heeft zelf een mooie business opgebouwd. [Zij/Hij] helpt mij nu ook en heeft al veel mensen begeleid die precies op zoek waren naar wat jij zoekt 💪🏽\n\n[naam sponsor], dit is [naam prospect]. Ze is op zoek naar [situatie]. Wil jij [haar/hem] even meenemen in hoe dit werkt? 🙏",
  },
  {
    nummer: 3,
    titel: "Stap 3 — Stap terug ⚠️",
    context: "Nu ben jij klaar. Zeg niets meer tenzij de sponsor je vraagt. Jij = student, sponsor = expert.",
    type: "terug",
  },
  {
    nummer: 4,
    titel: "Stap 4 — Sponsor opent",
    context: "Dit bericht stuurt de sponsor als opening — deel dit met je sponsor als tip",
    type: "bericht",
    bericht:
      "Hey [naam]! Leuk dat ik aan je voorgesteld word 😊 Ik vertel je graag meer over hoe dit werkt — maar eerst even kennismaken! Vertel, wat doe je nu en wat zou jij willen veranderen als je helemaal eerlijk bent? 🥰",
  },
  {
    nummer: 5,
    titel: "Stap 5 — Follow-up",
    context: "Stuur dit apart aan [naam] binnen 24 uur na het gesprek in het groepje",
    type: "follow-up",
    berichten: [
      {
        label: "Optie A",
        tekst: "Hey [naam] 😊 Wat sprak je het meeste aan van wat je tot nu toe hebt gezien en gehoord? 🥰",
      },
      {
        label: "Optie B",
        tekst: "Hey [naam] 😊 Zie je hoe dit je kan helpen om jouw doel te bereiken? 💛",
      },
    ],
  },
];

export function DriewegGesprekInklapbaar({ prospectNaam, prospectSituatie, sponsorNaam }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          💬 3-weg gesprek scripts
        </h2>
        <span className={`text-cm-gold text-lg transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {open && (
        <div className="mt-4">
          <DriewegGesprek
            prospectNaam={prospectNaam}
            prospectSituatie={prospectSituatie}
            sponsorNaam={sponsorNaam}
          />
        </div>
      )}
    </div>
  );
}

export function DriewegGesprek({ prospectNaam, prospectSituatie, sponsorNaam: sponsorNaamProp }: Props) {
  const [actieveTab, setActieveTab] = useState<TabType>("product");
  const [sponsorNaam, setSponsorNaam] = useState(sponsorNaamProp || "");
  const [sponsorPeriode, setSponsorPeriode] = useState("");
  const [geslacht, setGeslacht] = useState<Geslacht>("v");

  const voornaam = prospectNaam.split(" ")[0];
  const stappen = actieveTab === "product" ? PRODUCT_STAPPEN : BUSINESS_STAPPEN;

  return (
    <div className="space-y-4">
      {/* Sponsor invulvelden */}
      <div className="bg-cm-surface rounded-xl p-3 space-y-2 border border-cm-border">
        <p className="text-xs text-cm-white opacity-50 uppercase tracking-wider">Jouw sponsor</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-cm-white opacity-60 mb-1 flex items-center gap-1">
              Naam sponsor
              {sponsorNaamProp && (
                <span className="text-cm-gold opacity-70">· auto</span>
              )}
            </label>
            <input
              type="text"
              value={sponsorNaam}
              onChange={(e) => setSponsorNaam(e.target.value)}
              placeholder="bv. Gaby"
              className="w-full bg-cm-surface-2 border border-cm-border rounded-lg px-3 py-1.5 text-cm-white text-sm placeholder-cm-white/30 focus:outline-none focus:border-cm-gold"
            />
          </div>
          <div>
            <label className="text-xs text-cm-white opacity-60 mb-1 block">Periode actief</label>
            <input
              type="text"
              value={sponsorPeriode}
              onChange={(e) => setSponsorPeriode(e.target.value)}
              placeholder="bv. 2 jaar / 6 maanden"
              className="w-full bg-cm-surface-2 border border-cm-border rounded-lg px-3 py-1.5 text-cm-white text-sm placeholder-cm-white/30 focus:outline-none focus:border-cm-gold"
            />
          </div>
          <div>
            <label className="text-xs text-cm-white opacity-60 mb-1 block">Sponsor is een</label>
            <div className="flex gap-1">
              <button
                onClick={() => setGeslacht("v")}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  geslacht === "v"
                    ? "bg-cm-gold text-cm-black border-cm-gold"
                    : "bg-cm-surface-2 text-cm-white border-cm-border hover:border-cm-gold-dim"
                }`}
              >
                Vrouw
              </button>
              <button
                onClick={() => setGeslacht("m")}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  geslacht === "m"
                    ? "bg-cm-gold text-cm-black border-cm-gold"
                    : "bg-cm-surface-2 text-cm-white border-cm-border hover:border-cm-gold-dim"
                }`}
              >
                Man
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-cm-border">
        <button
          onClick={() => setActieveTab("product")}
          className={`pb-2 px-1 text-sm font-medium transition-all ${
            actieveTab === "product"
              ? "text-cm-gold border-b-2 border-cm-gold"
              : "text-cm-white opacity-60 hover:opacity-80"
          }`}
        >
          💊 Product / Interesse
        </button>
        <button
          onClick={() => setActieveTab("business")}
          className={`pb-2 px-3 text-sm font-medium transition-all ${
            actieveTab === "business"
              ? "text-cm-gold border-b-2 border-cm-gold"
              : "text-cm-white opacity-60 hover:opacity-80"
          }`}
        >
          💼 Business / Opportunity
        </button>
      </div>

      {/* Stappen */}
      <div className="space-y-3">
        {stappen.map((stap) => (
          <StapKaart
            key={stap.nummer}
            stap={stap}
            voornaam={voornaam}
            volledigeNaam={prospectNaam}
            situatie={prospectSituatie}
            sponsorNaam={sponsorNaam}
            sponsorPeriode={sponsorPeriode}
            geslacht={geslacht}
          />
        ))}
      </div>
    </div>
  );
}
