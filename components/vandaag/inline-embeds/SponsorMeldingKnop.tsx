"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ============================================================
// SponsorMeldingKnop — inline-embed voor /vandaag dag 1 'sponsor-melding'
//
// Toont een wa.me-knop met een voorgekauwd 'ik ben gestart'-bericht
// naar de sponsor van de member. Geen wegnavigeren — klikken opent
// WhatsApp (web of app), bevestigt = taak afvinken in vandaag-flow.
//
// Sponsor wordt opgehaald uit user_metadata.sponsor_id (gezet bij
// registratie/uitnodiging) en gekoppeld aan profile.full_name +
// profile.telefoon (kolom in profiles-tabel — kan leeg zijn).
// Geen telefoon? Dan tonen we alleen een tekst-bericht-template
// die de member zelf via z'n eigen kanaal kan sturen.
// ============================================================

type Props = {
  /** Wordt aangeroepen zodra member 'verstuurd'-knop klikt — vinkt taak af. */
  opVoltooid: () => void;
  alVoltooid: boolean;
};

type Sponsor = {
  naam: string | null;
};

export function SponsorMeldingKnop({ opVoltooid, alVoltooid }: Props) {
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

  const bericht =
    `Hoi${sponsor?.naam ? ` ${sponsor.naam.split(" ")[0]}` : ""}! ` +
    `Ik ben gestart in ELEVA 🚀 Vanaf nu zie je in het systeem mijn dagelijkse stappen — ` +
    `fijn om je rugdekking te hebben. Spreek je snel!`;

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
          Top — je sponsor weet dat je vertrokken bent. Door naar de volgende stap.
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
          📩 Stuur je sponsor{sponsor?.naam ? ` (${sponsor.naam.split(" ")[0]})` : ""} een bericht
        </h4>
        <p className="text-cm-white opacity-80 text-xs leading-relaxed">
          We hebben een korte tekst voor je voorgeschreven — pas 'm aan naar
          je eigen toon, of stuur 'm zoals 'ie is. Eén klik en WhatsApp opent.
        </p>
      </div>

      <div className="rounded-md bg-cm-bg/60 border border-cm-border px-3 py-2 text-xs text-cm-white opacity-90 italic leading-relaxed">
        "{bericht}"
      </div>

      <p className="text-xs text-cm-white opacity-60">
        ℹ️ WhatsApp opent een contact-zoeker — kies daar je sponsor of de
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
