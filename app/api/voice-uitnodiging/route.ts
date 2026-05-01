import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/voice-uitnodiging
//
// Body: { transcriptie: string, prospectId: string }
// Returnt: { uitnodiging: string, fout?: string }
//
// Het idee: member spreekt 30s vrij over een prospect ('Henk ken ik
// van voetbal, hij heeft pas z'n eigen zaak gestart, denk dat 'ie
// meer vrijheid wil...'). Whisper heeft de tekst al gemaakt op de
// client. Hier zet GPT die ruwe context om in een persoonlijke
// WhatsApp-uitnodiging volgens de 4-stappen-formule, in de eigen
// toon van de member.
//
// Output: ÉÉN bericht, geen alternatieven, geen explainer. Member
// kan het direct kopiëren of bewerken.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ fout: "Niet ingelogd" }, { status: 401 });
    }

    const body = await req.json();
    const transcriptie: string | undefined = body.transcriptie;
    const prospectId: string | undefined = body.prospectId;

    if (!transcriptie || transcriptie.trim().length < 10) {
      return NextResponse.json(
        { fout: "Te kort, spreek minimaal een paar zinnen in" },
        { status: 400 },
      );
    }
    if (!prospectId) {
      return NextResponse.json(
        { fout: "prospectId is verplicht" },
        { status: 400 },
      );
    }

    // Prospect-context ophalen voor personalisatie
    const { data: prospectRow } = await supabase
      .from("prospects")
      .select(
        "id, user_id, volledige_naam, pipeline_fase, notities, beroep, ingezette_tools",
      )
      .eq("id", prospectId)
      .maybeSingle();

    if (
      !prospectRow ||
      (prospectRow as { user_id: string }).user_id !== user.id
    ) {
      return NextResponse.json(
        { fout: "Prospect niet gevonden of geen toegang" },
        { status: 403 },
      );
    }

    // Member-naam voor afsluiting van het bericht
    const { data: profielRow } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    const memberVoornaam =
      ((profielRow as { full_name?: string | null } | null)?.full_name ?? "")
        .split(" ")[0] || "";

    const prospect = prospectRow as {
      volledige_naam: string;
      pipeline_fase: string;
      notities: string | null;
      beroep: string | null;
      ingezette_tools: string[];
    };
    const prospectVoornaam = prospect.volledige_naam.split(" ")[0];

    // OpenAI-aanroep
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { fout: "AI-service niet geconfigureerd" },
        { status: 500 },
      );
    }

    const systemPrompt = `Je helpt een netwerk-marketing-member van ELEVA met het opstellen van een korte, persoonlijke WhatsApp-uitnodiging naar een prospect.

VAST KADER:
- Maximaal 4-5 korte zinnen, zoals een echt WhatsApp-bericht.
- Volg de 4-stappen-formule (Eric Worre):
  1) WEES DRUK ('weinig tijd, maar...')
  2) COMPLIMENT (specifiek, niet plakkerig)
  3) UITNODIGEN voor een KIJKMOMENT (geen pitch)
  4) PLAN (twee tijdsblokken voorstellen)
- Toon: warm, eerlijk, geen verkoop-clichés, geen 'ik hoop dat...', geen 'lieve [naam]'.
- NOOIT em-dashes of en-dashes gebruiken. Gebruik komma's of nieuwe zinnen.
- Sluit af met de voornaam van de member.

OUTPUT: alléén het bericht. Geen alternatieven, geen explainer, geen quotes om de tekst.`;

    const userPrompt = `MEMBER zegt over deze prospect:
"""
${transcriptie.trim()}
"""

PROSPECT:
- Naam: ${prospect.volledige_naam} (voornaam: ${prospectVoornaam})
- Fase: ${prospect.pipeline_fase}
${prospect.beroep ? `- Beroep: ${prospect.beroep}` : ""}
${prospect.notities ? `- Notities: ${prospect.notities}` : ""}

MEMBER VOORNAAM: ${memberVoornaam || "(onbekend)"}

Schrijf nu de WhatsApp-uitnodiging in de eigen toon van de member, gebaseerd op wat 'ie hierboven heeft gezegd.`;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenAI fout:", errText);
      return NextResponse.json(
        { fout: "AI gaf geen antwoord, probeer opnieuw" },
        { status: 502 },
      );
    }

    const aiData = await aiResponse.json();
    const uitnodiging = aiData?.choices?.[0]?.message?.content?.trim();
    if (!uitnodiging) {
      return NextResponse.json(
        { fout: "AI gaf een leeg antwoord" },
        { status: 502 },
      );
    }

    return NextResponse.json({ uitnodiging });
  } catch (e) {
    console.error("voice-uitnodiging exception:", e);
    return NextResponse.json({ fout: "Onverwachte fout" }, { status: 500 });
  }
}
