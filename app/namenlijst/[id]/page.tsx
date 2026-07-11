import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import { PIPELINE_FASEN } from "@/lib/supabase/types";
import { ProspectActieForm } from "@/components/namenlijst/ProspectActieForm";
import { ContactLogLijst } from "@/components/namenlijst/ContactLogLijst";
import { ContactgegevensForm } from "@/components/namenlijst/ContactgegevensForm";
import { IngezetteTools } from "@/components/namenlijst/IngezetteTools";
import { FreebieUitslag } from "@/components/namenlijst/FreebieUitslag";
import { DriewegGesprekInklapbaar } from "@/components/namenlijst/DriewegGesprek";
import { MiniElevaUitnodigKnop } from "@/components/namenlijst/MiniElevaUitnodigKnop";
import { MiniElevaActieveSessies } from "@/components/namenlijst/MiniElevaActieveSessies";
import { MiniElevaProspectChat } from "@/components/namenlijst/MiniElevaProspectChat";
import { AanpakKeuze } from "@/components/namenlijst/AanpakKeuze";
import { ProspectVerwijderKnop } from "@/components/namenlijst/ProspectVerwijderKnop";
import { CoachGesprekkenInklapbaar } from "@/components/namenlijst/CoachGesprekkenInklapbaar";
// ProductadviesKnop is bewust niet meer in de kaart-header opgenomen om de
// drukte rechtsboven te verminderen. Triggeren via /coach met prospect-context.
// import { ProductadviesKnop } from "@/components/namenlijst/ProductadviesKnop";
import { ProductadviesTestKnop } from "@/components/namenlijst/ProductadviesTestKnop";
import { StuurFreebieKnop } from "@/components/namenlijst/StuurFreebieKnop";
import { StuurFilmKnop } from "@/components/namenlijst/StuurFilmKnop";
import { VoiceUitnodigingKnop } from "@/components/namenlijst/VoiceUitnodigingKnop";
import { FilmKijkOverzicht } from "@/components/namenlijst/FilmKijkOverzicht";
import { RealtimeProspectsRefresh } from "@/components/namenlijst/RealtimeProspectsRefresh";
import { ActiefToggle } from "@/components/namenlijst/ActiefToggle";
import { ProspectFormBlok } from "@/components/namenlijst/ProspectFormBlok";
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
    { data: filmViews },
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
      .select("sponsor_id, role, full_name, modus, is_tester")
      .eq("id", user.id)
      .single(),
    // Openstaande herinneringen voor deze prospect, toont ze op de kaart
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
    // Verzonden films naar deze prospect, met real-time kijkpercentage.
    // Faalt stilletjes als de prospect_film_views-tabel nog niet bestaat.
    supabase
      .from("prospect_film_views")
      .select("id, film_slug, created_at, gestart_op, afgekeken_op, kijkpercentage")
      .eq("prospect_id", id)
      .eq("member_user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!prospect) notFound();

  // Freebie-uitslagen van deze persoon (antwoorden + advies + film-kijk),
  // gematcht op e-mail binnen de eigen opt-ins. Los van de Promise.all
  // hierboven omdat we het e-mailadres van de prospect nodig hebben.
  let freebieOptIns: {
    titel: string;
    created_at: string;
    bot_antwoorden: Record<string, unknown> | null;
    spiegel_tekst: string | null;
  }[] = [];
  if (prospect.email) {
    const { data: optIns } = await supabase
      .from("freebie_opt_ins")
      .select("created_at, bot_antwoorden, spiegel_tekst, freebies(titel)")
      .eq("member_id", user.id)
      .ilike("lead_email", String(prospect.email).replace(/([\\%_])/g, "\\$1"))
      .order("created_at", { ascending: false })
      .limit(5);
    freebieOptIns = ((optIns as unknown as Array<{
      created_at: string;
      bot_antwoorden: Record<string, unknown> | null;
      spiegel_tekst: string | null;
      freebies: { titel: string } | { titel: string }[] | null;
    }>) ?? [])
      .filter((r) => r.bot_antwoorden || r.spiegel_tekst)
      .map((r) => ({
        titel: Array.isArray(r.freebies)
          ? (r.freebies[0]?.titel ?? "Freebie")
          : (r.freebies?.titel ?? "Freebie"),
        created_at: r.created_at,
        bot_antwoorden: r.bot_antwoorden,
        spiegel_tekst: r.spiegel_tekst,
      }));
  }

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
      {/* Live: zorgt dat wijzigingen vanuit voice/form/etc. direct zichtbaar
          zijn op deze pagina zonder dat de user moet refreshen. */}
      <RealtimeProspectsRefresh userId={user.id} />

      {/* Preview-ingang nieuwe klantenkaart, alleen founders/testers. */}
      {(eigenRol === "founder" || (eigenProfiel as any)?.is_tester === true) && (
        <Link
          href={`/namenlijst/${id}/nieuw`}
          className="flex items-center gap-2 rounded-xl border border-cm-gold/40 bg-cm-gold/5 px-4 py-2 text-xs text-cm-gold hover:border-cm-gold transition-colors"
        >
          ✨ Bekijk de nieuwe klantenkaart (preview) →
        </Link>
      )}

      {/* Header, naam BOVEN, knoppen verspreid daaronder zodat het rechts
          niet meer een grote stapel wordt op smalle schermen. */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Link
            href="/namenlijst"
            className="text-cm-white/60 hover:text-cm-white text-xl pt-1 transition-colors"
          >
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif-warm text-2xl sm:text-3xl text-cm-white break-words leading-tight">
              {prospect.volledige_naam}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
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

        {/* Sponsor-info-strip, neutrale weergave (geen 'kijkt mee'-vibe). */}
        {sponsorNaam && (
          <div className="ml-9 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-cm-border bg-cm-surface-2/40 glow-gold-soft">
            <div className="w-8 h-8 rounded-full border-2 border-cm-gold-dim bg-cm-surface-2 flex items-center justify-center text-cm-gold text-xs font-semibold flex-shrink-0">
              {sponsorNaam.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-cm-white/80 text-xs leading-snug">
              <span className="text-cm-white font-medium">{sponsorNaam}</span>{" "}
              <span className="text-cm-white/60">is je sponsor.</span>
            </div>
          </div>
        )}

        {/* FORM-context: wat de Mentor over deze prospect noteerde. */}
        <ProspectFormBlok
          formContext={
            (
              prospect as {
                form_context?: {
                  family?: string;
                  occupation?: string;
                  recreation?: string;
                  money?: string;
                } | null;
              }
            ).form_context ?? null
          }
        />

        {/* Actie-rij, links: ELEVA Mentor (hoofdactie). Rechts: vragenlijst-
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
            <VoiceUitnodigingKnop
              prospectId={id}
              prospectNaam={prospect.volledige_naam}
            />
            <StuurFilmKnop
              prospectId={id}
              prospectNaam={prospect.volledige_naam}
              memberVoornaam={
                ((eigenProfiel as any)?.full_name ?? "").split(" ")[0] || ""
              }
            />
            <StuurFreebieKnop
              prospectId={id}
              prospectNaam={prospect.volledige_naam}
              memberNaam={(eigenProfiel as any)?.full_name ?? "je member"}
              memberModus={(eigenProfiel as any)?.modus ?? null}
              memberRole={(eigenProfiel as any)?.role ?? null}
            />
            {/* Toon altijd de uitkomst-chips als de productadvies-vragenlijst
                al is ingevuld. Het verzenden gebeurt nu via 'Stuur freebie'
                hierboven. ProductadviesTestKnop laat alleen de chips zien
                wanneer status='ingevuld' en uitslag aanwezig. */}
            {productadviesTest?.status === "ingevuld" && productadviesTest.uitslag && (
              <ProductadviesTestKnop
                prospectId={id}
                prospectNaam={prospect.volledige_naam}
                memberNaam={(eigenProfiel as any)?.full_name ?? "je member"}
                bestaande={{
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
                }}
              />
            )}
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
          {/* Productbestellingen, bovenaan zodat meest relevante data eerst opvalt.
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

          {/* Ingezette tools/media, afvinkbare dropdown */}
          <IngezetteTools
            prospectId={id}
            ingezet={prospect.ingezette_tools || []}
          />

          {/* Freebie-uitslag: antwoorden, advies en film-kijkgedrag */}
          <FreebieUitslag optIns={freebieOptIns} />
        </div>

        {/* Acties + contactlog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Openstaande herinneringen, bovenaan zodat ze direct zichtbaar zijn */}
          <HerinneringenOpKaart herinneringen={herinneringen || []} />
          {/* Verzonden films met real-time kijkpercentage. Verbergt zich
              automatisch als er nog geen films verstuurd zijn. */}
          <FilmKijkOverzicht
            views={
              (filmViews as Array<{
                id: string;
                film_slug: string;
                created_at: string;
                gestart_op: string | null;
                afgekeken_op: string | null;
                kijkpercentage: number;
              }>) || []
            }
          />
          <ProspectActieForm prospect={prospect} userId={user.id} />
          <ContactLogLijst
            contactLogs={contactLogs || []}
            prospect={prospect}
            userId={user.id}
          />

          {/* Aanpak-keuze: 3-weg-gesprek vs Mini-ELEVA. De keuze stuurt
              welke optie hieronder prominent staat (de andere blijft
              beschikbaar maar minder benadrukt). */}
          <AanpakKeuze
            prospectId={id}
            prospectVoornaam={prospect.volledige_naam.split(" ")[0]}
            huidigeAanpak={
              (prospect as { gekozen_aanpak?: "drieweg" | "mini_eleva" | null })
                .gekozen_aanpak ?? null
            }
          />

          {/* 3-weg gesprek, inklapbaar. Prominenter wanneer member 'drieweg'
              heeft gekozen, anders compact en collapsed-by-default.
              prospectSituatie komt uit het korte situatie_kort-veld. */}
          {(prospect as { gekozen_aanpak?: string | null }).gekozen_aanpak !==
            "mini_eleva" && (
            <DriewegGesprekInklapbaar
              prospectNaam={prospect.volledige_naam}
              prospectSituatie={prospect.situatie_kort || undefined}
              sponsorNaam={sponsorNaam}
            />
          )}

          {/* Mini-ELEVA. Prominent wanneer member 'mini_eleva' heeft gekozen,
              anders verborgen. Bij geen keuze beide tonen. */}
          {(prospect as { gekozen_aanpak?: string | null }).gekozen_aanpak !==
            "drieweg" && (
            <MiniElevaUitnodigKnop
              prospectId={id}
              prospectNaam={prospect.volledige_naam}
            />
          )}

          {/* Read-only zicht op actieve mini-ELEVA-sessies van deze
              prospect. Toont activiteit, mentor-vragen en haal-erbij-
              meldingen zodat de member ziet of er momentum is. */}
          <MiniElevaActieveSessies prospectId={id} />

          {/* Drie-persoonschat tussen member, sponsor en prospect.
              EEN doorlopende thread per prospect (over alle uitnodigingen
              heen, WhatsApp-stijl), met ongelezen-teller en spraak. */}
          <MiniElevaProspectChat
            prospectId={id}
            prospectVoornaam={prospect.volledige_naam.split(" ")[0]}
            sponsorVoornaam={
              sponsorNaam ? sponsorNaam.split(" ")[0] : null
            }
          />

          {/* ELEVA Mentor gesprekken, inklapbaar */}
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
