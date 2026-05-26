// File: app/instellingen/mijn-tracking-links/page.tsx
//
// Member-dashboard, sectie "Mijn freebies". Toont per freebie de
// persoonlijke tracking-URL met kopieer-knop.
//
// Twee types freebies:
// 1. Productadvies-vragenlijst (open-template) - voor IEDEREEN
//    (Sprint, Core, Pro), bestaat al langer in ELEVA.
// 2. Tweede Lente bot - alleen Core (+founder voor testen), pilot.

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { genereerBotToken } from "@/lib/freebie-bots/token";
import {
  haalProductadviesStats,
  haalTweedeLenteStats,
} from "@/lib/freebie-bots/stats";
import { StatTegel } from "@/components/freebies/FreebieStatsBlok";
import { ManyChatHandleiding } from "@/components/freebies/ManyChatHandleiding";
import { InstagramLinkBuilder } from "@/components/freebies/InstagramLinkBuilder";
import { KopieerKnop } from "./kopieer-knop";

export const dynamic = "force-dynamic";

// Feature-flag voor Tweede Wind. Standaard UIT tot Raoul groen licht geeft
// (definitieve naam bevestigen, Gaby's content invullen, etc.).
const TWEEDE_WIND_ZICHTBAAR = false;

const FREEBIE_BOTS = [
  {
    slug: "tweede-lente",
    titel: "Tweede Lente",
    ondertitel: "Persoonlijk overzicht voor wat speelt in en rond de overgang",
    triggerVoorbeeld: "TWEEDE-LENTE",
    iconEmoji: "🌷",
    coreOnly: true,
    kleur: "rose" as const,
    actief: true,
  },
  {
    slug: "tweede-wind",
    titel: "Tweede Wind",
    ondertitel: "Persoonlijk overzicht voor energie en focus",
    triggerVoorbeeld: "TWEEDE-WIND",
    iconEmoji: "⚡",
    coreOnly: false,
    kleur: "sky" as const,
    actief: TWEEDE_WIND_ZICHTBAAR,
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
  const ziet_tweede_lente = isFounder || isCore;
  const memberVoornaam =
    ((profile as { full_name?: string } | null)?.full_name ?? "")
      .split(" ")[0] || "jij";

  // 1. Tokens ophalen / aanmaken voor de freebie-bots. Filter op:
  // - actief (feature-flag in code)
  // - coreOnly + member-modus
  const tokensPerBot: Record<string, string> = {};
  for (const bot of FREEBIE_BOTS) {
    if (!bot.actief) continue;
    if (bot.coreOnly && !ziet_tweede_lente) continue;
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

  // Stats per freebie ophalen
  const productadviesStats = await haalProductadviesStats(supabase, user.id);
  const tweedeLenteStats = ziet_tweede_lente
    ? await haalTweedeLenteStats(supabase, user.id)
    : null;

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

      {/* Sectie 2, Freebie-bots (alleen voor Core + founders, of bots
          die niet coreOnly zijn) */}
      {FREEBIE_BOTS.some(
        (b) => b.actief && (!b.coreOnly || ziet_tweede_lente),
      ) && (
        <section className="mt-6 space-y-4">
          {FREEBIE_BOTS.map((bot) => {
            if (!bot.actief) return null;
            if (bot.coreOnly && !ziet_tweede_lente) return null;
            const url = `${origin}/bot/${bot.slug}/${tokensPerBot[bot.slug]}`;
            return (
              <div
                key={bot.slug}
                className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-xl">
                    {bot.iconEmoji}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{bot.titel}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {bot.ondertitel}
                    </p>
                  </div>
                </div>

                {/* Stats voor Tweede Lente. Echte conversie = klant
                    geworden. Voor pipeline-spreiding + funnel-balk: link
                    naar /statistieken. */}
                {tweedeLenteStats && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <StatTegel
                      label="Ingetekend"
                      waarde={tweedeLenteStats.totaalIngetekend}
                      kleur="slate"
                    />
                    <StatTegel
                      label="Afgemaakt"
                      waarde={tweedeLenteStats.vragenlijstAfgemaakt}
                      kleur="emerald"
                    />
                    <StatTegel
                      label="Contact"
                      waarde={tweedeLenteStats.contactGevraagd}
                      kleur="rose"
                    />
                    <StatTegel
                      label="Klant"
                      waarde={tweedeLenteStats.klanten}
                      kleur="gold"
                      hint="Prospects die nu shopper of member zijn"
                    />
                    <StatTegel
                      label="Klant %"
                      waarde={`${tweedeLenteStats.klantPct}%`}
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
                    &quot;Wil je vijf minuten naar je eigen ritme kijken
                    rond de overgang? Reageer met {bot.triggerVoorbeeld}{" "}
                    en {memberVoornaam} stuurt je de persoonlijke link.&quot;
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

      {/* Bestellinks-info, alleen tonen als Tweede Lente zichtbaar is */}
      {ziet_tweede_lente && (
        <section className="mt-10 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
          <h3 className="text-base font-medium text-rose-100">
            Belangrijk: koppel je bestellinks
          </h3>
          <p className="mt-1 text-sm text-rose-200/80 leading-relaxed">
            Tweede Lente toont drie pakket-niveaus voor hormoonbalans
            (essential / plus / complete). Onder elk niveau verschijnt
            jouw persoonlijke bestellink uit je{" "}
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

      {/* ManyChat-handleiding (uitklap-blok) voor optionele Instagram-
          trigger-automatisering. Werkt voor alle freebies (productadvies
          + Tweede Lente). Members hoeven dit niet, het is een extra. */}
      <ManyChatHandleiding
        voorbeeldLink={
          ziet_tweede_lente && tokensPerBot["tweede-lente"]
            ? `${origin}/bot/tweede-lente/${tokensPerBot["tweede-lente"]}`
            : productadviesUrl
        }
        triggerVoorbeeld="TWEEDE-LENTE"
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
          Tweede Lente is de eerste bot-pilot. Daarna volgen Slaap-Loep,
          Energie-Loep en andere onderwerpen, allemaal met dezelfde
          architectuur en claim-vrije bewaking.
        </p>
      </section>
    </main>
  );
}
