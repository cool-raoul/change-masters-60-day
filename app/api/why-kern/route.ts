import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// GET /api/why-kern
//
// Haalt de kern uit de opgeslagen WHY van de ingelogde member, zodat
// het systeem die kan terughalen op plekken waar het ertoe doet
// (feedback Raoul 29 juli: bij de Doel-Tijd-Termijn moet de vraag niet
// abstract "hoeveel extra inkomen wil je" zijn, maar "hoeveel heb je
// nodig om die tijd met je dochter mogelijk te maken").
//
// Geeft terug:
//   { why, kern, beroep }
//   - why    = de volledige opgeslagen WHY (of null)
//   - kern   = waar het écht om gaat, kort, in de tweede persoon
//              ("meer tijd met je dochter", "eerder stoppen met de
//              nachtdiensten"). Null als het niet af te leiden is.
//   - beroep = wat iemand in het dagelijks leven doet (of null)
//
// Alles faalt stil terug naar null: de pagina werkt ook zonder.
// ============================================================

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { data: rij } = await supabase
      .from("why_profiles")
      .select("why_samenvatting")
      .eq("user_id", user.id)
      .maybeSingle();
    const why =
      ((rij as { why_samenvatting?: string | null } | null)?.why_samenvatting ??
        "").trim() || null;

    if (!why) return NextResponse.json({ why: null, kern: null, beroep: null });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ why, kern: null, beroep: null });

    const openai = new OpenAI({ apiKey });
    const uitkomst = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 150,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Je krijgt de WHY van iemand: de persoonlijke reden waarom diegene aan een eigen bijverdienste bouwt. Haal er twee dingen uit.

"kern": waar het écht om gaat, in de JE-vorm en zo concreet als de WHY toelaat. Maximaal acht woorden, geen punt aan het eind, geen hoofdletter aan het begin. Noem het mens-deel als dat er is. Goede voorbeelden: "meer tijd met je dochter", "eerder stoppen met de nachtdiensten", "je hypotheek zonder stress betalen", "je moeder vaker kunnen bezoeken". Slechte voorbeelden (te vaag): "meer vrijheid", "een beter leven", "financiële rust".
"beroep": wat diegene in het dagelijks leven doet, in twee of drie woorden ("vrachtwagenchauffeur", "verpleegkundige in de nachtdienst"). Staat het er niet, dan null.

Antwoord UITSLUITEND met JSON: {"kern": string|null, "beroep": string|null}. Kun je de kern niet concreet maken, geef dan null in plaats van iets vaags.`,
        },
        { role: "user", content: why.slice(0, 2000) },
      ],
    });

    let kern: string | null = null;
    let beroep: string | null = null;
    try {
      const j = JSON.parse(uitkomst.choices[0]?.message?.content ?? "{}") as {
        kern?: string | null;
        beroep?: string | null;
      };
      kern = j.kern?.trim() || null;
      beroep = j.beroep?.trim() || null;
    } catch {
      // laat null staan
    }

    return NextResponse.json({ why, kern, beroep });
  } catch (e) {
    console.error("why-kern fout:", e);
    return NextResponse.json({ why: null, kern: null, beroep: null });
  }
}
