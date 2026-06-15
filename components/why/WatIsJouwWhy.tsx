"use client";

import { MediaBlokkenClient } from "@/components/cms/MediaBlokkenClient";

// ============================================================
// WatIsJouwWhy, de uitgebreide WHY-uitleg op de WHY-pagina.
//
// Teruggehaald uit het oorspronkelijke kennisbank-materiaal
// (kennisbank/02-eerste-10-dagen.md, "Je 'Why' & doelen bepalen").
// Deze uitleg stond vroeger op dag 1 en is bij de herinrichting van
// de WHY-pagina verdwenen, waardoor iemand die de pagina opent geen
// uitleg meer zag van WAT een WHY is en WAAROM je 'm maakt. Nu weer
// hier, plus een founder-filmblok voor het WHY-uitlegfilmpje.
//
// NL-first voor de pilot. Vertaling naar de andere talen is een
// follow-up (de rest van de pagina is wel meertalig via useTaal).
// ============================================================

export function WatIsJouwWhy({ isFounder }: { isFounder: boolean }) {
  return (
    <div className="space-y-5 mb-6">
      {/* Founder-filmblok: hier komt het WHY-uitlegfilmpje. Leeg slot
          toont niets voor leden, alleen de founder ziet (in edit-modus)
          de '+ media hier'-knop. */}
      <MediaBlokkenClient
        paginaNamespace="why"
        paginaId="why-uitleg"
        positie="boven-titel"
        isFounder={isFounder}
      />

      <div className="card border-gold-subtle space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💛</span>
          <h2 className="text-lg font-display font-bold text-cm-gold">
            Wat is je WHY, en waarom maak je &apos;m?
          </h2>
        </div>

        <p className="text-cm-white text-sm leading-relaxed opacity-90">
          Je WHY is de reden waarom je begonnen bent. Je motivatie op de
          mindere dagen, je brandstof om door te zetten.
        </p>
        <p className="text-cm-white text-sm leading-relaxed opacity-90">
          Je deelt je WHY in gesprekken met mensen. Mensen haken niet aan op
          een product of een bedrijf, ze haken aan op een persoonlijk verhaal.
          Het jouwe. Daarom is dit het fundament onder alles wat je hierna doet.
        </p>
        <p className="text-cm-white text-sm leading-relaxed opacity-90">
          Mensen die hun WHY helder hebben, houden het langer vol als het even
          tegenzit. Je WHY is niet &quot;meer geld&quot;, maar wat dat geld in
          jouw leven verandert. En hij is zo opgeschreven dat je &apos;m met
          trots kunt delen met de mensen om je heen.
        </p>

        <div className="bg-cm-surface-2 border border-cm-border rounded-xl p-4 space-y-2">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Waar het straks over gaat
          </p>
          <p className="text-cm-white text-sm leading-relaxed opacity-80">
            Zo meteen stelt de Mentor je een paar van deze vragen. Je hoeft ze
            nu niet te beantwoorden, het helpt alleen om er alvast even over na
            te denken:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-cm-white text-sm leading-relaxed opacity-90 marker:text-cm-gold">
            <li>Wie ben ik? Wat doe ik?</li>
            <li>Wat vind ik niet leuk aan mijn huidige situatie?</li>
            <li>Waarom ben ik hiermee gestart, en wat wil ik veranderen?</li>
            <li>Wat wil ik bereiken, op korte én lange termijn?</li>
            <li>Wat zou er in mijn leven veranderen als dit echt lukt?</li>
            <li>Hoe ziet mijn leven eruit als het lukt, en hoe voel ik me dan?</li>
          </ol>
        </div>

        <p className="text-cm-gold text-sm italic text-center pt-1">
          &ldquo;Dit is de kern van je motivatie.&rdquo;
        </p>
      </div>
    </div>
  );
}
