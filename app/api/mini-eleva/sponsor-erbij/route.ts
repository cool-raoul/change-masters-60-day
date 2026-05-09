import { NextRequest, NextResponse } from "next/server";
import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifeerVoorUitnodiging } from "@/lib/mini-eleva/notificaties";

// ============================================================
// POST /api/mini-eleva/sponsor-erbij
//
// Prospect drukt op "haal sponsor erbij"-knop. We loggen het als
// activiteit zodat de member ziet dat de prospect om hulp vraagt.
// In een latere fase sturen we hier ook een push-notificatie of
// email naar member en sponsor.
//
// Body: { token: string, vraag?: string }
//
// Voor nu: alleen activiteit-log + chat-bericht in mini_eleva_chats
// als systeem-bericht zodat het in de geschiedenis staat.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = (body.token as string | undefined) ?? "";
    const vraag = (body.vraag as string | undefined)?.trim();

    if (!token) {
      return NextResponse.json({ error: "token vereist" }, { status: 400 });
    }

    const ctx = await pakMiniElevaContext(token);
    if (!ctx) {
      return NextResponse.json({ error: "Ongeldige link" }, { status: 401 });
    }
    if (ctx.isVerlopen) {
      return NextResponse.json({ error: "Verlopen" }, { status: 410 });
    }

    const admin = createAdminClient();

    // Tel hoeveel keer prospect al "haal erbij" heeft gedrukt zodat we
    // niet honderd keer dezelfde notificatie loggen
    const { count: eerderGedrukt } = await admin
      .from("mini_eleva_activiteit")
      .select("id", { count: "exact", head: true })
      .eq("invitation_id", ctx.invitationId)
      .eq("module", "sponsor-erbij");

    await logActiviteit(
      ctx.invitationId,
      "sponsor-erbij",
      vraag ? `prospect-vraag: ${vraag.substring(0, 200)}` : "knop ingedrukt",
    );

    // Sla ook als chat-bericht op zodat member en sponsor het terugzien
    // in de chat-thread bij hun zicht in /vandaag of /namenlijst.
    // Kanaal 'mens' want het is consent-gegeven info richting de mens-
    // chat (niet privé tussen prospect en AI).
    await admin.from("mini_eleva_chats").insert({
      invitation_id: ctx.invitationId,
      rol: "prospect",
      type: "tekst",
      content: vraag
        ? `🤝 [haal-erbij] ${vraag}`
        : "🤝 [haal-erbij] Prospect vraagt of jij of de sponsor erbij wil komen.",
      kanaal: "mens",
    });

    // Notificeer member + sponsor (in-app + push). De prospect heeft
    // expliciet op de knop gedrukt, dus we mogen z'n vraag-tekst (kort)
    // meesturen als detail.
    await notifeerVoorUitnodiging({
      invitationId: ctx.invitationId,
      type: "haal-erbij",
      titel: `${ctx.prospectNaam.split(" ")[0]} heeft je nodig`,
      detail: vraag
        ? vraag.substring(0, 120) + (vraag.length > 120 ? "..." : "")
        : "Wil graag dat jij of de sponsor erbij komt",
      url: `/namenlijst/${ctx.prospectId}#mini-eleva`,
    });

    return NextResponse.json({
      ok: true,
      eerder_gedrukt: eerderGedrukt ?? 0,
      member_naam: ctx.memberNaam,
      sponsor_naam: ctx.sponsorNaam,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    console.error("sponsor-erbij exception:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
