"use client";

import { useState } from "react";
import { differenceInDays, format } from "date-fns";
import { nl, enUS, fr, es, de, pt, Locale } from "date-fns/locale";
import { Herinnering } from "@/lib/supabase/types";
import { HerinneringActies } from "@/components/herinneringen/HerinneringActies";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTaal } from "@/lib/i18n/TaalContext";
import Link from "next/link";

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

const TYPE_ICOON: Record<string, string> = {
  followup: "🔄",
  product_herbestelling: "📦",
  custom: "📌",
};

interface Props {
  herinnering: Herinnering & {
    prospect?: { id: string; volledige_naam: string } | null;
  };
  // Verberg de "→ [naam]" link als we al op de prospect-kaart staan.
  toonProspectLink?: boolean;
}

// Click-to-expand + bewerkbare herinnering. Gebruikt op de prospect-kaart
// én op /herinneringen (sidebar). Doel: lappen tekst kunnen teruglezen
// en bewerken zonder apart navigatie-pad.
export function HerinneringItem({ herinnering, toonProspectLink = true }: Props) {
  const { taal } = useTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;
  const supabase = createClient();
  const router = useRouter();

  const [uitgevouwen, setUitgevouwen] = useState(false);
  const [bewerken, setBewerken] = useState(false);
  const [tekst, setTekst] = useState(herinnering.beschrijving || "");
  const [titel, setTitel] = useState(herinnering.titel);
  const [datum, setDatum] = useState(herinnering.vervaldatum);
  const [laden, setLaden] = useState(false);

  const vandaag = new Date().toISOString().split("T")[0];
  const isVerlopen = herinnering.vervaldatum < vandaag;
  const isVandaag = herinnering.vervaldatum === vandaag;
  const dagenTeLaat = differenceInDays(new Date(), new Date(herinnering.vervaldatum));
  const heeftBeschrijving = !!(herinnering.beschrijving && herinnering.beschrijving.trim());
  const isLang = heeftBeschrijving && herinnering.beschrijving!.length > 60;

  const kleur = isVerlopen
    ? "border-l-red-500 bg-red-500/5"
    : isVandaag
      ? "border-l-cm-gold"
      : "border-l-blue-500";

  async function slaBewerkingOp() {
    setLaden(true);
    const { error } = await supabase
      .from("herinneringen")
      .update({
        titel: titel.trim() || "Herinnering zonder titel",
        beschrijving: tekst.trim() || null,
        vervaldatum: datum,
      })
      .eq("id", herinnering.id);

    if (error) {
      toast.error("Opslaan mislukt: " + error.message);
    } else {
      toast.success("Herinnering bijgewerkt");
      setBewerken(false);
      router.refresh();
    }
    setLaden(false);
  }

  function annuleerBewerking() {
    setTekst(herinnering.beschrijving || "");
    setTitel(herinnering.titel);
    setDatum(herinnering.vervaldatum);
    setBewerken(false);
  }

  return (
    <div
      className={`border-l-4 ${kleur} bg-cm-surface-2 rounded-lg p-3 transition-colors`}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => !bewerken && setUitgevouwen((v) => !v)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base">
              {TYPE_ICOON[herinnering.herinnering_type] || "📌"}
            </span>
            {bewerken ? (
              <input
                type="text"
                value={titel}
                onChange={(e) => setTitel(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="input-cm text-sm flex-1 min-w-0"
              />
            ) : (
              <p className="text-cm-white font-semibold text-sm">{herinnering.titel}</p>
            )}
            {!bewerken && isVerlopen && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                {dagenTeLaat === 1 ? "1 dag te laat" : `${dagenTeLaat} dagen te laat`}
              </span>
            )}
            {!bewerken && isVandaag && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-cm-gold/20 text-cm-gold px-1.5 py-0.5 rounded">
                Vandaag
              </span>
            )}
            {!bewerken && heeftBeschrijving && (
              <span className="text-cm-gold text-xs ml-auto">
                {uitgevouwen ? "▲" : "▼"}
              </span>
            )}
          </div>

          {/* Beschrijving preview (ingeklapt = max 2 regels) / vol (uitgevouwen) */}
          {!bewerken && heeftBeschrijving && (
            <p
              className={`text-cm-white text-xs mt-1 ml-6 opacity-90 whitespace-pre-wrap leading-relaxed ${
                !uitgevouwen && isLang ? "line-clamp-2" : ""
              }`}
            >
              {herinnering.beschrijving}
            </p>
          )}

          {!bewerken && toonProspectLink && herinnering.prospect && (
            <Link
              href={`/namenlijst/${herinnering.prospect.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-cm-gold text-xs mt-1 ml-6 hover:text-cm-gold-light transition-colors inline-flex items-center gap-1"
            >
              👤 {herinnering.prospect.volledige_naam} →
            </Link>
          )}

          {!bewerken && (
            <p
              className={`text-xs mt-1 ml-6 ${
                isVerlopen ? "text-red-400" : "text-cm-white opacity-70"
              }`}
            >
              {format(new Date(herinnering.vervaldatum), "EEEE d MMMM yyyy", {
                locale: datumLocale,
              })}
            </p>
          )}
        </button>

        {!bewerken && <HerinneringActies herinneringId={herinnering.id} />}
      </div>

      {/* Uitgevouwen: toon bewerk-knop onderaan */}
      {uitgevouwen && !bewerken && (
        <div className="mt-3 ml-6 flex items-center gap-3">
          <button
            onClick={() => setBewerken(true)}
            className="text-cm-gold text-xs hover:text-cm-gold-light transition-colors"
          >
            ✏️ Bewerken
          </button>
        </div>
      )}

      {/* Bewerk-modus: volledige textarea + datum + opslaan/annuleer */}
      {bewerken && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-xs text-cm-white mb-1 opacity-70">
              Tekst
            </label>
            <textarea
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              rows={6}
              placeholder="Schrijf hier de volledige tekst..."
              className="textarea-cm text-sm w-full"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-cm-white mb-1 opacity-70">
              Datum
            </label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="input-cm text-sm [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={slaBewerkingOp}
              disabled={laden}
              className="btn-gold text-sm flex-1"
            >
              {laden ? "Opslaan..." : "Opslaan"}
            </button>
            <button
              onClick={annuleerBewerking}
              disabled={laden}
              className="btn-secondary text-sm"
            >
              Annuleer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
