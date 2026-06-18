// File: lib/freebie-bots/mail-queue.ts
//
// Helper voor het aanmaken van mail-queue-rijen wanneer een lead de
// freebie-bot heeft afgerond. Vijf rijen (dag 1-5) worden ingepland
// vanaf het moment van voltooien. De cron-route pakt ze later op.
//
// Vereist dat de SQL-migratie 2026-05-25-01-freebie-mail-queue.sql
// is uitgevoerd. Tot dan faalt de insert stilletjes (try-catch).

import type { SupabaseClient } from "@supabase/supabase-js";

const TOKEN_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function genereerUnsubscribeToken(): string {
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  }
  return result;
}

/**
 * Plan 5 mails in voor deze opt-in. Dag 1 om 18:00 UTC vandaag (als
 * voltooiing voor 18:00 was) of morgen, daarna elke 24u erna.
 *
 * Faalt veilig: als de tabel/kolom nog niet bestaat (migratie niet
 * gedraaid), wordt de fout gelogd en de aanroep gaat verder. De opt-in
 * blijft veilig opgeslagen in freebie_opt_ins.
 */
export async function planMailSequence(
  supabase: SupabaseClient,
  args: {
    optInId: string;
    freebieSlug: string;
    memberId: string;
    leadNaam: string;
    leadEmail: string;
  },
): Promise<{ ok: boolean; aangemaakt: number; fout?: string }> {
  try {
    // Idempotent: bestaan er al queue-rijen voor deze opt-in, dan niet
    // opnieuw plannen. Zo kan de capture veilig vanuit meerdere momenten
    // (intekening + opt-in) of bij terug-en-vooruit-klikken aangeroepen
    // worden zonder dubbele mails. Faalt de telling (tabel ontbreekt), dan
    // gaan we gewoon door en laat de insert het netjes vallen.
    try {
      const { count } = await supabase
        .from("freebie_mail_queue")
        .select("id", { count: "exact", head: true })
        .eq("opt_in_id", args.optInId);
      if ((count ?? 0) > 0) {
        return { ok: true, aangemaakt: 0 };
      }
    } catch {
      // door naar insert
    }

    const nu = new Date();
    const verzendUur = 18; // UTC, ca. 19-20u Nederland
    const eersteDag = new Date(nu);
    eersteDag.setUTCHours(verzendUur, 0, 0, 0);
    if (eersteDag.getTime() <= nu.getTime()) {
      // Als het al na 18:00 UTC is, plan dag 1 morgen
      eersteDag.setUTCDate(eersteDag.getUTCDate() + 1);
    }

    const rijen = [1, 2, 3, 4, 5].map((dag) => {
      const datum = new Date(eersteDag);
      datum.setUTCDate(datum.getUTCDate() + (dag - 1));
      return {
        opt_in_id: args.optInId,
        freebie_slug: args.freebieSlug,
        lead_email: args.leadEmail,
        lead_naam: args.leadNaam,
        member_id: args.memberId,
        dag,
        gepland_op: datum.toISOString(),
        status: "wacht",
        unsubscribe_token: genereerUnsubscribeToken(),
      };
    });

    const { error } = await supabase
      .from("freebie_mail_queue")
      .insert(rijen);

    if (error) {
      // Tabel bestaat nog niet (migratie niet gedraaid), of andere fout.
      // Niet blokkerend, opt-in is veilig.
      console.warn("[mail-queue] Insert faalt (migratie nodig?):", error.message);
      return { ok: false, aangemaakt: 0, fout: error.message };
    }

    return { ok: true, aangemaakt: 5 };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    console.warn("[mail-queue] Exception:", msg);
    return { ok: false, aangemaakt: 0, fout: msg };
  }
}
