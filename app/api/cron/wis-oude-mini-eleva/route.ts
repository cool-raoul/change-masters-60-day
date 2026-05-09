import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// Vercel cron, dagelijkse opruim-route voor mini-ELEVA-data.
//
// AVG-recht-op-vergeten: prospect heeft geen Supabase-account, dus
// hun data leeft in onze tabellen totdat wij 'm wissen. We verwijderen
// alle invitations + bijbehorende chats + activiteit-logs van
// uitnodigingen die langer dan 30 dagen geleden zijn verlopen.
//
// Beveiliging: alleen Vercel-cron of een verzoek met de juiste
// CRON_SECRET kan deze route aanroepen. ON CASCADE in de SQL zorgt dat
// een delete op prospect_invitations automatisch de chats en
// activiteit ook opruimt.
//
// Schedule: dagelijks om 03:00 NL-tijd, geconfigureerd in vercel.json
// ============================================================

export const dynamic = "force-dynamic";

const BEWAAR_DAGEN = 30;

export async function GET(req: NextRequest) {
  // Vercel cron stuurt een Authorization-header met CRON_SECRET
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    // Drempel: invitations die >30 dagen geleden zijn verlopen
    const drempel = new Date();
    drempel.setDate(drempel.getDate() - BEWAAR_DAGEN);
    const drempelISO = drempel.toISOString();

    // Eerst tellen voor de log
    const { count: aantalTeWissen } = await admin
      .from("prospect_invitations")
      .select("id", { count: "exact", head: true })
      .lt("expires_at", drempelISO);

    // Dan wissen. ON CASCADE in SQL zorgt dat mini_eleva_chats en
    // mini_eleva_activiteit automatisch mee gaan.
    const { error } = await admin
      .from("prospect_invitations")
      .delete()
      .lt("expires_at", drempelISO);

    if (error) {
      console.error("[CRON] mini-eleva opruim mislukt:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    console.log(
      `[CRON] mini-eleva opruim ok, ${aantalTeWissen ?? 0} verlopen invitations + cascade gewist`,
    );

    return NextResponse.json({
      ok: true,
      gewist: aantalTeWissen ?? 0,
      drempel: drempelISO,
      bewaarDagen: BEWAAR_DAGEN,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    console.error("[CRON] mini-eleva opruim exception:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
