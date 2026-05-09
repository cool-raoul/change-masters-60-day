"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// WekelijkseReviewFormulier, drie reflectie-vragen + sponsor-deel-keuze.
//
// Voor dag 7, 14, 21 en (later) elke zondag in het weekritme.
// Drie vragen:
//   1. Wat ging goed deze week?
//   2. Wat liep niet soepel?
//   3. Waar focus ik volgende week op?
//
// Aan het eind: expliciete keuze of sponsor de review mag zien.
// Niet automatisch, want sponsor-share moet een bewuste keuze zijn.
// ============================================================

type Props = {
  /** Standaard week-nummer dat voorgeselecteerd is. */
  weekNummer: number;
};

type SponsorInfo = {
  voornaam: string;
  telefoon: string | null;
};

function bouwWhatsAppLink(
  telefoon: string | null,
  bericht: string,
): string | null {
  if (!telefoon) return null;
  let nummer = telefoon.replace(/[^\d+]/g, "");
  if (nummer.startsWith("+")) nummer = nummer.substring(1);
  if (nummer.startsWith("0")) nummer = "31" + nummer.substring(1);
  return `https://wa.me/${nummer}?text=${encodeURIComponent(bericht)}`;
}

export function WekelijkseReviewFormulier({ weekNummer }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [bewaardId, setBewaardId] = useState<string | null>(null);
  const [gingGoed, setGingGoed] = useState("");
  const [nietSoepel, setNietSoepel] = useState("");
  const [focus, setFocus] = useState("");
  const [delenMetSponsor, setDelenMetSponsor] = useState(false);
  const [sponsor, setSponsor] = useState<SponsorInfo | null>(null);

  // Sponsor-data ophalen voor de WhatsApp-share-knop ná opslaan
  useEffect(() => {
    let actief = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("sponsor_id")
          .eq("id", user.id)
          .maybeSingle();
        const sponsorId = (profile as { sponsor_id?: string | null } | null)
          ?.sponsor_id;
        if (!sponsorId || !actief) return;
        const { data: sponsorProfile } = await supabase
          .from("profiles")
          .select("full_name, telefoon")
          .eq("id", sponsorId)
          .maybeSingle();
        if (!sponsorProfile || !actief) return;
        const fullName = (sponsorProfile as { full_name?: string }).full_name ?? "";
        const tel = (sponsorProfile as { telefoon?: string | null }).telefoon ?? null;
        setSponsor({
          voornaam: fullName.split(" ")[0] ?? "",
          telefoon: tel,
        });
      } catch {
        // negeer
      }
    })();
    return () => {
      actief = false;
    };
  }, []);

  async function bewaar() {
    if (!gingGoed.trim() && !nietSoepel.trim() && !focus.trim()) {
      toast.error("Vul minimaal één antwoord in");
      return;
    }
    setBezig(true);
    try {
      const res = await fetch("/api/review/wekelijks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNummer,
          gingGoed,
          nietSoepel,
          focusVolgendeWeek: focus,
          gedeeldMetSponsor: delenMetSponsor,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      toast.success(
        delenMetSponsor
          ? "Review bewaard en gedeeld met je sponsor"
          : "Review bewaard",
      );
      // Bewaar de id voor de share-knop ná opslaan
      setBewaardId(data?.id ?? "ok");
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  function bouwShareTekst(): string {
    const regels = [
      `📝 Mijn wekelijkse review (week ${weekNummer})`,
      "",
    ];
    if (gingGoed.trim()) {
      regels.push(`✅ Wat ging goed:`);
      regels.push(gingGoed.trim());
      regels.push("");
    }
    if (nietSoepel.trim()) {
      regels.push(`⚠️ Wat liep niet soepel:`);
      regels.push(nietSoepel.trim());
      regels.push("");
    }
    if (focus.trim()) {
      regels.push(`🎯 Mijn focus voor volgende week:`);
      regels.push(focus.trim());
    }
    return regels.join("\n");
  }

  function reset() {
    setGingGoed("");
    setNietSoepel("");
    setFocus("");
    setDelenMetSponsor(false);
    setBewaardId(null);
    setOpen(false);
  }

  // Na bewaren: toon bevestiging + WhatsApp-share-knop + link naar
  // mijn-reviews-archief
  if (bewaardId) {
    const shareText = bouwShareTekst();
    const sponsorWhats = sponsor
      ? bouwWhatsAppLink(
          sponsor.telefoon,
          `Hoi${sponsor.voornaam ? " " + sponsor.voornaam : ""}!\n\n${shareText}`,
        )
      : null;
    return (
      <div className="card border-l-4 border-cm-gold/60 space-y-3">
        <div>
          <h3 className="text-cm-gold font-semibold text-base flex items-center gap-2">
            ✅ Review bewaard, week {weekNummer}
          </h3>
          <p className="text-cm-white/80 text-sm mt-1 leading-relaxed">
            Je review staat op je eigen overzicht. Je kunt 'm nu naar je
            sponsor sturen via WhatsApp, of later terugkijken op{" "}
            <Link href="/mijn-reviews" className="text-cm-gold underline">
              Mijn reviews
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {sponsorWhats ? (
            <a
              href={sponsorWhats}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-sm"
            >
              💬 Stuur naar sponsor (WhatsApp)
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="btn-gold text-sm opacity-50 cursor-not-allowed"
              title="Sponsor heeft geen telefoonnummer ingevuld"
            >
              💬 WhatsApp niet beschikbaar
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(shareText);
              toast.success("Review gekopieerd naar klembord");
            }}
            className="btn-secondary text-sm"
          >
            📋 Kopieer tekst
          </button>
          <button type="button" onClick={reset} className="btn-secondary text-sm">
            Klaar
          </button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="card border-l-4 border-cm-gold/60 space-y-3">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h3 className="text-cm-gold font-semibold text-base flex items-center gap-2">
            📝 Wekelijkse review
          </h3>
          <Link
            href="/mijn-reviews"
            className="text-cm-white/60 hover:text-cm-white text-xs underline-offset-2 hover:underline"
          >
            Mijn eerdere reviews →
          </Link>
        </div>
        <p className="text-cm-white/80 text-sm leading-relaxed">
          Drie korte vragen om terug te kijken op week {weekNummer}. Je kiest
          zelf of je 'm met je sponsor wilt delen.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-gold text-sm"
        >
          Vul de review in →
        </button>
      </div>
    );
  }

  return (
    <div className="card border-l-4 border-cm-gold/60 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-cm-gold font-semibold text-base">
            📝 Wekelijkse review, week {weekNummer}
          </h3>
          <p className="text-cm-white/60 text-xs mt-1">
            Eerlijk antwoorden levert je de meeste groei.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={bezig}
          className="text-cm-white/60 hover:text-cm-white text-xs"
        >
          Sluit
        </button>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-cm-white text-sm font-medium">
            1. Wat ging goed deze week?
          </span>
          <textarea
            value={gingGoed}
            onChange={(e) => setGingGoed(e.target.value)}
            placeholder="Klein of groot, alles telt..."
            rows={3}
            className="input-cm w-full mt-1.5 text-sm"
            disabled={bezig}
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-cm-white text-sm font-medium">
            2. Wat liep niet soepel?
          </span>
          <textarea
            value={nietSoepel}
            onChange={(e) => setNietSoepel(e.target.value)}
            placeholder="Geen oordeel, gewoon eerlijk..."
            rows={3}
            className="input-cm w-full mt-1.5 text-sm"
            disabled={bezig}
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-cm-white text-sm font-medium">
            3. Waar focus ik volgende week op?
          </span>
          <textarea
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Eén ding waar je in groeit..."
            rows={3}
            className="input-cm w-full mt-1.5 text-sm"
            disabled={bezig}
          />
        </label>
      </div>

      <label className="flex items-start gap-3 p-3 rounded-lg border border-cm-border bg-cm-surface-2 cursor-pointer hover:bg-cm-surface transition-colors">
        <input
          type="checkbox"
          checked={delenMetSponsor}
          onChange={(e) => setDelenMetSponsor(e.target.checked)}
          disabled={bezig}
          className="mt-1 cursor-pointer"
        />
        <div>
          <p className="text-cm-white text-sm font-medium">
            Deel deze review met mijn sponsor
          </p>
          <p className="text-cm-white/60 text-xs mt-0.5 leading-relaxed">
            Sponsor ziet je antwoorden en kan je gerichter ondersteunen waar
            het niet soepel liep. Niet automatisch, alleen als jij dit aanvinkt.
          </p>
        </div>
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={bewaar}
          disabled={bezig}
          className="btn-gold flex-1 text-sm"
        >
          {bezig ? "Bewaren..." : "Bewaar review"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={bezig}
          className="btn-secondary text-sm"
        >
          Annuleer
        </button>
      </div>
    </div>
  );
}
