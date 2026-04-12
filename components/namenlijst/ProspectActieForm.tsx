"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Prospect, PipelineFase, PIPELINE_FASEN } from "@/lib/supabase/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  prospect: Prospect;
  userId: string;
}

export function ProspectActieForm({ prospect, userId }: Props) {
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

  // Bestelling form
  const [besteldatum, setBesteldatum] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [productOmschrijving, setProductOmschrijving] = useState("");

  async function slaActieOp(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);

    // Log het contact
    await supabase.from("contact_logs").insert({
      prospect_id: prospect.id,
      user_id: userId,
      contact_type: contactType,
      notities: contactNotitie,
      fase_voor: prospect.pipeline_fase,
      fase_na: nieuweFase,
    });

    // Update prospect
    const updates: Partial<Prospect> = {
      pipeline_fase: nieuweFase,
      laatste_contact: new Date().toISOString().split("T")[0],
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
      toast.error("Kon niet opslaan");
    } else {
      toast.success("Contact gelogd en prospect bijgewerkt");
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
      toast.error("Kon bestelling niet opslaan");
    } else {
      toast.success(
        "Bestelling opgeslagen — herinnering aangemaakt voor 21 dagen later!"
      );
      setActief(null);
      router.refresh();
    }

    setLaden(false);
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-sm font-semibold text-cm-muted uppercase tracking-wider">
        Actie toevoegen
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
          📝 Contact loggen
        </button>
        <button
          onClick={() => setActief(actief === "bestelling" ? null : "bestelling")}
          className={`text-sm px-4 py-2 rounded-lg transition-colors ${
            actief === "bestelling"
              ? "bg-cm-gold text-cm-black font-semibold"
              : "btn-secondary"
          }`}
        >
          📦 Bestelling registreren
        </button>
      </div>

      {/* Contact loggen form */}
      {actief === "actie" && (
        <form onSubmit={slaActieOp} className="space-y-3 border-t border-cm-border pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-cm-muted mb-1">Type contact</label>
              <select
                value={contactType}
                onChange={(e) => setContactType(e.target.value)}
                className="input-cm text-sm"
              >
                <option value="dm">DM</option>
                <option value="bel">Bellen</option>
                <option value="presentatie">Presentatie</option>
                <option value="followup">Follow-up</option>
                <option value="notitie">Notitie</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-cm-muted mb-1">Nieuwe fase</label>
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
            <label className="block text-xs text-cm-muted mb-1">Wat is er besproken?</label>
            <textarea
              value={contactNotitie}
              onChange={(e) => setContactNotitie(e.target.value)}
              placeholder="Korte samenvatting van het gesprek..."
              className="textarea-cm text-sm"
              rows={2}
            />
          </div>

          <div className="border-t border-cm-border pt-3">
            <p className="text-xs text-cm-muted mb-2">Volgende actie plannen (optioneel)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-cm-muted mb-1">Datum</label>
                <input
                  type="date"
                  value={volgendeDatum}
                  onChange={(e) => setVolgendeDatum(e.target.value)}
                  className="input-cm text-sm"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="block text-xs text-cm-muted mb-1">Wat ga je doen?</label>
                <input
                  type="text"
                  value={volgendeNotitie}
                  onChange={(e) => setVolgendeNotitie(e.target.value)}
                  placeholder="Bijv. Follow-up bellen"
                  className="input-cm text-sm"
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={laden} className="btn-gold w-full text-sm">
            {laden ? "Opslaan..." : "Contact loggen"}
          </button>
        </form>
      )}

      {/* Bestelling form */}
      {actief === "bestelling" && (
        <form onSubmit={slaBestellingOp} className="space-y-3 border-t border-cm-border pt-4">
          <div className="bg-gold-subtle border border-gold-subtle rounded-lg p-3">
            <p className="text-cm-gold text-xs font-semibold mb-1">
              🔔 Automatische herinnering
            </p>
            <p className="text-cm-muted text-xs">
              21 dagen na de bestelling krijg je automatisch een herinnering om
              contact op te nemen voor de tweede bestelling.
            </p>
          </div>

          <div>
            <label className="block text-xs text-cm-muted mb-1">Besteldatum</label>
            <input
              type="date"
              value={besteldatum}
              onChange={(e) => setBesteldatum(e.target.value)}
              className="input-cm text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-cm-muted mb-1">Product omschrijving</label>
            <input
              type="text"
              value={productOmschrijving}
              onChange={(e) => setProductOmschrijving(e.target.value)}
              placeholder="Bijv. Startpakket, Maandbestelling..."
              className="input-cm text-sm"
            />
          </div>

          <button type="submit" disabled={laden} className="btn-gold w-full text-sm">
            {laden ? "Opslaan..." : "Bestelling registreren"}
          </button>
        </form>
      )}
    </div>
  );
}
