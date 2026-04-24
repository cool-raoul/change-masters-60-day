"use client";

// Lijst van productbestellingen op de prospect-detail kaart.
// Elke bestelling kan inline bewerkt of verwijderd worden — zonder modal.
// De reminder-datum wordt NIET automatisch meeverschoven als je de
// besteldatum aanpast, omdat die twee los van elkaar gezet kunnen worden
// (de herinnering kan handmatig zijn uitgesteld). Je ziet dus beide velden.

import { useState } from "react";
import { format } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import type { Locale } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductBestelling } from "@/lib/supabase/types";

interface Props {
  bestellingen: ProductBestelling[];
  titel: string;
  herinneringLabel: string;
  // BELANGRIJK: Locale-objecten van date-fns bevatten functies en kunnen
  // niet als prop van server → client worden doorgegeven (Next throwt een
  // serialization error). Dus we nemen een simpele taal-key aan en kiezen
  // de Locale client-side uit.
  taal: string;
}

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

// date-input verwacht YYYY-MM-DD; database kan een ISO string teruggeven.
function naarInputDatum(iso: string): string {
  return iso.slice(0, 10);
}

export function ProductBestellingenLijst({
  bestellingen,
  titel,
  herinneringLabel,
  taal,
}: Props) {
  const datumLocale = DATE_LOCALES[taal] || nl;
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [bevestigenId, setBevestigenId] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  // Bewerk-formulier state (per moment maar één bestelling in bewerkmodus).
  const [besteldatum, setBesteldatum] = useState("");
  const [omschrijving, setOmschrijving] = useState("");
  const [reminderDatum, setReminderDatum] = useState("");

  const supabase = createClient();
  const router = useRouter();

  if (bestellingen.length === 0) return null;

  function startBewerken(b: ProductBestelling) {
    setBewerkId(b.id);
    setBevestigenId(null);
    setBesteldatum(naarInputDatum(b.besteldatum));
    setOmschrijving(b.product_omschrijving ?? "");
    setReminderDatum(naarInputDatum(b.tweede_bestelling_reminder_datum));
  }

  function annuleerBewerken() {
    setBewerkId(null);
    setBesteldatum("");
    setOmschrijving("");
    setReminderDatum("");
  }

  async function slaOp(id: string) {
    if (!besteldatum || !reminderDatum) {
      toast.error("Vul beide datums in");
      return;
    }
    setBezig(true);
    const { error } = await supabase
      .from("product_bestellingen")
      .update({
        besteldatum,
        product_omschrijving: omschrijving || null,
        tweede_bestelling_reminder_datum: reminderDatum,
      })
      .eq("id", id);

    if (error) {
      toast.error("Opslaan mislukt: " + error.message);
    } else {
      toast.success("Bestelling bijgewerkt");
      annuleerBewerken();
      router.refresh();
    }
    setBezig(false);
  }

  async function verwijder(id: string) {
    setBezig(true);
    const { error } = await supabase
      .from("product_bestellingen")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Verwijderen mislukt: " + error.message);
    } else {
      toast.success("Bestelling verwijderd");
      setBevestigenId(null);
      router.refresh();
    }
    setBezig(false);
  }

  return (
    <div className="pb-3 border-b border-cm-border">
      <p className="text-xs text-cm-white mb-2">{titel}</p>
      {bestellingen.map((b) => {
        const inBewerking = bewerkId === b.id;
        const inBevestigen = bevestigenId === b.id;

        if (inBewerking) {
          return (
            <div
              key={b.id}
              className="bg-cm-surface-2 rounded-lg p-3 text-xs mb-2 space-y-2 border border-cm-gold-dim"
            >
              <div>
                <label className="block text-[10px] text-cm-white opacity-60 mb-1">
                  Besteldatum
                </label>
                <input
                  type="date"
                  value={besteldatum}
                  onChange={(e) => setBesteldatum(e.target.value)}
                  className="input-cm text-xs w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] text-cm-white opacity-60 mb-1">
                  Producten
                </label>
                <input
                  type="text"
                  value={omschrijving}
                  onChange={(e) => setOmschrijving(e.target.value)}
                  placeholder="Bijv. Daily BioBasics + Proanthenols"
                  className="input-cm text-xs w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] text-cm-white opacity-60 mb-1">
                  Herinnering volgende bestelling
                </label>
                <input
                  type="date"
                  value={reminderDatum}
                  onChange={(e) => setReminderDatum(e.target.value)}
                  className="input-cm text-xs w-full"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={annuleerBewerken}
                  disabled={bezig}
                  className="btn-secondary text-xs flex-1 py-1.5"
                >
                  Annuleren
                </button>
                <button
                  type="button"
                  onClick={() => slaOp(b.id)}
                  disabled={bezig}
                  className="btn-gold text-xs flex-1 py-1.5"
                >
                  {bezig ? "Bezig…" : "Opslaan"}
                </button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={b.id}
            className="bg-cm-surface-2 rounded-lg p-2 text-xs mb-2 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-cm-white">
                  {format(new Date(b.besteldatum), "d MMM yyyy", {
                    locale: datumLocale,
                  })}
                </p>
                {b.product_omschrijving && (
                  <p className="text-cm-white break-words">
                    {b.product_omschrijving}
                  </p>
                )}
                <p className="text-cm-gold mt-1">
                  🔔 {herinneringLabel}{" "}
                  {format(new Date(b.tweede_bestelling_reminder_datum), "d MMM yyyy", {
                    locale: datumLocale,
                  })}
                </p>
              </div>
              {/* Actieknoppen — compact, rechts. Niet verborgen bij hover want
                  op mobiel bestaat hover niet; user moet altijd kunnen ingrijpen. */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {inBevestigen ? (
                  <>
                    <button
                      onClick={() => verwijder(b.id)}
                      disabled={bezig}
                      className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded transition-colors"
                      title="Verwijderen bevestigen"
                    >
                      Ja
                    </button>
                    <button
                      onClick={() => setBevestigenId(null)}
                      className="text-[10px] text-cm-white opacity-70 hover:opacity-100 px-1 transition-opacity"
                    >
                      Nee
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startBewerken(b)}
                      className="text-cm-gold hover:text-cm-gold-light text-sm px-1.5 py-0.5 rounded hover:bg-cm-gold/10 transition-colors"
                      title="Bewerken"
                      aria-label="Bewerken"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setBevestigenId(b.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-1.5 py-0.5 rounded hover:bg-red-500/10 transition-colors"
                      title="Verwijderen"
                      aria-label="Verwijderen"
                    >
                      🗑
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
