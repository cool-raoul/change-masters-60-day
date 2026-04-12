import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { NextResponse } from "next/server";

// Wordt elke ochtend om 07:00 aangeroepen via Vercel Cron
// Elke gebruiker heeft zijn eigen Resend API key en krijgt zijn eigen herinneringen

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const supabase = await createClient();
  const vandaag = new Date().toISOString().split("T")[0];

  // Haal alle gebruikers op die een Resend key hebben ingesteld
  const { data: gebruikers } = await supabase
    .from("profiles")
    .select("id, full_name, email, resend_api_key")
    .not("resend_api_key", "is", null);

  if (!gebruikers || gebruikers.length === 0) {
    return NextResponse.json({ message: "Geen gebruikers met e-mail ingesteld", verzonden: 0 });
  }

  let verzonden = 0;

  for (const gebruiker of gebruikers) {
    if (!gebruiker.resend_api_key) continue;

    // Haal openstaande herinneringen op voor deze gebruiker
    const { data: herinneringen } = await supabase
      .from("herinneringen")
      .select("id, titel, beschrijving, vervaldatum, prospect:prospects(volledige_naam)")
      .eq("user_id", gebruiker.id)
      .lte("vervaldatum", vandaag)
      .eq("voltooid", false);

    if (!herinneringen || herinneringen.length === 0) continue;

    // Bouw de e-mail tekst op
    const herinneringenTekst = herinneringen
      .map((h) => {
        const prospect = h.prospect as unknown as { volledige_naam: string } | null;
        const prospectNaam = prospect?.volledige_naam ? ` (${prospect.volledige_naam})` : "";
        const isVerlopen = h.vervaldatum < vandaag;
        return `${isVerlopen ? "VERLOPEN" : "Vandaag"}: ${h.titel}${prospectNaam}`;
      })
      .join("\n");

    try {
      const resend = new Resend(gebruiker.resend_api_key);
      await resend.emails.send({
        from: "Change Masters <onboarding@resend.dev>",
        to: gebruiker.email,
        subject: `${herinneringen.length} herinnering${herinneringen.length > 1 ? "en" : ""} voor vandaag`,
        text: `Hoi ${gebruiker.full_name.split(" ")[0]},

Je hebt ${herinneringen.length} openstaande herinnering${herinneringen.length > 1 ? "en" : ""} voor vandaag:

${herinneringenTekst}

Log in op je dashboard om ze af te vinken.

Succes vandaag!
Change Masters`,
      });
      verzonden++;
    } catch (e) {
      console.error(`Fout bij verzenden naar ${gebruiker.email}:`, e);
    }
  }

  return NextResponse.json({ message: `${verzonden} e-mails verzonden`, verzonden });
}
