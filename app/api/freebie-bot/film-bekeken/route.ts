import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { warmNaarOpvolgen } from "@/lib/prospect/warm-naar-opvolgen";
import { sendPushToUser } from "@/lib/push/sendPush";

// POST /api/freebie-bot/film-bekeken
// Body: { token, leadEmail }
//
// Wordt aangeroepen door de informatiefilm-speler zodra een prospect de film
// ~90% / tot het einde heeft bekeken. Zoekt de prospect (lid uit token +
// e-mail), verschuift 'm naar Opvolgen + herinnering en stuurt het lid een
// push. Eenmalig: een marker op de prospect voorkomt dubbel afvuren.

const MARKER = "🎬 Info-film bekeken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = (body.token as string | undefined)?.trim();
    const leadEmail = (body.leadEmail as string | undefined)?.trim();
    if (!token || !leadEmail) {
      return NextResponse.json(
        { error: "token/leadEmail ontbreekt" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    const { data: tokenRow } = await admin
      .from("freebie_bot_member_tokens")
      .select("member_id, bot_slug")
      .eq("token", token)
      .maybeSingle();
    if (!tokenRow) {
      return NextResponse.json({ error: "Onbekend token" }, { status: 404 });
    }

    const { data: rows } = await admin
      .from("prospects")
      .select("id, volledige_naam, ingezette_tools")
      .eq("user_id", tokenRow.member_id)
      .ilike("email", leadEmail)
      .eq("gearchiveerd", false)
      .order("updated_at", { ascending: false })
      .limit(1);
    const prospect = rows?.[0] as
      | {
          id: string;
          volledige_naam: string | null;
          ingezette_tools: string[] | null;
        }
      | undefined;
    if (!prospect) {
      // Nog geen prospect (bv. opt-in viel weg) → niets te doen, geen fout.
      return NextResponse.json({ ok: true, gevonden: false });
    }

    const tools = Array.isArray(prospect.ingezette_tools)
      ? prospect.ingezette_tools
      : [];
    if (tools.includes(MARKER)) {
      return NextResponse.json({ ok: true, alGevuurd: true });
    }

    // Markeer (eenmalig) + verschuif + push.
    await admin
      .from("prospects")
      .update({
        ingezette_tools: [...tools, MARKER],
        updated_at: new Date().toISOString(),
      })
      .eq("id", prospect.id);

    const naam = (prospect.volledige_naam || "Iemand").split(" ")[0];

    await warmNaarOpvolgen({
      admin,
      prospectId: prospect.id,
      memberId: tokenRow.member_id,
      reden: `${naam} bekeek de informatiefilm`,
      beschrijving:
        "Heeft de informatiefilm van Jouw gezonde start (af)gekeken. Mooi moment om persoonlijk op te volgen.",
    });

    await sendPushToUser(tokenRow.member_id, {
      title: `🎬 ${naam} heeft je film bekeken`,
      body: "Bekeek de informatiefilm van Jouw gezonde start. Tijd voor een follow-up.",
      url: `/namenlijst/${prospect.id}`,
      tag: `gezonde-start-film-${prospect.id}`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("film-bekeken exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
