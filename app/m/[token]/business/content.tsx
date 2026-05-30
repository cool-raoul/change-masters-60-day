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
              <span className="text-cm-gold">·</span> Geen inkoop, geen
              voorraad, geen startpakket dat je moet kopen. Geen investering
              om mee te doen.
            </li>
            <li>
              <span className="text-cm-gold">·</span> Geen verplichte
              maandelijkse afname om actief te blijven.
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
