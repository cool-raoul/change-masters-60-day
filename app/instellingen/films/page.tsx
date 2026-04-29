import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SLUG_BESCHRIJVINGEN, ONBOARDING_FILM_SLUGS } from "@/lib/films/embed";
import { FilmRowEditor } from "./film-row-editor";

// ============================================================
// Settings — Films-CMS (alleen leiders/founders)
// URL: /instellingen/films
//
// Leiders/founders kunnen hier per slug een YouTube/Vimeo URL plakken.
// De films-tabel + embed-component nemen het over: ELEVA host geen
// video's zelf.
//
// Voor de eerste rondes is dit een eenvoudige UI: per slot een rij met
// titel/url/beschrijving/aan-uit. Geen massa-import, geen versies. Dat
// kan in fase 2 als de feature-set groeit.
// ============================================================

export const dynamic = "force-dynamic";

export default async function FilmsBeheerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Alleen founder (hoofdbeheerder) mag films beheren. Iedereen ziet de
  // films op hun plek; één persoon onderhoudt de bibliotheek voor het hele
  // systeem. In fase 2 kunnen we dit verbreden naar 'leider' als leiders
  // eigen films voor hun team mogen plaatsen.
  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const rol = (profiel as { role?: string | null } | null)?.role ?? "";
  const magBeheren = rol === "founder";

  const { data: films } = await supabase
    .from("films")
    .select("id, slug, titel, beschrijving, belangrijk, video_url, tonen, duur_seconden, updated_at")
    .order("slug", { ascending: true });

  const filmsMap = new Map(
    (films ?? []).map((f: any) => [f.slug, f]),
  );

  // Standaard-slots die we in onboarding gebruiken — altijd zichtbaar
  // ook als ze nog geen film-rij hebben.
  const standaardSlots = Object.values(ONBOARDING_FILM_SLUGS);

  // Eventuele extra slugs die al in de DB staan (custom toegevoegde films)
  const dbSlugs = (films ?? []).map((f: any) => f.slug);
  const extraSlugs = dbSlugs.filter((s) => !standaardSlots.includes(s as any));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            🎬 Films beheren
          </h1>
          <p className="text-cm-white opacity-60 mt-1">
            Plak per slot een YouTube/Vimeo-link. Members en prospects zien
            de embed automatisch op de juiste plek.
          </p>
        </div>
        <Link href="/instellingen" className="btn-secondary text-sm">
          ← Terug naar instellingen
        </Link>
      </div>

      {!magBeheren ? (
        <div className="card border-l-4 border-amber-500">
          <p className="text-cm-white">
            Films worden centraal beheerd door de hoofdbeheerder. Heb je een
            specifieke film nodig of moet er iets gewijzigd worden? Stuur het
            verzoek naar je sponsor.
          </p>
        </div>
      ) : (
        <>
          <div className="card border-gold-subtle">
            <h2 className="text-cm-gold font-semibold mb-2">Hoe het werkt</h2>
            <ul className="text-cm-white text-sm space-y-2 opacity-90">
              <li>
                • Upload je film op <strong>YouTube</strong> (zet hem op
                "Niet vermeld" / unlisted) of <strong>Vimeo</strong>.
              </li>
              <li>
                • Kopieer de share-link en plak hem in het juiste slot
                hieronder. Ook <code>youtu.be/...</code>, <code>vimeo.com/...</code>{" "}
                en al-embed-URLs werken.
              </li>
              <li>
                • Geef een titel + korte beschrijving — die ziet de gebruiker
                onder/naast de film.
              </li>
              <li>
                • Met het <strong>Tonen</strong>-vinkje kun je een film
                tijdelijk verbergen zonder hem te verwijderen.
              </li>
            </ul>
          </div>

          {/* Onboarding-slots */}
          <section>
            <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
              Onboarding-films
            </h2>
            <div className="space-y-3">
              {standaardSlots.map((slug) => {
                const film = filmsMap.get(slug) as any;
                const meta = SLUG_BESCHRIJVINGEN[slug];
                return (
                  <FilmRowEditor
                    key={slug}
                    slug={slug}
                    plekBeschrijving={meta?.plek ?? slug}
                    suggestieTitel={meta?.suggestieTitel ?? ""}
                    bestaande={film ?? null}
                    userId={user.id}
                  />
                );
              })}
            </div>
          </section>

          {/* Extra slugs die in DB staan maar niet in onze standaard lijst */}
          {extraSlugs.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
                Andere films
              </h2>
              <div className="space-y-3">
                {extraSlugs.map((slug) => {
                  const film = filmsMap.get(slug) as any;
                  return (
                    <FilmRowEditor
                      key={slug}
                      slug={slug}
                      plekBeschrijving={`Custom slot: ${slug}`}
                      suggestieTitel=""
                      bestaande={film}
                      userId={user.id}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Nieuwe slug toevoegen */}
          <section>
            <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
              Nieuwe film toevoegen
            </h2>
            <FilmRowEditor
              slug=""
              plekBeschrijving="Nieuwe slug — vul zelf in (bv. prospect-intro-1)"
              suggestieTitel=""
              bestaande={null}
              userId={user.id}
              isNieuw
            />
          </section>
        </>
      )}
    </div>
  );
}
