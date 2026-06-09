// File: app/instellingen/mijn-tracking-links/page.tsx
//
// Member-dashboard, sectie "Mijn freebies". Toont per freebie de
// persoonlijke tracking-URL met kopieer-knop.
//
// Twee types freebies:
// 1. Productadvies-vragenlijst (open-template) - voor IEDEREEN
//    (Sprint, Core, Pro), bestaat al langer in ELEVA.
// 2. Score-bots (Energie & Focus, Hormonen & Overgang) - voor iedereen,
//    pilot voor de freebie-toolkit. Oude AI-spiegel-bots (Tweede Lente,
//    Tweede Wind) zijn vervangen, oude tokens blijven in DB maar staan
//    niet meer in deze lijst.

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { genereerBotToken } from "@/lib/freebie-bots/token";
import {
  haalProductadviesStats,
  haalScoreBotStats,
} from "@/lib/freebie-bots/stats";
import { StatTegel } from "@/components/freebies/FreebieStatsBlok";
import { ManyChatHandleiding } from "@/components/freebies/ManyChatHandleiding";
import { InstagramLinkBuilder } from "@/components/freebies/InstagramLinkBuilder";
import { KopieerKnop } from "./kopieer-knop";

export const dynamic = "force-dynamic";

const FREEBIE_BOTS = [
  {
    slug: "energie-en-focus",
    titel: "Energie & Focus",
    ondertitel: "Score-vragenlijst met uitgebreid leefstijl-advies",
    triggerVoorbeeld: "ENERGIE",
    iconEmoji: "⚡",
    coreOnly: false,
    kleur: "sky" as const,
    actief: true,
  },
  {
    slug: "hormonen-en-overgang",
    titel: "Hormonen & Overgang",
    ondertitel:
      "Score-vragenlijst over hormoon-signalen met uitgebreid leefstijl-advies",
    triggerVoorbeeld: "OVERGANG",
    iconEmoji: "🌸",
    coreOnly: false,
    kleur: "rose" as const,
    actief: true,
  },
  {
    slug: "reset-check",
    titel: "Klopt de Reset bij jou?",
    ondertitel:
      "Holistic Reset persoonlijke check, met heat-score per lead en investerings-filter",
    triggerVoorbeeld: "RESET",
    iconEmoji: "🌿",
    coreOnly: false,
    kleur: "emerald" as const,
    actief: true,
  },
] as const;

function genereerOpenToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "open-";
  for (let i = 0; i < 14; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default async function MijnTrackingLinksPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Pagina toegankelijk voor iedereen die is ingelogd. Per freebie
  // wordt apart bepaald of die zichtbaar is op basis van modus / rol.
  const { data: profile } = await supabase
    .from("profiles")
    .select("modus, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder = (profile as { role?: string } | null)?.role === "founder";
  const isCore = (profile as { modus?: string } | null)?.modus === "core";
  const ziet_core_bots = isFounder || isCore;
  const memberVoornaam =
    ((profile as { full_name?: string } | null)?.full_name ?? "")
      .split(" ")[0] || "jij";

  // 1. Tokens ophalen / aanmaken voor de freebie-bots. Filter op:
  // - actief (feature-flag in code)
  // - coreOnly + member-modus
  const tokensPerBot: Record<string, string> = {};
  for (const bot of FREEBIE_BOTS) {
    if (!bot.actief) continue;
    if (bot.coreOnly && !ziet_core_bots) continue;
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

  // 2. Productadvies-vragenlijst (open-template) token ophalen / aanmaken
  let productadviesToken: string | null = null;
  {
    const { data: bestaande } = await supabase
      .from("productadvies_tests")
      .select("token")
      .eq("member_id", user.id)
      .eq("is_open_template", true)
      .maybeSingle();
    if (bestaande?.token) {
      productadviesToken = bestaande.token;
    } else {
      const nieuw = genereerOpenToken();
      const { data: inserted } = await supabase
        .from("productadvies_tests")
        .insert({
          token: nieuw,
          member_id: user.id,
          prospect_id: null,
          is_open_template: true,
          status: "verstuurd",
        })
        .select("token")
        .single();
      productadviesToken = inserted?.token ?? nieuw;
    }
  }

  // Bouw volledige origin met fallback
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const protocol =
    headersList.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (host ? `${protocol}://${host}` : "");

  const productadviesUrl = `${origin}/test/${productadviesToken}`;

  // Stats per freebie ophalen. Voor elke score-bot apart, zodat de
  // funnel-cijfers per bot zichtbaar zijn.
  const productadviesStats = await haalProductadviesStats(supabase, user.id);
  const statsPerBot: Record<
    string,
    Awaited<ReturnType<typeof haalScoreBotStats>>
  > = {};
  for (const bot of FREEBIE_BOTS) {
    if (!bot.actief) continue;
    if (bot.coreOnly && !ziet_core_bots) continue;
    statsPerBot[bot.slug] = await haalScoreBotStats(
      supabase,
      user.id,
      bot.slug,
      bot.titel,
    );
  }

  // Eerste zichtbare bot voor de ManyChat-voorbeeldlink fallback
  const eersteZichtbareBot = FREEBIE_BOTS.find(
    (b) => b.actief && (!b.coreOnly || ziet_core_bots),
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-semibold">🎁 Mijn freebies</h1>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        Jouw persoonlijke links naar onze freebies. Iedereen die via jouw
        link een freebie doet, komt automatisch als prospect op jouw
        namenlijst.
      </p>

      {/* Sectie 1, Productadvies-vragenlijst (voor iedereen) */}
      <section className="mt-8">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xl">
              📋
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Productadvies-vragenlijst</h2>
              <p className="mt-1 text-sm text-slate-400">
                Korte vragenlijst van drie minuten. Aan het eind krijgt de
                invuller een pakket-advies dat past bij wat zij of hij
                aangeeft.
              </p>
            </div>
          </div>

          {/* Stats voor productadvies. Echte conversie = klant geworden,
              niet alleen ingevuld. Voor diepere stats: link naar /statistieken. */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatTegel
              label="Verzonden"
              waarde={productadviesStats.totaalVerzonden}
              kleur="slate"
            />
            <StatTegel
              label="Ingevuld"
              waarde={productadviesStats.ingevuld}
              kleur="emerald"
            />
            <StatTegel
              label="Klant"
              waarde={productadviesStats.klanten}
              kleur="gold"
              hint="Prospects via deze freebie die nu shopper of member zijn"
            />
            <StatTegel
              label="Klant %"
              waarde={`${productadviesStats.klantPct}%`}
              kleur="gold"
              hint="Echte conversie"
            />
          </div>

          <div className="mt-4 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 break-all">
            {productadviesUrl}
          </div>
          <KopieerKnop tekst={productadviesUrl} />

          <InstagramLinkBuilder basisUrl={productadviesUrl} />

          <details className="mt-4 text-sm text-slate-400">
            <summary className="cursor-pointer hover:text-slate-200">
              Hoe gebruik je deze link?
            </summary>
            <p className="mt-2 text-xs leading-relaxed bg-slate-900/60 p-3 rounded-lg">
              Deel deze link via social media, in een nieuwsbrief, op een
              event of in een persoonlijk bericht. Wie de link opent vult
              eerst zijn naam plus e-mail of telefoon in, daarna doorloopt
              hij of zij de vragenlijst, en jij krijgt direct de uitkomst
              op zijn of haar prospect-kaart in je namenlijst.
            </p>
          </details>
        </div>
      </section>

      {/* Sectie 2, Score-bots */}
      {FREEBIE_BOTS.some(
        (b) => b.actief && (!b.coreOnly || ziet_core_bots),
      ) && (
        <section className="mt-6 space-y-4">
          {FREEBIE_BOTS.map((bot) => {
            if (!bot.actief) return null;
            if (bot.coreOnly && !ziet_core_bots) return null;
            const url = `${origin}/bot/${bot.slug}/${tokensPerBot[bot.slug]}`;
            const stats = statsPerBot[bot.slug];
            const randKleur =
              bot.kleur === "sky"
                ? "border-sky-500/40 bg-sky-500/5"
                : bot.kleur === "rose"
                  ? "border-rose-500/40 bg-rose-500/5"
                  : "border-emerald-500/40 bg-emerald-500/5";
            const cirkelKleur =
              bot.kleur === "sky"
                ? "bg-sky-500/20"
                : bot.kleur === "rose"
                  ? "bg-rose-500/20"
                  : "bg-emerald-500/20";
            return (
              <div
                key={bot.slug}
                className={`rounded-2xl border ${randKleur} p-5`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${cirkelKleur} text-xl`}
                  >
                    {bot.iconEmoji}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{bot.titel}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {bot.ondertitel}
                    </p>
                  </div>
                </div>

                {/* Stats per bot. Echte conversie = klant geworden. Voor
                    pipeline-spreiding + funnel-balk: link naar /statistieken. */}
                {stats && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <StatTegel
                      label="Ingetekend"
                      waarde={stats.totaalIngetekend}
                      kleur="slate"
                    />
                    <StatTegel
                      label="Afgemaakt"
                      waarde={stats.vragenlijstAfgemaakt}
                      kleur="emerald"
                    />
                    <StatTegel
                      label="Contact"
                      waarde={stats.contactGevraagd}
                      kleur="rose"
                    />
                    <StatTegel
                      label="Klant"
                      waarde={stats.klanten}
                      kleur="gold"
                      hint="Prospects die nu shopper of member zijn"
                    />
                    <StatTegel
                      label="Klant %"
                      waarde={`${stats.klantPct}%`}
                      kleur="gold"
                      hint="Echte conversie"
                    />
                  </div>
                )}

                <div className="mt-4 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 break-all">
                  {url}
                </div>
                <KopieerKnop tekst={url} />

                <InstagramLinkBuilder basisUrl={url} />

                <details className="mt-4 text-sm text-slate-400">
                  <summary className="cursor-pointer hover:text-slate-200">
                    Voorbeeld-zin voor social-post
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed bg-slate-900/60 p-3 rounded-lg">
                    &quot;Wil je in vijf minuten je eigen score zien op{" "}
                    {bot.titel.toLowerCase()}? Reageer met{" "}
                    {bot.triggerVoorbeeld} en {memberVoornaam} stuurt je
                    de persoonlijke link.&quot;
                  </p>
                  <p className="mt-2 text-xs">
                    De persoon reageert, jij stuurt via DM jouw link
                    hierboven. Zo houd je controle over wie hem krijgt.
                  </p>
                </details>
              </div>
            );
          })}
        </section>
      )}

      {/* Bestellinks-info, tonen als er minimaal één bot zichtbaar is */}
      {eersteZichtbareBot && (
        <section className="mt-10 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
          <h3 className="text-base font-medium text-rose-100">
            Belangrijk: koppel je bestellinks
          </h3>
          <p className="mt-1 text-sm text-rose-200/80 leading-relaxed">
            De score-bots tonen pakket-niveaus (essential / plus /
            complete). Onder elk niveau verschijnt jouw persoonlijke
            bestellink uit je{" "}
            <a
              href="/instellingen/bestellinks"
              className="text-rose-100 underline hover:text-white"
            >
              bestellinks-instellingen
            </a>
            . Heb je voor een niveau geen link ingesteld, dan ziet de
            invuller een tekst dat ze jou even een berichtje mag sturen.
          </p>
        </section>
      )}

      {/* ManyChat-handleiding voor optionele Instagram-trigger-
          automatisering. Voorbeeld-link is van de eerste zichtbare bot
          (of de productadvies-link als geen bot zichtbaar is). */}
      <ManyChatHandleiding
        voorbeeldLink={
          eersteZichtbareBot && tokensPerBot[eersteZichtbareBot.slug]
            ? `${origin}/bot/${eersteZichtbareBot.slug}/${tokensPerBot[eersteZichtbareBot.slug]}`
            : productadviesUrl
        }
        triggerVoorbeeld={
          eersteZichtbareBot?.triggerVoorbeeld ?? "PRODUCTADVIES"
        }
      />

      <section className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <h3 className="text-base font-medium text-emerald-100">
          📊 Volledige funnel en pipeline-spreiding
        </h3>
        <p className="mt-1 text-sm text-emerald-200/80 leading-relaxed">
          Op{" "}
          <a
            href="/statistieken"
            className="text-emerald-100 underline hover:text-white"
          >
            de statistieken-pagina
          </a>
          {" "}zie je per freebie de complete funnel (ingetekend → afgemaakt
          → klant) en waar je leads NU staan in je pijplijn.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
        <h3 className="text-base font-medium text-amber-100">
          Meer freebies komen later
        </h3>
        <p className="mt-1 text-sm text-amber-200/80">
          Energie & Focus en Hormonen & Overgang zijn de eerste score-bots.
          Daarna volgen andere onderwerpen, allemaal met dezelfde
          architectuur en claim-vrije bewaking.
        </p>
      </section>
    </main>
  );
}
