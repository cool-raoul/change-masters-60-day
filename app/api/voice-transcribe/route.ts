import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_NAMEN_LIJST } from "@/lib/lifeplus/producten";

export const maxDuration = 30;

// Extra vocabulaire dat Whisper slecht kent: medische termen uit de NL praktijk
// + Lifeplus-brand + fonetische valkuilen. Whisper "prompt" = seed voor betere
// herkenning van deze woorden in de audio. Limiet: ~224 tokens totaal.
const MEDISCHE_TERMEN = [
  "Hashimoto", "fibromyalgie", "colitis ulcerosa", "ziekte van Crohn",
  "prikkelbare darm", "IBS", "menopauze", "overgang", "PMS",
  "schildklier", "diabetes type 2", "hoge bloeddruk", "cholesterol",
  "artrose", "reuma", "migraine", "burnout", "slapeloosheid",
  "prostaat", "incontinentie", "osteoporose", "eczeem",
  "candida", "lekkende darm", "histamine-intolerantie",
  "ADHD", "autisme", "depressie", "angst",
].join(", ");

const LIFEPLUS_BRAND_HINTS = [
  "Lifeplus", "Proanthenols", "OmeGold", "Evening Primrose Oil",
  "Daily BioBasics", "Women's Special", "Men's Special",
  "TVM-Plus", "Ubiquinol", "Biotic Blast", "Colloidal Silver",
  "Mena Plus", "Co-Q-10", "CalMag Plus",
].join(", ");

function bouwWhisperPrompt(taal: string): string {
  // Whisper gebruikt deze prompt om woordgebruik te biasen, niet als instructie.
  // Zo herkent hij "Proanthenols" i.p.v. "pro antenols", "colitis ulcerosa" correct, etc.
  if (taal === "nl" || !taal) {
    return `Transcript van een Nederlandstalige netwerkmarketing coach die spreekt over Lifeplus supplementen en gezondheid. Producten: ${PRODUCT_NAMEN_LIJST}. Merk- en fonetische hints: ${LIFEPLUS_BRAND_HINTS}. Medische termen die voor kunnen komen: ${MEDISCHE_TERMEN}.`;
  }
  return `Transcript of a network marketing coach talking about Lifeplus supplements and health. Products: ${PRODUCT_NAMEN_LIJST}. Brand hints: ${LIFEPLUS_BRAND_HINTS}.`;
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
