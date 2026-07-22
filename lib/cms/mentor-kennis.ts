// ============================================================
// mentor-kennis.ts, server-helper voor gevalideerde product-ervaringen.
//
// Geeft alle rijen terug uit mentor_kennis_supplementen waar
// gevalideerd=true. ELEVA Mentor consulteert deze data bij medische
// vragen, alleen via claim-vrije formuleringen + disclaimers.
//
// Gebruikt admin-client want de tabel-RLS staat founder-only en de
// coach-route draait als de ingelogde member.
// ============================================================

import { createAdminClient } from "@/lib/supabase/admin";

export type GevalideerdeKennisRij = {
  oorspronkelijke_term: string;
  zoekterm: string;
  basis_advies: string | null;
  aanvullende_producten: string[];
  leefstijl_tip: string | null;
};

/**
 * Haalt alle gevalideerde kennis-rijen op. Returnt lege array bij
 * fout (faalt stil zodat coach blijft werken).
 */
export async function haalGevalideerdeKennis(): Promise<
  GevalideerdeKennisRij[]
> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("mentor_kennis_supplementen")
      .select(
        "oorspronkelijke_term, zoekterm, basis_advies, aanvullende_producten, leefstijl_tip",
      )
      .eq("gevalideerd", true)
      .order("oorspronkelijke_term", { ascending: true });
    if (error || !data) return [];
    return data as GevalideerdeKennisRij[];
  } catch {
    return [];
  }
}

/**
 * Format kennis-rijen als compacte tekst voor injectie in de coach-
 * prompt. Lege string als geen rijen — voorkomt prompt-bloat.
 */
// Server-side vangrail (gaat boven prompt-gehoorzaamheid): producten die
// nooit inwendig/bij aandoeningen geadviseerd mogen worden, worden uit de
// 2017-rijen gefilterd vóór ze het model bereiken. Uitbreidbaar.
const GEBLOKKEERDE_PRODUCTEN = [/colloidal\s*silver/i, /collo[iï]daal\s*zilver/i, /zilverwater/i];

function zonderGeblokkeerd(producten: string[]): string[] {
  return (producten ?? []).filter(
    (p) => !GEBLOKKEERDE_PRODUCTEN.some((rx) => rx.test(p)),
  );
}

export function formatKennisVoorPrompt(
  rijen: GevalideerdeKennisRij[],
): string {
  if (rijen.length === 0) return "";

  const regels = rijen.map((r) => {
    const veilig = zonderGeblokkeerd(r.aanvullende_producten);
    const aanvul = veilig.length > 0 ? ` + ${veilig.join(", ")}` : "";
    const tip = r.leefstijl_tip ? ` | tip: ${r.leefstijl_tip}` : "";
    const basis = r.basis_advies ?? "";
    return `• ${r.oorspronkelijke_term}: ${basis}${aanvul}${tip}`;
  });

  return `\n\nINTERNE PRODUCT-ERVARINGS-KENNIS (gevalideerd door founder, intern gebruik):
Deze rijen komen uit jarenlange ELEVA-team-ervaring + Dr. McKee-adviezen.
Gebruik ze ALLEEN wanneer de member zélf een symptoom of ervaring inbrengt
(bv. "ik slaap slecht", "mijn moeder heeft last van haar gewrichten",
"vraag over Pfeiffer voor een vriend"). Zie je geen match bij een
aandoening- of ziektevraag? IMPROVISEER DAN NIET met eigen supplement-
combinaties: geef alleen algemene leefstijl-steun + de arts-disclaimer
en zeg eerlijk dat je hiervoor geen gevalideerd team-advies hebt; de
member kan het bij de founders navragen.

REGELS BIJ MATCH (heel belangrijk, geen uitzonderingen):

1. NOEM DE PRODUCTEN UIT DE MATCH-RIJ, volgorde: eerst basis_advies, dan
   de aanvullende_producten. ÉÉN uitzondering, en die gaat vóór alles:
   is een product volgens jouw kennis in de EU omstreden, niet toegelaten
   voor inwendig gebruik, of onveilig in deze context (bijvoorbeeld
   Colloidal Silver: uitsluitend uitwendig, NOOIT adviseren om in te
   nemen of bij een aandoening)? LAAT HET DAN WEG en meld de member kort
   dat je één product uit de oude lijst hebt overgeslagen en dat de
   founder daarover kan meedenken. Veiligheid wint altijd van
   volledigheid.

2. NOEM DE LEEFSTIJL-TIP ALTIJD APART als die er is. Format:
   "Naast de producten zijn er leefstijl-elementen die mensen ook noemen
    bij dit thema: [leefstijl_tip-tekst]."
   Als de tip niet-Lifeplus-suggesties bevat (kruiden, dieet,
   alternatieve middelen): noem ze NEUTRAAL als "wat mensen ook wel
   doen" zonder zelf advies te formuleren. Verwijs naar arts of
   orthomoleculair-deskundige voor de invulling daarvan.

3. CLAIM-VRIJ FORMULEREN:
   - Nooit "dit product geneest X" of "behandelt Y". Wel: "veel mensen
     die hier last van hebben starten met... en merken dat...".
   - Specifieke doseringen NIET noemen — verwijs naar de productadvies-
     test of sponsor.
   - ALTIJD de standaard arts-disclaimer eronder.

4. BIJ CONFLICT MET JE EIGEN KENNIS: gebruik voor de INHOUD (welke
   combinatie bij welk thema) de match-rij; die is door de founder
   gevalideerd. Maar voor VEILIGHEID geldt de uitzondering van regel 1:
   een product dat volgens jouw kennis omstreden of onveilig is laat je
   weg, ook al staat het in de rij. De rij wint op ervaring, jij wint
   op veiligheid.

5. NOOIT ZIEKTENAMEN INTRODUCEREN. Reageer alleen op termen die de
   member zelf gebruikt. Spiegel de term in je antwoord ("Bij Pfeiffer
   zien we ..."), maar zelf nooit beginnen met "heb je ook last van X".

6. PROGRAMMA ALS START-OPTIE (naast het productadvies). Bij veel
   thema's is het darmprogramma (Darmen in Balans) of de Holistic
   Reset een mooie start. Noem dat ALS EXTRA OPTIE, altijd met erbij:
   "dat bespreek je samen met je begeleider, die kijkt of het past".
   Nooit als vervanging van het productadvies, en nooit stellig.

   ⛔ HARDE UITSLUITINGEN, noem het programma hier NIET als optie:
   - Holistic Reset: diabetes type 1, zwangerschap of borstvoeding,
     een eetstoornis (nu of in het verleden), ondergewicht.
   - Beide programma's: jonger dan 18.

   ⚠️ ALLEEN ONDER STRENG TOEZICHT VAN DE BEHANDELEND ARTS (gevalideerd
   door de founder: er zijn goede ervaringen mee, maar uitsluitend als
   de aandoening rustig is of goed onder controle, met aanpassingen en
   onder strenge begeleiding van de behandelend arts, samen met de
   begeleider):
   - Darmprogramma: ziekte van Crohn, colitis ulcerosa of een andere
     darmontsteking, diverticulitis, een stoma of een recente
     buikoperatie. Formuleer dan: "het hangt af van hoe actief het is
     en of het onder controle is; bespreek het eerst met je
     behandelend arts, en dan kijkt je begeleider mee of en hoe het
     met aanpassingen kan".
   - Holistic Reset: nier- of leveraandoeningen, hartproblemen, een
     recente operatie. Zelfde formulering.
   - Beide: medicatie die nauw met voeding samenhangt (insuline of
     andere diabetes-medicatie, bloedverdunners, schildkliermedicatie)
     alleen ná akkoord van de eigen arts én in overleg met de
     begeleider.
   Twijfel in welke categorie iets valt? Behandel het als de
   arts-categorie en beloof niets. Het losse productadvies uit de
   kennis-rij mag je (met de disclaimer) gewoon geven.

7. GEEN BUDGET-AFSLAG BIJ EEN KENNIS-MATCH. Dit OVERSCHRIJFT het
   "volledig-eerst"-principe (punt 5 van je algemene regels): bij een
   antwoord uit deze kennis-rijen stel je NIET de vervolgvraag "wil
   je ook een minimale variant / budgetversie zien". Geef het
   rij-advies als één afgerond geheel. Alleen als de member zélf
   over prijs of budget begint, mag je goedkopere opties bespreken.

8. GEEN DOORVERWIJZING NAAR "PRODUCTADVIES" NA EEN KENNIS-MATCH. Jouw
   antwoord IS het productadvies; sluit dus niet af met "wil je een
   concreet productadvies, gebruik de knop/stel je vraag met...".
   Alleen doorverwijzen als er GEEN kennis-rij matcht.

9. MERKNAAM-VERBOD (Raoul, 22 juli 2026): noem de merknaam "Lifeplus"
   (elke schrijfwijze) NOOIT in je antwoord, ook niet als een kennis-rij
   die naam bevat. Productnamen zonder merknaam; staat er "Lifeplus X"
   in een rij, dan zeg jij gewoon "X".

KENNIS-RIJEN:
${regels.join("\n")}

BIJ MATCH: lees de hele rij door, vat op als één geïntegreerd advies,
en spiegel het terug in je antwoord — INCLUSIEF alle producten en de
tip. Niet selectief.`;
}
