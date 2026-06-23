import { NextRequest, NextResponse } from "next/server";
import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { notifeerVoorUitnodiging } from "@/lib/mini-eleva/notificaties";

// ============================================================
// POST /api/mini-eleva/film-afgekeken
// Body: { token: string, filmTitel?: string }
//
// De prospect heeft in haar eigen mini-ELEVA een video afgekeken. Géén
// auth: het invitation-token in de body is het toegangsbewijs (zelfde model
// als de rest van /m/[token]). We loggen de activiteit en notificeren de
// member. Dat notificatie-event (type !== 'eerste-bezoek') triggert
// automatisch de warm-naar-opvolgen-verschuiving in notifeerVoorUitnodiging:
// de prospect schuift naar Opvolgen + krijgt een opvolg-herinnering.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = (body.token as string | undefined)?.trim();
    const filmTitel = (body.filmTitel as string | undefined)?.trim();
    if (!token) {
      return NextResponse.json({ error: "Token ontbreekt" }, { status: 400 });
    }

    const ctx = await pakMiniElevaContext(token);
    if (!ctx || ctx.isVerlopen) {
      return NextResponse.json(
        { error: "Ongeldige of verlopen link" },
        { status: 404 },
      );
    }

    const voornaam = ctx.prospectNaam.split(" ")[0];
    await logActiviteit(
      ctx.invitationId,
      "film-afgekeken",
      filmTitel ?? "video afgekeken",
    );

    await notifeerVoorUitnodiging({
      invitationId: ctx.invitationId,
      type: "film-bekeken",
      titel: `${voornaam} heeft een film afgekeken in mini-ELEVA`,
      detail: filmTitel
        ? `Klaar met kijken: ${filmTitel}. Tijd voor een follow-up.`
        : "Klaar met kijken in de eigen omgeving. Tijd voor een follow-up.",
      url: `/namenlijst/${ctx.prospectId}`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("mini-eleva/film-afgekeken exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
