import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  SLUG_BESCHRIJVINGEN,
  WELKOMSTFILM_SLUG,
  MODUS_WELKOMSTFILM_SLUGS,
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

  // ONBOARDING_FILM_SLUGS (webshop/teams/krediet/bestellinks) zijn niet
  // meer in deze UI gerenderd. Founders zetten film-URL's voor de admin-
  // items rechtstreeks op /setup/[slug]. Slugs leven nog in lib/films/
  // embed.ts voor backwards-compat met bestaande FilmInBlok-fallbacks.
  //
  // Playbook-dag-N slots (slug "playbook-dag-1" t/m "playbook-dag-21")
  // zijn per 2026-05-20 uit de Films-CMS UI gehaald. Founders plaatsen
  // dag-films voortaan direct op /vandaag via ✏️ edit-modus + MediaBlokken.
  // Reden: dubbel pad was ruis voor andere founders.
  //
  // Ook de "Andere films"-sectie (extraSlugs) en "Nieuwe film toevoegen"-
  // sectie zijn per 2026-05-20 verwijderd. Bestaande rijen in de films-
  // tabel blijven in de DB, niets verloren, ze renderen alleen niet meer
  // in deze UI. Nieuwe film-slugs uitbreiden gebeurt voortaan via code
  // (lib/films/embed.ts) zodat we niet eindigen met een wildgroei aan
  // ad-hoc slugs zonder duidelijke functie.

  const prospectFilmSlots = Object.values(PROSPECT_FILM_SLUGS);
  const modusWelkomstfilmSlots = Object.values(MODUS_WELKOMSTFILM_SLUGS);

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

          {/* Modus-welkomstfilms: drie pagina's waar founder zelf moeilijk
              naartoe kan navigeren (alleen nieuwe members zonder modus zien
              /welkom-keuze, Core/Pro hun eigen welkom-pagina). Vandaar
              centraal beheer hier, niet via MediaBlokken op die pagina's
              zelf. */}
          <section>
            <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-2">
              🌟 Modus-welkomstfilms (Keuze / Core / Pro)
            </h2>
            <p className="text-cm-white opacity-60 text-xs mb-3 leading-relaxed">
              Korte welkomstfilm bovenaan de keuze-pagina (voor nieuwe leden
              zonder modus) of de modus-eigen welkomstpagina (Core, Pro).
              Niet verplicht, lege URL = geen film bovenaan. Pas wanneer de
              gebruiker /welkom-keuze, /welkom-core of /welkom-pro opent
              ziet 'ie de film, dus test 'm via de tester-toolbar of een
              proefaccount.
            </p>
            <div className="space-y-3">
              {modusWelkomstfilmSlots.map((slug) => {
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

          {/* Playbook-films (dag 2-4) sectie is per 2026-05-20 weggehaald.
              De 4 admin-items (webshop, teams-admin, krediet, bestellinks)
              hebben hun eigen film-URL veld direct op /setup/[slug] via de
              paarse founder-strip. Dubbel pad was ruis. Onderliggende slugs
              (onboarding-stap-6/7/8/9-*) blijven werken voor bestaande
              fallback-rendering via huidigeTaak.filmSlug op /vandaag. */}

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

          {/* "Andere films" (extraSlugs) en "Nieuwe film toevoegen"-sectie
              zijn per 2026-05-20 verwijderd. Reden: voor founders zonder
              context was niet duidelijk waar die slots in het systeem
              terechtkomen. Uitbreiden van het aantal prospect-films of
              andere structurele plekken gebeurt voortaan via een code-
              wijziging in lib/films/embed.ts (PROSPECT_FILM_SLUGS,
              ONBOARDING_FILM_SLUGS, etc.), zodat elke slug een vaste
              functie heeft. */}
        </>
      )}
    </div>
  );
}
