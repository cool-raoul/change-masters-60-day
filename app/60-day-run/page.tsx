// File: app/60-day-run/page.tsx
//
// Publieke One-Pager voor extern delen via WhatsApp/socials.
// Geen auth. Responsive (mobile-first, desktop = 3-koloms grid zoals
// het A4-landscape origineel). OG-tags geven een mooie preview-tegel
// in WhatsApp en LinkedIn.

import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Project Meer Tijd en Vrijheid",
  description:
    "Eerst samen bouwen. Daarna samen vermenigvuldigen. Er ligt een compleet systeem klaar met support, tools, training en begeleiding.",
  openGraph: {
    type: "website",
    url: `${SITE_URL}/60-day-run`,
    title: "Project Meer Tijd en Vrijheid",
    description:
      "Eerst samen bouwen. Daarna samen vermenigvuldigen. Er ligt een compleet systeem klaar met support, tools, training en begeleiding.",
    siteName: "Change Masters",
    locale: "nl_NL",
    images: [
      {
        url: "/og-60-day-run.png",
        width: 1200,
        height: 630,
        alt: "Project Meer Tijd en Vrijheid — Change Masters",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Meer Tijd en Vrijheid",
    description:
      "Eerst samen bouwen. Daarna samen vermenigvuldigen.",
    images: ["/og-60-day-run.png"],
  },
};

const BLOKKEN = [
  {
    titel: "Voor wie dit is",
    punten: [
      "Een groot hart, gedreven, gepassioneerd, en de handen uit de mouwen.",
      "Je voelt dat er meer vrijheid en eigen onderneming mogelijk moet zijn.",
      "Je wilt mensen helpen én zelf vooruit.",
      "Vol gas vooruit, geen jaren modderen.",
    ],
  },
  {
    titel: "Waarom nu",
    punten: [
      "Mensen zoeken meer dan ooit energie, balans en levenskwaliteit.",
      "Behoefte aan extra inkomen zonder een baan erbij groeit.",
      "Plaats-onafhankelijk werken wordt steeds normaler.",
      "Echte aanbevelingen zijn sterker dan ooit. Wie nu instapt, bouwt mee op gezamenlijke energie.",
    ],
  },
  {
    titel: "Waar we mensen mee helpen",
    punten: [
      "Mensen zich van binnenuit beter laten voelen: darmen, metabolisme, gewicht, stress, hormoonbalans, sport & herstel, energie, focus en slaap.",
      "Meer zelfvertrouwen, gemak en levenskwaliteit. Als mensen zich beter voelen, verandert hun leven, en daar praten ze over.",
    ],
  },
  {
    titel: "Het doel van dit traject",
    punten: [
      "Bouw je eerste team.",
      "Creëer momentum.",
      "Leg een sterk fundament.",
      "Help mensen met producten en programma's waar al vraag naar is.",
      "Zet iets neer dat verder groeit.",
    ],
  },
  {
    titel: "Waarom dit plan werkt",
    punten: [
      "Ethisch bedrijf, al 35 jaar sterk, met producten die echte impact maken.",
      "Markt zoekt al naar gezondheid, energie en resultaten.",
      "Structuur en duplicatie. Groei rust niet alleen op jou.",
      "Gratis webshop, presentaties, tools en support staan klaar.",
      "Geen inkoop, geen verkoopdruk, geen investeringen.",
    ],
  },
  {
    titel: "Het systeem dat al klaarstaat",
    punten: [
      "Bewezen presentaties, tools, events, community, reisjes en training.",
      "Follow-up-structuur, support en een online learning system.",
      "Eerst team bouwen + fundament. Daarna opschalen op alles wat er al staat.",
    ],
  },
];

const TEAM_RIJ = [
  { cap: "1e level", pct: "5%", uit: "Op de mensen die jij direct sponsort." },
  { cap: "2e level", pct: "25%", uit: "Op de mensen die zíj sponsoren. De grootste hefboom." },
  { cap: "3e level", pct: "10%", uit: "Op het derde niveau diepte van je groep." },
  { cap: "4e & verder", pct: "3 tot 12%", uit: "Vanaf rang Bronze: oneindig diep door op generaties." },
];

const WEBSHOP_RIJ = [
  { cap: "Eigen webshop", pct: "25%", uit: "Op producten verkocht via jouw eigen webshop." },
  { cap: "2e level", pct: "10%", uit: "Op de webshops van mensen die jij sponsort." },
  { cap: "3e level", pct: "5%", uit: "Op de webshops van het niveau daaronder." },
  { cap: "4e & verder", pct: "3 tot 12%", uit: "Op de overige webshops in je groep." },
];

export default function ZestigDagRunPagina() {
  return (
    <div className="min-h-screen bg-[#f7f1e4] text-[#1a1a1a]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 lg:py-16">

        {/* HEADER */}
        <Reveal herhaal richting="fade">
        <header className="rounded-2xl bg-[#0d0d0d] px-6 py-7 text-center text-white sm:px-10 sm:py-9">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#c9a961] sm:text-sm">
            Project Meer Tijd en Vrijheid
          </div>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
            Eerst samen bouwen.<br className="hidden sm:block" />{" "}
            <span className="text-[#c9a961]">Daarna samen vermenigvuldigen.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed opacity-90 sm:text-base">
            Er ligt een compleet systeem klaar. Met support, tools, training en begeleiding.
          </p>
        </header>
        </Reveal>

        {/* 6 INFO-BLOKKEN */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BLOKKEN.map((b, i) => (
            <Reveal herhaal key={b.titel} richting="up" delay={Math.min(i * 75, 600)} className="h-full">
            <article
              className="h-full rounded-xl border border-[#c9a961] bg-white p-5 shadow-sm"
            >
              <h3 className="border-b border-[#c9a961] pb-2 text-base font-extrabold">
                {b.titel}
              </h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                {b.punten.map((punt, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold text-[#c9a961]">•</span>
                    <span>{punt}</span>
                  </li>
                ))}
              </ul>
            </article>
            </Reveal>
          ))}
        </section>

        {/* MECHANIEK */}
        <Reveal herhaal richting="up">
        <section className="mt-6 rounded-xl border border-[#c9a961] bg-white p-5 sm:p-7">
          <h3 className="border-b border-[#c9a961] pb-2 text-base font-extrabold sm:text-lg">
            Hoe het Vergoedingsplan werkt: de mechaniek
          </h3>

          <div className="mt-4 space-y-4">
            {/* Rij: op je team */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[120px_repeat(4,1fr)]">
              <div className="flex items-center justify-center rounded-lg bg-[#0d0d0d] px-3 py-2 text-center text-xs font-extrabold uppercase tracking-wide text-[#c9a961] sm:text-sm">
                Op je team
              </div>
              {TEAM_RIJ.map((p) => (
                <PercentageKaart key={p.cap} {...p} />
              ))}
            </div>

            {/* Rij: op de webshops */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[120px_repeat(4,1fr)]">
              <div className="flex items-center justify-center rounded-lg bg-[#0d0d0d] px-3 py-2 text-center text-xs font-extrabold uppercase tracking-wide text-[#c9a961] sm:text-sm">
                Op de webshops
              </div>
              {WEBSHOP_RIJ.map((p) => (
                <PercentageKaart key={p.cap} {...p} />
              ))}
            </div>
          </div>

          <div className="mt-5 border-l-2 border-[#c9a961] pl-4 text-sm leading-relaxed">
            <p>Je plaatst een eigen bestelling om volwaardig deel te nemen.</p>
            <p className="mt-2">
              <strong>Hoe meer IP-volume</strong> jij draait én via duplicatie in je groep, hoe hoger de marges en hoe sneller iedereen z'n doel haalt.
            </p>
            <p className="mt-2 text-xs italic text-gray-600">
              Voor concrete cijfers: vraag een 1-op-1 gesprek aan.
            </p>
          </div>
        </section>
        </Reveal>

        {/* CTA + FOOTER */}
        <Reveal herhaal richting="up">
        <section className="mt-6 rounded-t-xl bg-[#0d0d0d] px-6 py-5 text-center text-white sm:px-10 sm:py-7">
          <h3 className="text-base font-extrabold leading-snug sm:text-lg">
            Bouw samen intensief aan je fundament en pluk nog jarenlang de vruchten.
          </h3>
          <div className="mt-2 inline-block font-extrabold text-[#c9a961] underline underline-offset-4">
            Eerst bouwen. Dan vermenigvuldigen. Dan impact maken.
          </div>
          <p className="mt-5 text-sm leading-relaxed text-gray-300">
            Heb je deze pagina van iemand uit het Change Masters team gekregen?
            <br />
            Reageer naar hem of haar terug voor een korte, vrijblijvende kennismaking.
          </p>
        </section>

        {/* DISCLAIMER */}
        <div className="rounded-b-xl bg-[#0d0d0d] px-6 py-3 text-center text-[10px] italic leading-relaxed text-gray-500 sm:px-10 sm:text-xs">
          Er worden geen garanties of toezeggingen gedaan over inkomen. Resultaat hangt af van persoonlijke inzet, het aantal actieve klanten en partners in je groep, het Vergoedingsplan, en marktomstandigheden. Alle inkomsten zijn het resultaat van de verkoop van producten. Geen inkoop, geen verkoopdruk, geen investeringen of gegarandeerde resultaten. De producten zijn voedingssupplementen, geen geneesmiddelen. Geen medische claims.
        </div>
        </Reveal>

      </div>
    </div>
  );
}

function PercentageKaart({ cap, pct, uit }: { cap: string; pct: string; uit: string }) {
  return (
    <div className="flex flex-col justify-center rounded-lg bg-[#0d0d0d] p-3 text-center text-white">
      <div className="text-[10px] font-bold uppercase tracking-wide text-[#c9a961] sm:text-xs">
        {cap}
      </div>
      <div className="my-1 text-2xl font-extrabold leading-none sm:text-3xl">{pct}</div>
      <div className="text-[10px] leading-tight text-[#f0e8d2] sm:text-xs">{uit}</div>
    </div>
  );
}
