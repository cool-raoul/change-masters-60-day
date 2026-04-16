import Anthropic from "@anthropic-ai/sdk";

// Tijdelijk endpoint om te checken welke modellen beschikbaar zijn
// Verwijder na gebruik
export async function GET() {
  const apiKey = process.env.CM_CLAUDE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Geen API key" }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey });

  const modellen = [
    "claude-sonnet-4-6",
    "claude-haiku-3-5-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-haiku-20240307",
    "claude-haiku-3-5-latest",
    "claude-3-5-sonnet-20241022",
    "claude-sonnet-4-20250514",
  ];

  const resultaten: Record<string, string> = {};

  for (const model of modellen) {
    try {
      const res = await anthropic.messages.create({
        model,
        max_tokens: 5,
        messages: [{ role: "user", content: "Hi" }],
      });
      resultaten[model] = `✅ WERKT (${res.usage?.input_tokens || "?"}+${res.usage?.output_tokens || "?"} tokens)`;
    } catch (err: any) {
      const status = err?.status || "?";
      const msg = err?.error?.error?.message || err?.message || "onbekend";
      resultaten[model] = `❌ ${status}: ${msg}`;
    }
  }

  return Response.json({ resultaten }, { status: 200 });
}
