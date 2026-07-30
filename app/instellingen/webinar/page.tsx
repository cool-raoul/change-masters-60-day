import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { genereerBotToken } from "@/lib/freebie-bots/token";
import { SITE_URL } from "@/lib/site";
import { WebinarInstellingenForm } from "./instellingen-form";
import { WebinarLinkBlok } from "./link-blok";

// ============================================================
// /instellingen/webinar
//
// Twee delen:
//   - Iedereen: je eigen deel-link plus je aanmeldingen.
//   - Founder: de video, de teksten en de actie-knop instellen.
//
// De masterclass zelf is er één voor het hele team (één opname,
// één set teksten). Wat per persoon verschilt is de link, zodat
// elke aanmelding bij de juiste member in de namenlijst landt.
// ============================================================

export const dynamic = "force-dynamic";

export default async function WebinarInstellingen() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isFounder = (prof as { role?: string | null } | null)?.role === "founder";

  const admin = createAdminClient();

  // Eigen deel-token ophalen of aanmaken.
  const { data: bestaand } = await admin
    .from("freebie_bot_member_tokens")
    .select("token")
    .eq("member_id", user.id)
    .eq("bot_slug", "webinar")
    .maybeSingle();
  let token = (bestaand as { token?: string } | null)?.token ?? null;
  if (!token) {
    const nieuw = genereerBotToken();
    const { data: ingevoegd } = await admin
      .from("freebie_bot_member_tokens")
      .insert({ member_id: user.id, bot_slug: "webinar", token: nieuw })
      .select("token")
      .maybeSingle();
    token = (ingevoegd as { token?: string } | null)?.token ?? nieuw;
  }

  const { data: configRij } = await admin
    .from("webinar_config")
    .select("*")
    .eq("id", "standaard")
    .maybeSingle();
  const config = (configRij ?? {}) as Record<string, unknown>;

  const { data: inschrijvingen } = await admin
    .from("webinar_inschrijvingen")
    .select("id, naam, email, slot_start, status, created_at")
    .eq("member_id", user.id)
    .order("created_at", { ascending: false })
    .limit(25);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <Link
        href="/instellingen"
        className="text-sm text-cm-white opacity-70 hover:opacity-100"
      >
        ← Terug naar instellingen
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          🎥 Masterclass
        </h1>
        <p className="text-cm-white/70 text-sm mt-1 leading-relaxed">
          Een opgenomen masterclass die je kunt delen. Mensen kiezen zelf een
          moment, krijgen een herinnering, en jij ziet ze verschijnen in je
          namenlijst.
        </p>
      </div>

      <WebinarLinkBlok
        url={`${SITE_URL}/webinar/${token}`}
        titel={(config.titel as string) ?? "de masterclass"}
      />

      {isFounder && (
        <WebinarInstellingenForm
          config={{
            titel: (config.titel as string) ?? "",
            ondertitel: (config.ondertitel as string) ?? "",
            video_url: (config.video_url as string) ?? "",
            duur_minuten: (config.duur_minuten as number) ?? 45,
            intro_tekst: (config.intro_tekst as string) ?? "",
            actie_label: (config.actie_label as string) ?? "",
            actie_uitleg: (config.actie_uitleg as string) ?? "",
            actief: config.actief !== false,
          }}
        />
      )}

      <div className="card space-y-3">
        <h2 className="text-cm-gold font-semibold">Jouw aanmeldingen</h2>
        {(inschrijvingen ?? []).length === 0 ? (
          <p className="text-cm-white/60 text-sm">
            Nog geen aanmeldingen. Deel je link en ze verschijnen hier, en
            tegelijk op je namenlijst.
          </p>
        ) : (
          <ul className="space-y-2">
            {(
              (inschrijvingen ?? []) as {
                id: string;
                naam: string;
                email: string;
                slot_start: string;
                status: string;
              }[]
            ).map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between gap-3 text-sm border-b border-cm-border pb-2"
              >
                <div className="min-w-0">
                  <p className="text-cm-white truncate">{i.naam}</p>
                  <p className="text-cm-white/50 text-xs truncate">
                    {new Intl.DateTimeFormat("nl-NL", {
                      timeZone: "Europe/Amsterdam",
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(i.slot_start))}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    i.status === "actie"
                      ? "bg-emerald-900/40 text-emerald-300"
                      : i.status === "gekeken"
                        ? "bg-cm-gold/15 text-cm-gold"
                        : "bg-cm-surface text-cm-white/60"
                  }`}
                >
                  {i.status === "actie"
                    ? "wil meer weten"
                    : i.status === "gekeken"
                      ? "heeft gekeken"
                      : "aangemeld"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
