// File: app/jouw-gezonde-start/page.tsx
//
// Mooie publieke link (onder de podcast-video gedeeld) voor "Jouw gezonde
// start". Redirect naar /bot/jouw-gezonde-start/<token> zodat de bestaande
// freebie-bot-architectuur werkt en de lead in de pijplijn komt.
//
// Per-member URLs gaan direct naar /bot/jouw-gezonde-start/<token>. Deze
// landing pakt nu het default-account (placeholder = founder; later Sandy).

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { genereerBotToken } from "@/lib/freebie-bots/token";

export const dynamic = "force-dynamic";

// Default-account voor de publieke podcast-link. TODO: omzetten naar Sandy
// zodra haar account + bot-token bestaan. Tot dan founder als placeholder.
const DEFAULT_EMAIL = "raoulzeewijk@hotmail.com";
const BOT_SLUG = "jouw-gezonde-start";

export default async function GezondeStartLanding({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = createAdminClient();

  const { data: account } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", DEFAULT_EMAIL)
    .maybeSingle();

  if (!account?.id) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm text-gray-600">
          Deze pagina is nog niet gekoppeld aan een account. Neem even contact op
          via Instagram.
        </p>
      </main>
    );
  }

  const { data: bestaand } = await supabase
    .from("freebie_bot_member_tokens")
    .select("token")
    .eq("member_id", account.id)
    .eq("bot_slug", BOT_SLUG)
    .maybeSingle();

  let token = bestaand?.token;
  if (!token) {
    const nieuwToken = genereerBotToken();
    const { error } = await supabase.from("freebie_bot_member_tokens").insert({
      member_id: account.id,
      bot_slug: BOT_SLUG,
      token: nieuwToken,
    });
    if (!error) token = nieuwToken;
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <p className="text-sm text-gray-600">
          Er ging iets mis. Probeer het later opnieuw.
        </p>
      </main>
    );
  }

  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(sp)) {
    if (typeof val === "string") qs.set(key, val);
  }
  if (!qs.has("utm_source") && !qs.has("bron")) qs.set("bron", "podcast");

  const suffix = qs.toString();
  redirect(`/bot/${BOT_SLUG}/${token}${suffix ? `?${suffix}` : ""}`);
}
