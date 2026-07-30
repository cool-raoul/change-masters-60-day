"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { waLinkNaar } from "@/lib/util/wa-nummer";

// ============================================================
// SponsorMeldingKnop, inline-embed voor /vandaag dag 1 'sponsor-melding'
//
// Toont een wa.me-knop met een voorgekauwd 'ik ben gestart'-bericht
// naar de sponsor van de member. Geen wegnavigeren, klikken opent
// WhatsApp (web of app), bevestigt = taak afvinken in vandaag-flow.
//
// Sponsor wordt opgehaald uit user_metadata.sponsor_id (gezet bij
// registratie/uitnodiging) en gekoppeld aan profile.full_name +
// profile.telefoon (kolom in profiles-tabel, kan leeg zijn).
// Geen telefoon? Dan tonen we alleen een tekst-bericht-template
// die de member zelf via z'n eigen kanaal kan sturen.
// ============================================================

type Props = {
  /** Wordt aangeroepen zodra member 'verstuurd'-knop klikt, vinkt taak af. */
  opVoltooid: () => void;
  alVoltooid: boolean;
  /** Taak-id zodat we het juiste bericht-sjabloon kunnen kiezen per dag. */
  taakId?: string;
};

/**
 * Bericht-sjablonen per taak-id. Sponsor wordt automatisch ingevuld
 * op de plek van [naam]. Default = "ik ben gestart"-versie van dag 1.
 */
function pakBericht(taakId: string | undefined, sponsorVoornaam: string): string {
  const naamDeel = sponsorVoornaam ? ` ${sponsorVoornaam}` : "";
  switch (taakId) {
    case "dag2-kennismaak":
      return (
        `Hoi${naamDeel}! Volgens m'n playbook is dit een mooi moment voor een ` +
        `korte kennismaak-call van zo'n 30 min, even mijn WHY met je delen, ` +
        `en samen kijken naar mijn eerste 3 invites. Wanneer schikt het bij jou?`
      );
    case "dag5-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 5 erop ✅ Vandaag voor het eerst Feel-Felt-Found ` +
        `(FFF) actief geoefend op bezwaren. Voelt nog wennen maar de structuur ` +
        `helpt. Spreek je snel!`
      );
    case "dag6-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 6 erop ✅ Vandaag actief gewerkt aan follow-ups ` +
        `en de 24-48u-regel. Voelt goed om systematisch door m'n pijplijn te ` +
        `lopen. Spreek je snel!`
      );
    case "dag8-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 8 erop ✅ Eerste dag van week 2. Heb vandaag ` +
        `bewust gewerkt aan snelheid bij m'n uitnodigingen — perfectie-val ` +
        `proberen te omzeilen. Spreek je snel!`
      );
    case "dag9-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 9 erop ✅ De 3-weg-meesterclass gelezen, de 5 ` +
        `stappen + edification helder. Klaar om morgen mijn eerstvolgende ` +
        `3-weg te starten. Ben je beschikbaar als ik je nodig heb?`
      );
    case "dag10-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 10 erop ✅ Mijn 3-weg-gesprek vandaag gestart. ` +
        `Voelde [nog onhandig / goed]. Kunnen we 5 min debriefen? Wat ` +
        `ging goed, waar liep ik vast?`
      );
    case "dag11-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 11 erop ✅ Pipeline doorgelopen, weet nu per ` +
        `prospect wat de volgende stap is. M'n bottleneck zit op [fase]. ` +
        `Heb je een tip voor die fase?`
      );
    case "dag12-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 12 erop ✅ Vandaag een product-pivot gestuurd ` +
        `naar [naam] die nee zei op business. Spreek je snel!`
      );
    case "dag13-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 13 erop ✅ FORM bewust toegepast bij [naam]. ` +
        `Ving deze haak op: [iets dat ze noemden]. Spreek je snel!`
      );
    case "dag15-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 15 erop ✅ Week 3 begint, follow-up wordt mijn ` +
        `focus. Hoeveel mensen heb ik nu warm te houden, ongeveer? Help me ` +
        `even zicht houden.`
      );
    case "dag16-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 16 erop ✅ Mijn top-20 prospects gecategoriseerd ` +
        `in de 5 types. Heb [aantal] op type 1+2 — daar gaat m'n energie heen ` +
        `komende week. Spreek je snel!`
      );
    case "dag17-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 17 erop ✅ Doel-Tijd-Termijn vandaag toegepast ` +
        `bij [naam]. M'n closing-zin staat opgeslagen onder /mijn-zinnen. ` +
        `Spreek je snel!`
      );
    case "dag18-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 18 erop ✅ Mijn edification-zin geschreven en ` +
        `opgeslagen. Wil je 'm even checken? Hij staat onder /mijn-zinnen.`
      );
    case "dag19-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 19 erop ✅ Pipeline-bottleneck zit op [fase]. ` +
        `Heb je een tip voor de komende 40 dagen om die fase aan te pakken?`
      );
    case "dag20-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 20 erop ✅ Vandaag (of morgen) voor het eerst ` +
        `de beslissing gevraagd bij [naam]. Reactie: [ja/nee/nog nodig]. ` +
        `Beslissing krijgen is winst, ongeacht de richting!`
      );
    case "dag3-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 3 erop ✅ Ben rustig aan het netwerk bouwen, ` +
        `eerste echte gesprekken lopen. Morgen pas ik de 4-stappen-` +
        `uitnodiging actief toe!`
      );
    case "dag4-sponsor-checkin":
      return (
        `Hoi${naamDeel}! Dag 4 zit erop 🎯 Heb vandaag voor het eerst ` +
        `de 4-stappen-uitnodiging actief toegepast. Voelt nog wat stroef ` +
        `maar de structuur helpt. Spreek je snel!`
      );
    case "dag6-sponsor-tip":
      return (
        `Hoi${naamDeel}! Mag ik je advies vragen op één lastige follow-up? ` +
        `Ik heb een prospect waar ik even niet uitkom, kan jij een tip geven ` +
        `als je een momentje hebt?`
      );
    case "dag7-sponsor-call":
      return (
        `Hoi${naamDeel}! Week 1 zit erop 🎉 Tijd voor onze 15-min call over ` +
        `wat ik in week 2 kan oppakken. Wanneer komt het uit bij jou?`
      );
    case "dag14-sponsor-call":
      return (
        `Hoi${naamDeel}! Halverwege de 21-daagse 🏁 Tijd voor onze 15-min ` +
        `call om week 3 voor te bereiden. Wanneer schikt het?`
      );
    case "dag21-sponsor-call":
      return (
        `Hoi${naamDeel}! Dag 21, week 1 t/m 3 voltooid 🏆 Klaar voor onze ` +
        `40-min call over hoe ik de volgende 40 dagen ga vormgeven?`
      );
    // CORE (flow-audit 30 juli): alle Core-taken vielen door naar het
    // dag-1-bericht, dus een Core-member stuurde zijn sponsor 21 dagen
    // lang "ik ben gestart in ELEVA", ook bij een upline-check op stap 18.
    case "core-v9-stap1-sponsor":
      return (
        `Hoi${naamDeel}! Ik ben gestart in Core 🚀 Fijn om jou als ` +
        `rugdekking te hebben. Spreek je snel!`
      );
    case "core-v9-stap2-sponsor-call":
      return (
        `Hoi${naamDeel}! Ik zit in mijn tweede stap. Zullen we een korte ` +
        `call doen? Even mijn WHY met je delen en samen naar mijn eerste ` +
        `mensen kijken. Wanneer schikt het bij jou?`
      );
    case "core-v9-stap5-sponsor-3weg-beschikbaar":
      return (
        `Hoi${naamDeel}! Ik ga binnenkort een 3-weg-gesprek doen. Kun je ` +
        `beschikbaar zijn als ik je erbij haal? Dan stem ik het moment ` +
        `met je af.`
      );
    case "core-v9-stap8-sponsor-bevestigen":
      return (
        `Hoi${naamDeel}! Even afstemmen: kun jij erbij zijn als ik iemand ` +
        `wil laten kijken? Ik geef het tijdig door.`
      );
    case "core-v9-stap18-upline-check":
      return (
        `Hoi${naamDeel}! Ik heb een post klaar en wil 'm graag door jou ` +
        `laten nakijken voordat ik 'm plaats. Kun je even meelezen?`
      );
    case "core-v9-stap20-kennisdeling":
      return (
        `Hoi${naamDeel}! Ik heb iets gemerkt in mijn gesprekken dat ik graag ` +
        `met je deel, misschien heeft de rest van het team er ook iets aan. ` +
        `Kunnen we kort bellen?`
      );
    case "core-v9-stap21-sponsor-call-plannen":
      return (
        `Hoi${naamDeel}! Mijn eerste 21 stappen zitten erop 🏆 Zullen we een ` +
        `call plannen over hoe ik het vanaf hier ga vormgeven?`
      );
    case "dag1-sponsor":
    default:
      // Dagelijkse Core-check-ins (core-v9-stapN-sponsor-checkin) komen
      // hier terecht; die krijgen een neutrale check-in in plaats van
      // een start-bericht.
      if (taakId && /^core-v9-stap\d+-sponsor-checkin$/.test(taakId)) {
        return (
          `Hoi${naamDeel}! Korte check-in: ik heb mijn stappen van vandaag ` +
          `gedaan. Als je iets ziet wat ik anders kan doen, hoor ik het ` +
          `graag. Spreek je snel!`
        );
      }
      return (
        `Hoi${naamDeel}! Ik ben gestart in ELEVA 🚀 Fijn om jou als ` +
        `rugdekking te hebben. Spreek je snel!`
      );
  }
}

/**
 * Titel-tekst voor de embed boven het bericht, past zich aan op
 * basis van de taak-context (kennismaak vs check-in vs call etc.).
 */
function pakTitel(taakId: string | undefined): string {
  switch (taakId) {
    case "dag2-kennismaak":
      return "📞 Stel een kennismaak-call voor";
    case "dag3-sponsor-checkin":
    case "dag5-sponsor-checkin":
    case "dag6-sponsor-checkin":
    case "dag8-sponsor-checkin":
    case "dag9-sponsor-checkin":
    case "dag10-sponsor-checkin":
    case "dag11-sponsor-checkin":
    case "dag12-sponsor-checkin":
    case "dag13-sponsor-checkin":
    case "dag15-sponsor-checkin":
    case "dag16-sponsor-checkin":
    case "dag17-sponsor-checkin":
    case "dag18-sponsor-checkin":
    case "dag19-sponsor-checkin":
    case "dag20-sponsor-checkin":
      return "📩 Stuur een korte check-in naar je sponsor";
    case "dag6-sponsor-tip":
      return "💬 Vraag je sponsor om een tip";
    case "dag7-sponsor-call":
    case "dag14-sponsor-call":
    case "dag21-sponsor-call":
    case "core-v9-stap2-sponsor-call":
    case "core-v9-stap21-sponsor-call-plannen":
    case "core-v9-stap20-kennisdeling":
      return "📞 Plan je sponsor-call in";
    case "core-v9-stap5-sponsor-3weg-beschikbaar":
    case "core-v9-stap8-sponsor-bevestigen":
      return "🤝 Stem af of je sponsor beschikbaar is";
    case "core-v9-stap18-upline-check":
      return "👀 Laat je post nakijken";
    default:
      if (taakId && /^core-v9-stap\d+-sponsor-checkin$/.test(taakId)) {
        return "📩 Stuur een korte check-in naar je sponsor";
      }
      return "📩 Stuur je sponsor een bericht";
  }
}

type Sponsor = {
  naam: string | null;
  telefoon: string | null;
};

export function SponsorMeldingKnop({ opVoltooid, alVoltooid, taakId }: Props) {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [laden, setLaden] = useState(true);
  const [bevestigd, setBevestigd] = useState(alVoltooid);

  useEffect(() => {
    let actief = true;
    async function laad() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (actief) setLaden(false);
        return;
      }
      let sponsorId = (user.user_metadata as { sponsor_id?: string } | undefined)
        ?.sponsor_id;
      // Fallback: sponsor_id uit het eigen profiel als de metadata leeg is.
      if (!sponsorId) {
        const { data: eigen } = await supabase
          .from("profiles")
          .select("sponsor_id")
          .eq("id", user.id)
          .maybeSingle();
        sponsorId =
          (eigen as { sponsor_id?: string | null } | null)?.sponsor_id ??
          undefined;
      }
      if (!sponsorId) {
        if (actief) {
          setSponsor({ naam: null, telefoon: null });
          setLaden(false);
        }
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("full_name, telefoon")
        .eq("id", sponsorId)
        .maybeSingle();
      if (actief) {
        const sp = data as
          | { full_name?: string | null; telefoon?: string | null }
          | null;
        setSponsor({
          naam: sp?.full_name ?? null,
          telefoon: sp?.telefoon ?? null,
        });
        setLaden(false);
      }
    }
    void laad();
    return () => {
      actief = false;
    };
  }, []);

  const sponsorVoornaam = sponsor?.naam ? sponsor.naam.split(" ")[0] : "";
  const bericht = pakBericht(taakId, sponsorVoornaam);
  const titel = pakTitel(taakId);

  // Met sponsor-nummer opent WhatsApp DIRECT bij de sponsor (geen
  // contact-zoeker). Zonder nummer valt 'ie terug op de tekst-only versie.
  const heeftNummer = !!sponsor?.telefoon;
  const waLink = waLinkNaar(sponsor?.telefoon, bericht);

  if (bevestigd) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4 space-y-2">
        <p className="text-emerald-300 font-semibold text-sm flex items-center gap-2">
          ✓ Bericht verstuurd
        </p>
        <p className="text-cm-white opacity-80 text-xs">
          {/* Zonder sponsor niet beweren dat er iemand op de hoogte is
              (flow-audit 30 juli). */}
          {sponsor?.naam
            ? "Top, je sponsor is op de hoogte. Door naar de volgende stap."
            : "Genoteerd. Door naar de volgende stap."}
        </p>
      </div>
    );
  }

  if (laden) {
    return (
      <div className="rounded-lg border-2 border-cm-border bg-cm-surface px-4 py-4">
        <p className="text-cm-white opacity-60 text-sm">Sponsor-info laden…</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 px-4 py-4 space-y-3">
      <div className="space-y-1">
        <h4 className="text-cm-gold font-semibold text-sm">
          {titel}
          {sponsor?.naam ? `, ${sponsor.naam.split(" ")[0]}` : ""}
        </h4>
        <p className="text-cm-white opacity-80 text-xs leading-relaxed">
          We hebben een korte tekst voor je voorgeschreven, pas 'm aan naar
          je eigen toon, of stuur 'm zoals 'ie is.{" "}
          {heeftNummer && sponsorVoornaam
            ? `Eén klik en WhatsApp opent direct bij ${sponsorVoornaam}.`
            : "Eén klik en WhatsApp opent."}
        </p>
      </div>

      <div className="rounded-md bg-cm-bg/60 border border-cm-border px-3 py-2 text-xs text-cm-white opacity-90 italic leading-relaxed">
        "{bericht}"
      </div>

      {!heeftNummer && (
        <p className="text-xs text-cm-white opacity-60">
          ℹ️ WhatsApp opent een contact-zoeker, kies daar je sponsor of de
          persoon die jou heeft uitgenodigd.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold flex-1 py-3 text-sm font-semibold text-center inline-block"
        >
          {heeftNummer && sponsorVoornaam
            ? `📱 Open WhatsApp naar ${sponsorVoornaam}`
            : "📱 Open WhatsApp met dit bericht"}
        </a>
        <button
          type="button"
          onClick={() => {
            setBevestigd(true);
            opVoltooid();
          }}
          className="btn-secondary flex-1 py-3 text-sm font-semibold"
        >
          ✓ Verstuurd
        </button>
      </div>
    </div>
  );
}
