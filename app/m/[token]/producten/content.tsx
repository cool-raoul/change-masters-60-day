import Link from "next/link";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";
import { Reveal } from "@/components/ui/Reveal";

// ============================================================
// Gedeelde content-component voor /m/[token]/producten (prospect-view,
// read-only) en /instellingen/mini-eleva-preview/producten (founder-
// view, edit-mode). Zelfde data, andere props.
//
// Inhoud: korte intro + 5 hoofdcategorieen + 5 programma's, elk met
// een claim-vrije beschrijving in onze stem en een MediaBlokken-slot
// waar Gaby filmpjes/uitleg kan toevoegen.
//
// Sinds 2026-06-01: alle teksten editable via EditableTekst/EditableBlok
// met namespace 'mini-eleva-producten'. Founders zien per veld een
// ✍️-knop in edit-modus. {voornaam} en {member} zijn interpolatie-vars.
// ============================================================

const NS = "mini-eleva-producten";

type Props = {
  isFounder: boolean;
  prospectVoornaam: string;
  memberNaam: string | null;
  terugHref: string;
  blokkenPerPositie: Record<string, Blok[]>;
  tekstOverrides: Record<string, string>;
};

export function MiniElevaProductenContent({
  isFounder,
  prospectVoornaam,
  memberNaam,
  terugHref,
  blokkenPerPositie,
  tekstOverrides,
}: Props) {
  const blokken = (positie: string): Blok[] => blokkenPerPositie[positie] ?? [];
  const vars = {
    voornaam: prospectVoornaam,
    member: memberNaam ?? "de member",
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

        <Reveal herhaal richting="fade">
        <div>
          <EditableTekst
            namespace={NS}
            sleutel="intro.label"
            standaard="Producten en programma's"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-gold text-xs font-semibold uppercase tracking-wider"
            hint="Het kleine gouden label boven de paginatitel"
          />
          <EditableTekst
            namespace={NS}
            sleutel="intro.titel"
            standaard="Wat is er, en voor wie past het"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h1"
            className="font-serif-warm text-2xl text-cm-white leading-tight mt-1"
            hint="Hoofdtitel van de producten-pagina"
          />
          <EditableBlok
            namespace={NS}
            sleutel="intro.uitleg"
            standaard="Hieronder een rustige rondleiding door de hoofdcategorieen. Geen beloftes, wel een beeld dat klopt. Wil je ergens dieper op ingaan? Vraag het de ELEVA-mentor of haal {member} erbij via de chat."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
            as="p"
            className="text-cm-white/75 text-sm leading-relaxed mt-3"
            rows={3}
            hint="Intro-paragraaf direct onder de titel"
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

        {/* BASIS-SUPPLEMENTEN */}
        <Reveal herhaal delay={75}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="basis.titel"
            standaard="🌿 Basis-supplementen, je dagelijkse aanvulling"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel basis-supplementen"
          />
          <EditableBlok
            namespace={NS}
            sleutel="basis.tekst1"
            standaard="De basislijn van Lifeplus is de Daily BioBasics-familie: Daily BioBasics Light, Daily BioBasics, en Daily BioBasics Plus. Voor vrouwen en mannen is er ook een eigen variant met de Women's Gold Formula en de Men's Gold Formula."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Eerste paragraaf basis-supplementen, opsomming producten"
          />
          <EditableBlok
            namespace={NS}
            sleutel="basis.tekst2"
            standaard="Wat het is: een dagelijkse aanvulling met basisvoedingsstoffen, antioxidanten en plantaardige bouwstenen. Geen wondermiddel, wel een fundament voor wat je lichaam dagelijks nodig heeft. Veel mensen die het gebruiken merken na een paar weken dat ze stabieler door de dag heen gaan, maar dat verschilt per persoon."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/70 text-sm leading-relaxed"
            rows={3}
            hint="Tweede paragraaf basis-supplementen, ervaring claim-vrij"
          />
          <EditableBlok
            namespace={NS}
            sleutel="basis.tekst3"
            standaard="Voor specifieke vragen over wat het voor jou kan betekenen kun je de ELEVA-mentor raadplegen, of {member} erbij halen."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
            as="p"
            className="text-cm-white/55 text-xs leading-relaxed italic"
            rows={2}
            hint="Slot-zin basis met verwijzing naar member"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="basis"
            blokken={blokken("basis")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* OMEGA EN ANTIOXIDANTEN */}
        <Reveal herhaal delay={150}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="omega.titel"
            standaard="🐟 Omega en antioxidanten"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel omega en antioxidanten"
          />
          <EditableBlok
            namespace={NS}
            sleutel="omega.tekst1"
            standaard="OmeGold en Vegan OmeGold zijn de omega-vetzuren-producten. Wie geen of weinig vis eet kiest hier vaak voor. Proanthenols 100 is de antioxidant-klassieker, gebaseerd op druivenpit-extract en denneschors."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Eerste paragraaf omega/antioxidanten"
          />
          <EditableBlok
            namespace={NS}
            sleutel="omega.tekst2"
            standaard="Mensen die deze gebruiken doen dat vaak ter ondersteuning van wat ze al doen met voeding en leefstijl. Het is een keuze voor mensen die hun basis bewust willen aanvullen. Wat je merkt verschilt per persoon en per situatie."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/70 text-sm leading-relaxed"
            rows={3}
            hint="Tweede paragraaf omega/antioxidanten, ervaring claim-vrij"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="omega"
            blokken={blokken("omega")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* EIWIT EN SHAKES */}
        <Reveal herhaal delay={225}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="eiwit.titel"
            standaard="🥤 Eiwit en shakes"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel eiwit en shakes"
          />
          <EditableBlok
            namespace={NS}
            sleutel="eiwit.tekst1"
            standaard="Triple Protein Shake komt in drie smaken (vanille, chocolade en ongezoet) en is een rustige plantaardige eiwitbron. Wie helemaal vegan eet kiest vaak voor Vegan Protein Shake. Be Refueled is meer gericht op herstel na inspanning of een drukke dag."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Eerste paragraaf eiwit en shakes"
          />
          <EditableBlok
            namespace={NS}
            sleutel="eiwit.tekst2"
            standaard="Veel mensen gebruiken een shake als snelle vervanger van een maaltijd of als toevoeging na sport. Geen wondermiddel, wel handig om eiwit-inname op peil te houden zonder dat je elke keer moet koken."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/70 text-sm leading-relaxed"
            rows={3}
            hint="Tweede paragraaf eiwit en shakes, gebruik"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="eiwit"
            blokken={blokken("eiwit")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* METABOLISME EN LICHTER VOELEN */}
        <Reveal herhaal delay={300}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="metabolisme.titel"
            standaard="⚖️ Metabolisme en lichter voelen"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel metabolisme"
          />
          <EditableBlok
            namespace={NS}
            sleutel="metabolisme.tekst1"
            standaard="In deze hoek zitten Key-Tonic, Enerxan en Phase'oMine. Deze worden vaak gebruikt door mensen die werken aan een schoner ritme of die lichter willen voelen, bijvoorbeeld in combinatie met de Holistic Reset."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Eerste paragraaf metabolisme"
          />
          <EditableBlok
            namespace={NS}
            sleutel="metabolisme.tekst2"
            standaard="Geen quick-fix, geen crash-aanpak. Veel mensen die hiermee starten merken dat hun kleding losser zit en dat ze met meer pit door de dag gaan, maar het lichaam reageert per persoon anders. {voornaam}, voor specifiek advies kun je samen met {member} en de Mentor kijken wat past."
            overrides={tekstOverrides}
            isFounder={isFounder}
            vars={vars}
            as="p"
            className="text-cm-white/70 text-sm leading-relaxed"
            rows={4}
            hint="Tweede paragraaf metabolisme met persoonlijke aanspreking"
          />
          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="metabolisme"
            blokken={blokken("metabolisme")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* PROGRAMMA'S */}
        <Reveal herhaal delay={375}>
        <section className="card space-y-3">
          <EditableTekst
            namespace={NS}
            sleutel="programmas.titel"
            standaard="🎯 Programma's, een afgebakende periode met focus"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-base font-semibold flex items-center gap-2"
            hint="Sectie-titel programma's"
          />
          <EditableBlok
            namespace={NS}
            sleutel="programmas.intro"
            standaard="Een programma is een aanpak van een paar weken waarin je gericht werkt aan iets specifieks. Combinatie van producten plus richtlijnen voor voeding en leefstijl, vaak met een groepsgevoel en een team-coach die meekijkt."
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="p"
            className="text-cm-white/85 text-sm leading-relaxed"
            rows={3}
            hint="Intro-paragraaf boven de programma-lijst"
          />

          <div className="space-y-2 pt-2">
            <EditableTekst
              namespace={NS}
              sleutel="programmas.reset.kop"
              standaard="🌱 Holistic Reset (drie weken)"
              overrides={tekstOverrides}
              isFounder={isFounder}
              as="h3"
              className="text-cm-white font-semibold text-sm"
              hint="Programma-kop Holistic Reset"
            />
            <EditableBlok
              namespace={NS}
              sleutel="programmas.reset.tekst"
              standaard="Een drie-weken-aanpak voor een schoner ritme. Begeleidende producten, richtlijnen voor voeding, dagelijkse momenten van rust en beweging. Veel mensen die dit doen merken dat hun kleding losser zit en dat ze meer pit hebben, maar dat verschilt per persoon. Mooi vertrekpunt als je iets wil voelen verschuiven zonder crash-dieet."
              overrides={tekstOverrides}
              isFounder={isFounder}
              as="p"
              className="text-cm-white/70 text-sm leading-relaxed"
              rows={4}
              hint="Beschrijving Holistic Reset"
            />
          </div>

          <div className="space-y-2 pt-2">
            <EditableTekst
              namespace={NS}
              sleutel="programmas.darmen.kop"
              standaard="🌿 Darmen in Balans"
              overrides={tekstOverrides}
              isFounder={isFounder}
              as="h3"
              className="text-cm-white font-semibold text-sm"
              hint="Programma-kop Darmen in Balans"
            />
            <EditableBlok
              namespace={NS}
              sleutel="programmas.darmen.tekst"
              standaard="Een aanpak van een paar weken gericht op spijsvertering en darmflora. Specifieke supplementen plus aandacht voor wat je eet. Mensen geven vaak aan dat hun buik rustiger voelt en dat er meer regelmaat in komt, opnieuw met de kanttekening dat het lichaam per persoon anders reageert."
              overrides={tekstOverrides}
              isFounder={isFounder}
              as="p"
              className="text-cm-white/70 text-sm leading-relaxed"
              rows={4}
              hint="Beschrijving Darmen in Balans"
            />
          </div>

          <div className="space-y-2 pt-2">
            <EditableTekst
              namespace={NS}
              sleutel="programmas.hormonen.kop"
              standaard="🌸 Hormonale Balans"
              overrides={tekstOverrides}
              isFounder={isFounder}
              as="h3"
              className="text-cm-white font-semibold text-sm"
              hint="Programma-kop Hormonale Balans"
            />
            <EditableBlok
              namespace={NS}
              sleutel="programmas.hormonen.tekst"
              standaard="Voor vrouwen in en rond de overgang, gericht op het ondersteunen van het natuurlijke hormoonritme. Combinatie van producten en levensstijl-aandacht. Niet medisch, wel een rustige aanpak die mensen helpt zich beter te voelen in een fase die niet altijd makkelijk is."
              overrides={tekstOverrides}
              isFounder={isFounder}
              as="p"
              className="text-cm-white/70 text-sm leading-relaxed"
              rows={4}
              hint="Beschrijving Hormonale Balans"
            />
          </div>

          <div className="space-y-2 pt-2">
            <EditableTekst
              namespace={NS}
              sleutel="programmas.stress.kop"
              standaard="🧘 Stress-vermindering"
              overrides={tekstOverrides}
              isFounder={isFounder}
              as="h3"
              className="text-cm-white font-semibold text-sm"
              hint="Programma-kop Stress-vermindering"
            />
            <EditableBlok
              namespace={NS}
              sleutel="programmas.stress.tekst"
              standaard="Een aanpak voor mensen die merken dat ze in een opgespannen stand staan en daar uit willen komen. Combinatie van producten, ademhalings- en rust-momenten, en aandacht voor je dagritme."
              overrides={tekstOverrides}
              isFounder={isFounder}
              as="p"
              className="text-cm-white/70 text-sm leading-relaxed"
              rows={3}
              hint="Beschrijving Stress-vermindering"
            />
          </div>

          <div className="space-y-2 pt-2">
            <EditableTekst
              namespace={NS}
              sleutel="programmas.sport.kop"
              standaard="💪 Sport-herstel"
              overrides={tekstOverrides}
              isFounder={isFounder}
              as="h3"
              className="text-cm-white font-semibold text-sm"
              hint="Programma-kop Sport-herstel"
            />
            <EditableBlok
              namespace={NS}
              sleutel="programmas.sport.tekst"
              standaard="Voor wie sport en bewust met herstel bezig is. Eiwit, ondersteunende supplementen, en richtlijnen voor herstel na inspanning. Veel sporters gebruiken dit naast hun eigen trainingsritme."
              overrides={tekstOverrides}
              isFounder={isFounder}
              as="p"
              className="text-cm-white/70 text-sm leading-relaxed"
              rows={3}
              hint="Beschrijving Sport-herstel"
            />
          </div>

          <MediaBlokken
            paginaNamespace={NS}
            paginaId="overzicht"
            positie="programmas"
            blokken={blokken("programmas")}
            isFounder={isFounder}
          />
        </section>
        </Reveal>

        {/* DOORVRAGEN */}
        <Reveal herhaal delay={450}>
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <EditableTekst
            namespace={NS}
            sleutel="doorvragen.titel"
            standaard="🤔 Wil je dieper op iets ingaan?"
            overrides={tekstOverrides}
            isFounder={isFounder}
            as="h2"
            className="text-cm-gold text-sm font-semibold flex items-center gap-2"
            hint="Slot-sectie titel"
          />
          <EditableBlok
            namespace={NS}
            sleutel="doorvragen.uitleg"
            standaard="De ELEVA-mentor kent alle producten en programma's tot in detail en kan jouw specifieke vragen rustig beantwoorden. En als je twijfelt of iets past, haal dan {member} erbij via de chat. Persoonlijk advies werkt altijd beter dan een algemeen overzicht."
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
        </Reveal>

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
