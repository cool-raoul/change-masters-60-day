// File: lib/klantomgeving/types.ts
//
// Type-definities voor klantomgeving (klanten + pulse-momenten).

export type KlantBron = "automatisch" | "handmatig" | "uitnodig-mail" | "freebie-opt-in";

export type KlantStatus = "actief" | "stil" | "klant" | "webshophouder" | "gesloten";

export type Klant = {
  id: string;
  memberId: string;
  klantNaam: string;
  klantEmail: string;
  bestelDatum?: string;
  startDatum?: string;
  bron: KlantBron;
  freebieOptInId?: string;
  status: KlantStatus;
  laatsteActiviteit: string;
  createdAt: string;
};

export type PulseNummer = 1 | 2 | 3 | 4 | 5;

export type KlantPulse = {
  id: string;
  klantId: string;
  pulseNummer: PulseNummer;
  geplandOp: string;
  uitgevoerdOp?: string;
  memberSeintjeGestuurdOp?: string;
  memberActieOp?: string;
  inhoudSamenvatting?: string;
  createdAt: string;
};
