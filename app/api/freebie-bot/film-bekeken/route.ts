import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { warmNaarOpvolgen } from "@/lib/prospect/warm-naar-opvolgen";
import { sendPushToUser } from "@/lib/push/sendPush";

// POST /api/freebie-bot/film-bekeken
// Body: { token, leadEmail, seconden?, duur?, afgekeken? }
//
// Twee soorten aanroepen vanuit de informatiefilm-speler:
//   - VOORTGANG (afgekeken=false): periodieke ping met hoever de prospect
//     is (seconden + duur). Wordt bewaard in de opt-in (bot_antwoorden.
//     filmKijk) zodat het member op de klantenkaart ziet hoeveel minuten
//     er gekeken is. Geen push, geen verschuiving.
//   - AFGEKEKEN (afgekeken=true of oud formaat zonder veld): prospect →
//     Opvolgen + herinnering + push naar het lid, met de kijktijd erbij.
//     Eenmalig: een marker op de prospect voorkomt dubbel afvuren.

const MARKER = "🎬 Info-film bekeken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = (body.token as string | undefined)?.trim();
    const leadEmail = (body.leadEmail as string | undefined)?.trim();
    // Oude clients stuurden alleen {token, leadEmail} en deden dat pas bij
    // 90% gekeken: behandel ontbrekend veld daarom als afgekeken.
    const afgekeken = body.afgekeken === undefined ? true : Boolean(body.afgekeken);
    const seconden = Math.max(0, Math.round(Number(body.seconden) || 0));
    const duur = Math.max(0, Math.round(Number(body.duur) || 0));
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

    // Kijk-voortgang bewaren op de opt-in (bot_antwoorden.filmKijk), zodat
    // het member op de kaart ziet hoeveel minuten er gekeken is. Seconden
    // alleen omhoog bijwerken (pings kunnen elkaar inhalen).
    try {
      const { data: freebieRij } = await admin
        .from("freebies")
        .select("id")
        .eq("slug", tokenRow.bot_slug)
        .maybeSingle();
      if (freebieRij) {
        const { data: optIn } = await admin
          .from("freebie_opt_ins")
          .select("id, bot_antwoorden")
          .eq("member_id", tokenRow.member_id)
          .eq("freebie_id", (freebieRij as { id: string }).id)
          .ilike("lead_email", leadEmail.replace(/([\\%_])/g, "\\$1"))
          .maybeSingle();
        if (optIn) {
          const huidig =
            ((optIn as { bot_antwoorden?: Record<string, unknown> | null })
              .bot_antwoorden ?? {}) as Record<string, unknown>;
          const oudeKijk = (huidig.filmKijk ?? {}) as {
            seconden?: number;
            duur?: number;
            afgekeken?: boolean;
          };
          await admin
            .from("freebie_opt_ins")
            .update({
              bot_antwoorden: {
                ...huidig,
                filmKijk: {
                  seconden: Math.max(oudeKijk.seconden ?? 0, seconden),
                  duur: duur || oudeKijk.duur || 0,
                  afgekeken: Boolean(oudeKijk.afgekeken) || afgekeken,
                  bijgewerkt: new Date().toISOString(),
                },
              },
            })
            .eq("id", (optIn as { id: string }).id);
        }
      }
    } catch (e) {
      console.error("filmKijk bijwerken mislukt:", e);
    }

    // Voortgang-ping: klaar. Push en verschuiving alleen bij afgekeken.
    if (!afgekeken) {
      return NextResponse.json({ ok: true, voortgang: true });
    }

    const { data: rows } = await admin
      .from("prospects")
      .select("id, volledige_naam, ingezette_tools")
      .eq("user_id", tokenRow.member_id)
      // Escape LIKE-wildcards: anders matcht "%@%" andermans prospect-kaart
      .ilike("email", leadEmail.replace(/([\\%_])/g, "\\$1"))
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

    // De kolom kan NULL zijn; dan matcht het NOT-contains-filter hieronder
    // nooit (SQL NULL-semantiek). Eerst race-veilig normaliseren naar [].
    if (!Array.isArray(prospect.ingezette_tools)) {
      await admin
        .from("prospects")
        .update({ ingezette_tools: [] })
        .eq("id", prospect.id)
        .is("ingezette_tools", null);
    }

    // Markeer atomair: alleen de call waarvan de update echt een rij raakt
    // (marker was er nog niet) mag verschuiven + pushen. Zo winnen twee
    // gelijktijdige calls nooit allebei.
    const { data: geclaimd } = await admin
      .from("prospects")
      .update({
        ingezette_tools: [...tools, MARKER],
        updated_at: new Date().toISOString(),
      })
      .eq("id", prospect.id)
      .not("ingezette_tools", "cs", `{"${MARKER}"}`)
      .select("id");
    if (!geclaimd || geclaimd.length === 0) {
      // Een parallelle call was ons voor; die doet de push + herinnering al.
      return NextResponse.json({ ok: true, alGevuurd: true });
    }

    const naam = (prospect.volledige_naam || "Iemand").split(" ")[0];
    const kijkTekst =
      seconden > 0
        ? `Bekeek ${Math.max(1, Math.round(seconden / 60))}${duur ? ` van de ±${Math.max(1, Math.round(duur / 60))}` : ""} minuten van de informatiefilm en keek 'm af.`
        : "Heeft de informatiefilm (af)gekeken.";

    await warmNaarOpvolgen({
      admin,
      prospectId: prospect.id,
      memberId: tokenRow.member_id,
      reden: `${naam} bekeek de informatiefilm`,
      beschrijving: `${kijkTekst} Mooi moment om persoonlijk op te volgen.`,
    });

    await sendPushToUser(tokenRow.member_id, {
      title: `🎬 ${naam} heeft je film afgekeken`,
      body: `${kijkTekst} Goed moment om contact op te nemen!`,
      url: `/namenlijst/${prospect.id}`,
      tag: `gezonde-start-film-${prospect.id}`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("film-bekeken exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
