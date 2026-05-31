import Link from "next/link";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";

// ============================================================
// Business-uitleg, alleen zichtbaar voor prospects die zijn
// uitgenodigd voor de business-kant van Lifeplus. Verdienmodel,
// rang-ladder, hoe het werkt, plus MediaBlokken per sectie.
// ============================================================

type Props = {
  isFounder: boolean;
  prospectVoornaam: string;
  memberNaam: string | null;
  sponsorNaam: string | null;
  terugHref: string;
  blokkenPerPositie: Record<string, Blok[]>;
};

export function MiniElevaBusinessContent({
  isFounder,
  prospectVoornaam,
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
            De business-kant
          </p>
          <h1 className="font-serif-warm text-2xl text-cm-white leading-tight mt-1">
            Hoe het werkt en wat je opbouwt
          </h1>
          <p className="text-cm-white/75 text-sm leading-relaxed mt-3">
            {prospectVoornaam}, hier vind je rustige uitleg over hoe het
            verdienmodel in elkaar zit, wat de rang-ladder is, en hoe je je
            eerste mijlpaal (Builder) bereikt. Geen druk om te beslissen, wel
            een eerlijk beeld dat klopt. Vragen mogen rustig blijven liggen
            of via de Mentor of {memberNaam ?? "de member"}.
          </p>
        </div>

        {/* Intro-blok (optioneel filmpje van Raoul of Gaby) */}
        <MediaBlokken
          paginaNamespace="mini-eleva-business"
          paginaId="overzicht"
          positie="intro"
          blokken={blokken("intro")}
          isFounder={isFounder}
        />

        {/* ============================================================
            HOE HET WERKT IN GROTE LIJNEN
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🧭 Hoe het werkt in grote lijnen
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Lifeplus is aanbevelingsmarketing. Concreet: je krijgt een eigen
            webshop-link die je kunt delen met mensen om je heen. Wie iets
            koopt via die link, telt mee voor jouw volume. Wie zelf ook
            iets met de business gaat doen, vormt jouw team, en hun volume
            telt ook mee.
          </p>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Wat er bijzonder is aan deze opzet, vergeleken met andere modellen
            die je misschien hebt gehoord:
          </p>
          <ul className="text-cm-white/80 text-sm leading-relaxed space-y-1.5 pl-1">
            <li>
              <span className="text-cm-gold">·</span> Geen inschrijfgeld
              en geen startpakket dat je moet kopen om mee te doen. Geen
              voorraad om aan anderen kwijt te raken.
            </li>
            <li>
              <span className="text-cm-gold">·</span> Wel doe je elke
              maand minimaal 40 IP voor jezelf, een eigen basis-bestelling
              (kort: 40 Internationale Punten, ongeveer een basis-pakket
              aan supplementen, zie uitleg verderop). Dat is je eigen
              afname, geen verkoopverplichting aan anderen.
            </li>
            <li>
              <span className="text-cm-gold">·</span> Je verdient pas iets
              als er ook daadwerkelijk producten worden aanbevolen en
              verkocht. Geen geld voor "alleen mensen werven".
            </li>
            <li>
              <span className="text-cm-gold">·</span> De top-rangen
              verdienen niet automatisch meer dan starters. Wie er hard aan
              trekt kan voorbij {memberNaam ?? "de member"} groeien, en
              voorbij de mensen die daarvoor zijn begonnen.
            </li>
          </ul>
          <MediaBlokken
            paginaNamespace="mini-eleva-business"
            paginaId="overzicht"
            positie="hoe-het-werkt"
            blokken={blokken("hoe-het-werkt")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            IP-UITLEG (Internationale Punten)
            ============================================================ */}
        <section className="card border-l-4 border-cm-gold/60 space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🔢 Wat is een IP eigenlijk?
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            IP staat voor <strong>Internationale Punten</strong>. Het is de
            eenheid waarin Lifeplus alle bestellingen meet. Elk product
            heeft een IP-waarde, en die telt mee voor je volume, je rang
            en eventuele commissies. IP is internationaal, dus een
            bestelling in Nederland telt op dezelfde manier mee als eentje
            in Duitsland of Engeland.
          </p>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            <strong className="text-cm-gold">Jouw minimale eigen afname:</strong>{" "}
            40 IP per maand voor jezelf. Dat komt ongeveer overeen met een
            basis-pakket aan supplementen. Dit is je eigen vaste afname,
            geen verkoopverplichting aan anderen, en voor veel mensen is
            het sowieso meerwaarde want het wordt hun eigen gezondheids-
            basis. Zonder die 40 IP per maand kun je geen actief lid
            blijven en geen commissies ontvangen.
          </p>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            <strong className="text-cm-gold">Voor je rang:</strong> in de
            ladder hieronder zie je getallen als "1500 IP totaal", dat is
            wat er in jouw eerste drie levels samen wordt besteld (jouw
            eigen bestelling plus alle members en shoppers daaronder).
            Daar tellen alle IP's bij elkaar op, in elke maand opnieuw.
          </p>
        </section>

        {/* ============================================================
            DE RANG-LADDER
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            📊 De rang-ladder, van Builder tot Diamond
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Je verdient op basis van wat er in jouw eerste drie levels gebeurt
            (jouw eigen bestelling plus alle members en shoppers daaronder).
            Die "members" hoeven niet allemaal in level 1 te zitten, ze
            mogen ook dieper hangen. Hoe groter het volume en hoe meer
            actieve members, hoe verder je op de ladder komt.
          </p>

          <div className="space-y-2 pt-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0">🪜</span>
              <div>
                <p className="text-cm-white font-semibold">Builder</p>
                <p className="text-cm-white/70 text-xs leading-relaxed">
                  Je bouwsteen. Eerste drie levels samen op 1500 IP, en
                  minimaal drie members met een bestelling vanaf 40 IP.
                  Geen vast bedrag, wel de sleutel tot duplicatie. Vanaf
                  Builder bouw je niet meer in je eentje, je team telt mee.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0">🥉</span>
              <div>
                <p className="text-cm-white font-semibold">Bronze</p>
                <p className="text-cm-white/70 text-xs leading-relaxed">
                  Vanaf 100 IP eigen, 3000 IP totaal, 3 members. Vanaf 300
                  tot 600 euro per maand, afhankelijk van diepte.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0">🥈</span>
              <div>
                <p className="text-cm-white font-semibold">Silver</p>
                <p className="text-cm-white/70 text-xs leading-relaxed">
                  Vanaf 100 IP eigen, 6000 IP totaal, 6 members. Vanaf 600
                  euro per maand.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0">🥇</span>
              <div>
                <p className="text-cm-white font-semibold">Gold</p>
                <p className="text-cm-white/70 text-xs leading-relaxed">
                  Vanaf 150 IP eigen, 9000 IP totaal, 9 members. Vanaf 900
                  euro per maand.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0">💎</span>
              <div>
                <p className="text-cm-white font-semibold">Diamond</p>
                <p className="text-cm-white/70 text-xs leading-relaxed">
                  Vanaf 150 IP eigen, 15000 IP totaal, 12 members verdeeld
                  over verschillende lijnen. Vanaf 1200 euro per maand. De
                  top-leiders gaan daar ver bovenuit, afhankelijk van
                  duplicatie-diepte.
                </p>
              </div>
            </div>
          </div>

          <p className="text-cm-white/55 text-xs leading-relaxed italic pt-2">
            Belangrijke nuance: deze bedragen zijn vanaf-getallen, geen
            beloftes en geen plafond. Resultaten verschillen per persoon,
            afhankelijk van inzet en consistentie. Geen garantie.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-business"
            paginaId="overzicht"
            positie="rang-ladder"
            blokken={blokken("rang-ladder")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            BUILDER, JE EERSTE MIJLPAAL
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🎯 Builder, je eerste mijlpaal
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Builder is de eerste rang waar duplicatie écht begint te werken.
            Vóór Builder bouw je in je eentje. Vanaf Builder heb je een
            team van minimaal drie mensen die met je meebouwen, en wat zij
            doen telt mee voor jouw groei.
          </p>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Twee voorwaarden om Builder te halen:
          </p>
          <ul className="text-cm-white/80 text-sm leading-relaxed space-y-1.5 pl-1">
            <li>
              <span className="text-cm-gold">1.</span> Minimaal drie
              members met een bestelling vanaf 40 IP.
            </li>
            <li>
              <span className="text-cm-gold">2.</span> Eerste drie levels
              samen 1500 IP of meer (jouw eigen bestelling telt mee).
            </li>
          </ul>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Concreet: jij bestelt iets voor jezelf, drie mensen die jij hebt
            uitgenodigd worden member, en samen kom je op het volume. Geen
            harde deadline, wel een helder doel dat het systeem voor je
            volgt zodra je start.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-business"
            paginaId="overzicht"
            positie="builder"
            blokken={blokken("builder")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            HOE EEN DAG ERUIT KAN ZIEN
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            📅 Hoe een dag eruit kan zien
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Mensen vragen vaak hoeveel tijd dit kost. Eerlijk antwoord: dat
            bepaal je grotendeels zelf. Er is geen verplicht aantal uren
            per dag, geen targets die boven je hoofd hangen. Wel een rustig
            ritme dat goed werkt voor de meeste mensen.
          </p>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Een rustige dag is bijvoorbeeld: een paar Stories plaatsen,
            reageren op DM's die binnenkomen, één of twee mensen
            persoonlijk benaderen, en kort contact met je sponsor. Een
            stevige dag bouwt daar bovenop met meer Stories, meer
            uitnodigingen, en een 3-weg-gesprek. Je bepaalt zelf het
            tempo, en je sponsor denkt met je mee.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-business"
            paginaId="overzicht"
            positie="dag-ritme"
            blokken={blokken("dag-ritme")}
            isFounder={isFounder}
          />
        </section>

        {/* FAQ verhuisd naar /m/[token]/faq, eigen module op de landing. */}
        {false && (
        <section className="card space-y-1">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2 mb-2">
            ❓ Veelgestelde vragen
          </h2>
          <p className="text-cm-white/65 text-xs leading-relaxed mb-2">
            Klik een vraag open. Staat 'm er niet bij? Stel 'm aan de
            Mentor of haal {memberNaam ?? "de member"} erbij via de chat.
          </p>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Hoeveel tijd kost dit per week?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Dat bepaal je grotendeels zelf, er is geen verplicht
              aantal uren. Sommige mensen doen 'm bewust naast hun werk
              in twee tot vier uur per week, anderen die het stevig
              willen pakken zitten op zes tot acht uur. Je bepaalt het
              tempo, en {sponsorNaam ?? "je sponsor"} denkt met je mee
              wat realistisch is bij wat je voor ogen hebt.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Moet ik investeren om te starten?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Geen inschrijfgeld om mee te starten, geen startpakket dat
              je moet kopen en geen voorraad om aan anderen te slijten.
              Wel doe je elke maand minimaal 40 IP voor jezelf, dat is
              je eigen basis-bestelling van rond een basis-pakket aan
              supplementen. Geen targets en geen verkoopverplichting aan
              anderen, wel een eigen vaste afname zodat je actief lid
              blijft. Voor veel mensen is dat sowieso meerwaarde want
              het wordt hun eigen gezondheidsbasis.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Wat als ik niet zoveel mensen ken?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Dat is geen probleem. Veel mensen die nu bouwen begonnen
              ook met een vrij beperkte kring. Het gaat niet om aantal,
              het gaat om de eerste paar mensen die echt warm zijn. Je
              bouwt rustig uit, en social media plus persoonlijke
              ontmoetingen brengen er stap voor stap bij. {sponsorNaam ?? "Je sponsor"}{" "}
              helpt je bij het vinden van die eerste mensen in jouw
              netwerk die je misschien zelf niet meteen had gezien.
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
              precies dat in het begin. Hier zit ook geen verkoper-rol
              in. Je pitcht niet, je praat niet mensen iets aan. Wat
              je doet is delen wat jou is opgevallen aan een product
              of aanpak, en kijken wie er zelf iets in herkent.
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
              aanwezigheid op één kanaal (Instagram of Facebook), waar
              je af en toe iets deelt van wat je doet. Geen
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
              Minimaal drie members met een bestelling vanaf 40 IP, plus
              je eerste drie levels samen op 1500 IP (jouw eigen
              bestelling telt daarin mee). Concreet: drie mensen die jij
              hebt uitgenodigd worden member en plaatsen een bestelling,
              en samen met jouw eigen bestelling en die van eventuele
              extra mensen in jouw lijnen kom je op 1500. Het is een
              haalbaar doel, en de meeste mensen die er bewust mee
              starten halen het binnen een paar maanden.
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
              meer mensen het zien. {sponsorNaam ?? "Je sponsor"} kijkt
              met je mee wat er werkt en wat niet, en past de aanpak aan
              op jouw situatie. Soms zit een member in je eigen klanten-
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
              Builder reken je gemiddeld op drie tot zes maanden, weer
              afhankelijk van inzet en tempo. De rangen erna bouwen
              daarop voort. Resultaten verschillen per persoon, dat
              moet ik er altijd bij zeggen, maar de tijdslijnen zijn
              haalbaar voor wie er consistent mee bezig is.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Kan ik stoppen wanneer ik wil?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Ja, op elk moment. Geen contract, geen opzegtermijn, geen
              boete. Je hebt niets te investeren dus je hebt ook niets
              te verliezen. Wel mooi: wat je hebt opgebouwd in je
              klantenkring en je team blijft van jou. Als je echt
              stopt, zakt het over tijd af, maar je hoeft niet bang te
              zijn om vast te zitten.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Wat als ik vastloop, wie helpt mij?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              {memberNaam ?? "De member"} is je eerste aanspreekpunt, en
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
              Je krijgt een eigen persoonlijke webshop-link die je kunt
              delen via WhatsApp, social media, of waar dan ook. Wie via
              jouw link iets bestelt, gaat door naar de echte Lifeplus-
              shop, rekent daar af, en Lifeplus regelt de verzending. Jij
              hoeft geen voorraad, geen verzending, geen administratie te
              doen. De bestelling telt automatisch mee voor jouw volume
              en eventuele commissie.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Krijg ik training?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Ja, op meerdere manieren. ELEVA heeft een ingebouwd pad
              dat je dag voor dag begeleidt (Sprint of Core, afhankelijk
              van wat past), plus een Academy met dieper-uitgewerkte
              trainingen voor social media, dagelijks ritme en claim-
              vrije communicatie. Daarnaast denkt{" "}
              {sponsorNaam ?? "je sponsor"} met je mee in jullie eigen
              tempo. Geen lange academische cursussen vooraf, je leert
              door te doen.
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
              Duplicatie is hoe je business groeit zonder dat jij meer
              uren maakt. Concreet: jij leert hoe je het doet, en de
              mensen die jij uitnodigt en zelf member worden leren het
              op hun beurt weer aan hun mensen. Zodra dat patroon
              loopt, draait jouw team voor een groot deel zonder dat
              alles op jou rust. Het is de reden waarom de hogere
              rangen mogelijk zijn: niet harder werken, wel slimmer
              opbouwen.
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
              paar honderd euro per maand, anderen bouwen het uit tot
              vervangend hoofdinkomen, en een kleine groep groeit door
              tot wat je top-leiders zou noemen. De rang-ladder
              hierboven geeft je een ondergrens per rang, en daarboven
              is veel mogelijk afhankelijk van duplicatie-diepte. Wat
              voor jou realistisch is, bespreek je het beste met{" "}
              {sponsorNaam ?? "je sponsor"} aan de hand van jouw
              situatie. Geen beloftes, wel een eerlijk gesprek.
            </div>
          </details>

          <details className="group border-t border-cm-border py-1.5">
            <summary className="cursor-pointer py-1.5 text-cm-white text-sm font-medium hover:text-cm-gold list-none flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0 transition-transform group-open:rotate-90">›</span>
              <span>Hoe weet ik of dit iets voor mij is?</span>
            </summary>
            <div className="text-cm-white/75 text-sm leading-relaxed pl-5 pb-2 pt-1">
              Een paar dingen die het meestal goed laten passen: je
              gunt mensen het goede, je vindt het fijn om verbinding te
              maken, en je hebt ergens een wens of doel waar dit aan
              kan bijdragen (extra ruimte, eigen ritme, iets opbouwen
              naast je werk). En je moet bereid zijn om te leren en
              stap voor stap te bouwen, want quick-fix bestaat hier
              niet. Het beste is om een gesprek aan te gaan met{" "}
              {memberNaam ?? "de member"} en{" "}
              {sponsorNaam ?? "de sponsor"} en zelf te voelen of het
              klopt.
            </div>
          </details>

          <MediaBlokken
            paginaNamespace="mini-eleva-business"
            paginaId="overzicht"
            positie="faq-extra"
            blokken={blokken("faq-extra")}
            isFounder={isFounder}
          />
        </section>
        )}

        {/* ============================================================
            ALS JE NIEUWSGIERIG WORDT
            ============================================================ */}
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <h2 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
            💬 Als je nieuwsgierig wordt
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Heb je vragen die je beter aan een mens wil stellen, of voel je
            dat dit iets kan zijn voor jou? Haal{" "}
            {sponsorNaam ?? memberNaam ?? "de member"} erbij via de chat.
            Geen druk, gewoon doorpraten over wat het voor jou zou kunnen
            zijn.
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
