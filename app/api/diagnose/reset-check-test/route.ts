// File: app/api/diagnose/reset-check-test/route.ts
//
// Diagnose-endpoint voor /diagnose. Doet een volledige test van de
// Reset-check pijplijn voor de ingelogde member:
// 1. Vind member's bot-token (maak aan als die nog niet bestaat)
// 2. POST een test-submission naar /api/freebie-bot/opt-in
// 3. Check of opt-in + prospect zijn aangemaakt
// 4. Ruim test-data direct weer op
// Geeft per stap een stap-status terug zodat Raoul precies ziet
// waar het mis gaat (als het mis gaat).

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { genereerBotToken } from "@/lib/freebie-bots/token";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Stap = {
  stap: string;
  status: "OK" | "FOUT" | "INFO";
  details: string;
};

const TEST_EMAIL = "diagnose-test-reset@elevasystem.local";

export async function POST() {
  const stappen: Stap[] = [];
  const log = (stap: string, status: Stap["status"], details: string) =>
    stappen.push({ stap, status, details });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, fout: "Niet ingelogd" }, { status: 401 });
    }

    log("1. Auth", "OK", `Ingelogd als user-id ${user.id}`);

    const admin = createAdminClient();

    // ===== 2. TOKEN OPZOEKEN OF MAKEN =====
    let token: string;
    const { data: bestaand } = await admin
      .from("freebie_bot_member_tokens")
      .select("token")
      .eq("member_id", user.id)
      .eq("bot_slug", "reset-check")
      .maybeSingle();

    if (bestaand?.token) {
      token = bestaand.token;
      log("2. Token", "OK", `Bestaand token gevonden: ${token}`);
    } else {
      const nieuw = genereerBotToken();
      const { error } = await admin.from("freebie_bot_member_tokens").insert({
        member_id: user.id,
        bot_slug: "reset-check",
        token: nieuw,
      });
      if (error) {
        log("2. Token", "FOUT", `Kan token niet maken: ${error.message}`);
        return NextResponse.json({ ok: false, stappen });
      }
      token = nieuw;
      log("2. Token", "OK", `Nieuw token aangemaakt: ${token}`);
    }

    // ===== 3. SUBMIT NAAR OPT-IN ENDPOINT =====
    const testPayload = {
      token,
      leadVoornaam: "Diagnose",
      leadAchternaam: "Test",
      leadEmail: TEST_EMAIL,
      leadTelefoon: "0612345678",
      antwoorden: {
        voornaam: "Diagnose",
        achternaam: "Test",
        email: TEST_EMAIL,
        telefoon: "0612345678",
        scores: { intentie: 3, spijsvertering: 2, stoelgang: 1 },
        profiel: {
          geslacht_leeftijd: "vrouw_35plus",
          afvalpogingen: "vaak",
          afvalwens: "5-10",
          investering: "altijd",
        },
        medisch: ["geen"],
        medischVrij: "",
      },
      spiegelTekst:
        "🔥 HEET (diagnose-test, mag verwijderd worden)\nDit is een test door /diagnose.",
      contactGewenst: true,
      herkomstBron: "diagnose",
    };

    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload),
    };

    // We doen de fetch via volledig URL want server-fetch naar relatieve
    // route werkt niet vanuit een API-route.
    const baseUrl = SITE_URL;

    let resStatus = 0;
    let resBody: unknown = null;
    try {
      const r = await fetch(`${baseUrl}/api/freebie-bot/opt-in`, opts);
      resStatus = r.status;
      resBody = await r.json().catch(() => ({}));
      log(
        "3. POST /api/freebie-bot/opt-in",
        r.ok ? "OK" : "FOUT",
        `Status ${r.status}, body: ${JSON.stringify(resBody)}`,
      );
    } catch (e) {
      log("3. POST /api/freebie-bot/opt-in", "FOUT", `Fetch faalde: ${String(e)}`);
    }

    // ===== 4. CHECK OPT-IN IN DB =====
    const { data: optInRow } = await admin
      .from("freebie_opt_ins")
      .select("id, lead_naam, status, bron_kanaal, spiegel_tekst")
      .eq("member_id", user.id)
      .ilike("lead_email", TEST_EMAIL)
      .maybeSingle();

    if (optInRow) {
      log(
        "4. Opt-in in DB",
        "OK",
        `freebie_opt_ins.id ${optInRow.id}, status ${optInRow.status}, bron ${optInRow.bron_kanaal}`,
      );
    } else {
      log(
        "4. Opt-in in DB",
        "FOUT",
        "Geen rij gevonden in freebie_opt_ins voor diagnose-test-reset@elevasystem.local",
      );
    }

    // ===== 5. CHECK PROSPECT IN NAMENLIJST =====
    const { data: prospectRow } = await admin
      .from("prospects")
      .select("id, volledige_naam, ingezette_tools, prioriteit")
      .eq("user_id", user.id)
      .ilike("email", TEST_EMAIL)
      .maybeSingle();

    if (prospectRow) {
      log(
        "5. Prospect in namenlijst",
        "OK",
        `prospects.id ${prospectRow.id}, prioriteit ${prospectRow.prioriteit}, tags: ${(prospectRow.ingezette_tools as string[] | null)?.join(", ") ?? "geen"}`,
      );
    } else {
      log(
        "5. Prospect in namenlijst",
        "FOUT",
        "Geen prospect-rij aangemaakt — namenlijst zou leeg blijven",
      );
    }

    // ===== 6. CLEANUP =====
    if (prospectRow) {
      await admin.from("prospects").delete().eq("id", prospectRow.id);
    }
    if (optInRow) {
      await admin.from("freebie_opt_ins").delete().eq("id", optInRow.id);
    }
    await admin
      .from("freebie_mail_queue")
      .delete()
      .ilike("lead_email", TEST_EMAIL);
    log("6. Cleanup", "OK", "Test-rijen verwijderd uit DB");

    const allesOk = stappen.every((s) => s.status !== "FOUT");
    return NextResponse.json({
      ok: allesOk,
      conclusie: allesOk
        ? "✅ ALLES WERKT. De pijplijn is in orde. Als jouw echte test niet binnenkomt, ligt het aan de browser (cache of submit-knop niet geklikt)."
        : "❌ ER ZIT IETS FOUT in de pijplijn. Zie hieronder welke stap faalde.",
      submit_status: resStatus,
      submit_body: resBody,
      stappen,
    });
  } catch (e) {
    log("Onverwachte fout", "FOUT", String(e));
    return NextResponse.json({ ok: false, fout: String(e), stappen });
  }
}
