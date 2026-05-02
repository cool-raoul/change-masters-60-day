import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  SLUG_BESCHRIJVINGEN,
  ONBOARDING_FILM_SLUGS,
  WELKOMSTFILM_SLUG,
  PROSPECT_FILM_SLUGS,
  PROSPECT_FILM_BESCHRIJVINGEN,
} from "@/lib/films/embed";
import { FilmRowEditor } from "./film-row-editor";

// ============================================================
// Settings, Films-CMS (alleen leiders/founders)
// URL: /instellingen/films
//
// Leiders/founders kunnen hier per slug een YouTube/Vimeo URL plakken.
// De films-tabel + embed-component nemen het over: ELEVA host geen
// video's zelf.
//
// Voor de eerste rondes is dit een eenvoudige UI: per slot een rij met
// titel/url/beschrijving/aan-uit. Geen massa-import, geen versies. Dat
// kan later als de feature-set groeit.
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
  // systeem. Later kunnen we dit verbreden naar 'leider' als leiders
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

  // Standaard-slots die we in onboarding gebruiken, altijd zichtbaar
  // ook als ze nog geen film-rij hebben.
  const standaardSlots = Object.values(ONBOARDING_FILM_SLUGS);

  // Optionele dag-films: per playbook-dag (1-21) één slot waar je
  // bovenin de dagtegel een korte intro-/inspiratiefilm kan plaatsen.
  // Niet verplicht, bij lege URL toont de tegel niets bovenaan.
  const dagFilmSlots: string[] = Array.from(
    { length: 21 },
    (_, i) => `playbook-dag-${i + 1}`,
  );

  const prospectFilmSlots = Object.values(PROSPECT_FILM_SLUGS);

  // Eventuele extra slugs die al in de DB staan (custom toegevoegde films)
  const dbSlugs = (films ?? []).map((f: any) => f.slug);
  const bekendeSlugs = new Set<string>([
    WELKOMSTFILM_SLUG,
    ...prospectFilmSlots,
    ...standaardSlots,
    ...dagFilmSlots,
  ]);
  const extraSlugs = dbSlugs.filter((s) => !bekendeSlugs.has(s));

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
                • Geef een titel + korte beschrijving, die ziet de gebruiker
                onder/naast de film.
              </li>
              <li>
                • Met het <strong>Tonen</strong>-vinkje kun je een film
                tijdelijk verbergen zonder hem te verwijderen.
              </li>
            </ul>
          </div>

          {/* Welkomstfilm: pop-up bij eerste dashboard-bezoek + Topbar 🎬-knop */}
          <section>
            <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-2">
              🎬 Welkomstfilm
            </h2>
            <p className="text-cm-white opacity-60 text-xs mb-3 leading-relaxed">
              Verschijnt automatisch als pop-up de eerste keer dat een nieuwe
              member /dashboard opent. Daarna altijd terug op te roepen via
              de 🎬-knop in de Topbar. Houd 'm kort (2-3 min): wie ben jij,
              wat is ELEVA, hoe werkt het systeem, en "vertrouw het proces".
            </p>
            <div className="space-y-3">
              <FilmRowEditor
                slug={WELKOMSTFILM_SLUG}
                plekBeschrijving={
                  SLUG_BESCHRIJVINGEN[WELKOMSTFILM_SLUG]?.plek ?? WELKOMSTFILM_SLUG
                }
                suggestieTitel={
                  SLUG_BESCHRIJVINGEN[WELKOMSTFILM_SLUG]?.suggestieTitel ?? ""
                }
                bestaande={(filmsMap.get(WELKOMSTFILM_SLUG) as any) ?? null}
                userId={user.id}
              />
            </div>
          </section>

          {/* Playbook-admin-slots, staan in dag 2/3/4 van het 21-daagse playbook */}
          <section>
            <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
              Playbook-films (dag 2-4)
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

          {/* Prospect-films: members kunnen deze met een unieke share-link
              naar individuele prospects sturen. Tracking + auto-pipeline-shift
              naar followup-fase bij afgekeken. */}
          <section>
            <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-2">
              📺 Prospect-films
            </h2>
            <p className="text-cm-white opacity-60 text-xs mb-3 leading-relaxed">
              Members sturen deze films naar individuele prospects via een
              unieke share-link (knop op elke prospect-kaart). Wanneer de
              prospect 'm afkijkt: member krijgt een herinnering, en de
              prospect schuift automatisch naar de followup-fase. Vul de
              slots die je gebruikt, lege slots verschijnen voor members
              gewoon niet als optie.
            </p>
            <div className="space-y-3">
              {prospectFilmSlots.map((slug) => {
                const film = filmsMap.get(slug) as any;
                const meta = PROSPECT_FILM_BESCHRIJVINGEN[slug];
                return (
                  <FilmRowEditor
                    key={slug}
                    slug={slug}
                    plekBeschrijving={
                      meta
                        ? `Prospect-film: ${meta.suggestieTitel}`
                        : `Prospect-film: ${slug}`
                    }
                    suggestieTitel={meta?.suggestieTitel ?? ""}
                    bestaande={film ?? null}
                    userId={user.id}
                  />
                );
              })}
            </div>
          </section>

          {/* Optionele dag-films, bovenaan de dagtegel in het 21-daagse playbook.
              Niet verplicht: lege slot = geen film boven de dagtegel. */}
          <section>
            <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-2">
              Dag-films (optioneel, 21 dagen)
            </h2>
            <p className="text-cm-white opacity-60 text-xs mb-3 leading-relaxed">
              Per dag kun je hier een korte intro-/inspiratiefilm toevoegen die
              bovenaan de dagtegel verschijnt. Laat een dag leeg en de tegel
              toont op die dag automatisch geen film-blok.
            </p>
            <div className="space-y-3">
              {dagFilmSlots.map((slug, i) => {
                const film = filmsMap.get(slug) as any;
                const dagNummer = i + 1;
                return (
                  <FilmRowEditor
                    key={slug}
                    slug={slug}
                    plekBeschrijving={`Playbook dag ${dagNummer}, bovenaan de dagtegel`}
                    suggestieTitel={`Dag ${dagNummer}, intro`}
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
              plekBeschrijving="Nieuwe slug, vul zelf in (bv. prospect-intro-1)"
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
