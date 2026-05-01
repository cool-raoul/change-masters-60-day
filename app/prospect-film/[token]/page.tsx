import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normaliseerNaarEmbed,
  PROSPECT_FILM_BESCHRIJVINGEN,
} from "@/lib/films/embed";
import { ProspectFilmClient } from "./prospect-film-client";

// ============================================================
// /prospect-film/[token], publieke pagina voor de prospect.
//
// Geen AppShell, geen sidebar. Alleen: korte intro, embed-film, CTA
// 'Ik heb 'm bekeken'. De prospect heeft geen account; verificatie
// gebeurt via de share-token.
//
// Tracking via /api/prospect-film/markeer (gestart bij iframe-load,
// afgekeken bij CTA-klik). Bij afgekeken: member krijgt herinnering,
// prospect schuift naar followup-fase.
// ============================================================

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ token: string }>;
};

export default async function ProspectFilmPagina({ params }: RouteProps) {
  const { token } = await params;
  if (!token) notFound();

  const admin = createAdminClient();

  // Haal view + film op via token (service-role: prospect heeft geen account).
  const { data: view } = await admin
    .from("prospect_film_views")
    .select("id, share_token, film_slug, member_user_id, afgekeken_op")
    .eq("share_token", token)
    .maybeSingle();
  if (!view) notFound();

  const v = view as {
    id: string;
    share_token: string;
    film_slug: string;
    member_user_id: string;
    afgekeken_op: string | null;
  };

  const { data: filmRow } = await admin
    .from("films")
    .select("titel, beschrijving, video_url, tonen")
    .eq("slug", v.film_slug)
    .maybeSingle();

  const film = filmRow as
    | { titel: string; beschrijving: string | null; video_url: string | null; tonen: boolean }
    | null;

  // Member-naam voor warmer copy ("[Naam] heeft je een film gestuurd")
  const { data: profielRow } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", v.member_user_id)
    .maybeSingle();
  const memberNaam =
    (profielRow as { full_name?: string | null } | null)?.full_name ?? "";

  const meta = PROSPECT_FILM_BESCHRIJVINGEN[v.film_slug] ?? {
    suggestieTitel: film?.titel || "Een film van je netwerk",
    voorbeeldIntro:
      "Hieronder een korte film, neem even rust en kijk 'm rustig door.",
    callToAction: "Ik heb 'm bekeken",
  };

  const embedUrl = normaliseerNaarEmbed(film?.video_url);

  return (
    <ProspectFilmClient
      token={token}
      memberVoornaam={memberNaam.split(" ")[0] || ""}
      filmTitel={film?.titel || meta.suggestieTitel}
      filmBeschrijving={film?.beschrijving || null}
      embedUrl={embedUrl}
      voorbeeldIntro={meta.voorbeeldIntro}
      callToAction={meta.callToAction}
      reedsAfgekeken={!!v.afgekeken_op}
      filmBeschikbaar={!!film?.tonen && !!embedUrl}
    />
  );
}
