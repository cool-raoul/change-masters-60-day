import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { nl, enUS, fr, es, de, pt, Locale } from "date-fns/locale";
import { Herinnering, Prospect } from "@/lib/supabase/types";
import { KanaalIconen } from "@/components/gedeeld/KanaalIconen";
import { HerinneringActies } from "@/components/herinneringen/HerinneringActies";
import { getServerTaal, v } from "@/lib/i18n/server";

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

// "Volgende acties" outbox — één pagina waar alle openstaande follow-ups staan
// met direct-klik kanaal-iconen per prospect. Verschil met /herinneringen:
//  - hier gaat het om actie-uitvoering (appen/bellen NU), niet om beheren
//  - kanaal-iconen zitten in elke rij — geen detailkaart openen nodig
//  - focus op vandaag/verlopen eerst
export default async function ActiesPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const taal = await getServerTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;

  const vandaag = new Date().toISOString().split("T")[0];
  const over7Dagen = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: herinneringen } = await supabase
    .from("herinneringen")
    .select("*, prospect:prospects(*)")
    .eq("user_id", user.id)
    .eq("voltooid", false)
    .order("vervaldatum", { ascending: true });

  type HerinneringMetProspect = Herinnering & {
    prospect: Prospect | null;
  };
  const lijst = (herinneringen as HerinneringMetProspect[]) || [];
  const verlopen = lijst.filter((h) => h.vervaldatum < vandaag);
  const vandaagLijst = lijst.filter((h) => h.vervaldatum === vandaag);
  const komende = lijst.filter(
    (h) => h.vervaldatum > vandaag && h.vervaldatum <= over7Dagen
  );

  // "Later" bewust weggelaten — dit is een DOE-pagina, niet een beheer-pagina.
  // Voor het volle overzicht: /herinneringen.

  const totaalVandaag = verlopen.length + vandaagLijst.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4"
      >
        {v("algemeen.terug", taal)}
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          🎯 Volgende acties
        </h1>
        <p className="text-cm-white mt-1">
          {totaalVandaag > 0
            ? `${totaalVandaag} ${totaalVandaag === 1 ? "persoon" : "mensen"} staan vandaag op je te wachten`
            : "Niks dringends vandaag ✨"}
        </p>
        <p className="text-cm-white text-xs opacity-60 mt-2">
          💡 Klik direct op een icoon om te WhatsAppen, bellen of mailen. Vink
          af zodra je het gedaan hebt.
        </p>
      </div>

      {lijst.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🧘</div>
          <p className="text-cm-white font-semibold mb-2">
            Je lijst is leeg.
          </p>
          <p className="text-cm-white opacity-70">
            Geen openstaande acties. Veel mensen hebben dit niet — jij nu wel.
          </p>
          <Link
            href="/namenlijst"
            className="inline-block mt-6 btn-secondary text-sm"
          >
            Naar namenlijst
          </Link>
        </div>
      )}

      {verlopen.length > 0 && (
        <ActieGroep
          titel="🔴 Te laat"
          herinneringen={verlopen}
          datumLocale={datumLocale}
          accentKlasse="border-l-red-500"
          toonDagenTeLaat
        />
      )}

      {vandaagLijst.length > 0 && (
        <ActieGroep
          titel="🎯 Vandaag"
          herinneringen={vandaagLijst}
          datumLocale={datumLocale}
          accentKlasse="border-l-cm-gold"
        />
      )}

      {komende.length > 0 && (
        <ActieGroep
          titel="📅 Komende 7 dagen"
          herinneringen={komende}
          datumLocale={datumLocale}
          accentKlasse="border-l-blue-500"
        />
      )}

      {/* Voor later-in-de-toekomst stuur je naar /herinneringen voor beheer */}
      {lijst.length > verlopen.length + vandaagLijst.length + komende.length && (
        <div className="text-center pt-4">
          <Link
            href="/herinneringen"
            className="text-cm-gold text-sm hover:text-cm-gold-light transition-colors"
          >
            Verder vooruit kijken → /herinneringen
          </Link>
        </div>
      )}
    </div>
  );
}

function ActieGroep({
  titel,
  herinneringen,
  datumLocale,
  accentKlasse,
  toonDagenTeLaat = false,
}: {
  titel: string;
  herinneringen: (Herinnering & { prospect: Prospect | null })[];
  datumLocale: Locale;
  accentKlasse: string;
  toonDagenTeLaat?: boolean;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 text-cm-white">
        {titel} ({herinneringen.length})
      </h2>
      <div className="space-y-2">
        {herinneringen.map((her) => (
          <ActieRij
            key={her.id}
            herinnering={her}
            datumLocale={datumLocale}
            accentKlasse={accentKlasse}
            toonDagenTeLaat={toonDagenTeLaat}
          />
        ))}
      </div>
    </div>
  );
}

function ActieRij({
  herinnering,
  datumLocale,
  accentKlasse,
  toonDagenTeLaat,
}: {
  herinnering: Herinnering & { prospect: Prospect | null };
  datumLocale: Locale;
  accentKlasse: string;
  toonDagenTeLaat: boolean;
}) {
  const dagenTeLaat = differenceInDays(
    new Date(),
    new Date(herinnering.vervaldatum)
  );
  const heeftBeschrijving = !!(
    herinnering.beschrijving && herinnering.beschrijving.trim()
  );

  return (
    <div
      className={`border-l-4 ${accentKlasse} bg-cm-surface-2 rounded-lg p-3`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Naam + link naar prospect */}
          {herinnering.prospect ? (
            <Link
              href={`/namenlijst/${herinnering.prospect.id}`}
              className="text-cm-white font-semibold text-sm hover:text-cm-gold transition-colors inline-flex items-center gap-1"
            >
              👤 {herinnering.prospect.volledige_naam}
            </Link>
          ) : (
            <p className="text-cm-white font-semibold text-sm">
              📌 {herinnering.titel}
            </p>
          )}

          {/* Titel van de herinnering als die anders is dan generiek */}
          {herinnering.prospect &&
            !herinnering.titel.startsWith("Follow-up:") && (
              <p className="text-cm-white text-xs mt-0.5 opacity-90">
                {herinnering.titel}
              </p>
            )}

          {/* Volledige beschrijving — altijd zichtbaar op actie-pagina,
              want dit is het ding dat je NU moet doen */}
          {heeftBeschrijving && (
            <p className="text-cm-white text-xs mt-1 opacity-80 whitespace-pre-wrap leading-relaxed">
              {herinnering.beschrijving}
            </p>
          )}

          {/* Datum + dagen-te-laat badge */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[11px] text-cm-white opacity-60">
              {format(new Date(herinnering.vervaldatum), "EEEE d MMMM", {
                locale: datumLocale,
              })}
            </span>
            {toonDagenTeLaat && dagenTeLaat > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                {dagenTeLaat === 1
                  ? "1 dag te laat"
                  : `${dagenTeLaat} dagen te laat`}
              </span>
            )}
          </div>
        </div>

        {/* Rechterkant: kanaal-iconen + afvink-knop */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {herinnering.prospect && (
            <KanaalIconen
              prospect={herinnering.prospect}
              grootte="compact"
            />
          )}
          <HerinneringActies herinneringId={herinnering.id} />
        </div>
      </div>
    </div>
  );
}
