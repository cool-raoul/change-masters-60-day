import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/push/sendPush";

// Wordt elke ochtend om 07:00 NL-tijd aangeroepen via Vercel Cron
// Schedule: "0 5 * * *" = 07:00 CEST (UTC+2, zomertijd)

export async function GET(request: Request) {
  // Vercel stuurt automatisch Authorization: Bearer CRON_SECRET mee bij cron calls
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const vandaag = new Date().toISOString().split("T")[0];

  // Gebruik één centrale Resend key uit omgevingsvariabelen
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ message: "Geen RESEND_API_KEY ingesteld — e-mails overgeslagen, push gaat wel door", verzonden: 0 });
  }
  const resend = new Resend(resendKey);

  // Haal alle gebruikers op
  const { data: gebruikers, error: gebruikersError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .neq("email", "");

  if (gebruikersError) {
    console.error("Fout bij ophalen gebruikers:", gebruikersError);
    return NextResponse.json({ error: "Database fout" }, { status: 500 });
  }

  if (!gebruikers || gebruikers.length === 0) {
    return NextResponse.json({ message: "Geen gebruikers gevonden", verzonden: 0 });
  }

  let verzonden = 0;
  const fouten: string[] = [];

  for (const gebruiker of gebruikers) {
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

    try {
      const stuurNaar = gebruiker.email;

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

      // Stuur ook push notification
      await sendPushToUser(gebruiker.id, {
        title: `${herinneringen.length} herinnering${herinneringen.length > 1 ? "en" : ""} vandaag`,
        body: herinneringen.slice(0, 3).map((h) => `• ${h.titel}`).join("\n"),
        url: "/herinneringen",
        tag: "herinnering",
      });

    } catch (e: any) {
      const fout = `${gebruiker.email}: ${e?.message || "onbekende fout"}`;
      console.error("Fout bij verzenden:", fout);
      fouten.push(fout);
    }
  }

  return NextResponse.json({
    message: `${verzonden} e-mail${verzonden !== 1 ? "s" : ""} verzonden`,
    verzonden,
    fouten: fouten.length > 0 ? fouten : undefined,
  });
}
