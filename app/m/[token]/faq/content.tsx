import Link from "next/link";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";

// ============================================================
// Gedeelde FAQ-content voor /m/[token]/faq en de founder-preview.
// Twee secties: product (zichtbaar voor alle sporen) en business
// (alleen business-spoor).
//
// Sinds 2026-06-01: alle vragen en antwoorden editable via namespace
// 'mini-eleva-faq'. Per Q/A een sleutel-paar 'X.vraag' + 'X.antwoord'.
// ============================================================

const NS = "mini-eleva-faq";

type Props = {
  isFounder: boolean;
  memberNaam: string | null;
  sponsorNaam: string | null;
  terugHref: string;
  blokkenPerPositie: Record<string, Blok[]>;
  tekstOverrides: Record<string, string>;
  spoor: "product" | "business";
};

type FaqProps = {
  sleutel: string;
  vraagStandaard: string;
  antwoordStandaard: string;
  overrides: Record<string, string>;
  isFounder: boolean;
  vars: Record<string, string>;
};

function FaqItem({
  sleutel,
  vraagStandaard,
  antwoordStandaard,
  overrides,
  isFounder,
  vars,
}: FaqProps) {
  return (
    <details className="group border-t border-cm-border py-1.5">
      <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
        <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">
          ›
        </span>
        <EditableTekst
          namespace={NS}
          sleutel={`${sleutel}.vraag`}
          standaard={vraagStandaard}
          overrides={overrides}
          isFounder={isFounder}
          as="span"
          hint={`FAQ-vraag (${sleutel})`}
        />
      </summary>
      <div className="pl-5 pb-2 pt-1">
        <EditableBlok
          namespace={NS}
          sleutel={`${sleutel}.antwoord`}
          standaard={antwoordStandaard}
          overrides={overrides}
          isFounder={isFounder}
          vars={vars}
          as="div"
          className="text-cm-white/75 text-sm leading-relaxed"
          rows={4}
          hint={`FAQ-antwoord (${sleutel})`}
        />
      </div>
    </details>
  );
}

export function MiniElevaFaqContent({
  isFounder,
  memberNaam,
  sponsorNaam,
  terugHref,
  blokkenPerPositie,
  tekstOverrides,
  spoor,
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
            standaard="Veelgestelde vragen"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-gold text-xs font-semibold uppercase tracking-wider"
            hint="Klein gouden label boven de paginatitel"
          />
          <EditableTekst
            namespace={NS}
            sleutel="intro.titel"
            standaard="Wat mensen meestal eerst willen weten"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h1"
            className="font-serif-warm text-2xl text-cm-white leading-tight mt-1"
            hint="Hoofdtitel FAQ-pagina"
          />
          <EditableBlok
            namespace={NS}
            sleutel="intro.uitleg"
            standaard="Klik een vraag open. Staat 'm er niet bij? Stel 'm aan de ELEVA-mentor, of haal {member} erbij via de chat. Geen vraag is dom, juist de eerlijke vragen brengen meestal het meeste."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
            as="p"
            className="text-cm-white/75 text-sm leading-relaxed mt-3"
            rows={3}
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

        {/* IP-UITLEG */}
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <EditableTekst
            namespace={NS}
            sleutel="ip.titel"
            standaard="🔢 Wat is een IP eigenlijk?"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel IP-uitleg"
          />
          <EditableBlok
            namespace={NS}
            sleutel="ip.tekst1"
            standaard="IP staat voor Internationale Punten. Dat is de eenheid waarin Lifeplus alle bestellingen meet. Elk product heeft een IP-waarde, en die telt mee voor je volume, je rang en eventuele commissies. IP is internationaal, dus een bestelling in Nederland telt op dezelfde manier mee als eentje in Duitsland of Engeland."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Eerste paragraaf IP-uitleg"
          />
          <EditableBlok
            namespace={NS}
            sleutel="ip.tekst2"
            standaard="Minimale eigen afname: 40 IP per maand voor jezelf, een eigen basis-bestelling (ongeveer een basis-pakket aan supplementen). Geen verkoopverplichting aan anderen, wel een eigen vaste afname zodat je actief lid blijft. Voor veel mensen is dat sowieso meerwaarde, want het wordt hun eigen gezondheidsbasis."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Tweede paragraaf IP, minimale afname"
          />
        </section>

        {/* PRODUCT-FAQ */}
        <section className="card space-y-1">
          <EditableTekst
            namespace={NS}
            sleutel="product.titel"
            standaard="🌿 Over de producten en programma's"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2 mb-2"
            hint="Sectie-titel product-FAQ"
          />

          <FaqItem
            sleutel="product.merken"
            vraagStandaard="Hoe lang duurt het voor ik iets merk?"
            antwoordStandaard="Eerlijk antwoord: dat verschilt per persoon en per product. Sommige mensen merken na twee of drie weken iets in hun slaap, hun energie of hun spijsvertering, anderen hebben wat meer tijd nodig. Programma's zoals de Holistic Reset zijn drie weken bewust werken, daar valt vaak aan het einde van de drie weken iets op. Het lichaam reageert op zijn eigen tempo, geen wonder, wel een proces."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.medicatie"
            vraagStandaard="Kan ik dit gebruiken naast mijn medicatie?"
            antwoordStandaard="Voor combinaties met medicatie verwijs ik je naar je arts of apotheker. Dat is geen ontwijking, dat is gewoon zorgvuldig. Laat 'r weten dat je een voedingssupplement overweegt en welke werkstoffen erin zitten, dat staat allemaal duidelijk op de verpakking en in de productinfo. {member} kan je helpen die info verzamelen zodat je arts een helder beeld heeft."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.bijwerkingen"
            vraagStandaard="Wat als ik bijwerkingen krijg?"
            antwoordStandaard="Stop met het product en overleg met je arts als je iets ongewoons merkt. Vertel het ook even aan {member} via de chat, dan kunnen we meedenken of er iets in de combinatie zit dat anders moet. Bij twijfel altijd voorzichtig, gezondheid eerst."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.kinderen"
            vraagStandaard="Kan ik dit aan mijn kinderen geven?"
            antwoordStandaard="Voor kinderen verwijs ik je naar je huisarts of kinderarts. Er zijn aangepaste producten en doseringen voor jongere leeftijden, en daar wil je iemand met medische kennis bij hebben. {member} kan helpen met productinfo zodat je dat met je arts kunt doornemen."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.vegan"
            vraagStandaard="Zijn de producten vegan, glutenvrij of lactosevrij?"
            antwoordStandaard="Per product verschilt dat. Er is een vegan-lijn met onder andere Vegan OmeGold en Vegan Protein Shake, en veel producten zijn glutenvrij of lactosevrij. De volledige etiket-info staat op de webshop, en je kunt elk specifiek product aan de Mentor vragen, die kent de details."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.productie"
            vraagStandaard="Waar worden de producten gemaakt?"
            antwoordStandaard="Lifeplus heeft eigen fabrieken met strenge kwaliteits-controle. Veel productie vindt plaats in eigen gecertificeerde faciliteiten, met zorgvuldig geselecteerde grondstoffen en regelmatig getoetste eindproducten. Voor specifieke productie-info per product kun je de Mentor vragen of de productpagina's op de webshop bekijken."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.wat-past"
            vraagStandaard="Hoe weet ik wat bij mij past?"
            antwoordStandaard="Er is een productadvies-test waarmee je in een paar minuten een persoonlijke richting krijgt. En je kunt het altijd aan {member} vragen via de chat, die heeft er meer ervaring mee dan ik. Vaak start je met de basis (een dagelijkse aanvulling zoals Daily BioBasics) en kijk je daarna wat je merkt en wat een logische aanvulling is."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.start"
            vraagStandaard="Wat is een goede start als ik nieuw ben?"
            antwoordStandaard="De meeste mensen starten met de basis: een dagelijkse aanvulling zoals Daily BioBasics of de vrouw/man-variant, plus één product dat past bij hun specifieke vraag (OmeGold voor omega-3, Proanthenols voor antioxidanten, et cetera). Geen lange lijst nodig, je hoeft niet alles tegelijk te proberen. Begin klein, kijk wat je merkt, en bouw rustig uit."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.bestellen"
            vraagStandaard="Hoe bestel ik?"
            antwoordStandaard="Via de webshop-link die je van {member} hebt gekregen. Je rekent direct bij Lifeplus af, en zij sturen je bestelling naar je toe. Eenvoudig en veilig. Wil je hulp bij je eerste bestelling? Vraag het via de chat, dan denken we mee."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.retour"
            vraagStandaard="Kan ik retourneren als ik niet tevreden ben?"
            antwoordStandaard="Lifeplus heeft een tevredenheids-garantie. De exacte voorwaarden en termijnen staan op de webshop bij de algemene voorwaarden. Bij twijfel: vraag {member} via de chat, die kent de actuele details."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.autoship"
            vraagStandaard="Kan ik maandelijks automatisch bestellen?"
            antwoordStandaard="Ja, Lifeplus heeft een autoship-optie zodat je producten automatisch geleverd krijgt. Handig als je iets dagelijks gebruikt en niet wil vergeten. Je kunt 'm op elk moment pauzeren, aanpassen of stopzetten."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.reset-kosten"
            vraagStandaard="Hoeveel kost een programma zoals de Reset?"
            antwoordStandaard="Prijzen vind je op de webshop, die kunnen door tijd of per pakket verschillen. Een programma is een combinatie van producten plus begeleiding, dus een eenmalige aanschaf voor een paar weken bewust werk. Vraag {member} voor de actuele prijzen en wat in welk pakket zit."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.volhouden"
            vraagStandaard="Wat als ik het programma niet kan volhouden?"
            antwoordStandaard="Geen probleem, en je bent niet de eerste. Een Reset is bewust drie weken bewust werk, maar je hoeft 'm niet perfect te doen om iets te merken. Veel mensen passen 'm aan op wat past, of doen 'm in een rustiger tempo. {member} kan meedenken, en de community is een fijne plek om af en toe even contact te hebben als het zwaarder voelt."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.veilig"
            vraagStandaard="Is dit veilig getest?"
            antwoordStandaard="Lifeplus producten zijn gecertificeerd en voldoen aan de Europese regelgeving voor voedingssupplementen. Productie loopt in gecontroleerde faciliteiten, kwaliteit wordt regelmatig getoetst. Voor jouw eigen veiligheid bij medicatie of bijzondere situaties: altijd je arts erbij betrekken."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />
          <FaqItem
            sleutel="product.sinds-1992"
            vraagStandaard="Is Lifeplus echt al zo lang bezig?"
            antwoordStandaard="Lifeplus bestaat sinds 1992, dus al meer dan dertig jaar. Geen tijdelijke trend en geen marketing-bedrijf dat op hypes leeft. De producten worden al decennialang door dezelfde mensen gebruikt, ook door mensen die er niets zakelijks mee doen. Dat is misschien wel het beste bewijs dat het zichzelf bewijst over tijd."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
          />

          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="product-extra"
            blokken={blokken("product-extra")}
            isFounder={isFounder}
          />
        </section>

        {/* BUSINESS-FAQ (alleen business-spoor) */}
        {spoor === "business" && (
          <section className="card space-y-1">
            <EditableTekst
              namespace={NS}
              sleutel="business.titel"
              standaard="💼 Over de business-kant"
              overrides={tekstOverrides}
              isFounder={isFounder}
              as="h2"
              className="text-cm-gold text-base font-semibold flex items-center gap-2 mb-2"
              hint="Sectie-titel business-FAQ"
            />

            <FaqItem
              sleutel="business.tijd"
              vraagStandaard="Hoeveel tijd kost dit per week?"
              antwoordStandaard="Dat bepaal je grotendeels zelf, er is geen verplicht aantal uren. Sommige mensen doen 'm bewust naast hun werk in twee tot vier uur per week, anderen die het stevig willen pakken zitten op zes tot acht uur. Je bepaalt het tempo, en {sponsor} denkt met je mee wat realistisch is bij wat je voor ogen hebt."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.investeren"
              vraagStandaard="Moet ik investeren om te starten?"
              antwoordStandaard="Geen inschrijfgeld om mee te starten, geen startpakket dat je moet kopen en geen voorraad om aan anderen te slijten. Wel doe je elke maand minimaal 40 IP voor jezelf, dat is je eigen basis-bestelling van rond een basis-pakket aan supplementen. Geen targets en geen verkoopverplichting aan anderen, wel een eigen vaste afname zodat je actief lid blijft. Voor veel mensen is dat sowieso meerwaarde want het wordt hun eigen gezondheidsbasis."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.weinig-mensen"
              vraagStandaard="Wat als ik niet zoveel mensen ken?"
              antwoordStandaard="Dat is geen probleem. Veel mensen die nu bouwen begonnen ook met een vrij beperkte kring. Het gaat niet om aantal, het gaat om de eerste paar mensen die echt warm zijn. Je bouwt rustig uit, en social media plus persoonlijke ontmoetingen brengen er stap voor stap bij. {sponsor} helpt je bij het vinden van die eerste mensen in jouw netwerk die je misschien zelf niet meteen had gezien."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.naast-baan"
              vraagStandaard="Kan ik dit naast mijn baan doen?"
              antwoordStandaard="Ja, de meeste mensen starten zo. Een paar uur per week naast je werk is een prima begin. Sommigen blijven het zo doen als bewuste bijverdienste, anderen bouwen het in de loop van een jaar of twee uit tot hoofdinkomen. Geen haast, geen druk, het past in jouw leven."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.geen-sales"
              vraagStandaard="Wat als ik geen sales-ervaring heb?"
              antwoordStandaard="Heel veel mensen die hier nu mooi bezig zijn voelden precies dat in het begin. Hier zit ook geen verkoper-rol in. Je pitcht niet, je praat niet mensen iets aan. Wat je doet is delen wat jou is opgevallen aan een product of aanpak, en kijken wie er zelf iets in herkent. {member} en {sponsor} doen de eerste gesprekken samen met je, je staat er niet alleen voor."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.social"
              vraagStandaard="Moet ik op social media gaan staan?"
              antwoordStandaard="Het helpt, maar het hoeft niet. Sommige mensen bouwen vooral via persoonlijke contacten, anderen via social media. Wat in elk geval handig is: een rustige aanwezigheid op één kanaal (Instagram of Facebook), waar je af en toe iets deelt van wat je doet. Geen influencer-niveau, gewoon menselijk en eerlijk. Je leert dit stap voor stap, niet ineens."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.builder-aantal"
              vraagStandaard="Hoeveel mensen heb ik nodig om Builder te worden?"
              antwoordStandaard="Minimaal drie members met een bestelling vanaf 40 IP, plus je eerste drie levels samen op 1500 IP (jouw eigen bestelling telt daarin mee). Concreet: drie mensen die jij hebt uitgenodigd worden member en plaatsen een bestelling, en samen met jouw eigen bestelling en die van eventuele extra mensen in jouw lijnen kom je op 1500. Het is een haalbaar doel, en de meeste mensen die er bewust mee starten halen het binnen een paar maanden."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.geen-3"
              vraagStandaard="Wat als ik geen drie members vind?"
              antwoordStandaard="Geen reden tot paniek, en zeker geen reden om te stoppen. Veel mensen hebben er een paar maanden voor nodig, en vinden het pas als hun verhaal langer op tafel ligt en meer mensen het zien. {sponsor} kijkt met je mee wat er werkt en wat niet, en past de aanpak aan op jouw situatie. Soms zit een member in je eigen klanten-kring zonder dat je 't doorhad."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.eerste-inkomen"
              vraagStandaard="Hoe lang duurt het voor ik iets verdien?"
              antwoordStandaard="De eerste commissies komen vaak al binnen één tot drie maanden, zodra je eerste klanten besteld hebben. Voor Builder reken je gemiddeld op drie tot zes maanden, weer afhankelijk van inzet en tempo. De rangen erna bouwen daarop voort. Resultaten verschillen per persoon, dat moet ik er altijd bij zeggen, maar de tijdslijnen zijn haalbaar voor wie er consistent mee bezig is."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.stoppen"
              vraagStandaard="Kan ik stoppen wanneer ik wil?"
              antwoordStandaard="Ja, op elk moment. Geen contract, geen opzegtermijn, geen boete. Je hoeft alleen je maandelijkse eigen afname te stoppen, dan eindigt je actieve lidmaatschap vanzelf. Wat je hebt opgebouwd in je klantenkring en je team blijft van jou. Als je echt stopt, zakt het over tijd af, maar je hoeft niet bang te zijn om vast te zitten."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.vastlopen"
              vraagStandaard="Wat als ik vastloop, wie helpt mij?"
              antwoordStandaard="{member} is je eerste aanspreekpunt, en {sponsor} loopt daarachter mee. Plus je hebt 24/7 de ELEVA-mentor voor snelle vragen. En er is een community waar mensen die hetzelfde pad lopen elkaar helpen. Je staat er nooit alleen voor, en dat is een van de mooiste delen van hoe dit hier is opgezet."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.webshop"
              vraagStandaard="Hoe werkt de webshop precies?"
              antwoordStandaard="Je krijgt een eigen persoonlijke webshop-link die je kunt delen via WhatsApp, social media, of waar dan ook. Wie via jouw link iets bestelt, gaat door naar de echte Lifeplus-shop, rekent daar af, en Lifeplus regelt de verzending. Jij hoeft geen voorraad, geen verzending, geen administratie te doen. De bestelling telt automatisch mee voor jouw volume en eventuele commissie."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.training"
              vraagStandaard="Krijg ik training?"
              antwoordStandaard="Ja, op meerdere manieren. ELEVA heeft een ingebouwd pad dat je dag voor dag begeleidt (Sprint of Core, afhankelijk van wat past), plus een Academy met dieper-uitgewerkte trainingen voor social media, dagelijks ritme en claim-vrije communicatie. Daarnaast denkt {sponsor} met je mee in jullie eigen tempo. Geen lange academische cursussen vooraf, je leert door te doen."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.deeltijds"
              vraagStandaard="Kan ik dit deeltijds doen, ook in vakanties?"
              antwoordStandaard="Ja zeker, en de meeste mensen doen 't ook zo. Je kunt minder tijd besteden in periodes dat het druk is, en meer als je ruimte hebt. Wat er staat (klanten, team) blijft van jou, ook als je een tijdje rustig aan doet. Vakantie is geen probleem, dingen lopen door."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.duplicatie"
              vraagStandaard="Hoe werkt duplicatie eigenlijk?"
              antwoordStandaard="Duplicatie is hoe je business groeit zonder dat jij meer uren maakt. Concreet: jij leert hoe je het doet, en de mensen die jij uitnodigt en zelf member worden leren het op hun beurt weer aan hun mensen. Zodra dat patroon loopt, draait jouw team voor een groot deel zonder dat alles op jou rust. Het is de reden waarom de hogere rangen mogelijk zijn: niet harder werken, wel slimmer opbouwen."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.hoeveel-verdienen"
              vraagStandaard="Hoeveel kunnen mensen écht verdienen?"
              antwoordStandaard="Eerlijk antwoord: het loopt sterk uiteen. Sommigen gebruiken het bewust als kleine bijverdienste van een paar honderd euro per maand, anderen bouwen het uit tot vervangend hoofdinkomen, en een kleine groep groeit door tot wat je top-leiders zou noemen. De rang-ladder geeft je een ondergrens per rang, en daarboven is veel mogelijk afhankelijk van duplicatie-diepte. Wat voor jou realistisch is, bespreek je het beste met {sponsor} aan de hand van jouw situatie. Geen beloftes, wel een eerlijk gesprek."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />
            <FaqItem
              sleutel="business.voor-mij"
              vraagStandaard="Hoe weet ik of dit iets voor mij is?"
              antwoordStandaard="Een paar dingen die het meestal goed laten passen: je gunt mensen het goede, je vindt het fijn om verbinding te maken, en je hebt ergens een wens of doel waar dit aan kan bijdragen (extra ruimte, eigen ritme, iets opbouwen naast je werk). En je moet bereid zijn om te leren en stap voor stap te bouwen, want quick-fix bestaat hier niet. Het beste is om een gesprek aan te gaan met {member} en {sponsor} en zelf te voelen of het klopt."
              overrides={tekstOverrides}
              isFounder={isFounder}
              vars={vars}
            />

            <MediaBlokken
              paginaNamespace={NS}
              paginaId="overzicht"
              positie="business-extra"
              blokken={blokken("business-extra")}
              isFounder={isFounder}
            />
          </section>
        )}

        {/* DOORVRAGEN */}
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <EditableBlok
            namespace={NS}
            sleutel="doorvragen.uitleg"
            standaard="Vraag niet beantwoord, of wil je dieper op iets ingaan? De ELEVA-mentor kent veel meer dan deze lijst, en {member} en {sponsor} staan klaar voor het persoonlijke gesprek."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Slot-uitleg met doorverwijzing naar member en sponsor"
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
