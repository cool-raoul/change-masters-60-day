import { ITEM_SLUGS } from "./sleutels";
import type { VoltooiingStatus } from "./voltooiingen";
import type { Dag } from "@/lib/playbook/types";

// ============================================================
// Dag 0 · Jouw voorbereiding — de onboarding- en setup-stappen
// als VOLWAARDIGE dag in de dag-flow (feedback Raoul 28 juli:
// zelfde opbouw als elke andere dag: les + taken + afvinken,
// bereikbaar via /vandaag?dag=0 en de dag-springer).
//
// Herzien 29 juli na Raouls test. Drie principes:
//  1. STARTEN GAAT VOOR. Alleen de vier stappen die je écht nodig
//     hebt om te beginnen zijn verplicht (samen ~10 minuten). De
//     administratie (webshop, krediet, teams-admin, bestellinks)
//     staat eronder als "mag ook later deze week" en blokkeert
//     niets. Wie 'm overslaat, krijgt de rustige setup-pop-up op
//     /vandaag (1× per dag, met "Later vandaag") tot het staat.
//  2. GEEN DUBBELE HOPS. Elke knop gaat naar de plek waar je het
//     werk ECHT doet. Waar een instructiefilm bestaat, speelt die
//     in de stap zelf (filmSlug), zodat je niet eerst naar een
//     uitleg-pagina hoeft die je dan doorstuurt.
//  3. EEN STAP DIE NERGENS HEEN GAAT, BESTAAT NIET. De oude
//     productadvies-taak wees naar /setup/productadvies-test-gedaan,
//     wat een 404 gaf (dat item is 19 mei uit de admin-rail gehaald).
//     Die taak is verwijderd.
//
// De vink-status synct met de bestaande onboarding-administratie
// (onboarding_voltooiingen); afvinken gaat daarna gewoon via
// dag_voltooiingen met dag_nummer 0, zoals elke dag. Andersom zorgt
// TAAK_NAAR_CROSS_MODUS_SLUG ervoor dat afvinken HIER ook de
// admin-rail bijwerkt, zodat de pop-up stopt zodra het gedaan is.
// Inhoud en volgorde: hier in één bestand aan te passen.
// ============================================================

/** Welke onboarding-slugs dekken welke dag 0-taak (voor auto-sync). */
export const DAG0_TAAK_SLUGS: Record<
  string,
  { slugs: string[]; eenVanDe?: boolean }
> = {
  "dag0-app": {
    slugs: [ITEM_SLUGS.appGeinstalleerd, ITEM_SLUGS.pushAan],
    eenVanDe: true,
  },
  "dag0-why": { slugs: [ITEM_SLUGS.why] },
  "dag0-namen": { slugs: [ITEM_SLUGS.eersteVijfNamen] },
  "dag0-tempo": {
    slugs: [ITEM_SLUGS.modusKeuzeTempo, ITEM_SLUGS.modusKeuzeDtt],
    eenVanDe: true,
  },
  "dag0-webshop": { slugs: [ITEM_SLUGS.webshopAangemaakt] },
  "dag0-krediet": { slugs: [ITEM_SLUGS.kredietformulierIngevuld] },
  "dag0-teams-admin": { slugs: [ITEM_SLUGS.teamsAdminIngericht] },
  "dag0-bestellinks": { slugs: [ITEM_SLUGS.bestellinksGekoppeld] },
};

/** Is een dag 0-taak al gedaan volgens de (cross-modus) onboarding-administratie? */
export function dag0TaakKlaarVolgensOnboarding(
  taakId: string,
  voltooiingen: Map<string, VoltooiingStatus>,
): boolean {
  const def = DAG0_TAAK_SLUGS[taakId];
  if (!def) return false;
  const check = (slug: string) => voltooiingen.get(slug)?.voltooid === true;
  return def.eenVanDe ? def.slugs.some(check) : def.slugs.every(check);
}

/** Dag 0 als volwaardige dag voor de vandaag-flow. */
export const DAG_NUL: Dag = {
  nummer: 0,
  titel: "Jouw voorbereiding: alles klaarzetten om te starten",
  fase: 1,
  vandaagDoen: [
    // ── Vier stappen die je nodig hebt om te kunnen starten ──
    {
      id: "dag0-app",
      label: "Zet ELEVA op je beginscherm en je meldingen aan",
      uitleg:
        "De kleinste stap van vandaag, en toch zetten we 'm bewust vooraan. Zolang ELEVA alleen in je browser leeft, moet je er elke keer zelf aan denken. Staat 'ie tussen je apps, dan open je 'm net zo makkelijk als je WhatsApp.\n\nEn je meldingen: die zetten we aan zodat je geen belangrijke berichten mist van het ELEVA-systeem of je sponsor. Geen gepiep de hele dag. Het gaat om de momenten dat er echt iets voor je klaarstaat, of dat iemand met je meekijkt.\n\nWil je het later anders? Dat past je zelf aan in je instellingen 🥰",
      verplicht: true,
      actieRoute: "/onboarding?stap=1",
      actieRouteLabel: "Zet mijn meldingen aan →",
    },
    {
      id: "dag0-why",
      label: "Leg jouw WHY vast",
      uitleg:
        "Je WHY is je reden. Niet het doel dat mooi klinkt als je het opschrijft, maar waar jij dit écht voor doet.\n\nVoor de één is dat meer tijd met de kinderen. Voor de ander financiële ademruimte, of eindelijk die reis die al jaren in je hoofd zit. En voor weer een ander is het nog niet eens scherp, gewoon dat gevoel van binnen: er zit meer in mij.\n\nWeet je het nog niet precies? Dat hoeft ook niet, daar is dit juist voor. Je gaat een kort gesprek aan met de Mentor, en die stelt je een paar vragen tot het boven tafel komt. Je hoeft niets voor te bereiden.\n\nWaarom dit vooraan staat? Omdat er dagen komen dat het even taai is. Op die dagen is je WHY wat je overeind houdt. En ELEVA gebruikt 'm daarna overal: bij je doel, bij wat je deelt, en op de momenten dat je even kwijt bent waarvoor je het ook alweer deed.\n\nWat je hier opschrijft blijft van jou. Je sponsor ziet dát je 'm gedaan hebt, lezen kan hij 'm niet 🥰",
      verplicht: true,
      actieRoute: "/mijn-why",
      actieRouteLabel: "Schrijf mijn WHY →",
    },
    {
      id: "dag0-namen",
      label: "Zet je eerste 5 namen op de lijst",
      uitleg:
        "Vijf mensen. Meer hoeft nu echt niet.\n\nEn let even op wat er nu NIET gebeurt: je gaat ze niets sturen. Je zet alleen op een rijtje wie er in je hoofd zit. Een naam opschrijven verplicht je tot niets, dus je kunt hier rustig in zijn.\n\nWie zet je erop? Mensen die je dit gunt. Iemand die je een tijd niet sprak, iemand die laatst iets liet vallen over hoe ze zich voelt, iemand die altijd nieuwsgierig is naar wat jij doet.\n\nEén tip die je later veel scheelt: schrijf niet alleen de mensen op van wie je denkt dat ze ja zeggen. Daar zit je meestal naast. De verrassingen komen bijna altijd uit een andere hoek.\n\nJe kunt ze hier direct invullen, zonder deze pagina te verlaten. De rest van je lijst groeit vanzelf in je eerste dagen 🥰",
      verplicht: true,
      inlineEmbed: "namen-form",
      inlineEmbedDoel: 5,
    },
    {
      id: "dag0-tempo",
      label: "Kies je tempo",
      uitleg:
        "Hier vertel je hoeveel tijd je hier per week voor hebt, wat je eruit wilt halen en binnen welke termijn. Dat heet je Doel-Tijd-Termijn.\n\nWaarom dat uitmaakt: ELEVA rekent daar je dagelijkse aantallen mee uit. Bij een paar uur per week krijg je een rustig ritme. Vul je meer uren in, dan komen er meer gesprekken per dag op je scherm te staan. Zo krijg jij een dag die bij jouw leven past, en niet bij dat van iemand anders.\n\nWees hier eerlijk in, dat werkt beter dan stoer doen. Zet je meer uren neer dan je echt hebt, dan sta je elke dag naar een lijst te kijken die niet lukt. En dat is precies hoe mensen afhaken.\n\nAanpassen kan altijd. Verandert er iets in je leven, dan zet je het bij in je instellingen en schuiven je aantallen gewoon mee 🥰",
      verplicht: true,
      actieRoute: "/onboarding?stap=4",
      actieRouteLabel: "Kies mijn tempo →",
    },

    // ── Administratie: mag ook later deze week, blokkeert niets ──
    {
      id: "dag0-webshop",
      label: "Maak je eigen webshop aan (mag ook later deze week)",
      uitleg:
        "Dit hoeft vandaag niet, en het houdt je nergens van tegen.\n\nJe webshop is de plek waar klanten straks bestellen. Je maakt 'm eenmalig aan op de website van het bedrijf, daarna staat 'ie en werkt het vanzelf. Je hebt er inloggegevens voor nodig, die kreeg je bij je aanmelding. Kun je ze niet vinden? Vraag ze even aan je sponsor, die helpt je zo verder.\n\nStaat er hieronder een film, dan loopt die de stappen met je door. Klaar? Vink 'm hier af, dan stopt de herinnering vanzelf.",
      verplicht: false,
      filmSlug: "onboarding-stap-6-webshop",
    },
    {
      id: "dag0-krediet",
      label: "Vul het kredietformulier in (mag ook later deze week)",
      uitleg:
        "Dit hoeft vandaag niet, maar van de vier administratieve stappen is dit wél degene die op tijd moet staan.\n\nWaarom? Zonder dit formulier kan er geen commissie naar je toe. Je kunt dus gewoon beginnen, mensen aanspreken en klanten helpen, alleen uitbetalen lukt pas als dit geregeld is. Zonde als dát de reden is dat je moet wachten.\n\nHet is één formulier op de website van het bedrijf, je bent er zo doorheen. Staat er hieronder een film, dan loopt die 'm met je door. Klaar? Vink 'm hier af.",
      verplicht: false,
      filmSlug: "onboarding-stap-8-kredietformulier",
    },
    {
      id: "dag0-teams-admin",
      label: "Richt je administratiesysteem in (mag ook later deze week)",
      uitleg:
        "Dit hoeft vandaag niet.\n\nDit is het systeem van het bedrijf waar je straks ziet wie er in je team zitten, wat er besteld wordt en hoe je ervoor staat. Even het verschil, want dat verwart in het begin: ELEVA is je dagelijkse werkplek, dít is je administratie. Twee verschillende plekken, allebei nodig.\n\nJe hebt 'm pas echt nodig zodra er mensen bij je aansluiten. Richt 'm dus in op een rustig moment, er is geen haast bij. Staat er hieronder een film, dan laat die de stappen zien.",
      verplicht: false,
      filmSlug: "core-dag3-teams-admin",
    },
    {
      id: "dag0-bestellinks",
      label: "Koppel je bestellinks aan ELEVA (mag ook later deze week)",
      uitleg:
        "Dit hoeft vandaag niet.\n\nEen bestellink is de link naar jouw webshop met een pakket er al in. Plak je die hier in ELEVA, dan gebruikt het systeem ze vanzelf: in je productadviezen, bij je freebies, overal waar iemand kan bestellen. Zo landen bestellingen bij jou, en niet ergens anders.\n\nJe hebt hier wel eerst je eigen webshop voor nodig, dus doe deze na die stap. Opslaan vinkt 'm meteen voor je af 🥰",
      verplicht: false,
      actieRoute: "/instellingen/bestellinks",
      actieRouteLabel: "Plak mijn bestellinks →",
    },
  ],
  faseDoel:
    "Je kunt starten: je fundament staat, je eerste vijf namen staan, en je weet wat er deze week nog geregeld moet worden.",
  waarInEleva: [
    {
      actie: "Start-stappen opnieuw doorlopen",
      menupad: "Deze pagina → open een stap",
      route: "/onboarding",
    },
    {
      actie: "Administratieve stappen met uitleg-films",
      menupad: "Instellingen → Administratieve stappen",
      route: "/setup",
    },
    {
      actie: "Je bestellinks per pakket",
      menupad: "Instellingen → Bestellinks",
      route: "/instellingen/bestellinks",
    },
  ],
  watJeLeert: `Wat fijn dat je er bent 🥰

Dit is je voorbereiding. Hier bouw je nog niets aan je business, hier zet je klaar wat je nodig hebt. Zie het als je spullen neerleggen voordat je begint.

WAT NU NODIG IS, SAMEN ZO'N TIEN MINUTEN
Je meldingen aan, je WHY, je eerste vijf namen en je tempo. Meer niet. Daarmee kun je gewoon beginnen, en weet ELEVA hoe het met jou mee moet lopen.

Merk je dat die vier stappen kort zijn? Dat is met opzet. Je moet vandaag kunnen starten, niet vandaag alles af hebben.

DE ADMINISTRATIE MAG OOK LATER DEZE WEEK
Je webshop, het kredietformulier, je administratiesysteem en je bestellinks. Die staan hieronder, maar ze houden je nergens van tegen.

Dat is een bewuste keuze. Wie eerst uren met formulieren bezig moet voordat hij mag starten, is zijn energie kwijt aan het verkeerde. En energie is precies wat je in je eerste week nodig hebt. Regel ze dus op een rustig moment in je eerste dagen. ELEVA herinnert je er één keer per dag aan tot ze staan, en die herinnering klik je altijd weg met "Nu even niet".

Eén uitzondering: het kredietformulier. Dat is de enige die op tijd moet staan, want zonder dat formulier kan er geen commissie naar je toe. Verder bepaal jij het moment.

EVEN OVER JE PRIVACY
Je vult hier persoonlijke dingen in, dus je hoort te weten wie wat ziet. Je sponsor krijgt een seintje zodra je een stap afrondt, zodat hij weet wanneer je hulp kunt gebruiken. Wát je opschrijft blijft van jou: je WHY, je namen en je notities kan hij niet lezen.

Alles wat je hier afvinkt blijft geregeld, dat hoef je dus nooit opnieuw te doen. En je kunt hier altijd terugkomen, deze pagina blijft gewoon staan, ook als je al onderweg bent.

Klaar? Dan zien we je zo bij dag 1 💪🏽`,
  waaromWerktDit: {
    tekst:
      "Een goede voorbereiding wint niet omdat 'ie perfect is, maar omdat je 'm maar één keer hoeft te doen. En omdat je er niet in blijft hangen.",
    bron: "eigen",
  },
};
