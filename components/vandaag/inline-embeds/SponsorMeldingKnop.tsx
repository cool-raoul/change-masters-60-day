"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    case "dag1-sponsor":
    default:
      return (
        `Hoi${naamDeel}! Ik ben gestart in ELEVA 🚀 Vanaf nu zie je in het ` +
        `systeem mijn dagelijkse stappen, fijn om je rugdekking te hebben. ` +
        `Spreek je snel!`
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
      return "📩 Stuur een korte check-in naar je sponsor";
    case "dag6-sponsor-tip":
      return "💬 Vraag je sponsor om een tip";
    case "dag7-sponsor-call":
    case "dag14-sponsor-call":
    case "dag21-sponsor-call":
      return "📞 Plan je sponsor-call in";
    default:
      return "📩 Stuur je sponsor een bericht";
  }
}

type Sponsor = {
  naam: string | null;
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
      const sponsorId = (user.user_metadata as { sponsor_id?: string } | undefined)
        ?.sponsor_id;
      if (!sponsorId) {
        if (actief) {
          setSponsor({ naam: null });
          setLaden(false);
        }
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", sponsorId)
        .maybeSingle();
      if (actief) {
        const sp = data as { full_name?: string | null } | null;
        setSponsor({ naam: sp?.full_name ?? null });
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

  // WhatsApp zonder nummer → opent een contact-picker. Profiles in
  // ELEVA hebben (nog) geen telefoonkolom, dus dit is de schoonste route.
  const waLink = `https://wa.me/?text=${encodeURIComponent(bericht)}`;

  if (bevestigd) {
    return (
      <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-900/20 px-4 py-4 space-y-2">
        <p className="text-emerald-300 font-semibold text-sm flex items-center gap-2">
          ✓ Bericht verstuurd
        </p>
        <p className="text-cm-white opacity-80 text-xs">
          Top, je sponsor weet dat je vertrokken bent. Door naar de volgende stap.
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
          je eigen toon, of stuur 'm zoals 'ie is. Eén klik en WhatsApp opent.
        </p>
      </div>

      <div className="rounded-md bg-cm-bg/60 border border-cm-border px-3 py-2 text-xs text-cm-white opacity-90 italic leading-relaxed">
        "{bericht}"
      </div>

      <p className="text-xs text-cm-white opacity-60">
        ℹ️ WhatsApp opent een contact-zoeker, kies daar je sponsor of de
        persoon die jou heeft uitgenodigd.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold flex-1 py-3 text-sm font-semibold text-center inline-block"
        >
          📱 Open WhatsApp met dit bericht
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
