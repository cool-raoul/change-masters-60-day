import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { NextResponse } from "next/server";

// Dit endpoint wordt dagelijks aangeroepen via Vercel Cron
// Het stuurt e-mail herinneringen naar gebruikers met openstaande taken

export async function GET(request: Request) {
  // Verificatie via geheime sleutel (zodat niet iedereen dit kan aanroepen)
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY niet geconfigureerd" }, { status: 500 });
  }

  const resend = new Resend(resendKey);
  const supabase = await createClient();
  const vandaag = new Date().toISOString().split("T")[0];

  // Haal alle openstaande herinneringen op voor vandaag
  const { data: herinneringen, error } = await supabase
    .from("herinneringen")
    .select(`
      id,
      titel,
      beschrijving,
      vervaldatum,
      herinnering_type,
      user_id,
      prospect_id,
      prospect:prospects(volledige_naam),
      user:profiles!herinneringen_user_id_fkey(full_name, email)
    `)
    .lte("vervaldatum", vandaag)
    .eq("voltooid", false);

  if (error) {
    console.error("Fout bij ophalen herinneringen:", error);
    return NextResponse.json({ error: "Database fout" }, { status: 500 });
  }

  if (!herinneringen || herinneringen.length === 0) {
    return NextResponse.json({ message: "Geen herinneringen voor vandaag", verzonden: 0 });
  }

  // Groepeer herinneringen per gebruiker
  const perGebruiker: Record<string, {
    email: string;
    naam: string;
    herinneringen: typeof herinneringen;
  }> = {};

  for (const her of herinneringen) {
    const user = her.user as unknown as { full_name: string; email: string } | null;
    if (!user?.email) continue;

    if (!perGebruiker[her.user_id]) {
      perGebruiker[her.user_id] = {
        email: user.email,
        naam: user.full_name,
        herinneringen: [],
      };
    }
    perGebruiker[her.user_id].herinneringen.push(her);
  }

  let verzonden = 0;
  const fouten: string[] = [];

  // Stuur per gebruiker 1 e-mail met al hun herinneringen
  for (const [userId, data] of Object.entries(perGebruiker)) {
    const herinneringenLijst = data.herinneringen
      .map((h) => {
        const prospect = h.prospect as unknown as { volledige_naam: string } | null;
        const prospectNaam = prospect?.volledige_naam ? ` (${prospect.volledige_naam})` : "";
        const isOverdue = h.vervaldatum < vandaag;
        return `${isOverdue ? "⚠️ VERLOPEN" : "📌"} ${h.titel}${prospectNaam}${h.beschrijving ? `\n   ${h.beschrijving}` : ""}`;
      })
      .join("\n\n");

    try {
      await resend.emails.send({
        from: "Change Masters <herinneringen@resend.dev>",
        to: data.email,
        subject: `${data.herinneringen.length} herinnering${data.herinneringen.length > 1 ? "en" : ""} voor vandaag`,
        text: `Hoi ${data.naam.split(" ")[0]},

Je hebt ${data.herinneringen.length} openstaande herinnering${data.herinneringen.length > 1 ? "en" : ""}:

${herinneringenLijst}

Ga naar je dashboard om ze af te vinken.

Succes vandaag!
Change Masters`,
      });
      verzonden++;
    } catch (e: any) {
      console.error(`Fout bij verzenden naar ${data.email}:`, e);
      fouten.push(data.email);
    }
  }

  return NextResponse.json({
    message: `${verzonden} e-mails verzonden`,
    verzonden,
    fouten: fouten.length > 0 ? fouten : undefined,
  });
}
