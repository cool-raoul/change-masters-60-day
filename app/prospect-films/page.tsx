// File: app/prospect-films/page.tsx
//
// "Films voor prospects" onder 🧰 Mijn tools. Film-eerst: je ziet welke
// films er zijn, bekijkt ze zelf, en stuurt er daarna een naar iemand.
//
// De knop "📺 Stuur film" op de kaart van een prospect blijft bestaan.
// Die is persoon-eerst (je bent al bij iemand en kiest een film); deze
// pagina is de andere kant op (je kent de film en zoekt de persoon).
// Beide gebruiken dezelfde /api/prospect-film/share-link, dus het kijk-
// gedrag en de herinnering werken precies hetzelfde.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  PROSPECT_FILM_SLUGS,
  PROSPECT_FILM_BESCHRIJVINGEN,
} from "@/lib/films/embed";
import { FilmsOverzicht } from "./films-overzicht";

export const dynamic = "force-dynamic";

export default async function ProspectFilmsPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const slugs = Object.values(PROSPECT_FILM_SLUGS);

  const [{ data: films }, { data: prospects }, { data: profiel }] =
    await Promise.all([
      supabase
        .from("films")
        .select("slug, titel, beschrijving, video_url, tonen")
        .in("slug", slugs),
      supabase
        .from("prospects")
        .select("id, volledige_naam, email, telefoon, pipeline_fase, actief")
        .eq("user_id", user.id)
        .order("volledige_naam"),
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    ]);

  const filmMap = new Map(
    (
      (films as Array<{
        slug: string;
        titel: string | null;
        beschrijving: string | null;
        video_url: string | null;
        tonen: boolean | null;
      }>) || []
    ).map((f) => [f.slug, f]),
  );

  // Alleen films die de hoofdbeheerder daadwerkelijk gevuld heeft. De lege
  // plekken (prospect-6-extra t/m 10) laten we weg: die zeggen een member
  // niets en maken de pagina alleen maar voller.
  const beschikbareFilms = slugs
    .map((slug) => {
      const f = filmMap.get(slug);
      const meta = PROSPECT_FILM_BESCHRIJVINGEN[slug];
      return {
        slug,
        titel: f?.titel || meta?.suggestieTitel || slug,
        beschrijving: f?.beschrijving || meta?.voorbeeldIntro || "",
        videoUrl: f?.video_url ?? null,
        beschikbaar: !!f?.video_url && f?.tonen !== false,
      };
    })
    .filter((f) => f.beschikbaar);

  const memberVoornaam =
    ((profiel as { full_name?: string } | null)?.full_name ?? "").split(
      " ",
    )[0] || "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          📺 Films voor prospects
        </h1>
        <p className="text-cm-white opacity-70 text-sm mt-1 leading-relaxed">
          Kies een film, kies wie je 'm stuurt. ELEVA maakt er een
          persoonlijke link van. Je ziet hier terug wanneer iemand gekeken
          heeft, en je krijgt een herinnering om op te volgen.
        </p>
      </div>

      <FilmsOverzicht
        films={beschikbareFilms}
        prospects={
          (prospects as Array<{
            id: string;
            volledige_naam: string;
            email: string | null;
            telefoon: string | null;
            pipeline_fase: string | null;
            actief: boolean | null;
          }>) ?? []
        }
        memberVoornaam={memberVoornaam}
      />
    </div>
  );
}
