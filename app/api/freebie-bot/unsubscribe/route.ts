// File: app/api/freebie-bot/unsubscribe/route.ts
//
// GET /api/freebie-bot/unsubscribe?token=...
// Lead die zich wil afmelden voor alle freebie-mailreeksen klikt op
// een unsubscribe-link in een mail. Token in URL refereert naar de
// queue-rij. We zoeken het bijbehorende e-mailadres op en voegen het
// toe aan freebie_mail_unsubscribed. Cron slaat het adres voortaan over.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Ongeldige link" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Vind het e-mailadres bij dit token
  const { data: rij } = await supabase
    .from("freebie_mail_queue")
    .select("lead_email")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!rij) {
    return new NextResponse(
      eenvoudigeHtmlPagina(
        "Link is niet meer geldig",
        "Deze afmeld-link werkt niet meer. Mocht je geen mails meer willen ontvangen, antwoord dan rechtstreeks op de laatste mail die je ontving.",
      ),
      { headers: { "Content-Type": "text/html" } },
    );
  }

  const email = (rij as { lead_email: string }).lead_email.toLowerCase();

  // Voeg toe aan unsubscribed-tabel (idempotent)
  await supabase
    .from("freebie_mail_unsubscribed")
    .upsert({ email, reden: "lead-afmelding via link" }, { onConflict: "email" });

  return new NextResponse(
    eenvoudigeHtmlPagina(
      "Je bent afgemeld",
      "Je ontvangt geen verdere freebie-mails meer. Mocht je later toch terug willen, vraag dan even een nieuwe link aan de persoon die je oorspronkelijk uitnodigde.",
    ),
    { headers: { "Content-Type": "text/html" } },
  );
}

function eenvoudigeHtmlPagina(titel: string, tekst: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titel}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 80px auto; padding: 24px; color: #333; line-height: 1.6; background: linear-gradient(180deg, #fff1f2, #ffffff); }
    .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center; }
    .tulp { font-size: 48px; }
    h1 { color: #be185d; font-size: 22px; margin-top: 16px; }
    p { color: #555; }
  </style>
</head>
<body>
  <div class="card">
    <div class="tulp">🌷</div>
    <h1>${titel}</h1>
    <p>${tekst}</p>
  </div>
</body>
</html>`;
}
