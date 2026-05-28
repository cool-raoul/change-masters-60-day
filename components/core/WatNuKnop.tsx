"use client";

// File: components/core/WatNuKnop.tsx
//
// De "wat nu?"-knop: de gereedschapskist-laag uit het tempo-spec
// (docs/superpowers/specs/2026-05-28-core-tempo-en-twee-lagen-design.md).
//
// Vaste knop linksonder (spraakknop VoiceFab zit rechtsonder). Bij tikken
// opent een menu met zes inklapbare onderwerpen. Tik een onderwerp open,
// tik dan een situatie: je krijgt EERST een korte uitleg in jouw stem,
// en pas daarna de knop naar de juiste plek. Een verwijzing zonder uitleg
// helpt niemand (Raoul, 2026-05-28).
//
// PROTOTYPE: uitleg-teksten staan in code, nog niet founder-bewerkbaar.
// Routes linken naar bestaande scripts / Mentor / tools.

import { useState } from "react";
import Link from "next/link";

type Situatie = {
  emoji: string;
  label: string;
  uitleg: string;
  actieLabel: string;
  route: string;
};

type Groep = {
  kop: string;
  situaties: Situatie[];
};

const GROEPEN: Groep[] = [
  {
    kop: "📣 Er komt iets binnen op je post",
    situaties: [
      {
        emoji: "💬",
        label: "Iemand reageerde",
        uitleg:
          "Fijn, er is een reactie! Reageer binnen een uur terug. Niet meteen pitchen, wel een warme opener die het gesprek opent. Hieronder staan de opener-scripts en het 3-soorten-mensen-DM.",
        actieLabel: "Open de opener-scripts",
        route: "/scripts?cat=opener",
      },
      {
        emoji: "👍",
        label: "Iemand liket alleen",
        uitleg:
          "Een like is ook een opening. Stuur een kort, vrijblijvend berichtje. Niet 'wil je kopen', wel 'leuk dat je 'm zag, ben je ergens mee bezig?'. Het like-DM-script helpt je op weg.",
        actieLabel: "Open de opener-scripts",
        route: "/scripts?cat=opener",
      },
      {
        emoji: "🔥",
        label: "Iemand wil meer weten",
        uitleg:
          "Er is interesse, mooi. Stuur een prospect-filmpje dat past bij wat ze zoeken en plan een vervolg. Twijfel je welk filmpje? De Mentor zoekt 'm met je uit.",
        actieLabel: "Open de Mentor",
        route: "/coach",
      },
      {
        emoji: "🌙",
        label: "Iemand reageert niet meer",
        uitleg:
          "Gebeurt, geen zorgen. Eén warm, vrijblijvend hercontact is genoeg. Iets als 'ik zag dat het even stil werd, helemaal oké, ben benieuwd hoe het met je gaat'. Geen druk.",
        actieLabel: "Open de hercontact-scripts",
        route: "/scripts?cat=followup",
      },
    ],
  },
  {
    kop: "💬 Een gesprek of uitnodiging",
    situaties: [
      {
        emoji: "✉️",
        label: "Ik wil iemand uitnodigen",
        uitleg:
          "Top. Gebruik het webshop-frame: geen 'wil je iets kopen', wel 'ik heb een manier gevonden om...'. De uitnodig-scripts geven je de vier bouwstenen om het in jouw woorden te zetten.",
        actieLabel: "Open de uitnodig-scripts",
        route: "/scripts?cat=uitnodiging",
      },
      {
        emoji: "🤷",
        label: "Ik weet niet wat ik moet zeggen",
        uitleg:
          "Geen punt. Vertel de Mentor wie de persoon is en wat je wil bereiken, dan schrijft ie een bericht op maat, in jouw stem.",
        actieLabel: "Open de Mentor",
        route: "/coach",
      },
      {
        emoji: "🤔",
        label: "Iemand twijfelt of zegt nee",
        uitleg:
          "Twijfel is meestal een vraag, geen nee. Erken het, vraag door, en gebruik Feel-Felt-Found. De bezwaren-scripts geven je de woorden voor de meest voorkomende bezwaren.",
        actieLabel: "Open de bezwaren-scripts",
        route: "/scripts?cat=bezwaar",
      },
      {
        emoji: "🤝",
        label: "Ik wil een 3-weg inplannen",
        uitleg:
          "Een 3-weg is jij plus je sponsor plus je prospect. Jij introduceert je sponsor (je edification-zin), zij doet de inhoudelijke uitleg. Hier vind je het script en hoe je 'm inplant.",
        actieLabel: "Open de 3-weg-scripts",
        route: "/scripts?cat=uitnodiging",
      },
    ],
  },
  {
    kop: "🎬 Iets tonen of delen",
    situaties: [
      {
        emoji: "🎬",
        label: "Hoe deel ik een filmpje?",
        uitleg:
          "Stuur een prospect-filmpje dat past bij wat iemand zoekt. Bekijk 'm zelf eerst even, zodat je weet wat erin zit als ze iets vragen. De Mentor helpt je het juiste kiezen.",
        actieLabel: "Open de Mentor",
        route: "/coach",
      },
      {
        emoji: "🎁",
        label: "Hoe deel ik een freebie?",
        uitleg:
          "Je hebt een eigen tracking-link per freebie. Wie via jouw link instapt, komt automatisch op je namenlijst. Hier vind je je links en hoe je ze deelt.",
        actieLabel: "Naar je freebies & links",
        route: "/instellingen/mijn-tracking-links",
      },
      {
        emoji: "🛍️",
        label: "Hoe deel ik mijn webshop?",
        uitleg:
          "Je persoonlijke bestellink staat klaar. Tip: laat ze ASAP aanvinken voor extra korting, dat doen bijna al je klanten. Hier vind je je links.",
        actieLabel: "Naar je bestellinks",
        route: "/instellingen/bestellinks",
      },
      {
        emoji: "📋",
        label: "Welk advies past bij iemand?",
        uitleg:
          "Laat iemand de productadvies-vragenlijst of een score-bot doen. In een paar minuten weet je wat past, en jij krijgt de uitkomst op de prospect-kaart.",
        actieLabel: "Naar je vragenlijsten",
        route: "/instellingen/mijn-tracking-links",
      },
    ],
  },
  {
    kop: "🛒 Iemand heeft gekocht",
    situaties: [
      {
        emoji: "📦",
        label: "Net besteld, wat nu?",
        uitleg:
          "Gefeliciteerd! Stuur een warm welkom, leg ASAP even uit, en zet ze in de klantomgeving. Daar volgen jullie samen de eerste stappen.",
        actieLabel: "Naar je klantomgeving",
        route: "/klant",
      },
      {
        emoji: "💞",
        label: "Hoe volg ik een klant op?",
        uitleg:
          "In de klantomgeving zie je waar je klant staat op de tijdlijn. Op de juiste momenten stel je een korte vraag. Niet verkopen, wel meeleven en helpen.",
        actieLabel: "Naar je klantomgeving",
        route: "/klant",
      },
      {
        emoji: "🌟",
        label: "Klant is enthousiast",
        uitleg:
          "Het mooiste moment. Vraag of ze anderen ook zo'n resultaat gunnen. Geen pitch, wel een opening. De Mentor helpt je de juiste woorden vinden.",
        actieLabel: "Open de Mentor",
        route: "/coach",
      },
    ],
  },
  {
    kop: "🌙 Het loopt even niet",
    situaties: [
      {
        emoji: "🫂",
        label: "Ik zie het even niet zitten",
        uitleg:
          "Hoort erbij, echt. Even praten lucht op. Stuur je sponsor een berichtje, of praat met de Mentor. Je hoeft dit niet alleen te doen.",
        actieLabel: "Open de Mentor",
        route: "/coach",
      },
      {
        emoji: "🧭",
        label: "Wat moet ik nu doen?",
        uitleg:
          "Geen overzicht meer? Ga terug naar je huidige stap. Daar staat precies wat vandaag telt. Eén ding tegelijk, meer hoeft niet.",
        actieLabel: "Naar je huidige stap",
        route: "/core-v9",
      },
      {
        emoji: "❤️",
        label: "Waarom doe ik dit ook alweer",
        uitleg:
          "Even je WHY terugzien. Dat is je brandstof op de mindere dagen, de reden waarom je begon. Hier staat 'm.",
        actieLabel: "Naar je WHY",
        route: "/mijn-why",
      },
    ],
  },
  {
    kop: "👥 Mijn team",
    situaties: [
      {
        emoji: "🙋",
        label: "Mijn teamlid heeft een vraag",
        uitleg:
          "Fijn dat je er voor ze bent. Soms kun je het zelf, soms haal je je sponsor erbij voor een 3-weg. Check je partners en zie wie aandacht nodig heeft.",
        actieLabel: "Naar je team",
        route: "/team",
      },
      {
        emoji: "🎉",
        label: "Iemand is bij mij gestart",
        uitleg:
          "Gefeliciteerd, je eerste of volgende member! Heet ze welkom en help ze hun eerste stappen. Hier zie je je team.",
        actieLabel: "Naar je team",
        route: "/team",
      },
    ],
  },
];

// Laat een spoor achter zodat de TerugNaarPlaybookBanner op de
// bestemming een "↩ Terug naar je stap"-knop toont. Routes binnen Core
// zelf krijgen geen spoor (je bent dan al thuis).
function metTerugSpoor(route: string): string {
  if (route.startsWith("/core-v9")) return route;
  return route + (route.includes("?") ? "&" : "?") + "van=core-v9";
}

export function WatNuKnop() {
  const [open, setOpen] = useState(false);
  const [openGroep, setOpenGroep] = useState<string | null>(null);
  const [openSituatie, setOpenSituatie] = useState<string | null>(null);

  function sluitAlles() {
    setOpen(false);
    setOpenGroep(null);
    setOpenSituatie(null);
  }

  return (
    <>
      {/* Backdrop sluit het menu bij klik elders */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={sluitAlles}
        />
      )}

      {/* Het menu, opent linksonder boven de knop. */}
      {open && (
        <div className="fixed bottom-36 lg:bottom-20 left-4 z-50 w-[min(92vw,380px)] max-h-[72vh] flex flex-col rounded-2xl border border-cm-gold/40 bg-cm-surface-2 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-cm-border flex-shrink-0">
            <p className="text-cm-white font-semibold text-sm">
              🧰 Wat is er aan de hand?
            </p>
            <p className="text-cm-white/60 text-xs mt-0.5">
              Kies een onderwerp, dan een situatie. Je krijgt eerst uitleg.
            </p>
          </div>

          <div className="overflow-y-auto p-2 space-y-1">
            {GROEPEN.map((groep) => {
              const groepOpen = openGroep === groep.kop;
              return (
                <div key={groep.kop} className="rounded-lg overflow-hidden">
                  {/* Onderwerp-kop, inklapbaar */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenGroep(groepOpen ? null : groep.kop);
                      setOpenSituatie(null);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left rounded-lg hover:bg-cm-gold/5 transition-colors"
                  >
                    <span className="text-sm font-semibold text-cm-white">
                      {groep.kop}
                    </span>
                    <span
                      className={`text-cm-gold text-xs transition-transform ${
                        groepOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Situaties binnen het onderwerp */}
                  {groepOpen && (
                    <div className="pl-2 pr-1 pb-1 space-y-0.5">
                      {groep.situaties.map((s) => {
                        const situatieOpen = openSituatie === s.label;
                        return (
                          <div key={s.label}>
                            <button
                              type="button"
                              onClick={() =>
                                setOpenSituatie(
                                  situatieOpen ? null : s.label,
                                )
                              }
                              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                                situatieOpen
                                  ? "bg-cm-gold/10"
                                  : "hover:bg-cm-gold/5"
                              }`}
                            >
                              <span className="text-lg flex-shrink-0 leading-none">
                                {s.emoji}
                              </span>
                              <span className="flex-1 text-sm text-cm-white">
                                {s.label}
                              </span>
                              <span
                                className={`text-cm-gold/70 text-[10px] transition-transform ${
                                  situatieOpen ? "rotate-180" : ""
                                }`}
                              >
                                ▼
                              </span>
                            </button>

                            {/* Eerst uitleg, dan de knop naar de plek */}
                            {situatieOpen && (
                              <div className="mx-2 mb-1 mt-0.5 rounded-lg bg-cm-bg/60 border border-cm-border px-3 py-3 space-y-3">
                                <p className="text-xs text-cm-white/85 leading-relaxed">
                                  {s.uitleg}
                                </p>
                                <Link
                                  href={metTerugSpoor(s.route)}
                                  onClick={sluitAlles}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-cm-gold text-cm-bg px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                                >
                                  {s.actieLabel}
                                  <span>→</span>
                                </Link>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2.5 border-t border-cm-border flex-shrink-0">
            <p className="text-cm-white/50 text-[11px] italic">
              Iets anders? Open gewoon de Mentor, die denkt overal in mee.
            </p>
          </div>
        </div>
      )}

      {/* De vaste knop, linksonder. Spiegelt de spraakknop (rechtsonder)
          qua hoogte: mobiel bottom-20 (boven de bottom-nav), desktop
          bottom-5. Rustiger gestyled zodat de spraakknop de opvallende blijft. */}
      <button
        type="button"
        onClick={() => (open ? sluitAlles() : setOpen(true))}
        className="fixed bottom-20 lg:bottom-5 left-5 z-40 flex items-center gap-2 rounded-full border border-cm-gold/50 bg-cm-surface-2/95 text-cm-gold px-4 py-3 shadow-2xl font-semibold text-sm hover:bg-cm-gold/10 transition-colors"
        aria-label="Wat nu? Hulp bij dit moment"
      >
        <span className="text-lg leading-none">🧰</span>
        {open ? "Sluiten" : "Wat nu?"}
      </button>
    </>
  );
}
