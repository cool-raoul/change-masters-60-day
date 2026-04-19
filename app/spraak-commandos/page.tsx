"use client";

import Link from "next/link";

type Voorbeeld = { zin: string; uitleg?: string };
type Commando = {
  categorie: string;
  icoon: string;
  titel: string;
  wat: string;
  voorbeelden: Voorbeeld[];
  tip?: string;
};

const CATEGORIE_KLEUREN: Record<string, string> = {
  "Prospects": "border-cm-gold/40 bg-cm-gold/5",
  "Activiteit": "border-blue-500/40 bg-blue-500/5",
  "Herinneringen": "border-purple-500/40 bg-purple-500/5",
  "Correcties": "border-yellow-500/40 bg-yellow-500/5",
  "Bestellingen": "border-green-500/40 bg-green-500/5",
  "Navigatie": "border-cm-gold/40 bg-cm-gold/5",
  "Persoonlijk": "border-pink-500/40 bg-pink-500/5",
  "Verwijderen": "border-red-500/40 bg-red-500/5",
};

const COMMANDOS: Commando[] = [
  // ─── PROSPECTS ───────────────────────────────────────────────
  {
    categorie: "Prospects",
    icoon: "📥",
    titel: "Nieuwe prospect toevoegen",
    wat: "Iemand in je pijplijn zetten met naam, fase en optionele notities.",
    voorbeelden: [
      { zin: "\"Voeg Maria van der Berg toe als nieuwe prospect, ze is geïnteresseerd.\"" },
      { zin: "\"Nieuwe prospect Johan, 52 jaar, heeft brainfog en hoge bloeddruk.\"" },
      { zin: "\"Zet de zus van Pieter op de lijst met relatie-info.\"" },
    ],
    tip: "Noem een volledige naam voor de beste match. Fase wordt automatisch 'prospect' als je niets zegt.",
  },
  {
    categorie: "Prospects",
    icoon: "🔄",
    titel: "Prospect bijwerken / fase wijzigen",
    wat: "Bestaande prospect naar een volgende fase in de pijplijn.",
    voorbeelden: [
      { zin: "\"Petra de Voogd is uitgenodigd voor de presentatie van zaterdag.\"" },
      { zin: "\"Arno is member geworden.\"" },
      { zin: "\"Maria heeft afgezegd, zet haar op not-yet.\"" },
    ],
  },
  {
    categorie: "Prospects",
    icoon: "📇",
    titel: "Contactgegevens bijwerken",
    wat: "Telefoon, e-mail, Instagram of Facebook toevoegen.",
    voorbeelden: [
      { zin: "\"Het nummer van Pieter is 06 12345678.\"" },
      { zin: "\"Maria's Instagram is @mariavdb.\"" },
    ],
  },
  {
    categorie: "Prospects",
    icoon: "✏️",
    titel: "Prospect hernoemen",
    wat: "Typefout in naam corrigeren.",
    voorbeelden: [
      { zin: "\"Pieter de Hoog heet eigenlijk Pieter de Hoogh.\"" },
      { zin: "\"De achternaam van Maria is Van Berg, niet van den Berg.\"" },
    ],
  },
  {
    categorie: "Prospects",
    icoon: "⭐",
    titel: "Prioriteit zetten",
    wat: "Hoog / normaal / laag als focus-signaal.",
    voorbeelden: [
      { zin: "\"Zet Petra op hoge prioriteit.\"" },
      { zin: "\"Maak Arno normaal.\"" },
      { zin: "\"Johan is niet zo belangrijk meer, zet op laag.\"" },
    ],
  },

  // ─── ACTIVITEIT ───────────────────────────────────────────
  {
    categorie: "Activiteit",
    icoon: "📝",
    titel: "Notitie bij een prospect",
    wat: "Los stukje info vastleggen bij iemand.",
    voorbeelden: [
      { zin: "\"Noteer bij Maria dat ze ook geïnteresseerd is in het starterpakket.\"" },
      { zin: "\"Schrijf op bij Pieter: hij heeft twee kinderen en werkt fulltime.\"" },
    ],
  },
  {
    categorie: "Activiteit",
    icoon: "💬",
    titel: "Contact loggen",
    wat: "Een gesprek, DM, bel of presentatie registreren.",
    voorbeelden: [
      { zin: "\"Ik heb Pieter vandaag gebeld, hij wil volgende week afspreken.\"" },
      { zin: "\"DM gestuurd naar Maria, nog geen reactie.\"" },
      { zin: "\"Presentatie gegeven aan Johan, hij moet het nog bespreken met zijn vrouw.\"" },
    ],
  },
  {
    categorie: "Activiteit",
    icoon: "📊",
    titel: "Dagstats OPHOGEN",
    wat: "Iets erbij tellen bij de dagelijkse teller.",
    voorbeelden: [
      { zin: "\"Ik heb vandaag 3 mensen gesproken en 2 uitnodigingen gedaan.\"" },
      { zin: "\"Er zijn 4 follow-ups bijgekomen.\"" },
    ],
  },
  {
    categorie: "Correcties",
    icoon: "🔢",
    titel: "Dagstats CORRIGEREN",
    wat: "Waarde vervangen i.p.v. optellen (als je te veel of te weinig hebt geboekt).",
    voorbeelden: [
      { zin: "\"Ik had vandaag niet 3 maar 5 contacten.\"" },
      { zin: "\"Zet uitnodigingen op 7.\"" },
      { zin: "\"Corrigeer de presentaties naar 2.\"" },
    ],
    tip: "Onderscheid met ophogen: 'er zijn X bij' = optellen, 'is eigenlijk X' / 'zet op X' = vervangen.",
  },

  // ─── BESTELLINGEN ─────────────────────────────────────────
  {
    categorie: "Bestellingen",
    icoon: "📦",
    titel: "Bestelling registreren",
    wat: "Iemand heeft een product gekocht. Activeert automatisch opvolg-herinneringen (21/51/81 dagen).",
    voorbeelden: [
      { zin: "\"Arno heeft gisteren het basispakket besteld.\"" },
      { zin: "\"Maria is klant geworden met OmeGold en Daily BioBasics.\"" },
      { zin: "\"Pieter heeft het starterpakket genomen, fase op shopper.\"" },
    ],
    tip: "Noem altijd welk product — dan matcht ELEVA naar de officiële Lifeplus-naam.",
  },
  {
    categorie: "Bestellingen",
    icoon: "✅",
    titel: "Opvolg-herinnering + nieuwe bestelling",
    wat: "De 21/51/81-daagse reminder afvinken én een nieuwe bestelling boeken.",
    voorbeelden: [
      { zin: "\"De opvolg-check voor Arno is gedaan, hij heeft opnieuw basispakket besteld.\"" },
    ],
  },

  // ─── HERINNERINGEN ─────────────────────────────────────────
  {
    categorie: "Herinneringen",
    icoon: "⏰",
    titel: "Nieuwe herinnering / taak",
    wat: "Iets op je lijst zetten voor later.",
    voorbeelden: [
      { zin: "\"Herinner me donderdag om Maria te bellen over de presentatie.\"" },
      { zin: "\"Zet op de lijst: volgende week Pieter follow-uppen.\"" },
    ],
    tip: "'Morgen' = +1 dag, 'volgende week' = +7, 'volgende maand' = +30. Standaard +7 als je niets zegt.",
  },
  {
    categorie: "Herinneringen",
    icoon: "✔️",
    titel: "Herinnering afvinken",
    wat: "Bestaande reminder als gedaan markeren.",
    voorbeelden: [
      { zin: "\"Vink de herinnering voor Maria af, gedaan.\"" },
      { zin: "\"De opvolging van Pieter is gedaan.\"" },
    ],
  },
  {
    categorie: "Herinneringen",
    icoon: "📅",
    titel: "Herinnering verzetten",
    wat: "Datum of titel van een reminder aanpassen.",
    voorbeelden: [
      { zin: "\"Zet de herinnering voor Maria naar vrijdag.\"" },
      { zin: "\"Verplaats de follow-up voor Pieter naar volgende week.\"" },
    ],
  },

  // ─── VERWIJDEREN / HERSTELLEN ─────────────────────────────
  {
    categorie: "Verwijderen",
    icoon: "🗑️",
    titel: "Prospect verwijderen",
    wat: "Kaart archiveren (verdwijnt uit alle lijsten, kan teruggehaald worden).",
    voorbeelden: [
      { zin: "\"Verwijder de kaart van Francois van Linger.\"" },
      { zin: "\"Haal Maria weg, die is niet meer actueel.\"" },
      { zin: "\"Archiveer Pieter.\"" },
    ],
  },
  {
    categorie: "Verwijderen",
    icoon: "🗑️",
    titel: "Herinnering verwijderen",
    wat: "Reminder definitief weggooien (i.p.v. afvinken).",
    voorbeelden: [
      { zin: "\"Verwijder de herinnering om Maria te bellen, niet meer nodig.\"" },
      { zin: "\"Haal de reminder voor Pieter weg.\"" },
    ],
  },
  {
    categorie: "Verwijderen",
    icoon: "🧹",
    titel: "Notities wissen",
    wat: "Alle notities bij een prospect leegmaken (de kaart blijft).",
    voorbeelden: [
      { zin: "\"Wis alle notities van Maria.\"" },
      { zin: "\"Schoon het dossier van Pieter leeg.\"" },
    ],
  },
  {
    categorie: "Verwijderen",
    icoon: "♻️",
    titel: "Prospect herstellen uit archief",
    wat: "Per ongeluk verwijderde kaart terughalen.",
    voorbeelden: [
      { zin: "\"Haal Francois terug, per ongeluk gearchiveerd.\"" },
      { zin: "\"Herstel Maria uit het archief.\"" },
    ],
  },

  // ─── BULK ─────────────────────────────────────────────────
  {
    categorie: "Prospects",
    icoon: "📦",
    titel: "Bulk fase-wijziging",
    wat: "Meerdere prospects in één commando naar dezelfde fase.",
    voorbeelden: [
      { zin: "\"Zet Pieter, Anna en Marie op follow-up.\"" },
      { zin: "\"Alle shoppers naar member.\"" },
    ],
  },
  {
    categorie: "Prospects",
    icoon: "📝",
    titel: "Bulk-notitie bij groep",
    wat: "Dezelfde notitie bij meerdere prospects.",
    voorbeelden: [
      { zin: "\"Bij alle members noteren dat ik de kerstactie heb aangeboden.\"" },
      { zin: "\"Drie mensen: zelfde notitie dat campagne X loopt.\"" },
    ],
  },

  // ─── NAVIGATIE ────────────────────────────────────────────
  {
    categorie: "Navigatie",
    icoon: "🧭",
    titel: "Ga naar een pagina",
    wat: "Spraak → direct openen van dashboard, kaarten, coach, etc.",
    voorbeelden: [
      { zin: "\"Ga naar dashboard.\"" },
      { zin: "\"Open de kaart van Petra.\"" },
      { zin: "\"Laat mijn herinneringen zien.\"" },
      { zin: "\"Naar de mentor.\"" },
    ],
  },
  {
    categorie: "Navigatie",
    icoon: "🔍",
    titel: "Zoeken",
    wat: "Doorzoek prospects en gesprekken op een term.",
    voorbeelden: [
      { zin: "\"Zoek naar diabetes in mijn notities.\"" },
      { zin: "\"Welke prospects hebben hoge bloeddruk?\"" },
    ],
  },

  // ─── MIJN WHY ─────────────────────────────────────────────
  {
    categorie: "Persoonlijk",
    icoon: "💡",
    titel: "Mijn WHY bijwerken",
    wat: "Je persoonlijke drijfveer opslaan of veranderen.",
    voorbeelden: [
      { zin: "\"Mijn WHY is: ik wil financiële vrijheid zodat ik fulltime voor mijn kinderen kan zorgen.\"" },
      { zin: "\"Update mijn droom naar: 10k per maand en over twee jaar reizen met mijn gezin.\"" },
    ],
  },

  // ─── MENTOR ───────────────────────────────────────────────
  {
    categorie: "Persoonlijk",
    icoon: "🧠",
    titel: "Vraag aan de ELEVA Mentor",
    wat: "Advies, bezwaar-hulp of productsuggesties vragen — wordt gekoppeld aan prospect als je een naam noemt.",
    voorbeelden: [
      { zin: "\"Hoe ga ik om met bezwaar 'geen tijd' bij Maria?\"" },
      { zin: "\"Wat is een goed productadvies voor Petra met brain fog?\"" },
      { zin: "\"Help me met een DM naar Pieter.\"" },
    ],
    tip: "Zonder expliciete vraag worden klachten gewoon als notitie opgeslagen — niet automatisch als mentor-vraag.",
  },
];

export default function SpraakCommandosPagina() {
  const categorien = Array.from(new Set(COMMANDOS.map((c) => c.categorie)));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link
        href="/dashboard"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1"
      >
        ← Terug
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          🎙️ Spraak-commando's
        </h1>
        <p className="text-cm-white mt-1 opacity-80">
          Alles wat je tegen ELEVA kunt zeggen via de goudkleurige microfoon-knop
          rechtsonder. De zinnen zijn voorbeelden — je mag het zeggen zoals het bij
          jou past.
        </p>
      </div>

      <div className="card bg-cm-gold/10 border-cm-gold/40 space-y-2">
        <p className="text-cm-gold text-sm font-semibold">🧭 Hoe werkt het?</p>
        <p className="text-cm-white text-sm">
          1. Druk op de 🎙️ knop rechtsonder. 2. Spreek natuurlijk. 3. ELEVA zet het
          om in tekst, jij controleert het, en na 'Verwerk' ziet je wat er wordt
          opgeslagen. 4. Klik op opslaan — alles gaat automatisch in de app.
        </p>
        <p className="text-cm-white text-xs opacity-70">
          Combineer gerust meerdere dingen in één opname — ELEVA snapt dat.
        </p>
      </div>

      {categorien.map((cat) => {
        const items = COMMANDOS.filter((c) => c.categorie === cat);
        return (
          <section key={cat} className="space-y-3">
            <h2 className="text-lg font-display font-bold text-cm-white pt-2">
              {cat}
            </h2>
            <div className="space-y-3">
              {items.map((cmd, i) => (
                <div
                  key={i}
                  className={`card ${CATEGORIE_KLEUREN[cmd.categorie] || "bg-cm-surface-2"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{cmd.icoon}</span>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <p className="text-cm-white font-semibold text-sm">
                          {cmd.titel}
                        </p>
                        <p className="text-cm-white text-xs opacity-70 mt-0.5">
                          {cmd.wat}
                        </p>
                      </div>
                      <ul className="space-y-1">
                        {cmd.voorbeelden.map((v, j) => (
                          <li
                            key={j}
                            className="text-cm-white text-xs italic opacity-80"
                          >
                            {v.zin}
                          </li>
                        ))}
                      </ul>
                      {cmd.tip && (
                        <p className="text-cm-gold text-xs pt-1 border-t border-cm-border/40">
                          💡 {cmd.tip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <div className="card bg-cm-surface-2 text-sm space-y-2">
        <p className="text-cm-white font-semibold">💬 ELEVA doet iets niet?</p>
        <p className="text-cm-white opacity-80">
          Bij twijfel krijg je altijd uitleg terug (in geel) met wat ELEVA niet kon
          plaatsen. Pas je tekst aan en probeer het opnieuw — of spreek het helemaal
          opnieuw in. De kracht zit in details: volledige namen, duidelijke
          werkwoorden ("voeg toe", "verwijder", "herinner me"), en producten zoals
          ze op de verpakking staan.
        </p>
      </div>
    </div>
  );
}
