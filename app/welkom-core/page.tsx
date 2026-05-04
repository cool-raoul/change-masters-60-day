import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import { EditableTekst } from "@/components/cms/EditableTekst";
import { haalTekstOverrides } from "@/lib/cms/tekst-overrides";
import { MODUS_WELKOMSTFILM_SLUGS } from "@/lib/films/embed";

// ============================================================
// /welkom-core, welkomstpagina voor de Core-flow (webshop-strategie)
//
// Voor ondernemende mensen die op eigen tempo een webshop willen
// opzetten en via social media + content + freebies klanten willen
// bereiken. Geeft direct toegang tot de bestaande tools, terwijl de
// rijkere 21-daagse webshop-onboarding rolling wordt bijgebouwd.
//
// Bewerkbaar voor founders:
// - Hoofdtitel, intro-tekst, "volgende stappen"-tekst (via EditableTekst)
// - Welkomstfilm bovenaan (via /instellingen/films, slug "modus-welkom-core")
// ============================================================

export const dynamic = "force-dynamic";

export default async function WelkomCorePagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check modus, alleen Core-gebruikers zien deze pagina
  const { data: profile } = await supabase
    .from("profiles")
    .select("modus, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const profielData =
    (profile as { modus?: string | null; full_name?: string | null; role?: string | null } | null) ?? {};
  const modus = profielData.modus;
  if (modus !== "core") {
    if (modus === "sprint") redirect("/dashboard");
    if (modus === "pro") redirect("/welkom-pro");
    redirect("/welkom-keuze");
  }

  const naam = profielData.full_name?.split(" ")[0] || "";
  const isFounder = profielData.role === "founder";

  const overrides = await haalTekstOverrides(supabase, "welkom-core");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FilmInBlok slug={MODUS_WELKOMSTFILM_SLUGS.CORE} verbergZonderFilm />

      <div>
        <h1 className="text-3xl font-display font-bold text-cm-white">
          <EditableTekst
            namespace="welkom-core"
            sleutel="titel"
            standaard={`Welkom${naam ? `, ${naam}` : ""} 🚶`}
            overrides={overrides}
            isFounder={isFounder}
            as="span"
            hint="Hoofdtitel van de Core-welkomstpagina. {naam} wordt automatisch ingevuld als bekend."
          />
        </h1>
        <EditableTekst
          namespace="welkom-core"
          sleutel="intro"
          standaard="Jouw plek om je eigen webshop op te bouwen en stap voor stap meer vrijheid te creëren. Hieronder de vijf tools waar je direct mee aan de slag kunt."
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
          href="/instellingen/bestellinks"
          className="card hover:border-cm-gold-dim transition-colors group"
        >
          <h2 className="text-cm-gold font-display font-bold text-lg flex items-center gap-2">
            🛒 Je webshop opzetten
          </h2>
          <p className="text-cm-white text-sm opacity-80 mt-2 leading-relaxed">
            Koppel je eigen Lifeplus-webshop en stel je verkooplinks in. Dit is jouw eerste stap richting vrijheid.
          </p>
          <span className="text-cm-gold text-sm mt-3 inline-block group-hover:translate-x-1 transition-transform">
            Open →
          </span>
        </Link>

        <Link
          href="/test-pakket-bouwer"
          className="card hover:border-cm-gold-dim transition-colors group"
        >
          <h2 className="text-cm-gold font-display font-bold text-lg flex items-center gap-2">
            🎯 Productadvies-test
          </h2>
          <p className="text-cm-white text-sm opacity-80 mt-2 leading-relaxed">
            Stuur prospects een korte test, krijg automatisch een passend pakket-advies dat je kunt delen via je webshop.
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
            Stel vragen over producten, marketing, social media-content of business-aanpak. Werkt 24/7.
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
            Voorgeschreven teksten voor sociale media-posts, productverhalen, Stories en hercontact-berichten.
          </p>
          <span className="text-cm-gold text-sm mt-3 inline-block group-hover:translate-x-1 transition-transform">
            Open →
          </span>
        </Link>

        <Link
          href="/namenlijst"
          className="card hover:border-cm-gold-dim transition-colors group sm:col-span-2"
        >
          <h2 className="text-cm-gold font-display font-bold text-lg flex items-center gap-2">
            👥 Je klantenlijst
          </h2>
          <p className="text-cm-white text-sm opacity-80 mt-2 leading-relaxed">
            Houd je prospects en klanten bij, met fase-tracking, herinneringen en notities. Voor wie via je webshop een product koopt of geïnteresseerd is.
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
          namespace="welkom-core"
          sleutel="volgende-stappen"
          standaard="De begeleidende stap-voor-stap-onboarding voor de webshop-strategie wordt rolling uitgebreid met dagelijkse lessen over social media-content, freebies en klantenwerving. Voor nu kun je vrij door de tools heen werken op het tempo dat jou past. Bij vragen: open de ELEVA Mentor of neem contact op met je sponsor."
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
