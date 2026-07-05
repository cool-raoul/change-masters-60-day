import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { genereerBotToken } from "@/lib/freebie-bots/token";

// POST /api/freebie/slug
// Body: { slug }
//
// Zet de leesbare publieke slug van het ingelogde lid voor "Jouw gezonde
// start" (de link my-eleva.com/gezonde-start/<slug>). Uniek over alle leden;
// leeg = slug verwijderen.

const BOT = "jouw-gezonde-start";
// kleine letters/cijfers met losse koppeltekens ertussen, 3-30 tekens.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
    const ruw = (body.slug as string | undefined)?.trim().toLowerCase() ?? "";

    const admin = createAdminClient();

    // Leeg = leesbare link verwijderen.
    if (!ruw) {
      await admin
        .from("freebie_bot_member_tokens")
        .update({ publieke_slug: null })
        .eq("member_id", user.id)
        .eq("bot_slug", BOT);
      return NextResponse.json({ ok: true, slug: null });
    }

    if (ruw.length < 3 || ruw.length > 30 || !SLUG_RE.test(ruw)) {
      return NextResponse.json(
        {
          error:
            "Gebruik 3 tot 30 tekens: kleine letters, cijfers en koppeltekens.",
        },
        { status: 400 },
      );
    }

    // Bezet door iemand anders?
    const { data: bestaand } = await admin
      .from("freebie_bot_member_tokens")
      .select("member_id")
      .eq("publieke_slug", ruw)
      .maybeSingle();
    if (bestaand && bestaand.member_id !== user.id) {
      return NextResponse.json(
        { error: "Dit woord is al bezet, kies een ander." },
        { status: 409 },
      );
    }

    const { data: bijgewerkt, error } = await admin
      .from("freebie_bot_member_tokens")
      .update({ publieke_slug: ruw })
      .eq("member_id", user.id)
      .eq("bot_slug", BOT)
      .select("bot_slug");
    if (error) {
      // Bv. een race op de unieke index.
      return NextResponse.json(
        { error: "Dit woord is al bezet, kies een ander." },
        { status: 409 },
      );
    }

    // Geen rij geraakt = dit lid heeft nog geen token-rij voor deze bot.
    // Maak 'm dan aan, anders krijgt de gebruiker een valse succes-melding
    // terwijl de slug nergens is opgeslagen.
    if (!bijgewerkt || bijgewerkt.length === 0) {
      const { error: insertFout } = await admin
        .from("freebie_bot_member_tokens")
        .insert({
          member_id: user.id,
          bot_slug: BOT,
          token: genereerBotToken(),
          publieke_slug: ruw,
        });
      if (insertFout) {
        // Bv. een race op de unieke index.
        return NextResponse.json(
          { error: "Dit woord is al bezet, kies een ander." },
          { status: 409 },
        );
      }
    }

    return NextResponse.json({ ok: true, slug: ruw });
  } catch (e) {
    console.error("freebie/slug exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
