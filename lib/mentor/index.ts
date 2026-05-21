// File: lib/mentor/index.ts
//
// Publieke API voor de drie-laags Mentor-architectuur. Volgorde:
// Laag 1 (standaardvragen) -> Laag 2 (AI met model-tier) -> Laag 3 (escalatie).
// Caller (bv. /api/coach route) gebruikt vraagAanMentor() en krijgt
// terug welke laag heeft geantwoord + de payload.

import { vindStandaardvraag } from "./laag-1-standaardvragen";
import { analyseerSignalen, kiesModelTier, modelIdVoorTier } from "./laag-2-router";
import { escalereeNaarSponsor, type ChatContextBericht } from "./laag-3-escalatie";

export type MentorAntwoord =
  | { laag: 1; antwoord: string; categorie: string; standaardvraagId: string }
  | { laag: 2; modelId: string; signalen: ReturnType<typeof analyseerSignalen> }
  | { laag: 3; escalatieId: string; trigger: "claim-gevoelig" | "emotioneel" };

export type VraagInput = {
  memberId: string;
  modus: "sprint" | "core" | "pro";
  vraag: string;
  chatHistorie: ChatContextBericht[];
};

/**
 * Routeer een binnenkomende vraag door de drie lagen. Returnt het laag-nummer
 * en de bijbehorende payload. Caller is verantwoordelijk voor de daadwerkelijke
 * AI-call (Laag 2) of het renderen van de melding aan member (Laag 1 en 3).
 */
export async function vraagAanMentor(input: VraagInput): Promise<MentorAntwoord> {
  // Laag 1: standaardvragen.
  const standaard = await vindStandaardvraag(input.vraag, input.modus);
  if (standaard) {
    return {
      laag: 1,
      antwoord: standaard.antwoord,
      categorie: standaard.categorie,
      standaardvraagId: standaard.id,
    };
  }

  // Signalen analyseren voor Laag 2 / 3-beslissing.
  const signalen = analyseerSignalen(input.vraag);

  // Laag 3: escalatie bij claim-gevoelig of emotioneel signaal.
  if (signalen.claimGevoelig || signalen.emotioneel) {
    const trigger = signalen.claimGevoelig ? "claim-gevoelig" : "emotioneel";
    const result = await escalereeNaarSponsor({
      memberId: input.memberId,
      trigger,
      chatContext: input.chatHistorie,
    });
    if (result.ok && result.escalatieId) {
      return { laag: 3, escalatieId: result.escalatieId, trigger };
    }
    // Bij fout: zak door naar Laag 2 zodat member niet zonder antwoord blijft.
  }

  // Laag 2: AI met model-tier.
  const tier = kiesModelTier(signalen);
  return { laag: 2, modelId: modelIdVoorTier(tier), signalen };
}

// Re-exports voor losse gebruik.
export { vindStandaardvraag } from "./laag-1-standaardvragen";
export { analyseerSignalen, kiesModelTier, modelIdVoorTier } from "./laag-2-router";
export { escalereeNaarSponsor, aantalOpenEscalatiesVoorSponsor } from "./laag-3-escalatie";
export type { ChatContextBericht, EscalatieTrigger } from "./laag-3-escalatie";
export type { ModelTier, ComplexiteitSignalen } from "./laag-2-router";
export type { StandaardvraagMatch } from "./laag-1-standaardvragen";
