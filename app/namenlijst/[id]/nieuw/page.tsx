import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import { PIPELINE_FASEN } from "@/lib/supabase/types";
import { ProspectActieForm } from "@/components/namenlijst/ProspectActieForm";
import { ContactLogLijst } from "@/components/namenlijst/ContactLogLijst";
import { ContactgegevensForm } from "@/components/namenlijst/ContactgegevensForm";
import { IngezetteTools } from "@/components/namenlijst/IngezetteTools";
import { DriewegGesprekInklapbaar } from "@/components/namenlijst/DriewegGesprek";
import { MiniElevaUitnodigKnop } from "@/components/namenlijst/MiniElevaUitnodigKnop";
import { MiniElevaActieveSessies } from "@/components/namenlijst/MiniElevaActieveSessies";
import { MiniElevaProspectChat } from "@/components/namenlijst/MiniElevaProspectChat";
import { AanpakKeuze } from "@/components/namenlijst/AanpakKeuze";
import { ProspectVerwijderKnop } from "@/components/namenlijst/ProspectVerwijderKnop";
import { CoachGesprekkenInklapbaar } from "@/components/namenlijst/CoachGesprekkenInklapbaar";
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
import { KaartTabs } from "@/components/namenlijst/KaartTabs";
import { KaartActieMenu } from "@/components/namenlijst/KaartActieMenu";
import { getServerTaal, v } from "@/lib/i18n/server";
import { Locale } from "date-fns";

// ============================================================
// NIEUWE klantenkaart (founder/tester-PREVIEW, 2026-07-08).
// Zelfde data en dezelfde componenten als /namenlijst/[id],
// maar heringedeeld: kop met volgende-stap + 2 knoppen, en
// vier tabbladen (Nu / Opvolgen / Notities / Gegevens).
// Wordt dit de standaard, dan vervangt deze indeling de oude
// pagina en vervalt deze route.
// ============================================================

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

export default async function NieuweProspectKaartPreview({
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
    supabase
      .from("herinneringen")
      .select("*")
      .eq("prospect_id", id)
      .eq("user_id", user.id)
      .eq("voltooid", false)
      .order("vervaldatum", { ascending: true }),
    supabase
      .from("productadvies_tests")
      .select(
        "token, status, trigger_60day, uitslag, ingevuld_op, darmvragenlijst_uitslag, darmvragenlijst_ingevuld_op",
      )
      .eq("prospect_id", id)
      .eq("member_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("prospect_film_views")
      .select("id, film_slug, created_at, gestart_op, afgekeken_op, kijkpercentage")
      .eq("prospect_id", id)
      .eq("member_user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  // Preview-gate: alleen founders/testers zien de nieuwe kaart.
  const profielInfo = eigenProfiel as {
    sponsor_id?: string | null;
    role?: string | null;
    full_name?: string | null;
    modus?: string | null;
    is_tester?: boolean | null;
  } | null;
  const magPreview =
    profielInfo?.role === "founder" || profielInfo?.is_tester === true;
  if (!magPreview) redirect(`/namenlijst/${id}`);

  if (!prospect) notFound();

  // Sponsor-naam, zelfde drie-traps fallback als de oude kaart.
  const sponsorId = profielInfo?.sponsor_id;
  const eigenRol = profielInfo?.role;
  let sponsorNaam: string = "";
  if (sponsorId) {
    const { data: sponsorProfiel } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", sponsorId)
      .single();
    sponsorNaam = sponsorProfiel?.full_name ?? "";
  } else if (eigenRol === "leider") {
    sponsorNaam = "Ramon Sant";
  } else {
    const { data: leiders } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("role", "leider")
      .order("created_at", { ascending: true });
    if (leiders && leiders.length > 0) {
      sponsorNaam = leiders
        .map((l: { full_name: string }) => l.full_name)
        .join(" / ");
    } else {
      sponsorNaam = "Ramon Sant";
    }
  }

  const faseInfo = PIPELINE_FASEN.find((f) => f.fase === prospect.pipeline_fase);
  const voornaam = prospect.volledige_naam.split(" ")[0];
  const memberVoornaam = (profielInfo?.full_name ?? "").split(" ")[0] || "";

  // Volgende stap: de eerstvolgende open herinnering. Zonder herinnering
  // een eerlijke lege-staat die naar het actie-formulier wijst.
  const eersteHerinnering = (herinneringen ?? [])[0] as
    | { titel?: string | null; vervaldatum?: string | null }
    | undefined;

  // Laatste contactmoment, voor de context-regel in de kop.
  const laatsteLog = (contactLogs ?? [])[0] as { created_at?: string } | undefined;

  const gekozenAanpak =
    (prospect as { gekozen_aanpak?: "drieweg" | "mini_eleva" | null })
      .gekozen_aanpak ?? null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <RealtimeProspectsRefresh userId={user.id} />

      {/* Preview-banner: dit is de nieuwe indeling, oude kaart één klik weg. */}
      <div className="flex items-center gap-3 rounded-xl border border-cm-gold/40 bg-cm-gold/5 px-4 py-2.5 text-xs">
        <span className="text-cm-white/80 flex-1">
          ✨ Preview van de nieuwe klantenkaart (alleen jij ziet dit).
        </span>
        <Link href={`/namenlijst/${id}`} className="text-cm-gold hover:underline flex-shrink-0">
          ↩️ Naar de huidige kaart
        </Link>
      </div>

      {/* ===== DE KOP: wie + waar in de reis + volgende stap + 2 knoppen ===== */}
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
                style={{
                  color: faseInfo?.tekstkleur,
                  background: `${faseInfo?.kleur}`,
                }}
              >
                {faseInfo?.label}
              </span>
              {prospect.prioriteit === "hoog" && (
                <span className="text-cm-gold text-xs">
                  {v("prospect.hoge_prioriteit", taal)}
                </span>
              )}
              {prospect.actief === false && (
                <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-full">
                  💤 Niet-actief
                </span>
              )}
              {laatsteLog?.created_at && (
                <span className="text-xs text-cm-white/45">
                  laatste contact{" "}
                  {formatDistanceToNow(new Date(laatsteLog.created_at), {
                    addSuffix: true,
                    locale: datumLocale,
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Volgende stap: de kaart vertelt zelf wat je ermee moet. */}
        <div className="ml-9 rounded-xl border border-cm-gold/35 bg-cm-gold/5 px-4 py-2.5 text-sm">
          {eersteHerinnering ? (
            <>
              👉 <span className="text-cm-gold font-semibold">Volgende stap:</span>{" "}
              {eersteHerinnering.titel}
              {eersteHerinnering.vervaldatum && (
                <span className="text-cm-white/55">
                  {" "}
                  ·{" "}
                  {format(new Date(eersteHerinnering.vervaldatum), "d MMMM", {
                    locale: datumLocale,
                  })}
                </span>
              )}
            </>
          ) : (
            <>
              👉 <span className="text-cm-gold font-semibold">Volgende stap:</span>{" "}
              <span className="text-cm-white/70">
                nog niets ingepland. Noteer een contactmoment of zet een
                herinnering (tab 📍 Nu).
              </span>
            </>
          )}
        </div>

        {/* Actie-rij: één hoofdactie + twee opgeruimde menu's. */}
        <div className="ml-9 flex items-center gap-2 flex-wrap">
          <Link href={`/coach?prospect=${id}`} className="btn-gold text-sm font-semibold">
            🤖 Vraag de Mentor
          </Link>
          <KaartActieMenu label="📤 Stuur...">
            <VoiceUitnodigingKnop
              prospectId={id}
              prospectNaam={prospect.volledige_naam}
            />
            <StuurFilmKnop
              prospectId={id}
              prospectNaam={prospect.volledige_naam}
              memberVoornaam={memberVoornaam}
            />
            <StuurFreebieKnop
              prospectId={id}
              prospectNaam={prospect.volledige_naam}
              memberNaam={profielInfo?.full_name ?? "je member"}
              memberModus={profielInfo?.modus ?? null}
              memberRole={profielInfo?.role ?? null}
            />
          </KaartActieMenu>
          <KaartActieMenu label="⋯" stil>
            {(prospect.pipeline_fase === "member" ||
              prospect.pipeline_fase === "shopper") && (
              <ActiefToggle
                prospectId={id}
                prospectNaam={prospect.volledige_naam}
                actief={prospect.actief ?? true}
              />
            )}
            <ProspectVerwijderKnop
              prospectId={id}
              prospectNaam={prospect.volledige_naam}
            />
          </KaartActieMenu>
        </div>
      </div>

      {/* ===== DE VIER TABS ===== */}
      <KaartTabs
        notitiesTeller={(contactLogs ?? []).length}
        nu={
          <>
            {/* Openstaande herinneringen (verbergt zichzelf als leeg) */}
            <HerinneringenOpKaart herinneringen={herinneringen || []} />

            {/* Signalen: films met kijkpercentage (verbergt zichzelf als leeg) */}
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

            {/* Check-uitslag-chips als de vragenlijst is ingevuld */}
            {productadviesTest?.status === "ingevuld" && productadviesTest.uitslag && (
              <ProductadviesTestKnop
                prospectId={id}
                prospectNaam={prospect.volledige_naam}
                memberNaam={profielInfo?.full_name ?? "je member"}
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

            {/* FORM: wat de Mentor over deze persoon noteerde */}
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

            {/* Actie: contactmoment noteren / fase verplaatsen */}
            <ProspectActieForm prospect={prospect} userId={user.id} />
          </>
        }
        opvolgen={
          <>
            {/* Aanpak-keuze stuurt welke route prominent staat */}
            <AanpakKeuze
              prospectId={id}
              prospectVoornaam={voornaam}
              huidigeAanpak={gekozenAanpak}
            />
            {gekozenAanpak !== "mini_eleva" && (
              <DriewegGesprekInklapbaar
                prospectNaam={prospect.volledige_naam}
                prospectSituatie={prospect.situatie_kort || undefined}
                sponsorNaam={sponsorNaam}
              />
            )}
            {gekozenAanpak !== "drieweg" && (
              <MiniElevaUitnodigKnop
                prospectId={id}
                prospectNaam={prospect.volledige_naam}
              />
            )}
            <MiniElevaActieveSessies prospectId={id} />
            <MiniElevaProspectChat
              prospectId={id}
              prospectVoornaam={voornaam}
              sponsorVoornaam={sponsorNaam ? sponsorNaam.split(" ")[0] : null}
            />
          </>
        }
        notities={
          <>
            <ContactLogLijst
              contactLogs={contactLogs || []}
              prospect={prospect}
              userId={user.id}
            />
            <CoachGesprekkenInklapbaar
              gesprekken={coachGesprekken || []}
              prospectId={id}
              prospectNaam={prospect.volledige_naam}
            />
          </>
        }
        gegevens={
          <>
            <div className="card space-y-3">
              <ContactgegevensForm prospect={prospect} />
              <div className="border-t border-cm-border pt-3 mt-3">
                <p className="text-xs text-cm-white opacity-60">
                  {v("prospect.toegevoegd", taal)}
                </p>
                <p className="text-cm-white text-sm">
                  {format(new Date(prospect.created_at), "d MMMM yyyy", {
                    locale: datumLocale,
                  })}
                </p>
              </div>
            </div>
            {bestellingen && bestellingen.length > 0 && (
              <div className="card">
                <ProductBestellingenLijst
                  bestellingen={bestellingen}
                  titel={v("prospect.bestellingen", taal)}
                  herinneringLabel={v("prospect.herinnering", taal)}
                  taal={taal}
                />
              </div>
            )}
            <div className="card">
              <IngezetteTools
                prospectId={id}
                ingezet={prospect.ingezette_tools || []}
              />
            </div>
            {sponsorNaam && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-cm-border bg-cm-surface-2/40">
                <div className="w-8 h-8 rounded-full border-2 border-cm-gold-dim bg-cm-surface-2 flex items-center justify-center text-cm-gold text-xs font-semibold flex-shrink-0">
                  {sponsorNaam
                    .split(" ")
                    .map((s) => s[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 text-cm-white/80 text-xs leading-snug">
                  <span className="text-cm-white font-medium">{sponsorNaam}</span>{" "}
                  <span className="text-cm-white/60">is je sponsor.</span>
                </div>
              </div>
            )}
          </>
        }
      />
    </div>
  );
}
