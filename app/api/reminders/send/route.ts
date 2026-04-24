import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/push/sendPush";

// Wordt ELK UUR op het hele uur aangeroepen via Vercel Cron.
// Schedule: "0 * * * *". Per user checken we of het NU het gewenste lokale uur
// is in hun tijdzone (profiles.dagelijkse_push_uur + profiles.tijdzone). Alleen
// voor matches sturen we de gebundelde push/mail. Zo kan iedereen z'n eigen
// ochtend-tijdstip kiezen zonder 24 aparte cron-jobs.

// Bereken het huidige uur (0-23) in een IANA-tijdzone. Intl.DateTimeFormat
// geeft ons een gelokaliseerde string; we pakken het uur daaruit.
function huidigUurInTijdzone(tz: string): number | null {
  try {
    const fmt = new Intl.DateTimeFormat("nl-NL", {
      timeZone: tz,
      hour: "numeric",
      hour12: false,
    });
    // fmt.format geeft bv. "7" of "23" afhankelijk van tijd
    const val = parseInt(fmt.format(new Date()), 10);
    if (Number.isNaN(val) || val < 0 || val > 23) return null;
    return val;
  } catch {
    // Ongeldige tijdzone: laat deze user dit uur over
    return null;
  }
}

// Bereken YYYY-MM-DD (ISO-datum) in een bepaalde tijdzone. Nodig omdat "vandaag"
// anders in een UTC-log doet alsof er om middernacht UTC al een nieuwe dag is,
// terwijl de user in een andere tz zit.
function vandaagInTijdzone(tz: string): string {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    // en-CA geeft "YYYY-MM-DD", perfect voor onze kolom
    return fmt.format(new Date());
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export async function GET(request: Request) {
  // Vercel stuurt automatisch Authorization: Bearer CRON_SECRET mee bij cron calls
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Haal alle users op die OF een Resend key hebben OF een actieve push-subscription.
  // We laden direct ook de push-schedule velden zodat we per user kunnen filteren.
  const [{ data: emailUsers }, { data: pushUsers }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, email, resend_api_key, dagelijkse_push_uur, tijdzone, dagelijkse_push_aan"
      )
      .not("resend_api_key", "is", null)
      .neq("resend_api_key", ""),
    supabase
      .from("push_subscriptions")
      .select("user_id")
      .eq("is_active", true),
  ]);

  type UserRij = {
    id: string;
    full_name: string | null;
    email: string;
    resend_api_key: string | null;
    dagelijkse_push_uur: number | null;
    tijdzone: string | null;
    dagelijkse_push_aan: boolean | null;
  };

  const userMap = new Map<string, UserRij>();
  for (const u of (emailUsers || []) as UserRij[]) {
    userMap.set(u.id, u);
  }
  const pushUserIds = new Set((pushUsers || []).map((p) => p.user_id));
  const ontbrekendePushUsers = Array.from(pushUserIds).filter((id) => !userMap.has(id));
  if (ontbrekendePushUsers.length > 0) {
    const { data: extra } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, resend_api_key, dagelijkse_push_uur, tijdzone, dagelijkse_push_aan"
      )
      .in("id", ontbrekendePushUsers);
    for (const u of (extra || []) as UserRij[]) {
      userMap.set(u.id, u);
    }
  }

  // Filter: alleen users waarvoor het NU hun ingestelde lokale uur is, en
  // die de dagelijkse push aan hebben staan. Defaults (als de migratie nog
  // niet gelopen heeft of een user niks heeft ingesteld): 07:00 Amsterdam aan.
  const gebruikers = Array.from(userMap.values()).filter((u) => {
    const aan = u.dagelijkse_push_aan ?? true;
    if (!aan) return false;
    const tz = u.tijdzone || "Europe/Amsterdam";
    const gewenstUur = u.dagelijkse_push_uur ?? 7;
    const huidigUur = huidigUurInTijdzone(tz);
    return huidigUur !== null && huidigUur === gewenstUur;
  });

  if (gebruikers.length === 0) {
    return NextResponse.json({ message: "Geen gebruikers met e-mail of push-abonnement", verzonden: 0 });
  }

  let verzonden = 0;
  let pushVerzonden = 0;
  const fouten: string[] = [];

  for (const gebruiker of gebruikers) {
    // "Vandaag" moet in de tijdzone van de gebruiker bepaald worden —
    // anders zou een user in Azië zijn vandaag-herinneringen pas de dag
    // erna binnenkrijgen. Zonder tijdzone val je terug op UTC-vandaag.
    const gebruikerTz = gebruiker.tijdzone || "Europe/Amsterdam";
    const vandaag = vandaagInTijdzone(gebruikerTz);

    // Haal openstaande herinneringen op voor deze gebruiker
    const { data: herinneringen } = await supabase
      .from("herinneringen")
      .select("id, titel, beschrijving, vervaldatum, prospect:prospects(volledige_naam)")
      .eq("user_id", gebruiker.id)
      .lte("vervaldatum", vandaag)
      .eq("voltooid", false)
      .order("vervaldatum", { ascending: true });

    if (!herinneringen || herinneringen.length === 0) continue;

    // Bouw de e-mail inhoud op
    const herinneringenRegels = herinneringen.map((h) => {
      const prospect = h.prospect as unknown as { volledige_naam: string } | null;
      const prospectNaam = prospect?.volledige_naam ? ` — ${prospect.volledige_naam}` : "";
      const isVerlopen = h.vervaldatum < vandaag;
      const prefix = isVerlopen ? `⚠ VERLOPEN (${h.vervaldatum})` : "• Vandaag";
      return `${prefix}: ${h.titel}${prospectNaam}`;
    });

    const voornaam = gebruiker.full_name?.split(" ")[0] || "Hey";
    const aantalVandaag = herinneringen.filter((h) => h.vervaldatum === vandaag).length;
    const aantalVerlopen = herinneringen.filter((h) => h.vervaldatum < vandaag).length;

    let onderwerp = `${herinneringen.length} herinnering${herinneringen.length > 1 ? "en" : ""} voor vandaag`;
    if (aantalVerlopen > 0) {
      onderwerp = `⚠ ${aantalVerlopen} verlopen + ${aantalVandaag} voor vandaag`;
    }

    // E-mail alleen sturen als gebruiker een Resend key heeft
    if (gebruiker.resend_api_key) {
      try {
        const stuurNaar = gebruiker.email;
        const resend = new Resend(gebruiker.resend_api_key);

        await resend.emails.send({
          from: "ELEVA 60 Dagen Run <onboarding@resend.dev>",
          to: stuurNaar,
          subject: onderwerp,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #C9A84C; margin-bottom: 8px;">Goedemorgen ${voornaam}! ☀️</h2>
              <p style="color: #888; margin-bottom: 24px;">Je hebt ${herinneringen.length} openstaande herinnering${herinneringen.length > 1 ? "en" : ""} vandaag:</p>

              <div style="background: #1a1a1a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                ${herinneringenRegels.map((r) => `
                  <div style="padding: 8px 0; border-bottom: 1px solid #2a2a2a; color: #f5f5f0; font-size: 14px;">
                    ${r}
                  </div>
                `).join("")}
              </div>

              <a href="https://change-masters-60-day-q25o.vercel.app/herinneringen"
                 style="background: #C9A84C; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                Bekijk herinneringen →
              </a>

              <p style="color: #555; font-size: 12px; margin-top: 24px;">
                ELEVA 60 Dagen Run — Succes vandaag!
              </p>
            </div>
          `,
          text: `Goedemorgen ${voornaam}!\n\nJe hebt ${herinneringen.length} openstaande herinnering${herinneringen.length > 1 ? "en" : ""} vandaag:\n\n${herinneringenRegels.join("\n")}\n\nLog in op je dashboard om ze af te vinken.\n\nSucces!\nELEVA 60 Dagen Run`,
        });

        verzonden++;
      } catch (e: any) {
        const fout = `${gebruiker.email} (email): ${e?.message || "onbekende fout"}`;
        console.error("Fout bij verzenden:", fout);
        fouten.push(fout);
      }
    }

    // Push notification onafhankelijk van e-mail
    const pushTitel =
      aantalVerlopen > 0
        ? `⚠ ${aantalVerlopen} verlopen, ${aantalVandaag} vandaag`
        : `${herinneringen.length} herinnering${herinneringen.length > 1 ? "en" : ""} vandaag`;

    const pushBody = herinneringen
      .slice(0, 3)
      .map((h) => {
        const p = h.prospect as unknown as { volledige_naam: string } | null;
        const naam = p?.volledige_naam ? ` — ${p.volledige_naam}` : "";
        return h.vervaldatum < vandaag ? `⚠ ${h.titel}${naam}` : `• ${h.titel}${naam}`;
      })
      .join("\n");

    const pushResultaat = await sendPushToUser(gebruiker.id, {
      title: pushTitel,
      body: pushBody,
      url: "/herinneringen",
      tag: "dagelijkse-herinneringen",
    });

    if (pushResultaat.success) {
      pushVerzonden++;
    }
  }

  return NextResponse.json({
    message: `${verzonden} e-mail${verzonden !== 1 ? "s" : ""} + ${pushVerzonden} push verzonden`,
    verzonden,
    push_verzonden: pushVerzonden,
    fouten: fouten.length > 0 ? fouten : undefined,
  });
}
