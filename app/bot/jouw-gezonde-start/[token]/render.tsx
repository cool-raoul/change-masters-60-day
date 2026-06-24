// Gedeelde renderer voor "Jouw gezonde start", zodat zowel de token-route
// (/bot/jouw-gezonde-start/<token>) als de leesbare slug-route
// (/start/<woord>) exact dezelfde freebie tonen op basis van een token.

import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { haalTekstOverrides } from "@/lib/cms/tekst-overrides";
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { WelkomstfilmSpeler } from "@/components/freebies/WelkomstfilmSpeler";
import { GezondeStartFlow } from "./flow";

export const NAMESPACE = "jouw-gezonde-start";
const DEFAULT_ACCOUNT_EMAIL = "raoulzeewijk@hotmail.com";

type FilmRij = {
  welkomstfilm_soort?: string | null;
  welkomstfilm_url?: string | null;
  informatiefilm_soort?: string | null;
  informatiefilm_url?: string | null;
};

export async function RenderGezondeStart({ token }: { token: string }) {
  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("freebie_bot_member_tokens")
    .select("member_id, bot_slug, welkomstfilm_soort, welkomstfilm_url")
    .eq("token", token)
    .maybeSingle();

  if (!row || row.bot_slug !== NAMESPACE) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", row.member_id)
    .maybeSingle();

  const memberVoornaam =
    ((profile?.full_name ?? "") as string).split(" ")[0] || "iemand";

  // Algemene films komen van het default-account (de podcast-landing / founder).
  const { data: def } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", DEFAULT_ACCOUNT_EMAIL)
    .maybeSingle();

  let defWelkomSoort: string | null = null;
  let defWelkomUrl: string | null = null;
  let infoSoort: string | null = null;
  let infoUrl: string | null = null;
  if (def?.id) {
    const { data: defTok } = await supabase
      .from("freebie_bot_member_tokens")
      .select(
        "welkomstfilm_soort, welkomstfilm_url, informatiefilm_soort, informatiefilm_url",
      )
      .eq("member_id", def.id)
      .eq("bot_slug", NAMESPACE)
      .maybeSingle();
    const t = (defTok as FilmRij | null) ?? null;
    defWelkomSoort = t?.welkomstfilm_soort ?? null;
    defWelkomUrl = t?.welkomstfilm_url ?? null;
    infoSoort = t?.informatiefilm_soort ?? null;
    infoUrl = t?.informatiefilm_url ?? null;
  }

  // Welkomstfilm: eigen film van dit lid, anders de algemene default.
  const welkomSoort = (row as FilmRij).welkomstfilm_soort ?? defWelkomSoort;
  const welkomUrl = (row as FilmRij).welkomstfilm_url ?? defWelkomUrl;

  const welkomFilm = <WelkomstfilmSpeler soort={welkomSoort} url={welkomUrl} />;

  // Founder die de pagina bekijkt mag elke tekst aanpassen (voor iedereen).
  const sessie = await createClient();
  const {
    data: { user: viewer },
  } = await sessie.auth.getUser();
  let isFounder = false;
  if (viewer) {
    const { data: vp } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", viewer.id)
      .maybeSingle();
    isFounder = (vp as { role?: string } | null)?.role === "founder";
  }
  const tekstOverrides = await haalTekstOverrides(supabase, NAMESPACE);

  return (
    <EditModeProvider>
      {isFounder && (
        <div className="fixed top-4 right-4 z-50">
          <EditModeToggle isFounder={true} />
        </div>
      )}
      <GezondeStartFlow
        token={token}
        memberVoornaam={memberVoornaam}
        welkomFilm={welkomFilm}
        infoFilmSoort={infoSoort}
        infoFilmUrl={infoUrl}
        tekstOverrides={tekstOverrides}
        isFounder={isFounder}
      />
    </EditModeProvider>
  );
}
