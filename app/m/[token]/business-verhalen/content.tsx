import Link from "next/link";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";

// ============================================================
// Business-verhalen: ervaringen van mensen die je voorgingen met de
// business-kant. Apart van /verhalen (dat puur product is).
//
// Acht thema-secties met korte tekst-intro plus MediaBlokken-slot.
//
// Sinds 2026-06-01: alle teksten editable via namespace
// 'mini-eleva-business-verhalen'.
// ============================================================

const NS = "mini-eleva-business-verhalen";

type Props = {
  isFounder: boolean;
  prospectVoornaam: string;
  memberNaam: string | null;
  sponsorNaam: string | null;
  terugHref: string;
  blokkenPerPositie: Record<string, Blok[]>;
  tekstOverrides: Record<string, string>;
};

export function MiniElevaBusinessVerhalenContent({
  isFounder,
  prospectVoornaam: _prospectVoornaam,
  memberNaam,
  sponsorNaam,
  terugHref,
  blokkenPerPositie,
  tekstOverrides,
}: Props) {
  const blokken = (positie: string): Blok[] => blokkenPerPositie[positie] ?? [];
  const vars = {
    member: memberNaam ?? "de member",
    sponsor: sponsorNaam ?? "de sponsor",
  };

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
          <EditableTekst
            namespace={NS}
            sleutel="intro.label"
            standaard="Verhalen van mensen die met de business bouwen"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-gold text-xs font-semibold uppercase tracking-wider"
            hint="Klein gouden label boven de paginatitel"
          />
          <EditableTekst
            namespace={NS}
            sleutel="intro.titel"
            standaard="Hoe het er bij anderen uit is gaan zien"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h1"
            className="font-serif-warm text-2xl text-cm-white leading-tight mt-1"
            hint="Hoofdtitel business-verhalen"
          />
          <EditableBlok
            namespace={NS}
            sleutel="intro.uitleg"
            standaard="Geen succes-marketing, gewoon echte mensen die vertellen wat ze hebben opgebouwd, waar ze tegenaan liepen, en wat het voor hun leven heeft betekend. Resultaten verschillen per persoon, dat hoort erbij. Wel geeft het je een eerlijk beeld van wat er mogelijk is en hoe het pad er ongeveer uitziet."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/75 text-sm leading-relaxed mt-3"
            rows={4}
            hint="Intro-paragraaf onder de titel"
          />
        </div>

        <MediaBlokken
          paginaNamespace={NS}
          paginaId="overzicht"
          positie="intro"
          blokken={blokken("intro")}
          isFounder={isFounder}
        />

        {/* EERSTE 3-WEG */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="eerste-3weg.titel"
            standaard="🎯 De eerste 3-weg, hoe dat voelde"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel eerste 3-weg"
          />
          <EditableBlok
            namespace={NS}
            sleutel="eerste-3weg.tekst"
            standaard="Bijna iedereen die nu mooi bouwt heeft de eerste 3-weg met een mengeling van zenuwen en doorzettingsvermogen gedaan. Verhalen over die eerste keer: wat er door je hoofd ging, hoe je sponsor erbij voelde, en wat er na afloop kantelde. Vaak het moment waarop mensen dachten 'oh, dit kan dus wel'."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Beschrijving eerste-3-weg-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="eerste-3weg"
            blokken={blokken("eerste-3weg")}
            isFounder={isFounder}
          />
        </section>

        {/* EERSTE KLANTEN */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="eerste-klanten.titel"
            standaard="🌱 Eerste klanten, eerste commissies"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel eerste klanten"
          />
          <EditableBlok
            namespace={NS}
            sleutel="eerste-klanten.tekst"
            standaard="Voor veel mensen is dat ene moment dat de eerste bestelling via hun link binnenkomt onvergetelijk. Niet zozeer om het bedrag, wel om de bevestiging dat het werkt en dat iemand via jou is gegaan. Verhalen over hoe dat ging, wie de eerste klant was, en wat er daarna in beweging kwam."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Beschrijving eerste-klanten-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="eerste-klanten"
            blokken={blokken("eerste-klanten")}
            isFounder={isFounder}
          />
        </section>

        {/* EERSTE MEMBER */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="eerste-member.titel"
            standaard="👥 Eerste member, eerste team-gevoel"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel eerste member"
          />
          <EditableBlok
            namespace={NS}
            sleutel="eerste-member.tekst"
            standaard="De stap van 'ik werk in mijn eentje' naar 'er bouwt iemand naast mij' is groot. Verhalen over de eerste keer dat iemand zei 'ik wil dit ook gaan doen', hoe je samen op weg ging, en wat er met je werk veranderde toen je niet meer de enige was die het droeg."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Beschrijving eerste-member-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="eerste-member"
            blokken={blokken("eerste-member")}
            isFounder={isFounder}
          />
        </section>

        {/* BIJVERDIENSTE */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="bijverdienste.titel"
            standaard="💶 Bewuste bijverdienste naast werk"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel bijverdienste"
          />
          <EditableBlok
            namespace={NS}
            sleutel="bijverdienste.tekst"
            standaard="Niet iedereen bouwt naar een hoofdinkomen, en dat hoeft ook niet. Verhalen van mensen die er bewust een bijverdienste van maken: een paar honderd euro per maand extra, een rustig ritme naast hun baan, en hoe ze die ruimte invullen (vakantie, sparen, kinderen, of gewoon ademruimte)."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Beschrijving bijverdienste-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="bijverdienste"
            blokken={blokken("bijverdienste")}
            isFounder={isFounder}
          />
        </section>

        {/* VRIJHEID */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="vrijheid.titel"
            standaard="🕊️ Vervangend inkomen en vrijheid"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel vrijheid"
          />
          <EditableBlok
            namespace={NS}
            sleutel="vrijheid.tekst"
            standaard="Voor sommigen groeide het uit tot een hoofdinkomen, of zelfs tot meer dan ze in loondienst verdienden. Verhalen over hoe dat is gegaan, welke keuzes daarbij hoorden, en wat de vrijheid concreet brengt. Eigen uren, geen baas, tijd voor wat belangrijk is, maar ook de verantwoordelijkheid van zelf je dag indelen."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Beschrijving vrijheid-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="vrijheid"
            blokken={blokken("vrijheid")}
            isFounder={isFounder}
          />
        </section>

        {/* SPONSOR */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="sponsor.titel"
            standaard="🤝 Samen met je sponsor bouwen"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel sponsor-relatie"
          />
          <EditableBlok
            namespace={NS}
            sleutel="sponsor.tekst"
            standaard="Wat veel mensen verrast is hoe persoonlijk de sponsor-relatie is. Niet een baas, niet een collega, wel iemand die er naast je is omdat jouw groei ook voor haar belangrijk is. Verhalen over hoe die samenwerking voelt, wat 'r anders is dan andere werkvormen, en wat je samen kunt doen wat alleen niet lukt."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Beschrijving sponsor-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="sponsor"
            blokken={blokken("sponsor")}
            isFounder={isFounder}
          />
        </section>

        {/* TEGENSLAG */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="tegenslag.titel"
            standaard="🪨 Tegenslag, en hoe je toch doorzet"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel tegenslag"
          />
          <EditableBlok
            namespace={NS}
            sleutel="tegenslag.tekst"
            standaard="Bouwen gaat met ups en downs, dat hoort erbij. Verhalen over momenten dat het tegen zat: een nee waar je een ja verwachtte, een prospect die afhaakte, een periode van stilte. En vooral: hoe mensen daar weer doorheen kwamen, wat ze geleerd hebben, en waarom ze blij zijn dat ze niet zijn gestopt."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Beschrijving tegenslag-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="tegenslag"
            blokken={blokken("tegenslag")}
            isFounder={isFounder}
          />
        </section>

        {/* DOORBRAAK */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="doorbraak.titel"
            standaard="✨ Het moment dat het klikte"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel doorbraak-momenten"
          />
          <EditableBlok
            namespace={NS}
            sleutel="doorbraak.tekst"
            standaard="Vrijwel iedereen die nu lekker bouwt heeft een moment gehad waarop iets kantelde. Een gesprek dat anders ging, een eerste 'ja, ik wil dit ook', een dag waarop ineens duidelijk werd hoe het verder kan. Verhalen over die kantelmomenten, wat 'r vooraf ging, en wat 'r daarna mogelijk werd."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Beschrijving doorbraak-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="doorbraak"
            blokken={blokken("doorbraak")}
            isFounder={isFounder}
          />
        </section>

        {/* AFSLUITEND */}
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <EditableBlok
            namespace={NS}
            sleutel="afsluit.uitleg"
            standaard="Herken je iets in deze verhalen, of komt er een vraag bij je naar boven? Stel 'm rustig aan de ELEVA-mentor, of haal {member} of {sponsor} erbij voor het persoonlijke gesprek. Geen druk, gewoon doorpraten over wat dit voor jou zou kunnen betekenen."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Slot-uitleg met doorverwijzing"
          />
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
