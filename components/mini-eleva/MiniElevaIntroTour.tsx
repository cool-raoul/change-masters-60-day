"use client";

import { useEffect, useState } from "react";

// ============================================================
// MiniElevaIntroTour, getoond aan de prospect bij eerste bezoek
// aan /m/[token]. Legt in vier korte secties uit:
//   1. Wat is mini-ELEVA?
//   2. Wat kun je hier?
//   3. Hoe werkt het?
//   4. Wat blijft privé?
//
// Standaard prominent open bij eerste bezoek, daarna ingeklapt met
// een 'Hoe werkt dit?'-knopje voor wie 'm wil herzien. Onthoudt
// keuze in localStorage per token.
// ============================================================

const ONTHOUD_KEY_PREFIX = "mini-eleva-intro-tour-";

type Props = {
  token: string;
  prospectVoornaam: string;
  memberNaam: string | null;
  sponsorNaam: string | null;
};

export function MiniElevaIntroTour({
  token,
  prospectVoornaam,
  memberNaam,
  sponsorNaam,
}: Props) {
  const [open, setOpen] = useState(false);
  const [eersteKeer, setEersteKeer] = useState(false);
  const [gehydreerd, setGehydreerd] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sleutel = ONTHOUD_KEY_PREFIX + token.substring(0, 8);
    const gezien = localStorage.getItem(sleutel);
    if (!gezien) {
      setOpen(true);
      setEersteKeer(true);
    }
    setGehydreerd(true);
  }, [token]);

  function sluit() {
    if (typeof window !== "undefined") {
      const sleutel = ONTHOUD_KEY_PREFIX + token.substring(0, 8);
      localStorage.setItem(sleutel, String(Date.now()));
    }
    setOpen(false);
    setEersteKeer(false);
  }

  function herOpen() {
    setOpen(true);
    setEersteKeer(false);
  }

  // Voorkom hydration-flikkering: niet renderen tot we localStorage
  // hebben gechecked
  if (!gehydreerd) return null;

  const memberDeel = memberNaam ? memberNaam.split(" ")[0] : "de member";
  const sponsorDeel = sponsorNaam ? sponsorNaam.split(" ")[0] : null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={herOpen}
        className="text-cm-gold/70 hover:text-cm-gold text-xs underline mt-1"
      >
        ℹ️ Wat is mini-ELEVA en hoe werkt het?
      </button>
    );
  }

  return (
    <div className="card border-l-4 border-cm-gold space-y-5">
      {eersteKeer && (
        <div className="text-cm-gold text-[10px] font-semibold uppercase tracking-wider">
          Welkom, lees dit even rustig door
        </div>
      )}

      {/* Sectie 1: Wat is dit? */}
      <section className="space-y-2">
        <h3 className="text-cm-white font-semibold text-sm flex items-center gap-2">
          <span className="text-xl">✨</span>
          Wat is mini-ELEVA?
        </h3>
        <p className="text-cm-white/80 text-xs leading-relaxed">
          Hoi {prospectVoornaam}. Dit is jouw eigen kleine versie van ELEVA, de
          tooling die {memberDeel} gebruikt voor zijn werk. {memberDeel} heeft
          'm voor jou klaargezet zodat je rustig kunt kijken wat Lifeplus is,
          waar de producten voor staan, en hoe het verdienmodel in elkaar zit.
          Geen pitch, geen presentatie, geen druk om te beslissen. Gewoon
          rondkijken.
        </p>
      </section>

      {/* Sectie 2: Wat kun je hier? */}
      <section className="space-y-2">
        <h3 className="text-cm-white font-semibold text-sm flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          Wat kun je hier doen?
        </h3>
        <ul className="space-y-2 text-xs">
          <li className="flex gap-2">
            <span className="text-base">👋</span>
            <div>
              <strong className="text-cm-white">Welkomstvideo's</strong>
              <span className="text-cm-white/70">
                : korte intro van {memberDeel}
                {sponsorDeel ? ` en ${sponsorDeel}` : ""}, zodat je weet wie je
                voor je hebt.
              </span>
            </div>
          </li>
          <li className="flex gap-2">
            <span className="text-base">🤖</span>
            <div>
              <strong className="text-cm-white">ELEVA-mentor</strong>
              <span className="text-cm-white/70">
                : een AI die jouw vragen 24/7 beantwoordt. Over producten,
                het verdienmodel, hoe het werkt, wat het niet is. Eerlijk, ook
                over wat 'ie niet weet.
              </span>
            </div>
          </li>
          <li className="flex gap-2">
            <span className="text-base">💬</span>
            <div>
              <strong className="text-cm-white">
                Chat met {memberDeel}
                {sponsorDeel ? ` + ${sponsorDeel}` : ""}
              </strong>
              <span className="text-cm-white/70">
                : echte gesprekken met echte mensen. Tekst- of
                spraakberichten. Reactie komt wanneer ze tijd hebben, je krijgt
                vanzelf een seintje.
              </span>
            </div>
          </li>
          <li className="flex gap-2 opacity-60">
            <span className="text-base">📚</span>
            <div>
              <strong className="text-cm-white">Wat er nog komt</strong>
              <span className="text-cm-white/70">
                : succesverhalen van mensen die hetzelfde pad liepen,
                video's van Lifeplus-events, een kijkje in de fabriek, en
                productinformatie. Dit wordt steeds verder gevuld.
              </span>
            </div>
          </li>
        </ul>
      </section>

      {/* Sectie 3: Hoe werkt het? */}
      <section className="space-y-2">
        <h3 className="text-cm-white font-semibold text-sm flex items-center gap-2">
          <span className="text-xl">🧭</span>
          Hoe werkt het praktisch?
        </h3>
        <ul className="space-y-1.5 text-xs text-cm-white/80 leading-relaxed">
          <li>
            <strong className="text-cm-white">14 dagen geldig.</strong> Je hoeft
            geen account aan te maken, je toegang werkt via de link die je hebt
            gekregen.
          </li>
          <li>
            <strong className="text-cm-white">Op je eigen tempo.</strong> Klik
            op de tegels in elke volgorde die je wilt. Je kunt tussendoor
            stoppen en later terugkomen.
          </li>
          <li>
            <strong className="text-cm-white">Tijd nodig?</strong> {memberDeel}
            {" "}kan verlengen als je nog meer dagen wilt om rustig te kijken.
          </li>
          <li>
            <strong className="text-cm-white">Op je telefoon.</strong> Tip: zet
            ELEVA op je beginscherm via de "deel"-knop van je browser. Dan komt
            'ie terug zoals een gewone app, en kun je meldingen krijgen als
            {" "}{memberDeel} reageert.
          </li>
        </ul>
      </section>

      {/* Sectie 4: Wat blijft privé? */}
      <section className="space-y-2">
        <h3 className="text-cm-white font-semibold text-sm flex items-center gap-2">
          <span className="text-xl">🔒</span>
          Wat blijft privé?
        </h3>
        <p className="text-cm-white/80 text-xs leading-relaxed">
          {memberDeel} ziet wanneer je actief bent en hoeveel vragen je stelt,
          maar niet <strong>wát</strong> je aan de ELEVA-mentor vraagt. Wat je
          met de mentor bespreekt blijft tussen jullie tweeën. Pas als jij zelf
          een bericht stuurt via de <strong>chat-tegel</strong> deel je iets
          met {memberDeel}
          {sponsorDeel ? ` of ${sponsorDeel}` : ""}.
        </p>
      </section>

      <div className="pt-2 border-t border-cm-white/10">
        <button
          type="button"
          onClick={sluit}
          className="btn-gold text-sm w-full"
        >
          {eersteKeer ? "Begrepen, laat me beginnen →" : "Sluit"}
        </button>
      </div>
    </div>
  );
}
