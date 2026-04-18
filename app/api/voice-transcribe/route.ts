import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

// Whisper prompt-seed: maximaal ~224 tokens (1000 chars). Alleen de lastige
// productnamen + medische termen die Whisper fonetisch verkeerd hoort. De
// volledige productcatalogus hoort hier NIET in — die is te lang en Whisper
// knipt de prompt aan de voorkant af.
function bouwWhisperPrompt(taal: string): string {
  if (taal === "nl" || !taal) {
    return "Gesprek van een Nederlandse coach over Lifeplus supplementen en gezondheid. Merken en producten: Lifeplus, Proanthenols, Daily BioBasics, OmeGold, Evening Primrose Oil, Biotic Blast, CalMag Plus, Co-Q-10, TVM-Plus, Ubiquinol, Women's Special, Men's Special, Mena Plus, Colloidal Silver, Iron Plus, Joint Formula. Mogelijke klachten: Hashimoto, fibromyalgie, colitis, Crohn, IBS, menopauze, schildklier, cholesterol, artrose, migraine, burnout, slapeloosheid, eczeem, candida.";
  }
  return "Coaching conversation about Lifeplus supplements and health. Brands and products: Lifeplus, Proanthenols, Daily BioBasics, OmeGold, Evening Primrose Oil, Biotic Blast, CalMag Plus, Co-Q-10, TVM-Plus, Ubiquinol, Women's Special, Men's Special.";
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ fout: "OPENAI_API_KEY niet ingesteld" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ fout: "Niet ingelogd" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formData = await request.formData();
    const audio = formData.get("audio");
    const taalRaw = formData.get("taal");
    const taal = typeof taalRaw === "string" ? taalRaw : "nl";

    if (!(audio instanceof Blob)) {
      return new Response(
        JSON.stringify({ fout: "Geen audio-bestand ontvangen" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Whisper accepteert max 25MB. Onze opnames zijn max 2 min ≈ <2MB opus.
    if (audio.size > 25 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ fout: "Audio te groot (max 25MB)" }),
        { status: 413, headers: { "Content-Type": "application/json" } }
      );
    }
    if (audio.size < 1000) {
      return new Response(
        JSON.stringify({ fout: "Audio te kort of leeg" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // OpenAI SDK wil een File-object met een bestandsnaam zodat hij de codec herkent.
    // We geven een passende extensie op basis van het mime-type van de Blob.
    const mime = audio.type || "audio/webm";
    let ext = "webm";
    if (mime.includes("mp4") || mime.includes("m4a")) ext = "mp4";
    else if (mime.includes("ogg")) ext = "ogg";
    else if (mime.includes("wav")) ext = "wav";
    else if (mime.includes("mpeg") || mime.includes("mp3")) ext = "mp3";

    const bestand = new File([audio], `opname.${ext}`, { type: mime });

    const openai = new OpenAI({ apiKey });

    const transcriptie = await openai.audio.transcriptions.create({
      file: bestand,
      model: "whisper-1",
      language: taal,
      prompt: bouwWhisperPrompt(taal),
      temperature: 0,
      response_format: "text",
    });

    const tekst = typeof transcriptie === "string"
      ? transcriptie
      : ((transcriptie as any)?.text ?? "");

    // Server-side Lifeplus-normalisatie (zelfde vangnet als voice-parse).
    const genormaliseerd = tekst.replace(
      /\b(life|lijf|live|leaf|laif|lief)[\s\-]?(plus|plas)\b/gi,
      "Lifeplus"
    );

    return new Response(JSON.stringify({ tekst: genormaliseerd.trim() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("voice-transcribe fout:", err);
    return new Response(
      JSON.stringify({ fout: err?.message || "Transcriptie mislukt" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
