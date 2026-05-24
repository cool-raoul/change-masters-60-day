// File: app/instellingen/mijn-tracking-links/page.tsx
//
// Member-dashboard, sectie "Mijn freebie-bot-links". Toont per bot de
// persoonlijke tracking-URL met kopieer-knop. Voor pilot alleen Tweede
// Lente actief. Genereert token aan bij eerste bezoek.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { genereerBotToken } from "@/lib/freebie-bots/token";
import { KopieerKnop } from "./kopieer-knop";

export const dynamic = "force-dynamic";

const ACTIEVE_BOTS = [
  {
    slug: "tweede-lente",
    titel: "Tweede Lente",
    beschrijving:
      "Vijf-minuten spiegel voor vrouwen in peri-, volle of post-overgang.",
    triggerVoorbeeld: "TWEEDE-LENTE",
  },
];

export default async function MijnTrackingLinksPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Voor elke actieve bot: haal of maak token aan
  const tokensPerBot: Record<string, string> = {};
  for (const bot of ACTIEVE_BOTS) {
    const { data: bestaand } = await supabase
      .from("freebie_bot_member_tokens")
      .select("token")
      .eq("member_id", user.id)
      .eq("bot_slug", bot.slug)
      .maybeSingle();

    if (bestaand?.token) {
      tokensPerBot[bot.slug] = bestaand.token;
      continue;
    }

    const nieuweToken = genereerBotToken();
    const { data: inserted } = await supabase
      .from("freebie_bot_member_tokens")
      .insert({
        member_id: user.id,
        bot_slug: bot.slug,
        token: nieuweToken,
      })
      .select("token")
      .single();

    tokensPerBot[bot.slug] = inserted?.token ?? nieuweToken;
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-semibold">🔗 Mijn freebie-bot-links</h1>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        Dit zijn jouw persoonlijke links naar onze freebie-bots. Iedereen
        die via jouw link de bot doet, komt in jouw klantomgeving terecht.
      </p>

      <section className="mt-8 space-y-4">
        {ACTIEVE_BOTS.map((bot) => {
          const url = `${origin}/bot/${bot.slug}/${tokensPerBot[bot.slug]}`;
          return (
            <div
              key={bot.slug}
              className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5"
            >
              <h2 className="text-lg font-semibold">{bot.titel}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {bot.beschrijving}
              </p>

              <div className="mt-4 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 break-all">
                {url}
              </div>
              <KopieerKnop tekst={url} />

              <details className="mt-4 text-sm text-slate-400">
                <summary className="cursor-pointer hover:text-slate-200">
                  Voorbeeld-zin voor social-post
                </summary>
                <p className="mt-2 text-xs leading-relaxed bg-slate-900/60 p-3 rounded-lg">
                  &quot;Wil je vijf minuten naar je eigen ritme kijken in deze
                  fase? Reageer met {bot.triggerVoorbeeld} en ik stuur je
                  mijn persoonlijke link.&quot;
                </p>
                <p className="mt-2 text-xs">
                  De vrouw reageert, jij stuurt haar via DM jouw link
                  hierboven. Zo houd je controle over wie haar krijgt.
                </p>
              </details>
            </div>
          );
        })}
      </section>

      <section className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
        <h3 className="text-base font-medium text-amber-100">
          Meer bots komen later
        </h3>
        <p className="mt-1 text-sm text-amber-200/80">
          Tweede Lente is de pilot. Daarna volgen Slaap-Loep, Energie-Loep
          en andere onderwerpen. Allemaal met dezelfde architectuur en
          claim-vrije bewaking.
        </p>
      </section>
    </main>
  );
}
