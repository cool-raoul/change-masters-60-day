// File: lib/freebies/types.ts
//
// Type-definities voor de freebies-toolkit en opt-in-leads.

export type FreebieVorm = "pdf" | "mailreeks" | "film" | "test" | "gids";

export type Freebie = {
  id: string;
  slug: string;
  titel: string;
  ondertitel?: string;
  vorm: FreebieVorm;
  onderwerp: string;
  beschrijving: string;
  inhoudTemplate?: string;
  duurMinuten?: number;
  actief: boolean;
};

export type FreebieOptInStatus = "nieuw" | "mini-eleva" | "klant" | "gesloten";

export type FreebieOptIn = {
  id: string;
  freebieId: string;
  memberId: string;
  leadNaam?: string;
  leadEmail: string;
  bronKanaal?: string;
  status: FreebieOptInStatus;
  createdAt: string;
  laatsteActiviteit: string;
};
