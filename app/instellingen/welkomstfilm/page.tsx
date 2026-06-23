// File: app/instellingen/welkomstfilm/page.tsx
//
// Beheer van de eigen welkomstfilm voor "Jouw gezonde start". Nu alleen voor
// founders + Sandy (gefaseerde vrijgave). Erft de instellingen-layout (AppShell).

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { WelkomstfilmKiezer } from "@/components/freebies/WelkomstfilmKiezer";

export const dynamic = "force-dynamic";

const BOT_SLUG = "jouw-gezonde-start";
// Pre-release: founders + Sandy. Later vrijgeven voor iedereen.
const TOEGESTANE_EMAILS = ["sandy@wrsparkling.com"];

export default async function WelkomstfilmPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  const rol = (profiel as { role?: string } | null)?.role;
  const eigenEmail = ((profiel as { email?: string } | null)?.email ?? "").toLowerCase();
  const mag = rol === "founder" || TOEGESTANE_EMAILS.includes(eigenEmail);

  if (!mag) {
    return (
      <div className="card text-sm text-cm-white/70">
        Deze functie komt binnenkort voor iedereen beschikbaar.
      </div>
    );
  }

  // Huidige eigen film van dit lid ophalen.
  const admin = createAdminClient();
  const { data: tok } = await admin
    .from("freebie_bot_member_tokens")
    .select("welkomstfilm_soort, welkomstfilm_url")
    .eq("member_id", user.id)
    .eq("bot_slug", BOT_SLUG)
    .maybeSingle();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          Jouw welkomstfilm
        </h1>
        <p className="text-cm-white/70 text-sm mt-1 leading-relaxed">
          Dit is het filmpje dat mensen als eerste zien in jouw freebie "Jouw
          gezonde start". Stel je eigen film in via een YouTube- of Vimeo-link,
          of upload er een vanaf je computer of telefoon. Doe je niks, dan staat
          de algemene welkomstfilm aan.
        </p>
      </div>
      <div className="card">
        <WelkomstfilmKiezer
          botSlug={BOT_SLUG}
          huidigeSoort={(tok as { welkomstfilm_soort?: string | null } | null)?.welkomstfilm_soort ?? null}
          huidigeUrl={(tok as { welkomstfilm_url?: string | null } | null)?.welkomstfilm_url ?? null}
        />
      </div>
    </div>
  );
}
