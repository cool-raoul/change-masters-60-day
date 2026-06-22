import { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

// Fases die nog vóór 'followup' liggen. Een lichte freebie-lead die "warm"
// wordt (telefoon achterlaat, om contact vraagt, of actief wordt in
// Mini-ELEVA) schuift hiervandaan naar 'followup'. Latere fases (member,
// shopper, not_yet) blijven onaangetast: voorwaarts-only.
const PRE_FOLLOWUP_FASES = [
  "prospect",
  "in_gesprek",
  "uitgenodigd",
  "one_pager",
  "presentatie",
];

/**
 * Verschuif een freebie-lead naar "Opvolgen" (followup) zodra die warm is
 * geworden, en maak één opvolg-herinnering aan als er nog geen open
 * herinnering voor deze prospect staat.
 *
 * - Voorwaarts-only: alleen vanuit een pre-followup-fase.
 * - Idempotent: de herinnering-guard voorkomt spam bij herhaalde triggers
 *   (bv. elke 5 vragen in Mini-ELEVA).
 * - Faalt stilletjes: mag nooit de hoofd-flow (opt-in, contact, notificatie)
 *   breken.
 */
export async function warmNaarOpvolgen(opts: {
  admin?: AdminClient;
  prospectId: string;
  memberId: string;
  /** Wordt de titel van de opvolg-herinnering. */
  reden: string;
  beschrijving?: string | null;
}): Promise<void> {
  const admin = opts.admin ?? createAdminClient();
  try {
    const { data: prospect } = await admin
      .from("prospects")
      .select("pipeline_fase")
      .eq("id", opts.prospectId)
      .maybeSingle();
    if (!prospect) return;

    const fase = (prospect as { pipeline_fase?: string | null }).pipeline_fase;
    if (fase && PRE_FOLLOWUP_FASES.includes(fase)) {
      await admin
        .from("prospects")
        .update({
          pipeline_fase: "followup",
          updated_at: new Date().toISOString(),
        })
        .eq("id", opts.prospectId);
    }

    // Eén open herinnering volstaat; voorkom dubbele bij herhaalde triggers.
    const { data: openHerinnering } = await admin
      .from("herinneringen")
      .select("id")
      .eq("user_id", opts.memberId)
      .eq("prospect_id", opts.prospectId)
      .eq("voltooid", false)
      .limit(1)
      .maybeSingle();
    if (openHerinnering) return;

    const morgen = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    await admin.from("herinneringen").insert({
      user_id: opts.memberId,
      prospect_id: opts.prospectId,
      titel: opts.reden,
      beschrijving: opts.beschrijving ?? null,
      vervaldatum: morgen,
      herinnering_type: "followup",
      voltooid: false,
    });
  } catch (e) {
    console.warn(
      "[warmNaarOpvolgen] faal stilletjes:",
      e instanceof Error ? e.message : e,
    );
  }
}
