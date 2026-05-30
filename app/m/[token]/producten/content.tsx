import Link from "next/link";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { EditModeProvider } from "@/components/cms/EditModeContext";

// ============================================================
// Gedeelde content-component voor /m/[token]/producten (prospect-view,
// read-only) en /instellingen/mini-eleva-preview/producten (founder-
// view, edit-mode). Zelfde data, andere props.
//
// Inhoud: korte intro + 5 hoofdcategorieen + 5 programma's, elk met
// een claim-vrije beschrijving in onze stem en een MediaBlokken-slot
// waar Gaby filmpjes/uitleg kan toevoegen.
// ============================================================

type Props = {
  isFounder: boolean;
  prospectVoornaam: string;
  memberNaam: string | null;
  terugHref: string;
  blokkenPerPositie: Record<string, Blok[]>;
};

export function MiniElevaProductenContent({
  isFounder,
  prospectVoornaam,
  memberNaam,
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
            Producten en programma's
          </p>
          <h1 className="font-serif-warm text-2xl text-cm-white leading-tight mt-1">
            Wat is er, en voor wie past het
          </h1>
          <p className="text-cm-white/75 text-sm leading-relaxed mt-3">
            Hieronder een rustige rondleiding door de hoofdcategorieen. Geen
            beloftes, wel een beeld dat klopt. Wil je ergens dieper op ingaan?
            Vraag het de ELEVA-mentor of haal {memberNaam ?? "de member"} erbij
            via de chat.
          </p>
        </div>

        {/* Intro-media (optioneel filmpje, bv. Gaby's korte intro) */}
        <MediaBlokken
          paginaNamespace="mini-eleva-producten"
          paginaId="overzicht"
          positie="intro"
          blokken={blokken("intro")}
          isFounder={isFounder}
        />

        {/* ============================================================
            BASIS-SUPPLEMENTEN
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🌿 Basis-supplementen, je dagelijkse aanvulling
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            De basislijn van Lifeplus is de Daily BioBasics-familie: Daily
            BioBasics Light, Daily BioBasics, en Daily BioBasics Plus. Voor
            vrouwen en mannen is er ook een eigen variant met de Women's Gold
            Formula en de Men's Gold Formula.
          </p>
          <p className="text-cm-white/70 text-sm leading-relaxed">
            Wat het is: een dagelijkse aanvulling met basisvoedingsstoffen,
            antioxidanten en plantaardige bouwstenen. Geen wondermiddel, wel
            een fundament voor wat je lichaam dagelijks nodig heeft. Veel
            mensen die het gebruiken merken na een paar weken dat ze stabieler
            door de dag heen gaan, maar dat verschilt per persoon.
          </p>
          <p className="text-cm-white/55 text-xs leading-relaxed italic">
            Voor specifieke vragen over wat het voor jou kan betekenen kun je
            de ELEVA-mentor raadplegen, of {memberNaam ?? "de member"} erbij
            halen.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-producten"
            paginaId="overzicht"
            positie="basis"
            blokken={blokken("basis")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            OMEGA EN ANTIOXIDANTEN
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🐟 Omega en antioxidanten
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            OmeGold en Vegan OmeGold zijn de omega-vetzuren-producten. Wie
            geen of weinig vis eet kiest hier vaak voor. Proanthenols 100 is
            de antioxidant-klassieker, gebaseerd op druivenpit-extract en
            denneschors.
          </p>
          <p className="text-cm-white/70 text-sm leading-relaxed">
            Mensen die deze gebruiken doen dat vaak ter ondersteuning van wat
            ze al doen met voeding en leefstijl. Het is een keuze voor mensen
            die hun basis bewust willen aanvullen. Wat je merkt verschilt per
            persoon en per situatie.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-producten"
            paginaId="overzicht"
            positie="omega"
            blokken={blokken("omega")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            EIWIT EN SHAKES
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🥤 Eiwit en shakes
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Triple Protein Shake komt in drie smaken (vanille, chocolade en
            ongezoet) en is een rustige plantaardige eiwitbron. Wie helemaal
            vegan eet kiest vaak voor Vegan Protein Shake. Be Refueled is
            meer gericht op herstel na inspanning of een drukke dag.
          </p>
          <p className="text-cm-white/70 text-sm leading-relaxed">
            Veel mensen gebruiken een shake als snelle vervanger van een
            maaltijd of als toevoeging na sport. Geen wondermiddel, wel
            handig om eiwit-inname op peil te houden zonder dat je elke keer
            moet koken.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-producten"
            paginaId="overzicht"
            positie="eiwit"
            blokken={blokken("eiwit")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            METABOLISME EN LICHTER VOELEN
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            ⚖️ Metabolisme en lichter voelen
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            In deze hoek zitten Key-Tonic, Enerxan en Phase'oMine. Deze
            worden vaak gebruikt door mensen die werken aan een schoner
            ritme of die lichter willen voelen, bijvoorbeeld in combinatie
            met de Holistic Reset.
          </p>
          <p className="text-cm-white/70 text-sm leading-relaxed">
            Geen quick-fix, geen crash-aanpak. Veel mensen die hiermee
            starten merken dat hun kleding losser zit en dat ze met meer
            pit door de dag gaan, maar het lichaam reageert per persoon
            anders. {prospectVoornaam}, voor specifiek advies kun je
            samen met {memberNaam ?? "de member"} en de Mentor kijken wat
            past.
          </p>
          <MediaBlokken
            paginaNamespace="mini-eleva-producten"
            paginaId="overzicht"
            positie="metabolisme"
            blokken={blokken("metabolisme")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            PROGRAMMA'S
            ============================================================ */}
        <section className="card space-y-3">
          <h2 className="text-cm-gold text-base font-semibold flex items-center gap-2">
            🎯 Programma's, een afgebakende periode met focus
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Een programma is een aanpak van een paar weken waarin je gericht
            werkt aan iets specifieks. Combinatie van producten plus
            richtlijnen voor voeding en leefstijl, vaak met een groepsgevoel
            en een team-coach die meekijkt.
          </p>

          <div className="space-y-2 pt-2">
            <h3 className="text-cm-white font-semibold text-sm">
              🌱 Holistic Reset (drie weken)
            </h3>
            <p className="text-cm-white/70 text-sm leading-relaxed">
              Een drie-weken-aanpak voor een schoner ritme. Begeleidende
              producten, richtlijnen voor voeding, dagelijkse momenten van
              rust en beweging. Veel mensen die dit doen merken dat hun
              kleding losser zit en dat ze meer pit hebben, maar dat
              verschilt per persoon. Mooi vertrekpunt als je iets wil
              voelen verschuiven zonder crash-dieet.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-cm-white font-semibold text-sm">
              🌿 Darmen in Balans
            </h3>
            <p className="text-cm-white/70 text-sm leading-relaxed">
              Een aanpak van een paar weken gericht op spijsvertering en
              darmflora. Specifieke supplementen plus aandacht voor wat je
              eet. Mensen geven vaak aan dat hun buik rustiger voelt en
              dat er meer regelmaat in komt, opnieuw met de kanttekening
              dat het lichaam per persoon anders reageert.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-cm-white font-semibold text-sm">
              🌸 Hormonale Balans
            </h3>
            <p className="text-cm-white/70 text-sm leading-relaxed">
              Voor vrouwen in en rond de overgang, gericht op het
              ondersteunen van het natuurlijke hormoonritme. Combinatie
              van producten en levensstijl-aandacht. Niet medisch, wel
              een rustige aanpak die mensen helpt zich beter te voelen
              in een fase die niet altijd makkelijk is.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-cm-white font-semibold text-sm">
              🧘 Stress-vermindering
            </h3>
            <p className="text-cm-white/70 text-sm leading-relaxed">
              Een aanpak voor mensen die merken dat ze in een
              opgespannen stand staan en daar uit willen komen.
              Combinatie van producten, ademhalings- en rust-momenten,
              en aandacht voor je dagritme.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-cm-white font-semibold text-sm">
              💪 Sport-herstel
            </h3>
            <p className="text-cm-white/70 text-sm leading-relaxed">
              Voor wie sport en bewust met herstel bezig is. Eiwit,
              ondersteunende supplementen, en richtlijnen voor herstel
              na inspanning. Veel sporters gebruiken dit naast hun eigen
              trainingsritme.
            </p>
          </div>

          <MediaBlokken
            paginaNamespace="mini-eleva-producten"
            paginaId="overzicht"
            positie="programmas"
            blokken={blokken("programmas")}
            isFounder={isFounder}
          />
        </section>

        {/* ============================================================
            DOORVRAGEN
            ============================================================ */}
        <section className="card border-l-4 border-cm-gold/60 space-y-2">
          <h2 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
            🤔 Wil je dieper op iets ingaan?
          </h2>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            De ELEVA-mentor kent alle producten en programma's tot in detail
            en kan jouw specifieke vragen rustig beantwoorden. En als je
            twijfelt of iets past, haal dan {memberNaam ?? "de member"} erbij
            via de chat. Persoonlijk advies werkt altijd beter dan een
            algemeen overzicht.
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
