import Link from "next/link";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";

// ============================================================
// Gedeelde content-component voor de succesverhalen-bibliotheek.
// Acht thema-secties (slaap, energie, hormonen, herstel, vel, lichter,
// rust, business). Per thema een korte tekst-intro plus een
// MediaBlokken-slot waar Gaby filmpjes en quotes kan droppen.
// ============================================================

type Props = {
  isFounder: boolean;
  prospectVoornaam: string;
  memberNaam: string | null;
  terugHref: string;
  blokkenPerPositie: Record<string, Blok[]>;
  /**
   * Spoor van de prospect. Op product-spoor verbergen we het 'business'-
   * thema, want die prospect is daar niet voor uitgenodigd.
   */
  spoor: "product" | "business";
};

export function MiniElevaVerhalenContent({
  isFounder,
  prospectVoornaam: _prospectVoornaam,
  memberNaam,
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
            Verhalen van mensen die je voorgingen
          </p>
          <h1 className="font-serif-warm text-2xl text-cm-white leading-tight mt-1">
            Hoe het anderen verging
          </h1>
          <p className="text-cm-white/75 text-sm leading-relaxed mt-3">
            Geen marketing-verhalen, gewoon echte mensen die vertellen wat ze
            hebben gemerkt. Elke ervaring is persoonlijk, dus wat bij hen
            verschoof zegt nog niet wat bij jou gebeurt. Wel geeft het je een
            beeld van hoe het in andere levens uitwerkt.
          </p>
        </div>

        {/* Intro-blok (optioneel filmpje van Gaby of Raoul) */}
        <MediaBlokken
          paginaNamespace="mini-eleva-verhalen"
          paginaId="overzicht"
          positie="intro"
          blokken={blokken("intro")}
          isFounder={isFounder}
        />

        {/* ============================================================
            SLAAP
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            😴 Slaap en herstel
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Een veelgehoord thema. Mensen geven aan dat ze dieper slapen, dat
            ze minder vaak wakker worden, of dat ze frisser opstaan dan ze
            jaren gewend waren. Geen wonder, wel iets dat veel mensen
            ervaren.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-verhalen"
            paginaId="overzicht"
            positie="slaap"
            blokken={blokken("slaap")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            ENERGIE
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            ⚡ Energie door de dag
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Verhalen van mensen die merken dat ze niet meer halverwege de
            middag onderuit gaan, of die zonder die extra koffie de dag door
            komen. Vaak iets dat sluipenderwijs verandert, en pas opvalt als
            je terugkijkt.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-verhalen"
            paginaId="overzicht"
            positie="energie"
            blokken={blokken("energie")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            HORMONEN EN OVERGANG
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🌸 Hormonen en overgang
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Voor vrouwen in en rond de overgang. Verhalen over rustiger
            slapen, minder opvliegers, meer regelmaat, of gewoon zich
            stabieler voelen in een fase die niet altijd makkelijk is.
            Het lichaam reageert per vrouw anders, en dat hoor je terug.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-verhalen"
            paginaId="overzicht"
            positie="hormonen"
            blokken={blokken("hormonen")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            VEL EN UITERLIJK
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            ✨ Vel en uitstraling
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Mensen vertellen dat hun vel rustiger oogt, dat ze er frisser
            uitzien op een foto die ze tegenkomen, of dat anderen erop
            beginnen te wijzen. Vaak een combinatie van slaap, voeding, en
            ondersteunende producten samen.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-verhalen"
            paginaId="overzicht"
            positie="vel"
            blokken={blokken("vel")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            LICHTER VOELEN (RESET)
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            ⚖️ Lichter voelen, kleding die losser zit
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Vooral mensen die de Holistic Reset hebben gedaan, vertellen
            hierover. Niet als crash-aanpak, wel als drie weken bewust werk
            aan een schoner ritme. De kleding die losser zit komt vaak terug
            in deze verhalen, evenals een rustiger spijsverteringsritme.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-verhalen"
            paginaId="overzicht"
            positie="lichter"
            blokken={blokken("lichter")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            RUST EN STRESS
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🧘 Innerlijke rust, minder spanning
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Mensen die merken dat ze gelijkmoediger door drukke perioden
            heen gaan, dat ze minder snel uit het lood raken, of dat de
            avonden weer ontspannen voelen. Vaak in combinatie met aandacht
            voor dagritme en ademhaling.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-verhalen"
            paginaId="overzicht"
            positie="rust"
            blokken={blokken("rust")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            SPIJSVERTERING EN DARMEN
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🌿 Spijsvertering en darmen
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Verhalen rond het programma Darmen in Balans. Een rustigere buik,
            meer regelmaat, minder opgeblazen gevoel. Vaak iets dat na een
            paar weken pas opvalt, want je merkt het meestal aan wat er
            weg-is.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-verhalen"
            paginaId="overzicht"
            positie="darmen"
            blokken={blokken("darmen")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            BUSINESS (alleen business-spoor)
            ============================================================ */}
        {spoor === "business" && (
          <section className="card space-y-3">
            <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
              💼 Mensen die met de business bezig zijn
            </h2>
            <p className="text-cm-white/85 text-sm leading-relaxed">
              Verhalen van mensen die er ook iets mee zijn gaan doen aan de
              business-kant. Sommigen bewust als kleine bijverdienste naast
              hun werk, anderen die uitbouwen tot iets stevigers. Geen
              bedragen-beloftes, wel een eerlijk beeld van wat ze hebben
              opgebouwd en wat dat met hen heeft gedaan.
            </p>
            <MediaBlokken
              paginaNamespace="mini-eleva-verhalen"
              paginaId="overzicht"
              positie="business"
              blokken={blokken("business")}
              isFounder={isFounder}
            />
          </section>
        )}

        {/* ============================================================
            AFSLUITEND
            ============================================================ */}
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Herken je iets in deze verhalen, of zit er een vraag bij je naar
            boven? Stel 'm rustig aan de ELEVA-mentor, of haal{" "}
            {memberNaam ?? "de member"} erbij. Een verhaal is een opening
            naar een gesprek, niet een belofte.
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
