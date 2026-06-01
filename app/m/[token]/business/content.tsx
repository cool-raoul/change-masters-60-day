import Link from "next/link";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";

// ============================================================
// Business-uitleg, alleen zichtbaar voor prospects die zijn
// uitgenodigd voor de business-kant van Lifeplus. Verdienmodel,
// rang-ladder, hoe het werkt, plus MediaBlokken per sectie.
//
// Sinds 2026-06-01: alle teksten editable via namespace
// 'mini-eleva-business'. Dode FAQ-blok weg, FAQ leeft op /faq.
// ============================================================

const NS = "mini-eleva-business";

type Props = {
  isFounder: boolean;
  prospectVoornaam: string;
  memberNaam: string | null;
  sponsorNaam: string | null;
  terugHref: string;
  blokkenPerPositie: Record<string, Blok[]>;
  tekstOverrides: Record<string, string>;
};

export function MiniElevaBusinessContent({
  isFounder,
  prospectVoornaam,
  memberNaam,
  sponsorNaam,
  terugHref,
  blokkenPerPositie,
  tekstOverrides,
}: Props) {
  const blokken = (positie: string): Blok[] => blokkenPerPositie[positie] ?? [];
  const vars = {
    voornaam: prospectVoornaam,
    member: memberNaam ?? "de member",
    sponsor: sponsorNaam ?? memberNaam ?? "de sponsor",
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
            standaard="De business-kant"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-gold text-xs font-semibold uppercase tracking-wider"
            hint="Klein gouden label boven de paginatitel"
          />
          <EditableTekst
            namespace={NS}
            sleutel="intro.titel"
            standaard="Hoe het werkt en wat je opbouwt"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h1"
            className="font-serif-warm text-2xl text-cm-white leading-tight mt-1"
            hint="Hoofdtitel business-pagina"
          />
          <EditableBlok
            namespace={NS}
            sleutel="intro.uitleg"
            standaard="{voornaam}, hier vind je rustige uitleg over hoe het verdienmodel in elkaar zit, wat de rang-ladder is, en hoe je je eerste mijlpaal (Builder) bereikt. Geen druk om te beslissen, wel een eerlijk beeld dat klopt. Vragen mogen rustig blijven liggen of via de Mentor of {member}."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
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

        {/* HOE HET WERKT */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="hoe.titel"
            standaard="🧭 Hoe het werkt in grote lijnen"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel hoe het werkt"
          />
          <EditableBlok
            namespace={NS}
            sleutel="hoe.tekst1"
            standaard="Lifeplus is aanbevelingsmarketing. Concreet: je krijgt een eigen webshop-link die je kunt delen met mensen om je heen. Wie iets koopt via die link, telt mee voor jouw volume. Wie zelf ook iets met de business gaat doen, vormt jouw team, en hun volume telt ook mee."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Eerste paragraaf, basis-uitleg model"
          />
          <EditableBlok
            namespace={NS}
            sleutel="hoe.tekst2"
            standaard="Wat er bijzonder is aan deze opzet, vergeleken met andere modellen die je misschien hebt gehoord:"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={2}
            hint="Bridge-zin naar de opsomming"
          />
          <ul className="text-cm-white/80 text-sm leading-relaxed space-y-1.5 pl-1">
            <li>
              <span className="text-cm-gold">·</span>{" "}
              <EditableTekst
                namespace={NS}
                sleutel="hoe.punt1"
                standaard="Geen inschrijfgeld en geen startpakket dat je moet kopen om mee te doen. Geen voorraad om aan anderen kwijt te raken."
                overrides={tekstOverrides}
                isFounder={isFounder}
                as="span"
                hint="Onderscheidend punt 1"
              />
            </li>
            <li>
              <span className="text-cm-gold">·</span>{" "}
              <EditableTekst
                namespace={NS}
                sleutel="hoe.punt2"
                standaard="Wel doe je elke maand minimaal 40 IP voor jezelf, een eigen basis-bestelling (kort: 40 Internationale Punten, ongeveer een basis-pakket aan supplementen, zie uitleg verderop). Dat is je eigen afname, geen verkoopverplichting aan anderen."
                overrides={tekstOverrides}
                isFounder={isFounder}
                as="span"
                hint="Onderscheidend punt 2 (IP-uitleg kort)"
              />
            </li>
            <li>
              <span className="text-cm-gold">·</span>{" "}
              <EditableTekst
                namespace={NS}
                sleutel="hoe.punt3"
                standaard="Je verdient pas iets als er ook daadwerkelijk producten worden aanbevolen en verkocht. Geen geld voor 'alleen mensen werven'."
                overrides={tekstOverrides}
                isFounder={isFounder}
                as="span"
                hint="Onderscheidend punt 3 (anti-piramide)"
              />
            </li>
            <li>
              <span className="text-cm-gold">·</span>{" "}
              <EditableTekst
                namespace={NS}
                sleutel="hoe.punt4"
                standaard="De top-rangen verdienen niet automatisch meer dan starters. Wie er hard aan trekt kan voorbij {member} groeien, en voorbij de mensen die daarvoor zijn begonnen."
                overrides={tekstOverrides}
                isFounder={isFounder}
                vars={vars}
                as="span"
                hint="Onderscheidend punt 4 (geen plafond)"
              />
            </li>
          </ul>
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="hoe-het-werkt"
            blokken={blokken("hoe-het-werkt")}
            isFounder={isFounder}
          />
        </section>

        {/* IP-UITLEG */}
        <section className="card border-l-4 border-cm-gold/60 space-y-3">
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
            standaard="IP staat voor Internationale Punten. Het is de eenheid waarin Lifeplus alle bestellingen meet. Elk product heeft een IP-waarde, en die telt mee voor je volume, je rang en eventuele commissies. IP is internationaal, dus een bestelling in Nederland telt op dezelfde manier mee als eentje in Duitsland of Engeland."
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
            standaard="Jouw minimale eigen afname: 40 IP per maand voor jezelf. Dat komt ongeveer overeen met een basis-pakket aan supplementen. Dit is je eigen vaste afname, geen verkoopverplichting aan anderen, en voor veel mensen is het sowieso meerwaarde want het wordt hun eigen gezondheids-basis. Zonder die 40 IP per maand kun je geen actief lid blijven en geen commissies ontvangen."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Tweede paragraaf IP, eigen afname"
          />
          <EditableBlok
            namespace={NS}
            sleutel="ip.tekst3"
            standaard="Voor je rang: in de ladder hieronder zie je getallen als '1500 IP totaal', dat is wat er in jouw eerste drie levels samen wordt besteld (jouw eigen bestelling plus alle members en shoppers daaronder). Daar tellen alle IP's bij elkaar op, in elke maand opnieuw."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Derde paragraaf IP, rang-context"
          />
        </section>

        {/* RANG-LADDER */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="rang.titel"
            standaard="📊 De rang-ladder, van Builder tot Diamond"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel rang-ladder"
          />
          <EditableBlok
            namespace={NS}
            sleutel="rang.intro"
            standaard="Je verdient op basis van wat er in jouw eerste drie levels gebeurt (jouw eigen bestelling plus alle members en shoppers daaronder). Die 'members' hoeven niet allemaal in level 1 te zitten, ze mogen ook dieper hangen. Hoe groter het volume en hoe meer actieve members, hoe verder je op de ladder komt."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Intro-paragraaf boven de ladder"
          />

          <div className="space-y-2 pt-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0">🪜</span>
              <div>
                <EditableTekst
                  namespace={NS}
                  sleutel="rang.builder.kop"
                  standaard="Builder"
                  overrides={tekstOverrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white font-semibold"
                  hint="Rang-naam Builder"
                />
                <EditableBlok
                  namespace={NS}
                  sleutel="rang.builder.tekst"
                  standaard="Je bouwsteen. Eerste drie levels samen op 1500 IP, en minimaal drie members met een bestelling vanaf 40 IP. Geen vast bedrag, wel de sleutel tot duplicatie. Vanaf Builder bouw je niet meer in je eentje, je team telt mee."
                  overrides={tekstOverrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white/70 text-xs leading-relaxed"
                  rows={3}
                  hint="Beschrijving Builder"
                />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0">🥉</span>
              <div>
                <EditableTekst
                  namespace={NS}
                  sleutel="rang.bronze.kop"
                  standaard="Bronze"
                  overrides={tekstOverrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white font-semibold"
                  hint="Rang-naam Bronze"
                />
                <EditableBlok
                  namespace={NS}
                  sleutel="rang.bronze.tekst"
                  standaard="Vanaf 100 IP eigen, 3000 IP totaal, 3 members. Vanaf 300 tot 600 euro per maand, afhankelijk van diepte."
                  overrides={tekstOverrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white/70 text-xs leading-relaxed"
                  rows={2}
                  hint="Beschrijving Bronze"
                />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0">🥈</span>
              <div>
                <EditableTekst
                  namespace={NS}
                  sleutel="rang.silver.kop"
                  standaard="Silver"
                  overrides={tekstOverrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white font-semibold"
                  hint="Rang-naam Silver"
                />
                <EditableBlok
                  namespace={NS}
                  sleutel="rang.silver.tekst"
                  standaard="Vanaf 100 IP eigen, 6000 IP totaal, 6 members. Vanaf 600 euro per maand."
                  overrides={tekstOverrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white/70 text-xs leading-relaxed"
                  rows={2}
                  hint="Beschrijving Silver"
                />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0">🥇</span>
              <div>
                <EditableTekst
                  namespace={NS}
                  sleutel="rang.gold.kop"
                  standaard="Gold"
                  overrides={tekstOverrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white font-semibold"
                  hint="Rang-naam Gold"
                />
                <EditableBlok
                  namespace={NS}
                  sleutel="rang.gold.tekst"
                  standaard="Vanaf 150 IP eigen, 9000 IP totaal, 9 members. Vanaf 900 euro per maand."
                  overrides={tekstOverrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white/70 text-xs leading-relaxed"
                  rows={2}
                  hint="Beschrijving Gold"
                />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0">💎</span>
              <div>
                <EditableTekst
                  namespace={NS}
                  sleutel="rang.diamond.kop"
                  standaard="Diamond"
                  overrides={tekstOverrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white font-semibold"
                  hint="Rang-naam Diamond"
                />
                <EditableBlok
                  namespace={NS}
                  sleutel="rang.diamond.tekst"
                  standaard="Vanaf 150 IP eigen, 15000 IP totaal, 12 members verdeeld over verschillende lijnen. Vanaf 1200 euro per maand. De top-leiders gaan daar ver bovenuit, afhankelijk van duplicatie-diepte."
                  overrides={tekstOverrides}
                  isFounder={isFounder}
                  as="p"
                  className="text-cm-white/70 text-xs leading-relaxed"
                  rows={3}
                  hint="Beschrijving Diamond"
                />
              </div>
            </div>
          </div>

          <EditableBlok
            namespace={NS}
            sleutel="rang.disclaimer"
            standaard="Belangrijke nuance: deze bedragen zijn vanaf-getallen, geen beloftes en geen plafond. Resultaten verschillen per persoon, afhankelijk van inzet en consistentie. Geen garantie."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/55 text-xs leading-relaxed italic pt-2"
            rows={3}
            hint="Disclaimer onder de rang-ladder"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="rang-ladder"
            blokken={blokken("rang-ladder")}
            isFounder={isFounder}
          />
        </section>

        {/* BUILDER */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="builder.titel"
            standaard="🎯 Builder, je eerste mijlpaal"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel Builder-mijlpaal"
          />
          <EditableBlok
            namespace={NS}
            sleutel="builder.tekst1"
            standaard="Builder is de eerste rang waar duplicatie écht begint te werken. Vóór Builder bouw je in je eentje. Vanaf Builder heb je een team van minimaal drie mensen die met je meebouwen, en wat zij doen telt mee voor jouw groei."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Eerste paragraaf Builder-mijlpaal"
          />
          <EditableBlok
            namespace={NS}
            sleutel="builder.tekst2"
            standaard="Twee voorwaarden om Builder te halen:"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={2}
            hint="Bridge-zin naar de twee voorwaarden"
          />
          <ul className="text-cm-white/80 text-sm leading-relaxed space-y-1.5 pl-1">
            <li>
              <span className="text-cm-gold">1.</span>{" "}
              <EditableTekst
                namespace={NS}
                sleutel="builder.voorwaarde1"
                standaard="Minimaal drie members met een bestelling vanaf 40 IP."
                overrides={tekstOverrides}
                isFounder={isFounder}
                as="span"
                hint="Voorwaarde 1 voor Builder"
              />
            </li>
            <li>
              <span className="text-cm-gold">2.</span>{" "}
              <EditableTekst
                namespace={NS}
                sleutel="builder.voorwaarde2"
                standaard="Eerste drie levels samen 1500 IP of meer (jouw eigen bestelling telt mee)."
                overrides={tekstOverrides}
                isFounder={isFounder}
                as="span"
                hint="Voorwaarde 2 voor Builder"
              />
            </li>
          </ul>
          <EditableBlok
            namespace={NS}
            sleutel="builder.tekst3"
            standaard="Concreet: jij bestelt iets voor jezelf, drie mensen die jij hebt uitgenodigd worden member, en samen kom je op het volume. Geen harde deadline, wel een helder doel dat het systeem voor je volgt zodra je start."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Slot-paragraaf Builder"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="builder"
            blokken={blokken("builder")}
            isFounder={isFounder}
          />
        </section>

        {/* DAG-RITME */}
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="dag.titel"
            standaard="📅 Hoe een dag eruit kan zien"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel dag-ritme"
          />
          <EditableBlok
            namespace={NS}
            sleutel="dag.tekst1"
            standaard="Mensen vragen vaak hoeveel tijd dit kost. Eerlijk antwoord: dat bepaal je grotendeels zelf. Er is geen verplicht aantal uren per dag, geen targets die boven je hoofd hangen. Wel een rustig ritme dat goed werkt voor de meeste mensen."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Eerste paragraaf dag-ritme"
          />
          <EditableBlok
            namespace={NS}
            sleutel="dag.tekst2"
            standaard="Een rustige dag is bijvoorbeeld: een paar Stories plaatsen, reageren op DM's die binnenkomen, één of twee mensen persoonlijk benaderen, en kort contact met je sponsor. Een stevige dag bouwt daar bovenop met meer Stories, meer uitnodigingen, en een 3-weg-gesprek. Je bepaalt zelf het tempo, en je sponsor denkt met je mee."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={4}
            hint="Tweede paragraaf dag-ritme, voorbeeld-dagen"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="dag-ritme"
            blokken={blokken("dag-ritme")}
            isFounder={isFounder}
          />
        </section>

        {/* AFSLUITEND */}
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <EditableTekst
            namespace={NS}
            sleutel="afsluit.titel"
            standaard="💬 Als je nieuwsgierig wordt"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-sm font-semibold flex items-center gap-2"
            hint="Slot-sectie titel"
          />
          <EditableBlok
            namespace={NS}
            sleutel="afsluit.uitleg"
            standaard="Heb je vragen die je beter aan een mens wil stellen, of voel je dat dit iets kan zijn voor jou? Haal {sponsor} erbij via de chat. Geen druk, gewoon doorpraten over wat het voor jou zou kunnen zijn."
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
