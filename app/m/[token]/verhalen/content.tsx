import Link from "next/link";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";
import { Reveal } from "@/components/ui/Reveal";

// ============================================================
// Gedeelde content-component voor de succesverhalen-bibliotheek.
// Zeven thema-secties (slaap, energie, hormonen, vel, lichter, rust,
// darmen). Per thema een korte tekst-intro plus een MediaBlokken-slot
// waar Gaby filmpjes en quotes kan droppen.
//
// Sinds 2026-06-01: alle teksten editable via namespace
// 'mini-eleva-verhalen'. Business-verhalen leven op een eigen route.
// ============================================================

const NS = "mini-eleva-verhalen";

type Props = {
  isFounder: boolean;
  prospectVoornaam: string;
  memberNaam: string | null;
  terugHref: string;
  blokkenPerPositie: Record<string, Blok[]>;
  tekstOverrides: Record<string, string>;
  spoor: "product" | "business";
};

export function MiniElevaVerhalenContent({
  isFounder,
  prospectVoornaam: _prospectVoornaam,
  memberNaam,
  terugHref,
  blokkenPerPositie,
  tekstOverrides,
}: Props) {
  const blokken = (positie: string): Blok[] => blokkenPerPositie[positie] ?? [];
  const vars = { member: memberNaam ?? "de member" };

  return (
    <EditModeProvider>
      <div className="space-y-6 pt-6">
        <Link
          href={terugHref}
          className="text-cm-white/60 hover:text-cm-white text-sm flex items-center gap-1"
        >
          ← Terug
        </Link>

        <Reveal richting="fade">
        <div>
          <EditableTekst
            namespace={NS}
            sleutel="intro.label"
            standaard="Verhalen van mensen die je voorgingen"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-gold text-xs font-semibold uppercase tracking-wider"
            hint="Klein gouden label boven de paginatitel"
          />
          <EditableTekst
            namespace={NS}
            sleutel="intro.titel"
            standaard="Hoe het anderen verging"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h1"
            className="font-serif-warm text-2xl text-cm-white leading-tight mt-1"
            hint="Hoofdtitel verhalen-pagina"
          />
          <EditableBlok
            namespace={NS}
            sleutel="intro.uitleg"
            standaard="Geen marketing-verhalen, gewoon echte mensen die vertellen wat ze hebben gemerkt. Elke ervaring is persoonlijk, dus wat bij hen verschoof zegt nog niet wat bij jou gebeurt. Wel geeft het je een beeld van hoe het in andere levens uitwerkt."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/75 text-sm leading-relaxed mt-3"
            rows={3}
            hint="Intro-paragraaf onder de titel"
          />
        </div>
        </Reveal>

        <MediaBlokken
          paginaNamespace={NS}
          paginaId="overzicht"
          positie="intro"
          blokken={blokken("intro")}
          isFounder={isFounder}
        />

        {/* SLAAP */}
        <Reveal delay={75}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="slaap.titel"
            standaard="😴 Slaap en herstel"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel slaap"
          />
          <EditableBlok
            namespace={NS}
            sleutel="slaap.tekst"
            standaard="Een veelgehoord thema. Mensen geven aan dat ze dieper slapen, dat ze minder vaak wakker worden, of dat ze frisser opstaan dan ze jaren gewend waren. Geen wonder, wel iets dat veel mensen ervaren."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Beschrijving slaap-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="slaap"
            blokken={blokken("slaap")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* ENERGIE */}
        <Reveal delay={150}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="energie.titel"
            standaard="⚡ Energie door de dag"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel energie"
          />
          <EditableBlok
            namespace={NS}
            sleutel="energie.tekst"
            standaard="Verhalen van mensen die merken dat ze niet meer halverwege de middag onderuit gaan, of die zonder die extra koffie de dag door komen. Vaak iets dat sluipenderwijs verandert, en pas opvalt als je terugkijkt."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Beschrijving energie-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="energie"
            blokken={blokken("energie")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* HORMONEN EN OVERGANG */}
        <Reveal delay={225}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="hormonen.titel"
            standaard="🌸 Hormonen en overgang"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel hormonen en overgang"
          />
          <EditableBlok
            namespace={NS}
            sleutel="hormonen.tekst"
            standaard="Voor vrouwen in en rond de overgang. Verhalen over rustiger slapen, minder opvliegers, meer regelmaat, of gewoon zich stabieler voelen in een fase die niet altijd makkelijk is. Het lichaam reageert per vrouw anders, en dat hoor je terug."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Beschrijving hormonen-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="hormonen"
            blokken={blokken("hormonen")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* VEL */}
        <Reveal delay={300}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="vel.titel"
            standaard="✨ Vel en uitstraling"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel vel en uitstraling"
          />
          <EditableBlok
            namespace={NS}
            sleutel="vel.tekst"
            standaard="Mensen vertellen dat hun vel rustiger oogt, dat ze er frisser uitzien op een foto die ze tegenkomen, of dat anderen erop beginnen te wijzen. Vaak een combinatie van slaap, voeding, en ondersteunende producten samen."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Beschrijving vel-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="vel"
            blokken={blokken("vel")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* LICHTER */}
        <Reveal delay={375}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="lichter.titel"
            standaard="⚖️ Lichter voelen, kleding die losser zit"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel lichter voelen"
          />
          <EditableBlok
            namespace={NS}
            sleutel="lichter.tekst"
            standaard="Vooral mensen die de Holistic Reset hebben gedaan, vertellen hierover. Niet als crash-aanpak, wel als drie weken bewust werk aan een schoner ritme. De kleding die losser zit komt vaak terug in deze verhalen, evenals een rustiger spijsverteringsritme."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Beschrijving lichter-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="lichter"
            blokken={blokken("lichter")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* RUST */}
        <Reveal delay={450}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="rust.titel"
            standaard="🧘 Innerlijke rust, minder spanning"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel rust"
          />
          <EditableBlok
            namespace={NS}
            sleutel="rust.tekst"
            standaard="Mensen die merken dat ze gelijkmoediger door drukke perioden heen gaan, dat ze minder snel uit het lood raken, of dat de avonden weer ontspannen voelen. Vaak in combinatie met aandacht voor dagritme en ademhaling."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Beschrijving rust-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="rust"
            blokken={blokken("rust")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* DARMEN */}
        <Reveal delay={525}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="darmen.titel"
            standaard="🌿 Spijsvertering en darmen"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel spijsvertering en darmen"
          />
          <EditableBlok
            namespace={NS}
            sleutel="darmen.tekst"
            standaard="Verhalen rond het programma Darmen in Balans. Een rustigere buik, meer regelmaat, minder opgeblazen gevoel. Vaak iets dat na een paar weken pas opvalt, want je merkt het meestal aan wat er weg-is."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Beschrijving darmen-thema"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="darmen"
            blokken={blokken("darmen")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* AFSLUITEND */}
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <EditableBlok
            namespace={NS}
            sleutel="afsluit.uitleg"
            standaard="Herken je iets in deze verhalen, of zit er een vraag bij je naar boven? Stel 'm rustig aan de ELEVA-mentor, of haal {member} erbij. Een verhaal is een opening naar een gesprek, niet een belofte."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Slot-uitleg met doorverwijzing naar member/mentor"
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
