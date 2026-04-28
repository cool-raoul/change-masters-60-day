import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import { PIPELINE_FASEN } from "@/lib/supabase/types";
import { ProspectActieForm } from "@/components/namenlijst/ProspectActieForm";
import { ContactLogLijst } from "@/components/namenlijst/ContactLogLijst";
import { ContactgegevensForm } from "@/components/namenlijst/ContactgegevensForm";
import { OnboardingChecklist } from "@/components/namenlijst/OnboardingChecklist";
import { IngezetteTools } from "@/components/namenlijst/IngezetteTools";
import { DriewegGesprekInklapbaar } from "@/components/namenlijst/DriewegGesprek";
import { ProspectVerwijderKnop } from "@/components/namenlijst/ProspectVerwijderKnop";
import { CoachGesprekkenInklapbaar } from "@/components/namenlijst/CoachGesprekkenInklapbaar";
// ProductadviesKnop is bewust niet meer in de kaart-header opgenomen om de
// drukte rechtsboven te verminderen. Triggeren via /coach met prospect-context.
// import { ProductadviesKnop } from "@/components/namenlijst/ProductadviesKnop";
import { ProductadviesTestKnop } from "@/components/namenlijst/ProductadviesTestKnop";
import { ActiefToggle } from "@/components/namenlijst/ActiefToggle";
import { HerinneringenOpKaart } from "@/components/namenlijst/HerinneringenOpKaart";
import { ProductBestellingenLijst } from "@/components/namenlijst/ProductBestellingenLijst";
// productadviesBeschikbaar wordt gebruikt door de Coach (mentor); niet meer
// nodig op deze pagina sinds de directe knop is verwijderd.
// import { productadviesBeschikbaar } from "@/lib/features/productadvies";
import { getServerTaal, v } from "@/lib/i18n/server";
import { Locale } from "date-fns";

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

export default async function ProspectDetailPagina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const taal = await getServerTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;

  const [
    { data: prospect },
    { data: contactLogs },
    { data: bestellingen },
    { data: coachGesprekken },
    { data: eigenProfiel },
    { data: herinneringen },
    { data: productadviesTest },
  ] = await Promise.all([
    supabase
      .from("prospects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("contact_logs")
      .select("*")
      .eq("prospect_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("product_bestellingen")
      .select("*")
      .eq("prospect_id", id)
      .order("besteldatum", { ascending: false }),
    supabase
      .from("ai_gesprekken")
      .select("id, titel, created_at, updated_at")
      .eq("prospect_id", id)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("sponsor_id, role, full_name")
      .eq("id", user.id)
      .single(),
    // Openstaande herinneringen voor deze prospect — toont ze op de kaart
    // i.p.v. alleen op /herinneringen. Context hoort bij de persoon.
    supabase
      .from("herinneringen")
      .select("*")
      .eq("prospect_id", id)
      .eq("user_id", user.id)
      .eq("voltooid", false)
      .order("vervaldatum", { ascending: true }),
    // Meest recente productadvies-test voor deze prospect
    supabase
      .from("productadvies_tests")
      .select("token, status, trigger_60day, uitslag, ingevuld_op, darmvragenlijst_uitslag, darmvragenlijst_ingevuld_op")
      .eq("prospect_id", id)
      .eq("member_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!prospect) notFound();

  // Haal sponsor naam op via sponsor_id
  const sponsorId = (eigenProfiel as any)?.sponsor_id;
  const eigenRol = (eigenProfiel as any)?.role;
  let sponsorNaam: string = "";

  if (sponsorId) {
    // Gebruiker heeft een gekoppelde sponsor → gebruik die naam
    const { data: sponsorProfiel } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", sponsorId)
      .single();
    sponsorNaam = sponsorProfiel?.full_name ?? "";
  } else if (eigenRol === "leider") {
    // Leider (Raoul/Gaby) zit bovenaan de stamboom → hun sponsor is Ramon Sant
    sponsorNaam = "Ramon Sant";
  } else {
    // Teamlid zonder sponsor_id → terugvallen op de leider(s)
    const { data: leiders } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("role", "leider")
      .order("created_at", { ascending: true });
    if (leiders && leiders.length > 0) {
      sponsorNaam = leiders.map((l: { full_name: string }) => l.full_name).join(" / ");
    } else {
      sponsorNaam = "Ramon Sant";
    }
  }

  const faseInfo = PIPELINE_FASEN.find((f) => f.fase === prospect.pipeline_fase);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header — naam BOVEN, knoppen verspreid daaronder zodat het rechts
          niet meer een grote stapel wordt op smalle schermen. */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Link
            href="/namenlijst"
            className="text-cm-white hover:text-cm-white text-xl pt-1"
          >
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-cm-white break-words">
              {prospect.volledige_naam}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ color: faseInfo?.tekstkleur, background: `${faseInfo?.kleur}` }}
              >
                {faseInfo?.label}
              </span>
              {prospect.prioriteit === "hoog" && (
                <span className="text-cm-gold text-xs">{v("prospect.hoge_prioriteit", taal)}</span>
              )}
              {(prospect.pipeline_fase === "member" || prospect.pipeline_fase === "shopper") && (
                <ActiefToggle
                  prospectId={id}
                  prospectNaam={prospect.volledige_naam}
                  actief={prospect.actief ?? true}
                />
              )}
              {prospect.actief === false && (
                <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  💤 Niet-actief
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actie-rij — links: ELEVA Mentor (hoofdactie). Rechts: vragenlijst-
            chips + verwijder-prospect (secundair). De losse Productadvies-knop
            is hieruit weggehaald: dat triggeren we voortaan via de Mentor zodat
            de header rustiger wordt. */}
        <div className="flex flex-wrap items-center justify-between gap-2 pl-9">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/coach?prospect=${id}`}
              className="btn-secondary text-sm"
            >
              🤖 {v("nav.coach", taal)}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ProductadviesTestKnop
              prospectId={id}
              prospectNaam={prospect.volledige_naam}
              memberNaam={(eigenProfiel as any)?.full_name ?? "je member"}
              bestaande={
                productadviesTest
                  ? {
                      token: productadviesTest.token,
                      status: productadviesTest.status as
                        | "verstuurd"
                        | "ingevuld"
                        | "geen",
                      trigger_60day: productadviesTest.trigger_60day,
                      uitslag: productadviesTest.uitslag as any,
                      ingevuld_op: productadviesTest.ingevuld_op,
                      darmvragenlijst_uitslag:
                        productadviesTest.darmvragenlijst_uitslag as any,
                      darmvragenlijst_ingevuld_op:
                        productadviesTest.darmvragenlijst_ingevuld_op,
                    }
                  : null
              }
            />
            <ProspectVerwijderKnop
              prospectId={id}
              prospectNaam={prospect.volledige_naam}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contactgegevens */}
        <div className="card space-y-3">
          {/* Productbestellingen — bovenaan zodat meest relevante data eerst opvalt.
              Client component: bewerken + verwijderen direct hier, zonder modal. */}
          {bestellingen && bestellingen.length > 0 && (
            <ProductBestellingenLijst
              bestellingen={bestellingen}
              titel={v("prospect.bestellingen", taal)}
              herinneringLabel={v("prospect.herinnering", taal)}
              taal={taal}
            />
          )}

          <ContactgegevensForm prospect={prospect} />

          <div className="border-t border-cm-border pt-3 mt-3">
            <p className="text-xs text-cm-white opacity-60">{v("prospect.toegevoegd", taal)}</p>
            <p className="text-cm-white text-sm">
              {format(new Date(prospect.created_at), "d MMMM yyyy", { locale: datumLocale })}
            </p>
          </div>

          {/* Ingezette tools/media — afvinkbare dropdown */}
          <IngezetteTools
            prospectId={id}
            ingezet={prospect.ingezette_tools || []}
          />

          {/* Onboarding checklist — helemaal onderaan (alleen zichtbaar bij members) */}
          <OnboardingChecklist prospect={prospect} />
        </div>

        {/* Acties + contactlog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Openstaande herinneringen — bovenaan zodat ze direct zichtbaar zijn */}
          <HerinneringenOpKaart herinneringen={herinneringen || []} />
          <ProspectActieForm prospect={prospect} userId={user.id} />
          <ContactLogLijst
            contactLogs={contactLogs || []}
            prospect={prospect}
            userId={user.id}
          />

          {/* 3-weg gesprek — inklapbaar */}
          <DriewegGesprekInklapbaar
            prospectNaam={prospect.volledige_naam}
            prospectSituatie={prospect.notities || undefined}
            sponsorNaam={sponsorNaam}
          />

          {/* ELEVA Mentor gesprekken — inklapbaar */}
          <CoachGesprekkenInklapbaar
            gesprekken={coachGesprekken || []}
            prospectId={id}
            prospectNaam={prospect.volledige_naam}
          />
        </div>
      </div>
    </div>
  );
}
