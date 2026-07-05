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
    // veld: 'welkomst' (per lid) of 'info' (founder-only, algemene info-film).
    const veld = (body.veld as string | undefined) === "info" ? "info" : "welkomst";
    const soortKol = veld === "info" ? "informatiefilm_soort" : "welkomstfilm_soort";
    const urlKol = veld === "info" ? "informatiefilm_url" : "welkomstfilm_url";

    if (!botSlug) {
      return NextResponse.json({ error: "botSlug ontbreekt" }, { status: 400 });
    }
    if (soort !== null && !SOORTEN.includes(soort)) {
      return NextResponse.json({ error: "Onbekend soort" }, { status: 400 });
    }
    if (soort !== null && !url) {
      return NextResponse.json({ error: "Geen video gekozen" }, { status: 400 });
    }

    // Server-side URL-check: wat hier wordt opgeslagen belandt in een
    // <iframe>/<video> op een publieke pagina. Alleen https + bekende hosts,
    // anders is stored XSS mogelijk (bv. een javascript:-URL).
    if (url) {
      let hostOk = false;
      try {
        const u = new URL(url);
        const host = u.hostname.toLowerCase();
        const toegestaan = [
          "www.youtube.com",
          "youtube.com",
          "youtu.be",
          "www.youtube-nocookie.com",
          "vimeo.com",
          "www.vimeo.com",
          "player.vimeo.com",
        ];
        let supabaseHost: string | null = null;
        try {
          supabaseHost = new URL(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          ).hostname.toLowerCase();
        } catch {
          supabaseHost = null;
        }
        hostOk =
          u.protocol === "https:" &&
          (toegestaan.includes(host) || (!!supabaseHost && host === supabaseHost));
      } catch {
        hostOk = false;
      }
      if (!hostOk) {
        return NextResponse.json({ error: "Ongeldige video-URL" }, { status: 400 });
      }
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
        [soortKol]: soort,
        [urlKol]: url,
      });
      if (error) throw error;
    } else {
      const { error } = await admin
        .from("freebie_bot_member_tokens")
        .update({ [soortKol]: soort, [urlKol]: url })
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
