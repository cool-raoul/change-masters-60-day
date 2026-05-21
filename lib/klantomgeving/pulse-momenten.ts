// File: lib/klantomgeving/pulse-momenten.ts
//
// Definitie van de vijf tijdlijn-pulsmomenten. Wordt door ELEVA gebruikt
// om automatisch pulses in te plannen na bestelling van een klant.
// Anti-overwhelm K4: ELEVA stuurt op het juiste moment één signaal naar
// de member, member krijgt nooit een lijst van vijftig.

import type { PulseNummer } from "./types";

export type PulseMomentDefinitie = {
  nummer: PulseNummer;
  /** Aantal dagen na bestel_datum dat dit moment geplanned wordt. */
  dagenNaBestelling: number;
  /** Korte naam voor in de UI. */
  naam: string;
  /** Voor de Mentor: wat moet 'ie doen op dit moment (in klantomgeving). */
  mentorActie: string;
  /** Voor de member: wat krijgt 'ie als seintje. */
  memberSeintje: string;
};

export const PULSE_MOMENTEN: PulseMomentDefinitie[] = [
  {
    nummer: 1,
    dagenNaBestelling: 0,
    naam: "Bestelling-pulse",
    mentorActie:
      "Stuur welkom-bericht in klantomgeving. Bevestig bestelling, eerste verwachting (levertijd), korte intro op het programma.",
    memberSeintje:
      "Marieke heeft besteld. Mentor heeft welkom gestuurd, jij kunt persoonlijk aanhaken.",
  },
  {
    nummer: 2,
    dagenNaBestelling: 5,
    naam: "Supplementen binnen",
    mentorActie:
      "Vraag open: 'Zijn je supplementen binnen? Heb je vragen over hoe je begint?'",
    memberSeintje:
      "Mentor heeft 'spullen binnen'-check gedaan. Stuur persoonlijk bericht ter aanvulling.",
  },
  {
    nummer: 3,
    dagenNaBestelling: 14,
    naam: "Eerste effecten",
    mentorActie:
      "Vraag naar eerste resultaten, peil enthousiasme. Bij ja-signaal: zachte vraag over webshop-mogelijkheid (3 keuzes-zin).",
    memberSeintje:
      "Marieke is enthousiast over haar eerste effecten. Goed moment voor webshop-uitnodiging.",
  },
  {
    nummer: 4,
    dagenNaBestelling: 28,
    naam: "Drie weken inzichten",
    mentorActie:
      "Vraag naar voortgang, referrals (kent ze iemand die hier ook baat bij heeft), introduceer social-media-stappenplan voor wie bouw-energie laat zien.",
    memberSeintje:
      "Marieke is aan drie weken productgebruik. Referral-moment + eventueel social-stappen-introductie.",
  },
  {
    nummer: 5,
    dagenNaBestelling: 56,
    naam: "Twee maanden, blijvende routine",
    mentorActie:
      "Overleg blijvende producten + abonnement-routine. Tweede 'wist je dat'-pulse over eigen webshop.",
    memberSeintje:
      "Marieke zit op twee maanden productgebruik. Routine-check + tweede webshop-uitnodig-moment.",
  },
];

/** Returnt pulse-definitie voor een nummer, of throws bij onbekend nummer. */
export function pulseMomentVoor(nummer: PulseNummer): PulseMomentDefinitie {
  const m = PULSE_MOMENTEN.find((p) => p.nummer === nummer);
  if (!m) throw new Error(`Onbekend pulse-moment-nummer: ${nummer}`);
  return m;
}
