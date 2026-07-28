import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// Team-seintjes: elk pushbericht over een teamlid ook opslaan,
// zodat de ontvanger het volledige bericht kan teruglezen op
// /team (pushes worden op de telefoon afgekapt en zijn daarna
// weg). Best-effort: mag nooit een flow laten falen.
// ============================================================

export async function logTeamSeintje(
  ontvangerId: string,
  lidId: string | null,
  titel: string,
  detail: string | null,
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("team_seintjes").insert({
      ontvanger_id: ontvangerId,
      lid_id: lidId,
      titel,
      detail,
    });
  } catch (e) {
    console.warn("team-seintje loggen mislukt (niet fataal):", e);
  }
}
