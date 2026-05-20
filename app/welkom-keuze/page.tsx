import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import { EditableTekst } from "@/components/cms/EditableTekst";
import { haalTekstOverrides } from "@/lib/cms/tekst-overrides";
import { MODUS_WELKOMSTFILM_SLUGS } from "@/lib/films/embed";
import { ModusKiesKnoppen } from "./modus-kies-knoppen";
import { MediaBlokkenClient } from "@/components/cms/MediaBlokkenClient";

// ============================================================
// /welkom-keuze, eenmalige route-keuze voor nieuwe gebruikers
//
// Verschijnt zodra een nieuwe member is aangemaakt en zijn modus nog
// op NULL staat. Drie tegels: Sprint (60-dagen-bouwer), Core (webshop-
// strategie) en Pro (professional met cliënten). Member kiest één
// van drie, dan wordt de modus opgeslagen in profiles en redirect
// ELEVA naar de juiste welkomstpagina (Sprint → /dashboard, Core →
// /welkom-core, Pro → /welkom-pro).
//
// Tijdens pilot-fase 1 is Sprint open zichtbaar zodat het pilot-team
// (Raoul, Gaby, Juan, Sandy, Jaimie) er direct in kan. In een latere
// fase kunnen we Sprint achter een uitnodiging-tegel zetten.
// ============================================================

export const dynamic = "force-dynamic";

export default async function WelkomKeuzePagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Als modus al gekozen, redirect naar juiste plek
  const { data: profile } = await supabase
    .from("profiles")
    .select("modus, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const profielData =
    (profile as {
      modus?: string | null;
      full_name?: string | null;
      role?: string | null;
    } | null) ?? {};
  const modus = profielData.modus;

  if (modus === "sprint") redirect("/dashboard");
  if (modus === "core") redirect("/welkom-core");
  if (modus === "pro") redirect("/welkom-pro");

  const naam = profielData.full_name?.split(" ")[0] || "";
  const isFounder = profielData.role === "founder";

  const overrides = await haalTekstOverrides(supabase, "welkom-keuze");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Eigen header omdat de Topbar uit AppShell niet meer aanwezig is.
          Logo + brand-naam zodat de gebruiker direct ziet waar 'ie is. */}
      <div className="flex items-center gap-3 pb-2">
        <img
          src="/eleva-icon.png"
          alt="ELEVA"
          className="h-10 w-10 rounded-lg"
        />
        <div>
          <p className="eleva-brand text-xl leading-none">ELEVA</p>
          <p className="text-cm-white/55 text-[10px] tracking-wider uppercase mt-0.5">
            Project Meer Tijd en Vrijheid
          </p>
        </div>
      </div>

      {/* Welkomstfilm voor de keuze-pagina, via Films-CMS slot
          (modus-welkom-keuze). Founder beheert 'm via /instellingen/films
          → Modus-welkomstfilms. Reden voor Films-CMS i.p.v. MediaBlokken:
          welkomstfilms zijn lastig via MediaBlokken te beheren omdat de
          founder de welkomst-context (nieuwe-gebruiker-zonder-modus) niet
          altijd kan oproepen om bij de edit-modus te komen. */}
      <FilmInBlok slug={MODUS_WELKOMSTFILM_SLUGS.KEUZE} verbergZonderFilm />

      {/* Daarnaast een MediaBlokken-placeholder voor extra media op deze
          pagina (afbeelding, PDF, quote, etc.). Welkomstfilm zelf gaat
          via Films-CMS hierboven. */}
      <MediaBlokkenClient
        paginaNamespace="welkom-keuze"
        paginaId="hoofd"
        positie="boven-titel"
        isFounder={isFounder}
      />

      <div>
        <p className="text-cm-white/60 text-sm italic">
          {naam ? `Mooi dat je er bent, ${naam},` : "Mooi dat je er bent,"}
        </p>
        <h1 className="font-serif-warm text-2xl sm:text-3xl text-cm-white mt-1 leading-tight">
          <EditableTekst
            namespace="welkom-keuze"
            sleutel="titel"
            standaard={`welke kant ga je op? 👋`}
            overrides={overrides}
            isFounder={isFounder}
            as="span"
            hint="Hoofdtitel van de keuzepagina. {naam} wordt automatisch ingevuld via de groet erboven."
          />
        </h1>
        <EditableTekst
          namespace="welkom-keuze"
          sleutel="intro"
          standaard="Welke route past het beste bij wat jij wilt? Kies hieronder, je kunt altijd later switchen via je instellingen."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white/75 mt-3 leading-relaxed text-sm"
          multiline
          rows={3}
          hint="Korte introductie boven de twee keuze-tegels."
        />
      </div>

      <ModusKiesKnoppen userId={user.id}>
        <div data-slot="sprint-titel">
          <EditableTekst
            namespace="welkom-keuze"
            sleutel="sprint-titel"
            standaard="Sprint, 60-dagen-bouwer"
            overrides={overrides}
            isFounder={isFounder}
            as="span"
            hint="Titel van de Sprint-tegel."
          />
        </div>
        <div data-slot="sprint-uitleg">
          <EditableTekst
            namespace="welkom-keuze"
            sleutel="sprint-uitleg"
            standaard="Voor business-bouwers die in 60 dagen samen met een sprint-team een fundament willen leggen. Dagelijkse stap-voor-stap structuur, ritme + accountability, je zoekt mensen voor Core of Pro om met je mee te bouwen."
            overrides={overrides}
            isFounder={isFounder}
            as="span"
            multiline
            rows={4}
            hint="Beschrijving van wat de Sprint-route inhoudt."
          />
        </div>
        <div data-slot="core-titel">
          <EditableTekst
            namespace="welkom-keuze"
            sleutel="core-titel"
            standaard="Webshop-strategie"
            overrides={overrides}
            isFounder={isFounder}
            as="span"
            hint="Titel van de Core-tegel."
          />
        </div>
        <div data-slot="core-uitleg">
          <EditableTekst
            namespace="welkom-keuze"
            sleutel="core-uitleg"
            standaard="Bouw je eigen webshop op je eigen tempo. Via social media, content en gratis weggevers (freebies) breng je nieuwe klanten binnen. Geschikt voor ondernemende mensen die rustig willen opbouwen."
            overrides={overrides}
            isFounder={isFounder}
            as="span"
            multiline
            rows={4}
            hint="Beschrijving van wat de Core-route inhoudt."
          />
        </div>
        <div data-slot="pro-titel">
          <EditableTekst
            namespace="welkom-keuze"
            sleutel="pro-titel"
            standaard="Professional met cliënten"
            overrides={overrides}
            isFounder={isFounder}
            as="span"
            hint="Titel van de Pro-tegel."
          />
        </div>
        <div data-slot="pro-uitleg">
          <EditableTekst
            namespace="welkom-keuze"
            sleutel="pro-uitleg"
            standaard="Voor professionals (coaches, diëtisten, fitness-trainers, masseurs, etc.) die producten via een eigen webshop aan hun cliënten willen aanbieden. Pakketten samenstellen, productadvies-test als kerninstrument."
            overrides={overrides}
            isFounder={isFounder}
            as="span"
            multiline
            rows={4}
            hint="Beschrijving van wat de Pro-route inhoudt."
          />
        </div>
      </ModusKiesKnoppen>

      <div className="card border-gold-subtle text-center">
        <EditableTekst
          namespace="welkom-keuze"
          sleutel="onderkant"
          standaard="Twijfel je welke route past? Kies wat het meest klinkt als jij. Alle tools zijn voor beide routes beschikbaar, alleen de begeleidende stappen zijn anders. Je sponsor of de ELEVA Mentor kan je helpen als je twijfelt."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm opacity-80 leading-relaxed"
          multiline
          rows={3}
          hint="Geruststellende tekst onderaan voor wie twijfelt."
        />
      </div>
    </div>
  );
}
