import Link from "next/link";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";

// ============================================================
// Gedeelde FAQ-content voor /m/[token]/faq en de founder-preview.
// Twee secties: product (zichtbaar voor alle sporen) en business
// (uiteindelijk alleen business-spoor zodra dat veld er is).
//
// Per sectie ook een MediaBlokken-slot zodat Gaby losse video-
// antwoorden of quote-blokken kan toevoegen.
// ============================================================

type Props = {
  isFounder: boolean;
  memberNaam: string | null;
  sponsorNaam: string | null;
  terugHref: string;
  blokkenPerPositie: Record<string, Blok[]>;
  /**
   * Welk spoor? Op product-spoor verbergen we de business-FAQ omdat
   * die prospect daar niet voor is uitgenodigd.
   */
  spoor: "product" | "business";
};

export function MiniElevaFaqContent({
  isFounder,
  memberNaam,
  sponsorNaam,
  terugHref,
  blokkenPerPositie,
  spoor,
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
            Veelgestelde vragen
          </p>
          <h1 className="font-serif-warm text-2xl text-cm-white leading-tight mt-1">
            Wat mensen meestal eerst willen weten
          </h1>
          <p className="text-cm-white/75 text-sm leading-relaxed mt-3">
            Klik een vraag open. Staat 'm er niet bij? Stel 'm aan de
            ELEVA-mentor, of haal {memberNaam ?? "de member"} erbij via
            de chat. Geen vraag is dom, juist de eerlijke vragen brengen
            meestal het meeste.
          </p>
        </div>

        {/* Intro-blok */}
        <MediaBlokken
          paginaNamespace="mini-eleva-faq"
          paginaId="overzicht"
          positie="intro"
          blokken={blokken("intro")}
          isFounder={isFounder}
        />

        {/* ============================================================
            IP-UITLEG (komt vaak terug, vooraan)
            ============================================================ */}
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🔢 Wat is een IP eigenlijk?
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            IP staat voor <strong>Internationale Punten</strong>. Dat is
            de eenheid waarin Lifeplus alle bestellingen meet. Elk
            product heeft een IP-waarde, en die telt mee voor je volume,
            je rang en eventuele commissies. IP is internationaal, dus
            een bestelling in Nederland telt op dezelfde manier mee als
            eentje in Duitsland of Engeland.
          </p>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            <strong className="text-cm-gold">Minimale eigen afname:</strong>{" "}
            40 IP per maand voor jezelf, een eigen basis-bestelling
            (ongeveer een basis-pakket aan supplementen). Geen
            verkoopverplichting aan anderen, wel een eigen vaste afname
            zodat je actief lid blijft. Voor veel mensen is dat sowieso
            meerwaarde, want het wordt hun eigen gezondheidsbasis.
          </p>
        </section>

        {/* ============================================================
            PRODUCT-KANT FAQ
            ============================================================ */}
        <section className="card space-y-1">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2 mb-2">
            🌿 Over de producten en programma's
          </h2>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Hoe lang duurt het voor ik iets merk?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Eerlijk antwoord: dat verschilt per persoon en per product.
              Sommige mensen merken na twee of drie weken iets in hun
              slaap, hun energie of hun spijsvertering, anderen hebben
              wat meer tijd nodig. Programma's zoals de Holistic Reset
              zijn drie weken bewust werken, daar valt vaak aan het
              einde van de drie weken iets op. Het lichaam reageert op
              zijn eigen tempo, geen wonder, wel een proces.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Kan ik dit gebruiken naast mijn medicatie?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Voor combinaties met medicatie verwijs ik je naar je arts
              of apotheker. Dat is geen ontwijking, dat is gewoon
              zorgvuldig. Laat 'r weten dat je een voedingssupplement
              overweegt en welke werkstoffen erin zitten, dat staat
              allemaal duidelijk op de verpakking en in de productinfo.
              {memberNaam ? ` ${memberNaam}` : " De member"} kan je
              helpen die info verzamelen zodat je arts een helder beeld
              heeft.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Wat als ik bijwerkingen krijg?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Stop met het product en overleg met je arts als je iets
              ongewoons merkt. Vertel het ook even aan{" "}
              {memberNaam ?? "de member"} via de chat, dan kunnen we
              meedenken of er iets in de combinatie zit dat anders moet.
              Bij twijfel altijd voorzichtig, gezondheid eerst.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Kan ik dit aan mijn kinderen geven?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Voor kinderen verwijs ik je naar je huisarts of kinderarts.
              Er zijn aangepaste producten en doseringen voor jongere
              leeftijden, en daar wil je iemand met medische kennis bij
              hebben. {memberNaam ?? "De member"} kan helpen met
              productinfo zodat je dat met je arts kunt doornemen.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Zijn de producten vegan, glutenvrij of lactosevrij?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Per product verschilt dat. Er is een vegan-lijn met onder
              andere Vegan OmeGold en Vegan Protein Shake, en veel
              producten zijn glutenvrij of lactosevrij. De volledige
              etiket-info staat op de webshop, en je kunt elk specifiek
              product aan de Mentor vragen, die kent de details.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Waar worden de producten gemaakt?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Lifeplus heeft eigen fabrieken met strenge kwaliteits-
              controle. Veel productie vindt plaats in eigen
              gecertificeerde faciliteiten, met zorgvuldig geselecteerde
              grondstoffen en regelmatig getoetste eindproducten. Voor
              specifieke productie-info per product kun je de Mentor
              vragen of de productpagina's op de webshop bekijken.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Hoe weet ik wat bij mij past?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Er is een productadvies-test waarmee je in een paar minuten
              een persoonlijke richting krijgt. En je kunt het altijd aan
              {memberNaam ? ` ${memberNaam}` : " de member"} vragen via
              de chat, die heeft er meer ervaring mee dan ik. Vaak start
              je met de basis (een dagelijkse aanvulling zoals Daily
              BioBasics) en kijk je daarna wat je merkt en wat een
              logische aanvulling is.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Wat is een goede start als ik nieuw ben?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              De meeste mensen starten met de basis: een dagelijkse
              aanvulling zoals Daily BioBasics of de vrouw/man-variant,
              plus één product dat past bij hun specifieke vraag
              (OmeGold voor omega-3, Proanthenols voor antioxidanten,
              et cetera). Geen lange lijst nodig, je hoeft niet alles
              tegelijk te proberen. Begin klein, kijk wat je merkt, en
              bouw rustig uit.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Hoe bestel ik?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Via de webshop-link die je van{" "}
              {memberNaam ?? "de member"} hebt gekregen. Je rekent direct
              bij Lifeplus af, en zij sturen je bestelling naar je toe.
              Eenvoudig en veilig. Wil je hulp bij je eerste bestelling?
              Vraag het via de chat, dan denken we mee.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Kan ik retourneren als ik niet tevreden ben?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Lifeplus heeft een tevredenheids-garantie. De exacte
              voorwaarden en termijnen staan op de webshop bij de
              algemene voorwaarden. Bij twijfel: vraag{" "}
              {memberNaam ?? "de member"} via de chat, die kent de
              actuele details.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Kan ik maandelijks automatisch bestellen?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Ja, Lifeplus heeft een autoship-optie zodat je producten
              automatisch geleverd krijgt. Handig als je iets dagelijks
              gebruikt en niet wil vergeten. Je kunt 'm op elk moment
              pauzeren, aanpassen of stopzetten.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Hoeveel kost een programma zoals de Reset?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Prijzen vind je op de webshop, die kunnen door tijd of per
              pakket verschillen. Een programma is een combinatie van
              producten plus begeleiding, dus een eenmalige aanschaf
              voor een paar weken bewust werk. Vraag{" "}
              {memberNaam ?? "de member"} voor de actuele prijzen en
              wat in welk pakket zit.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Wat als ik het programma niet kan volhouden?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Geen probleem, en je bent niet de eerste. Een Reset is
              bewust drie weken bewust werk, maar je hoeft 'm niet
              perfect te doen om iets te merken. Veel mensen passen 'm
              aan op wat past, of doen 'm in een rustiger tempo.{" "}
              {memberNaam ?? "De member"} kan meedenken, en de
              community is een fijne plek om af en toe even contact te
              hebben als het zwaarder voelt.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Is dit veilig getest?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Lifeplus producten zijn gecertificeerd en voldoen aan de
              Europese regelgeving voor voedingssupplementen. Productie
              loopt in gecontroleerde faciliteiten, kwaliteit wordt
              regelmatig getoetst. Voor jouw eigen veiligheid bij
              medicatie of bijzondere situaties: altijd je arts erbij
              betrekken.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Is Lifeplus echt al zo lang bezig?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Lifeplus bestaat sinds 1992, dus al meer dan dertig jaar.
              Geen tijdelijke trend en geen marketing-bedrijf dat op
              hypes leeft. De producten worden al decennialang door
              dezelfde mensen gebruikt, ook door mensen die er niets
              zakelijks mee doen. Dat is misschien wel het beste bewijs
              dat het zichzelf bewijst over tijd.
            </div>
          </details>

          <MediaBlokken
            paginaNamespace="mini-eleva-faq"
            paginaId="overzicht"
            positie="product-extra"
            blokken={blokken("product-extra")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            BUSINESS-KANT FAQ (alleen business-spoor)
            ============================================================ */}
        {spoor === "business" && (
          <section className="card space-y-1">
            <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2 mb-2">
              💼 Over de business-kant
            </h2>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Hoeveel tijd kost dit per week?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Dat bepaal je grotendeels zelf, er is geen verplicht
                aantal uren. Sommige mensen doen 'm bewust naast hun
                werk in twee tot vier uur per week, anderen die het
                stevig willen pakken zitten op zes tot acht uur. Je
                bepaalt het tempo, en{" "}
                {sponsorNaam ?? "je sponsor"} denkt met je mee wat
                realistisch is bij wat je voor ogen hebt.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Moet ik investeren om te starten?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Geen inschrijfgeld om mee te starten, geen startpakket
                dat je moet kopen en geen voorraad om aan anderen te
                slijten. Wel doe je elke maand minimaal 40 IP voor
                jezelf, dat is je eigen basis-bestelling van rond een
                basis-pakket aan supplementen. Geen targets en geen
                verkoopverplichting aan anderen, wel een eigen vaste
                afname zodat je actief lid blijft. Voor veel mensen is
                dat sowieso meerwaarde want het wordt hun eigen
                gezondheidsbasis.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Wat als ik niet zoveel mensen ken?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Dat is geen probleem. Veel mensen die nu bouwen begonnen
                ook met een vrij beperkte kring. Het gaat niet om
                aantal, het gaat om de eerste paar mensen die echt warm
                zijn. Je bouwt rustig uit, en social media plus
                persoonlijke ontmoetingen brengen er stap voor stap bij.
                {sponsorNaam ? ` ${sponsorNaam}` : " Je sponsor"} helpt
                je bij het vinden van die eerste mensen in jouw netwerk
                die je misschien zelf niet meteen had gezien.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Kan ik dit naast mijn baan doen?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Ja, de meeste mensen starten zo. Een paar uur per week
                naast je werk is een prima begin. Sommigen blijven het
                zo doen als bewuste bijverdienste, anderen bouwen het in
                de loop van een jaar of twee uit tot hoofdinkomen. Geen
                haast, geen druk, het past in jouw leven.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Wat als ik geen sales-ervaring heb?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Heel veel mensen die hier nu mooi bezig zijn voelden
                precies dat in het begin. Hier zit ook geen verkoper-
                rol in. Je pitcht niet, je praat niet mensen iets aan.
                Wat je doet is delen wat jou is opgevallen aan een
                product of aanpak, en kijken wie er zelf iets in
                herkent.
                {memberNaam ? ` ${memberNaam}` : " De member"} en{" "}
                {sponsorNaam ?? "de sponsor"} doen de eerste gesprekken
                samen met je, je staat er niet alleen voor.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Moet ik op social media gaan staan?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Het helpt, maar het hoeft niet. Sommige mensen bouwen
                vooral via persoonlijke contacten, anderen via social
                media. Wat in elk geval handig is: een rustige
                aanwezigheid op één kanaal (Instagram of Facebook),
                waar je af en toe iets deelt van wat je doet. Geen
                influencer-niveau, gewoon menselijk en eerlijk. Je leert
                dit stap voor stap, niet ineens.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Hoeveel mensen heb ik nodig om Builder te worden?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Minimaal drie members met een bestelling vanaf 40 IP,
                plus je eerste drie levels samen op 1500 IP (jouw eigen
                bestelling telt daarin mee). Concreet: drie mensen die
                jij hebt uitgenodigd worden member en plaatsen een
                bestelling, en samen met jouw eigen bestelling en die
                van eventuele extra mensen in jouw lijnen kom je op
                1500. Het is een haalbaar doel, en de meeste mensen die
                er bewust mee starten halen het binnen een paar maanden.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Wat als ik geen drie members vind?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Geen reden tot paniek, en zeker geen reden om te stoppen.
                Veel mensen hebben er een paar maanden voor nodig, en
                vinden het pas als hun verhaal langer op tafel ligt en
                meer mensen het zien.{" "}
                {sponsorNaam ?? "Je sponsor"} kijkt met je mee wat er
                werkt en wat niet, en past de aanpak aan op jouw
                situatie. Soms zit een member in je eigen klanten-
                kring zonder dat je 't doorhad.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Hoe lang duurt het voor ik iets verdien?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                De eerste commissies komen vaak al binnen één tot drie
                maanden, zodra je eerste klanten besteld hebben. Voor
                Builder reken je gemiddeld op drie tot zes maanden,
                weer afhankelijk van inzet en tempo. De rangen erna
                bouwen daarop voort. Resultaten verschillen per
                persoon, dat moet ik er altijd bij zeggen, maar de
                tijdslijnen zijn haalbaar voor wie er consistent mee
                bezig is.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Kan ik stoppen wanneer ik wil?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Ja, op elk moment. Geen contract, geen opzegtermijn,
                geen boete. Je hoeft alleen je maandelijkse eigen
                afname te stoppen, dan eindigt je actieve lidmaatschap
                vanzelf. Wat je hebt opgebouwd in je klantenkring en je
                team blijft van jou. Als je echt stopt, zakt het over
                tijd af, maar je hoeft niet bang te zijn om vast te
                zitten.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Wat als ik vastloop, wie helpt mij?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                {memberNaam ?? "De member"} is je eerste aanspreekpunt,
                en{" "}
                {sponsorNaam ? ` ${sponsorNaam}` : " je sponsor"} loopt
                daarachter mee. Plus je hebt 24/7 de ELEVA-mentor voor
                snelle vragen. En er is een community waar mensen die
                hetzelfde pad lopen elkaar helpen. Je staat er nooit
                alleen voor, en dat is een van de mooiste delen van hoe
                dit hier is opgezet.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Hoe werkt de webshop precies?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Je krijgt een eigen persoonlijke webshop-link die je
                kunt delen via WhatsApp, social media, of waar dan ook.
                Wie via jouw link iets bestelt, gaat door naar de echte
                Lifeplus-shop, rekent daar af, en Lifeplus regelt de
                verzending. Jij hoeft geen voorraad, geen verzending,
                geen administratie te doen. De bestelling telt
                automatisch mee voor jouw volume en eventuele
                commissie.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Krijg ik training?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Ja, op meerdere manieren. ELEVA heeft een ingebouwd
                pad dat je dag voor dag begeleidt (Sprint of Core,
                afhankelijk van wat past), plus een Academy met dieper-
                uitgewerkte trainingen voor social media, dagelijks
                ritme en claim-vrije communicatie. Daarnaast denkt{" "}
                {sponsorNaam ?? "je sponsor"} met je mee in jullie
                eigen tempo. Geen lange academische cursussen vooraf,
                je leert door te doen.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Kan ik dit deeltijds doen, ook in vakanties?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Ja zeker, en de meeste mensen doen 't ook zo. Je kunt
                minder tijd besteden in periodes dat het druk is, en
                meer als je ruimte hebt. Wat er staat (klanten, team)
                blijft van jou, ook als je een tijdje rustig aan doet.
                Vakantie is geen probleem, dingen lopen door.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Hoe werkt duplicatie eigenlijk?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Duplicatie is hoe je business groeit zonder dat jij
                meer uren maakt. Concreet: jij leert hoe je het doet,
                en de mensen die jij uitnodigt en zelf member worden
                leren het op hun beurt weer aan hun mensen. Zodra dat
                patroon loopt, draait jouw team voor een groot deel
                zonder dat alles op jou rust. Het is de reden waarom
                de hogere rangen mogelijk zijn: niet harder werken,
                wel slimmer opbouwen.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Hoeveel kunnen mensen écht verdienen?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Eerlijk antwoord: het loopt sterk uiteen. Sommigen
                gebruiken het bewust als kleine bijverdienste van een
                paar honderd euro per maand, anderen bouwen het uit
                tot vervangend hoofdinkomen, en een kleine groep
                groeit door tot wat je top-leiders zou noemen. De
                rang-ladder geeft je een ondergrens per rang, en
                daarboven is veel mogelijk afhankelijk van duplicatie-
                diepte. Wat voor jou realistisch is, bespreek je het
                beste met {sponsorNaam ?? "je sponsor"} aan de hand
                van jouw situatie. Geen beloftes, wel een eerlijk
                gesprek.
              </div>
            </details>

            <details className="group border-t border-cm-border py-1.5">
              <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
                <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
                <span>Hoe weet ik of dit iets voor mij is?</span>
              </summary>
              <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
                Een paar dingen die het meestal goed laten passen: je
                gunt mensen het goede, je vindt het fijn om verbinding
                te maken, en je hebt ergens een wens of doel waar dit
                aan kan bijdragen (extra ruimte, eigen ritme, iets
                opbouwen naast je werk). En je moet bereid zijn om te
                leren en stap voor stap te bouwen, want quick-fix
                bestaat hier niet. Het beste is om een gesprek aan te
                gaan met {memberNaam ?? "de member"} en{" "}
                {sponsorNaam ?? "de sponsor"} en zelf te voelen of
                het klopt.
              </div>
            </details>

            <MediaBlokken
              paginaNamespace="mini-eleva-faq"
              paginaId="overzicht"
              positie="business-extra"
              blokken={blokken("business-extra")}
              isFounder={isFounder}
            />
          </section>
        )}

        {/* ============================================================
            DOORVRAGEN
            ============================================================ */}
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Vraag niet beantwoord, of wil je dieper op iets ingaan? De
            ELEVA-mentor kent veel meer dan deze lijst, en{" "}
            {memberNaam ?? "de member"} en{" "}
            {sponsorNaam ?? "de sponsor"} staan klaar voor het
            persoonlijke gesprek.
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
