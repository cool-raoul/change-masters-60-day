// File: app/api/freebie-bot/start/route.ts
//
// POST /api/freebie-bot/start
// Body: { token: string }
// Response: { ok: true, memberId, memberVoornaam, botSlug } of { error }
//
// PUBLIEKE route. Geen auth-check op de aanroeper. Wel: token MOET
// matchen met een rij in freebie_bot_member_tokens. Gebruikt
// service-role-admin-client omdat RLS-policy 'anon' weigert.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token as string | undefined;
    if (!token || typeof token !== "string" || token.length !== 16) {
      return NextResponse.json(
        { error: "Ongeldige token" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data: row } = await supabase
      .from("freebie_bot_member_tokens")
      .select("member_id, bot_slug")
      .eq("token", token)
      .maybeSingle();

    if (!row) {
      return NextResponse.json(
        { error: "Onbekende token" },
        { status: 404 },
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", row.member_id)
      .maybeSingle();

    const memberVoornaam =
      ((profile?.full_name ?? "") as string).split(" ")[0] || "iemand";

    return NextResponse.json({
      ok: true,
      memberId: row.member_id,
      memberVoornaam,
      botSlug: row.bot_slug,
    });
  } catch (e) {
    console.error("freebie-bot/start exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
