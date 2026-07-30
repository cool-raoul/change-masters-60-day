// ============================================================
// Kijkmomenten voor de evergreen masterclass.
//
// Eerlijke opzet (afspraak Raoul): het is een OPGENOMEN masterclass.
// We doen niet alsof er live iemand zit en we tonen geen nep-teller.
// Wat we wél doen is een moment laten kiezen, want een gekozen moment
// wordt veel vaker echt gekeken dan een losse link "voor later".
//
// Aanbod: de eerstvolgende dagen, twee vaste momenten per dag, plus
// "nu meteen" bovenaan. Alles in Nederlandse tijd.
// ============================================================

export type Slot = {
  /** ISO-string van het startmoment (UTC onder water). */
  start: string;
  /** "Vandaag 20:00", "Morgen 12:00", "donderdag 20:00" */
  label: string;
  /** True voor het "nu meteen"-blok. */
  isDirect: boolean;
};

const MOMENTEN = [12, 20]; // uur, Nederlandse tijd
const DAGEN_VOORUIT = 4;
/** Minder dan dit aantal minuten weg? Dan bieden we het slot niet aan. */
const MINIMALE_VOORSPRONG_MIN = 45;

function nlDatumDelen(d: Date) {
  const fmt = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [datum, tijd] = fmt.format(d).split(" ");
  return { datum, tijd };
}

/**
 * Bouwt een Date voor "datum (YYYY-MM-DD) om uur:00 Nederlandse tijd".
 * We zoeken de UTC-tijd waarvan de NL-weergave klopt; zo hoeven we
 * zomertijd niet zelf te rekenen.
 */
function nlMoment(datum: string, uur: number): Date {
  // Start met een schatting (UTC) en corrigeer op basis van de
  // werkelijke NL-weergave. Twee rondes is altijd genoeg.
  let kandidaat = new Date(`${datum}T${String(uur).padStart(2, "0")}:00:00Z`);
  for (let i = 0; i < 2; i++) {
    const { datum: d, tijd } = nlDatumDelen(kandidaat);
    const [hh, mm] = tijd.split(":").map(Number);
    const verschilUren = uur - hh;
    const verschilDagen =
      (Date.parse(`${datum}T00:00:00Z`) - Date.parse(`${d}T00:00:00Z`)) /
      86_400_000;
    const correctieMs =
      verschilDagen * 86_400_000 + verschilUren * 3_600_000 - mm * 60_000;
    if (correctieMs === 0) break;
    kandidaat = new Date(kandidaat.getTime() + correctieMs);
  }
  return kandidaat;
}

function dagLabel(slot: Date, nu: Date): string {
  const vandaag = nlDatumDelen(nu).datum;
  const morgen = nlDatumDelen(new Date(nu.getTime() + 86_400_000)).datum;
  const { datum, tijd } = nlDatumDelen(slot);
  if (datum === vandaag) return `Vandaag ${tijd}`;
  if (datum === morgen) return `Morgen ${tijd}`;
  const dag = new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    weekday: "long",
  }).format(slot);
  return `${dag.charAt(0).toUpperCase()}${dag.slice(1)} ${tijd}`;
}

/** De keuzelijst voor de inschrijfpagina. */
export function bouwSlots(nu: Date = new Date()): Slot[] {
  const slots: Slot[] = [
    {
      start: new Date(nu.getTime() + 3 * 60_000).toISOString(),
      label: "Nu meteen kijken",
      isDirect: true,
    },
  ];
  for (let d = 0; d <= DAGEN_VOORUIT; d++) {
    const dagDatum = nlDatumDelen(new Date(nu.getTime() + d * 86_400_000)).datum;
    for (const uur of MOMENTEN) {
      const start = nlMoment(dagDatum, uur);
      const minutenWeg = (start.getTime() - nu.getTime()) / 60_000;
      if (minutenWeg < MINIMALE_VOORSPRONG_MIN) continue;
      slots.push({
        start: start.toISOString(),
        label: dagLabel(start, nu),
        isDirect: false,
      });
    }
  }
  return slots.slice(0, 9);
}

/** Menselijke weergave van een gekozen moment, voor mails en pagina's. */
export function slotTekst(startIso: string): string {
  const d = new Date(startIso);
  const datum = new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  const tijd = new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${datum} om ${tijd}`;
}

/** Mag de kijkpagina de video tonen? Vanaf het gekozen moment. */
export function slotIsBegonnen(startIso: string, nu: Date = new Date()): boolean {
  return nu.getTime() >= Date.parse(startIso) - 60_000;
}
