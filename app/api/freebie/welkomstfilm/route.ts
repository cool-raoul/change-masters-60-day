import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { genereerBotToken } from "@/lib/freebie-bots/token";

// POST /api/freebie/welkomstfilm
// Body: { botSlug, soort: 'youtube'|'vimeo'|'upload'|null, url: string|null }
//
// Zet de eigen welkomstfilm van het ingelogde lid op z'n token-rij voor deze
// bot. soort=null wist de eigen film (valt dan terug op de algemene default).
// De upload zelf gebeurt client-side naar Supabase Storage; hier slaan we
// alleen de resulterende URL + het soort op.

const SOORTEN = ["youtube", "vimeo", "upload"];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const botSlug = (body.botSlug as string | undefined)?.trim();
    const soort = (body.soort as string | null | undefined) ?? null;
    const url = ((body.url as string | null | undefined) ?? "").toString().trim() || null;

    if (!botSlug) {
      return NextResponse.json({ error: "botSlug ontbreekt" }, { status: 400 });
    }
    if (soort !== null && !SOORTEN.includes(soort)) {
      return NextResponse.json({ error: "Onbekend soort" }, { status: 400 });
    }
    if (soort !== null && !url) {
      return NextResponse.json({ error: "Geen video gekozen" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: bestaand } = await admin
      .from("freebie_bot_member_tokens")
      .select("token")
      .eq("member_id", user.id)
      .eq("bot_slug", botSlug)
      .maybeSingle();

    if (!bestaand) {
      const { error } = await admin.from("freebie_bot_member_tokens").insert({
        member_id: user.id,
        bot_slug: botSlug,
        token: genereerBotToken(),
        welkomstfilm_soort: soort,
        welkomstfilm_url: url,
      });
      if (error) throw error;
    } else {
      const { error } = await admin
        .from("freebie_bot_member_tokens")
        .update({ welkomstfilm_soort: soort, welkomstfilm_url: url })
        .eq("member_id", user.id)
        .eq("bot_slug", botSlug);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("welkomstfilm save exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
