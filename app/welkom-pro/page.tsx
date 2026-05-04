import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import { EditableTekst } from "@/components/cms/EditableTekst";
import { haalTekstOverrides } from "@/lib/cms/tekst-overrides";
import { MODUS_WELKOMSTFILM_SLUGS } from "@/lib/films/embed";

// ============================================================
// /welkom-pro, welkomstpagina voor de Professional-flow
//
// Voor coaches, diëtisten, fitness-trainers etc. die producten via een
// eigen webshop aan hun cliënten willen aanbieden. Geeft direct toegang
// tot de bestaande tools (productadvies-test, namenlijst, Mentor, etc.)
// zodat een nieuwe Pro-member direct aan de slag kan, ook al wordt de
// rijkere 10-14 daagse onboarding nog rolling bijgebouwd.
//
// Bewerkbaar voor founders:
// - Hoofdtitel, intro-tekst, "volgende stappen"-tekst (via EditableTekst)
// - Welkomstfilm bovenaan (via /instellingen/films, slug "modus-welkom-pro")
// ============================================================

export const dynamic = "force-dynamic";

export default async function WelkomProPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check modus, alleen Pro-gebruikers zien deze pagina
  const { data: profile } = await supabase
    .from("profiles")
    .select("modus, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const profielData =
    (profile as { modus?: string | null; full_name?: string | null; role?: string | null } | null) ?? {};
  const modus = profielData.modus;
  if (modus !== "pro") {
    if (modus === "sprint") redirect("/dashboard");
    if (modus === "core") redirect("/welkom-core");
    redirect("/welkom-keuze");
  }

  const naam = profielData.full_name?.split(" ")[0] || "";
  const isFounder = profielData.role === "founder";

  // Founder-overrides eenmalig prefetchen voor alle EditableTekst-velden op deze pagina
  const overrides = await haalTekstOverrides(supabase, "welkom-pro");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Welkomstfilm, alleen zichtbaar als de founder een YouTube/Vimeo-link
          heeft gekoppeld aan slug "modus-welkom-pro" via /instellingen/films */}
      <FilmInBlok slug={MODUS_WELKOMSTFILM_SLUGS.PRO} verbergZonderFilm />

      <div>
        <h1 className="text-3xl font-display font-bold text-cm-white">
          <EditableTekst
            namespace="welkom-pro"
            sleutel="titel"
            standaard={`Welkom${naam ? `, ${naam}` : ""} 💼`}
            overrides={overrides}
            isFounder={isFounder}
            as="span"
            hint="Hoofdtitel van de Pro-welkomstpagina. {naam} wordt automatisch ingevuld als bekend."
          />
        </h1>
        <EditableTekst
          namespace="welkom-pro"
          sleutel="intro"
          standaard="Jouw plek voor het bedienen van eigen cliënten via een eigen Lifeplus-webshop. Hieronder de vijf tools waar je direct mee aan de slag kunt."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white opacity-80 mt-2 leading-relaxed"
          multiline
          rows={3}
          hint="Korte introductie onder de titel."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/test-pakket-bouwer"
          className="card hover:border-cm-gold-dim transition-colors group"
        >
          <h2 className="text-cm-gold font-display font-bold text-lg flex items-center gap-2">
            🎯 Productadvies-test
          </h2>
          <p className="text-cm-white text-sm opacity-80 mt-2 leading-relaxed">
            Stuur je cliënt een korte test, krijg automatisch een passend pakket-advies dat je kunt aanpassen voor je cliënt.
          </p>
          <span className="text-cm-gold text-sm mt-3 inline-block group-hover:translate-x-1 transition-transform">
            Open →
          </span>
        </Link>

        <Link
          href="/namenlijst"
          className="card hover:border-cm-gold-dim transition-colors group"
        >
          <h2 className="text-cm-gold font-display font-bold text-lg flex items-center gap-2">
            📋 Cliëntenlijst
          </h2>
          <p className="text-cm-white text-sm opacity-80 mt-2 leading-relaxed">
            Houd je cliënten bij, met notities, herhaalbestellingen en voortgang. De namenlijst-functie werkt ook voor cliënten.
          </p>
          <span className="text-cm-gold text-sm mt-3 inline-block group-hover:translate-x-1 transition-transform">
            Open →
          </span>
        </Link>

        <Link
          href="/coach"
          className="card hover:border-cm-gold-dim transition-colors group"
        >
          <h2 className="text-cm-gold font-display font-bold text-lg flex items-center gap-2">
            🤖 ELEVA Mentor
          </h2>
          <p className="text-cm-white text-sm opacity-80 mt-2 leading-relaxed">
            Stel vragen over producten, pakketten, omgaan met cliënten of business-aanpak. De Mentor kent het hele vak.
          </p>
          <span className="text-cm-gold text-sm mt-3 inline-block group-hover:translate-x-1 transition-transform">
            Open →
          </span>
        </Link>

        <Link
          href="/scripts"
          className="card hover:border-cm-gold-dim transition-colors group"
        >
          <h2 className="text-cm-gold font-display font-bold text-lg flex items-center gap-2">
            📋 Scripts &amp; teksten
          </h2>
          <p className="text-cm-white text-sm opacity-80 mt-2 leading-relaxed">
            Kant-en-klare scripts voor productadvies-gesprekken, hercontact en cliëntbediening. Kopiëren, aanpassen, sturen.
          </p>
          <span className="text-cm-gold text-sm mt-3 inline-block group-hover:translate-x-1 transition-transform">
            Open →
          </span>
        </Link>

        <Link
          href="/instellingen/bestellinks"
          className="card hover:border-cm-gold-dim transition-colors group sm:col-span-2"
        >
          <h2 className="text-cm-gold font-display font-bold text-lg flex items-center gap-2">
            🛒 Webshop-instellingen
          </h2>
          <p className="text-cm-white text-sm opacity-80 mt-2 leading-relaxed">
            Stel je standaardpakketten in en koppel je Lifeplus-webshop. Hier maak je de basis voor het bedienen van je cliënten.
          </p>
          <span className="text-cm-gold text-sm mt-3 inline-block group-hover:translate-x-1 transition-transform">
            Open →
          </span>
        </Link>
      </div>

      <div className="card border-gold-subtle">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-2">
          De volgende stappen
        </h2>
        <EditableTekst
          namespace="welkom-pro"
          sleutel="volgende-stappen"
          standaard="De begeleidende stap-voor-stap-onboarding voor de Professional-flow wordt rolling uitgebreid met dagelijkse lessen en korte oefeningen. Voor nu kun je vrij door de tools heen werken op het tempo dat jou past. Bij vragen of twijfel: open de ELEVA Mentor of neem contact op met je sponsor."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm opacity-90 leading-relaxed"
          multiline
          rows={4}
          hint='Tekst onderaan de pagina, "wat komt er nog aan / waar zoek ik hulp" boodschap.'
        />
      </div>
    </div>
  );
}
