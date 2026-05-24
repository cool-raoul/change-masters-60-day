// File: app/bot/tweede-lente/[token]/blok-intro.tsx
//
// Blok 1, warme intro. Toont de naam van de member die de link
// heeft gedeeld, zodat de vrouw voelt dat ze door iemand persoonlijk
// is uitgenodigd. Naam-mismatch tussen social-profiel en
// systeem-profiel is geaccepteerd: het kan zijn dat ze 'Raoul' ziet
// terwijl ze via Gaby kwam. De vrouw begrijpt dat het team is.
//
// TODO-GABY: definitieve openings-tekst aanleveren. Onder staat
// een placeholder die claim-vrij is en in jullie stem klinkt.

"use client";

export function BlokIntro({
  memberVoornaam,
  onStart,
}: {
  memberVoornaam: string;
  onStart: () => void;
}) {
  return (
    <div className="text-center">
      <div className="text-rose-500 text-sm font-medium uppercase tracking-wider">
        Tweede Lente
      </div>
      <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">
        Welkom bij {memberVoornaam} 💟
      </h1>
      <p className="mt-5 text-lg text-gray-700 leading-relaxed">
        Fijn dat je hier bent. {memberVoornaam} heeft deze ruimte met haar team
        voor jou klaargezet, vrouwen die zelf door deze fase zijn gegaan.
      </p>
      <p className="mt-4 text-gray-700 leading-relaxed">
        Vijf minuten, zeven vragen. Aan het eind een rustige spiegel en
        concrete ideeën die veel vrouwen in jouw fase rust geven. Daarna
        kun je optioneel intekenen voor vijf avonden korte mail.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-8 rounded-full bg-rose-600 px-8 py-3 text-white text-base font-medium shadow-sm hover:bg-rose-700 transition"
      >
        Ja, start de vragen
      </button>
      <p className="mt-6 text-xs text-gray-400">
        Tweede Lente deelt herkenning en richting, geen medisch advies.
      </p>
    </div>
  );
}
