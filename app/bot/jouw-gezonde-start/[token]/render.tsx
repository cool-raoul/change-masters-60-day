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
import { DEFAULT_FREEBIE_ACCOUNT_EMAIL } from "@/lib/freebie-bots/default-account";
import { GezondeStartFlow } from "./flow";

export const NAMESPACE = "jouw-gezonde-start";

type FilmRij = {
  welkomstfilm_soort?: string | null;
  welkomstfilm_url?: string | null;
  informatiefilm_soort?: string | null;
  informatiefilm_url?: string | null;
};

export async function RenderGezondeStart({ token }: { token: string }) {
  const supabase = createAdminClient();
  const sessie = await createClient();

  // Onafhankelijke queries parallel (publieke page-view, dus latency telt).
  // Ketens die op elkaars resultaat leunen blijven binnen hun eigen tak
  // sequentieel: default-account → default-token-rij, en viewer → rol.
  const [tokenRes, defFilms, isFounder, tekstOverrides] = await Promise.all([
    supabase
      .from("freebie_bot_member_tokens")
      .select("member_id, bot_slug, welkomstfilm_soort, welkomstfilm_url")
      .eq("token", token)
      .maybeSingle(),
    // Algemene films komen van het default-account (podcast-landing / founder).
    (async (): Promise<FilmRij | null> => {
      const { data: def } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", DEFAULT_FREEBIE_ACCOUNT_EMAIL)
        .maybeSingle();
      if (!def?.id) return null;
      const { data: defTok } = await supabase
        .from("freebie_bot_member_tokens")
        .select(
          "welkomstfilm_soort, welkomstfilm_url, informatiefilm_soort, informatiefilm_url",
        )
        .eq("member_id", def.id)
        .eq("bot_slug", NAMESPACE)
        .maybeSingle();
      return (defTok as FilmRij | null) ?? null;
    })(),
    // Founder die de pagina bekijkt mag elke tekst aanpassen (voor iedereen).
    (async (): Promise<boolean> => {
      const {
        data: { user: viewer },
      } = await sessie.auth.getUser();
      if (!viewer) return false;
      const { data: vp } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", viewer.id)
        .maybeSingle();
      return (vp as { role?: string } | null)?.role === "founder";
    })(),
    haalTekstOverrides(supabase, NAMESPACE),
  ]);

  const row = tokenRes.data;
  if (!row || row.bot_slug !== NAMESPACE) {
    notFound();
  }

  // Afhankelijk van de token-rij, dus na de Promise.all.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", row.member_id)
    .maybeSingle();

  const memberVoornaam =
    ((profile?.full_name ?? "") as string).split(" ")[0] || "iemand";

  const defWelkomSoort = defFilms?.welkomstfilm_soort ?? null;
  const defWelkomUrl = defFilms?.welkomstfilm_url ?? null;
  const infoSoort = defFilms?.informatiefilm_soort ?? null;
  const infoUrl = defFilms?.informatiefilm_url ?? null;

  // Welkomstfilm: eigen film van dit lid, anders de algemene default.
  const welkomSoort = (row as FilmRij).welkomstfilm_soort ?? defWelkomSoort;
  const welkomUrl = (row as FilmRij).welkomstfilm_url ?? defWelkomUrl;

  const welkomFilm = <WelkomstfilmSpeler soort={welkomSoort} url={welkomUrl} />;

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
