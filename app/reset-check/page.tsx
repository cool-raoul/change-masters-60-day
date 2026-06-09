// File: app/reset-check/page.tsx
//
// Publieke landing voor de podcast-link en social-shares zonder
// specifieke afzender. Redirect naar /bot/reset-check/<founder-token>
// zodat de inzending in de founder-pijplijn terechtkomt en de bestaande
// freebie-bot-architectuur werkt.
//
// Per-member URLs gaan altijd direct naar /bot/reset-check/<token> via
// /instellingen/mijn-tracking-links — die slaan deze landing over.

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { genereerBotToken } from "@/lib/freebie-bots/token";

export const dynamic = "force-dynamic";

// Default-account voor de publieke podcast-link. Tijdens pilot: Raoul.
const DEFAULT_FOUNDER_EMAIL = "raoulzeewijk@hotmail.com";
const BOT_SLUG = "reset-check";

export default async function ResetCheckLandingPagina({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = createAdminClient();

  // Vind de default-founder
  const { data: founderProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", DEFAULT_FOUNDER_EMAIL)
    .maybeSingle();

  if (!founderProfile?.id) {
    // Geen founder gevonden, dan tonen we een nette fallback
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm text-gray-600">
          De Reset-check is nog niet gekoppeld aan een account. Neem contact op via Instagram.
        </p>
      </main>
    );
  }

  // Bestaande token ophalen of nieuwe aanmaken
  const { data: bestaand } = await supabase
    .from("freebie_bot_member_tokens")
    .select("token")
    .eq("member_id", founderProfile.id)
    .eq("bot_slug", BOT_SLUG)
    .maybeSingle();

  let token = bestaand?.token;
  if (!token) {
    const nieuwToken = genereerBotToken();
    const { error } = await supabase.from("freebie_bot_member_tokens").insert({
      member_id: founderProfile.id,
      bot_slug: BOT_SLUG,
      token: nieuwToken,
    });
    if (error) {
      console.error("kon publieke reset-check token niet aanmaken", error);
    } else {
      token = nieuwToken;
    }
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm text-gray-600">Er ging iets mis. Probeer het later opnieuw.</p>
      </main>
    );
  }

  // Behoud query-params (herkomst-tracking via ?utm_source etc.)
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(sp)) {
    if (typeof val === "string") qs.set(key, val);
  }
  // Default herkomst-tag voor podcast als er geen utm is
  if (!qs.has("utm_source") && !qs.has("bron")) {
    qs.set("bron", "podcast");
  }

  const suffix = qs.toString();
  redirect(`/bot/${BOT_SLUG}/${token}${suffix ? `?${suffix}` : ""}`);
}
