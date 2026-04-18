"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Prospect, PipelineFase, PIPELINE_FASEN } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTaal } from "@/lib/i18n/TaalContext";

interface Props {
  prospect: Prospect;
  userId: string;
}

export function ProspectActieForm({ prospect, userId }: Props) {
  const { v } = useTaal();
  const [actief, setActief] = useState<"actie" | "bestelling" | null>(null);
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Volgende actie form
  const [volgendeDatum, setVolgendeDatum] = useState(
    prospect.volgende_actie_datum || ""
  );
  const [volgendeNotitie, setVolgendeNotitie] = useState(
    prospect.volgende_actie_notitie || ""
  );
  const [nieuweFase, setNieuweFase] = useState<PipelineFase>(prospect.pipeline_fase);
  const [contactType, setContactType] = useState("followup");
  const [contactNotitie, setContactNotitie] = useState("");
  // Datum van de aantekening zelf — default vandaag, user kan terug in de tijd
  const [aantekeningDatum, setAantekeningDatum] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Bestelling form
  const [besteldatum, setBesteldatum] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [productOmschrijving, setProductOmschrijving] = useState("");

  async function slaActieOp(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);

    // Log het contact — override created_at als user een eerdere datum koos
    const vandaag = new Date().toISOString().split("T")[0];
    const contactLogData: any = {
      prospect_id: prospect.id,
      user_id: userId,
      contact_type: contactType,
      notities: contactNotitie,
      fase_voor: prospect.pipeline_fase,
      fase_na: nieuweFase,
    };
    if (aantekeningDatum && aantekeningDatum !== vandaag) {
      // 12:00 UTC zodat tijdweergave consistent is in elke tijdzone
      contactLogData.created_at = `${aantekeningDatum}T12:00:00.000Z`;
    }
    await supabase.from("contact_logs").insert(contactLogData);

    // Update prospect — laatste_contact = gekozen datum (niet per se vandaag)
    const updates: Partial<Prospect> = {
      pipeline_fase: nieuweFase,
      laatste_contact: aantekeningDatum || vandaag,
      updated_at: new Date().toISOString(),
    };

    if (volgendeDatum) {
      updates.volgende_actie_datum = volgendeDatum;
      updates.volgende_actie_notitie = volgendeNotitie;

      // Maak herinnering aan
      await supabase.from("herinneringen").insert({
        user_id: userId,
        prospect_id: prospect.id,
        herinnering_type: "followup",
        titel: `Follow-up: ${prospect.volledige_naam}`,
        beschrijving: volgendeNotitie || `Opvolgen van ${prospect.volledige_naam}`,
        vervaldatum: volgendeDatum,
      });
    }

    const { error } = await supabase
      .from("prospects")
      .update(updates)
      .eq("id", prospect.id);

    if (error) {
      toast.error(v("actie.fout"));
    } else {
      toast.success(v("actie.opgeslagen"));
      setActief(null);
      router.refresh();
    }

    setLaden(false);
  }

  async function slaBestellingOp(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);

    const { error } = await supabase.from("product_bestellingen").insert({
      prospect_id: prospect.id,
      user_id: userId,
      besteldatum,
      product_omschrijving: productOmschrijving,
    });

    if (error) {
      toast.error(v("actie.bestelling_fout"));
    } else {
      toast.success(v("actie.bestelling_opgeslagen"));
      setActief(null);
      router.refresh();
    }

    setLaden(false);
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
        {v("actie.bijhouden")}
      </h2>

      {/* Knoppen */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActief(actief === "actie" ? null : "actie")}
          className={`text-sm px-4 py-2 rounded-lg transition-colors ${
            actief === "actie"
              ? "bg-cm-gold text-cm-black font-semibold"
              : "btn-secondary"
          }`}
        >
          {v("actie.aantekening")}
        </button>
        <button
          onClick={() => setActief(actief === "bestelling" ? null : "bestelling")}
          className={`text-sm px-4 py-2 rounded-lg transition-colors ${
            actief === "bestelling"
              ? "bg-cm-gold text-cm-black font-semibold"
              : "btn-secondary"
          }`}
        >
          {v("actie.bestelling_knop")}
        </button>
      </div>

      {/* Aantekening toevoegen form */}
      {actief === "actie" && (
        <form onSubmit={slaActieOp} className="space-y-3 border-t border-cm-border pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-cm-white mb-1">{v("actie.type_contact")}</label>
              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value)}
                className="input-cm text-sm"
              >
                <option value="dm">DM</option>
                <option value="bel">{v("actie.bellen")}</option>
                <option value="presentatie">{v("fase.presentatie")}</option>
                <option value="followup">Follow-up</option>
                <option value="notitie">{v("namenlijst.aantekeningen")}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-cm-white mb-1">{v("actie.nieuwe_fase")}</label>
              <select
                value={nieuweFase}
                onChange={(e) => setNieuweFase(e.target.value as PipelineFase)}
                className="input-cm text-sm"
              >
                {PIPELINE_FASEN.map((f) => (
                  <option key={f.fase} value={f.fase}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-cm-white mb-1">{v("actie.besproken")}</label>
            <textarea
              value={contactNotitie}
              onChange={(e) => setContactNotitie(e.target.value)}
              placeholder={v("actie.besproken_placeholder")}
              className="textarea-cm text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-xs text-cm-white mb-1">
              Datum aantekening{" "}
              <span className="opacity-60">(default vandaag, je kan terug in de tijd)</span>
            </label>
            <input
              type="date"
              value={aantekeningDatum}
              onChange={(e) => setAantekeningDatum(e.target.value)}
              className="input-cm text-sm [&::-webkit-calendar-picker-indicator]:invert"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="border-t border-cm-border pt-3">
            <p className="text-xs text-cm-white mb-2">
              🔔 Volgende actie plannen{" "}
              <span className="opacity-60">(wordt een herinnering)</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-cm-white mb-1">Herinnering-datum</label>
                <input
                  type="date"
                  value={volgendeDatum}
                  onChange={(e) => setVolgendeDatum(e.target.value)}
                  className="input-cm text-sm [&::-webkit-calendar-picker-indicator]:invert"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="block text-xs text-cm-white mb-1">Wat herinneren</label>
                <input
                  type="text"
                  value={volgendeNotitie}
                  onChange={(e) => setVolgendeNotitie(e.target.value)}
                  placeholder={v("actie.wat_placeholder")}
                  className="input-cm text-sm"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={laden} className="btn-gold w-full text-sm">
            {laden ? v("algemeen.laden") : v("actie.opslaan")}
          </button>
        </form>
      )}

      {/* Bestelling form */}
      {actief === "bestelling" && (
        <form onSubmit={slaBestellingOp} className="space-y-3 border-t border-cm-border pt-4">
          <div className="bg-gold-subtle border border-gold-subtle rounded-lg p-3">
            <p className="text-cm-gold text-xs font-semibold mb-1">
              🔔 {v("algemeen.herinneringen") || "Automatische herinneringen"}
            </p>
            <p className="text-cm-white text-xs">
              {v("actie.herinnering_info")}
            </p>
          </div>

          <div>
            <label className="block text-xs text-cm-white mb-1">{v("actie.besteldatum")}</label>
            <input
              type="date"
              value={besteldatum}
              onChange={(e) => setBesteldatum(e.target.value)}
              className="input-cm text-sm [&::-webkit-calendar-picker-indicator]:invert"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-cm-white mb-1">{v("actie.product")}</label>
            <input
              type="text"
              value={productOmschrijving}
              onChange={(e) => setProductOmschrijving(e.target.value)}
              placeholder={v("actie.product_placeholder")}
              className="input-cm text-sm"
            />
          </div>

          <button type="submit" disabled={laden} className="btn-gold w-full text-sm">
            {laden ? v("algemeen.laden") : v("actie.bestelling_opslaan")}
          </button>
        </form>
      )}
    </div>
  );
}
