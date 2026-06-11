// Vertaal-endpoint voor het TTS-demo: NL-tekst naar gekozen doel-taal.
// Gebruikt Claude omdat we al een CM_CLAUDE_API_KEY in de stack hebben en
// Claude is sterk in nuances voor stem-context.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOEL_TALEN: Record<string, string> = {
  nl: "Nederlands",
  en: "Engels",
  fr: "Frans",
  de: "Duits",
  es: "Spaans",
  pt: "Portugees",
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ fout: "Niet ingelogd" }, { status: 401 });
    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profiel as { role?: string } | null)?.role !== "founder") {
      return NextResponse.json({ fout: "Alleen founders" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const tekst = String(body.tekst ?? "").trim();
    const doel = String(body.doel ?? "");
    if (!tekst || !DOEL_TALEN[doel]) {
      return NextResponse.json({ fout: "tekst en doel verplicht" }, { status: 400 });
    }

    const apiKey = process.env.CM_CLAUDE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { fout: "CM_CLAUDE_API_KEY niet ingesteld" },
        { status: 500 },
      );
    }
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Vertaal de volgende tekst naar ${DOEL_TALEN[doel]}. Behoud de toon, ritme en eventuele emoji. Geef ALLEEN de vertaling terug, geen uitleg.\n\nTekst:\n${tekst}`,
        },
      ],
    });

    const eerste = message.content[0];
    const vertaling =
      eerste && eerste.type === "text" ? eerste.text.trim() : "";

    return NextResponse.json({ vertaling });
  } catch (err: any) {
    return NextResponse.json(
      { fout: err?.message || "Onbekende fout" },
      { status: 500 },
    );
  }
}
