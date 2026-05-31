import Link from "next/link";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";

// ============================================================
// Business-verhalen: ervaringen van mensen die je voorgingen met de
// business-kant. Apart van /verhalen (dat puur product is) zodat
// business-prospects een eigen ruimte krijgen met opbouw-verhalen.
//
// Acht thema-secties met korte tekst-intro plus MediaBlokken-slot
// waar Gaby filmpjes, quotes of foto's kan toevoegen.
// ============================================================

type Props = {
  isFounder: boolean;
  prospectVoornaam: string;
  memberNaam: string | null;
  sponsorNaam: string | null;
  terugHref: string;
  blokkenPerPositie: Record<string, Blok[]>;
};

export function MiniElevaBusinessVerhalenContent({
  isFounder,
  prospectVoornaam: _prospectVoornaam,
  memberNaam,
  sponsorNaam,
  terugHref,
  blokkenPerPositie,
}: Props) {
  const blokken = (positie: string): Blok[] => blokkenPerPositie[positie] ?? [];

  return (
    <EditModeProvider>
      <div className="space-y-6 pt-6">
        <Link
          href={terugHref}
          className="text-cm-white/60 hover:text-cm-white text-sm flex items-center gap-1"
        >
          ← Terug
        </Link>

        <div>
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Verhalen van mensen die met de business bouwen
          </p>
          <h1 className="font-serif-warm text-2xl text-cm-white leading-tight mt-1">
            Hoe het er bij anderen uit is gaan zien
          </h1>
          <p className="text-cm-white/75 text-sm leading-relaxed mt-3">
            Geen succes-marketing, gewoon echte mensen die vertellen wat
            ze hebben opgebouwd, waar ze tegenaan liepen, en wat het
            voor hun leven heeft betekend. Resultaten verschillen per
            persoon, dat hoort erbij. Wel geeft het je een eerlijk beeld
            van wat er mogelijk is en hoe het pad er ongeveer uitziet.
          </p>
        </div>

        {/* Intro-blok (optioneel filmpje, bv. Raoul of Gaby over wat je
            hier gaat zien) */}
        <MediaBlokken
          paginaNamespace="mini-eleva-business-verhalen"
          paginaId="overzicht"
          positie="intro"
          blokken={blokken("intro")}
          isFounder={isFounder}
        />

        {/* ============================================================
            EERSTE 3-WEG
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🎯 De eerste 3-weg, hoe dat voelde
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Bijna iedereen die nu mooi bouwt heeft de eerste 3-weg met
            een mengeling van zenuwen en doorzettingsvermogen gedaan.
            Verhalen over die eerste keer: wat er door je hoofd ging,
            hoe je sponsor erbij voelde, en wat er na afloop kantelde.
            Vaak het moment waarop mensen dachten 'oh, dit kan dus
            wel'.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-business-verhalen"
            paginaId="overzicht"
            positie="eerste-3weg"
            blokken={blokken("eerste-3weg")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            EERSTE KLANTEN
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🌱 Eerste klanten, eerste commissies
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Voor veel mensen is dat ene moment dat de eerste bestelling
            via hun link binnenkomt onvergetelijk. Niet zozeer om het
            bedrag, wel om de bevestiging dat het werkt en dat iemand
            via jou is gegaan. Verhalen over hoe dat ging, wie de
            eerste klant was, en wat er daarna in beweging kwam.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-business-verhalen"
            paginaId="overzicht"
            positie="eerste-klanten"
            blokken={blokken("eerste-klanten")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            EERSTE MEMBER / TEAM
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            👥 Eerste member, eerste team-gevoel
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            De stap van 'ik werk in mijn eentje' naar 'er bouwt iemand
            naast mij' is groot. Verhalen over de eerste keer dat
            iemand zei 'ik wil dit ook gaan doen', hoe je samen op weg
            ging, en wat er met je werk veranderde toen je niet meer de
            enige was die het droeg.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-business-verhalen"
            paginaId="overzicht"
            positie="eerste-member"
            blokken={blokken("eerste-member")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            BIJVERDIENSTE
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            💶 Bewuste bijverdienste naast werk
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Niet iedereen bouwt naar een hoofdinkomen, en dat hoeft ook
            niet. Verhalen van mensen die er bewust een bijverdienste
            van maken: een paar honderd euro per maand extra, een rustig
            ritme naast hun baan, en hoe ze die ruimte invullen
            (vakantie, sparen, kinderen, of gewoon ademruimte).
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-business-verhalen"
            paginaId="overzicht"
            positie="bijverdienste"
            blokken={blokken("bijverdienste")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            VERVANGEND INKOMEN / VRIJHEID
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🕊️ Vervangend inkomen en vrijheid
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Voor sommigen groeide het uit tot een hoofdinkomen, of zelfs
            tot meer dan ze in loondienst verdienden. Verhalen over hoe
            dat is gegaan, welke keuzes daarbij hoorden, en wat de
            vrijheid concreet brengt. Eigen uren, geen baas, tijd voor
            wat belangrijk is, maar ook de verantwoordelijkheid van
            zelf je dag indelen.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-business-verhalen"
            paginaId="overzicht"
            positie="vrijheid"
            blokken={blokken("vrijheid")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            SAMEN MET SPONSOR
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🤝 Samen met je sponsor bouwen
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Wat veel mensen verrast is hoe persoonlijk de sponsor-
            relatie is. Niet een baas, niet een collega, wel iemand die
            er naast je is omdat jouw groei ook voor haar belangrijk
            is. Verhalen over hoe die samenwerking voelt, wat 'r
            anders is dan andere werkvormen, en wat je samen kunt doen
            wat alleen niet lukt.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-business-verhalen"
            paginaId="overzicht"
            positie="sponsor"
            blokken={blokken("sponsor")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            TEGENSLAG EN DOORZETTEN
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🪨 Tegenslag, en hoe je toch doorzet
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Bouwen gaat met ups en downs, dat hoort erbij. Verhalen
            over momenten dat het tegen zat: een nee waar je een ja
            verwachtte, een prospect die afhaakte, een periode van
            stilte. En vooral: hoe mensen daar weer doorheen kwamen,
            wat ze geleerd hebben, en waarom ze blij zijn dat ze niet
            zijn gestopt.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-business-verhalen"
            paginaId="overzicht"
            positie="tegenslag"
            blokken={blokken("tegenslag")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            DOORBRAAK-MOMENTEN
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            ✨ Het moment dat het klikte
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Vrijwel iedereen die nu lekker bouwt heeft een moment
            gehad waarop iets kantelde. Een gesprek dat anders ging,
            een eerste 'ja, ik wil dit ook', een dag waarop ineens
            duidelijk werd hoe het verder kan. Verhalen over die
            kantelmomenten, wat 'r vooraf ging, en wat 'r daarna
            mogelijk werd.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-business-verhalen"
            paginaId="overzicht"
            positie="doorbraak"
            blokken={blokken("doorbraak")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            AFSLUITEND
            ============================================================ */}
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Herken je iets in deze verhalen, of komt er een vraag bij je
            naar boven? Stel 'm rustig aan de ELEVA-mentor, of haal{" "}
            {memberNaam ?? "de member"} of{" "}
            {sponsorNaam ?? "de sponsor"} erbij voor het persoonlijke
            gesprek. Geen druk, gewoon doorpraten over wat dit voor jou
            zou kunnen betekenen.
          </p>
          <div className="flex gap-2 flex-wrap pt-2">
            <Link
              href={`${terugHref}/mentor`}
              className="text-xs px-3 py-1.5 rounded-full bg-cm-gold/15 text-cm-gold hover:bg-cm-gold/25 transition-colors"
            >
              🤖 Open de Mentor
            </Link>
            <Link
              href={`${terugHref}/chat`}
              className="text-xs px-3 py-1.5 rounded-full bg-cm-gold/15 text-cm-gold hover:bg-cm-gold/25 transition-colors"
            >
              💬 Naar de chat
            </Link>
          </div>
        </section>

        <Link
          href={terugHref}
          className="block text-center text-cm-gold text-sm hover:underline pt-4"
        >
          ← Terug naar overzicht
        </Link>
      </div>
    </EditModeProvider>
  );
}
