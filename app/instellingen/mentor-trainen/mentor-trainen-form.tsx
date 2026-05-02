"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { gebruikSpraak } from "@/components/voice/gebruikSpraak";

// ============================================================
// MentorTrainenForm, voeg een nieuw vraag-antwoord-voorbeeld toe.
//
// Velden:
//   - doelgroep (member / prospect)
//   - categorie (dm / bezwaar / followup / etc)
//   - vraag (typen of inspreken via Whisper)
//   - antwoord (typen of inspreken)
//   - tags (komma-gescheiden)
//
// Voice-inspreken: bij elk tekstveld een 🎙️-knop. Bij stop transcribeert
// Whisper en plakt resultaat in het veld.
// ============================================================

type Doelgroep = "member" | "prospect";
type Categorie =
  | "algemeen"
  | "dm"
  | "bezwaar"
  | "followup"
  | "closing"
  | "drieweg"
  | "productadvies"
  | "motivatie"
  | "accountability"
  | "social";

const CATEGORIE_LABELS: Record<Categorie, string> = {
  algemeen: "Algemeen",
  dm: "DM / Uitnodigen",
  bezwaar: "Bezwaren",
  followup: "Follow-up",
  closing: "Closing / sluiting",
  drieweg: "3-weg-gesprek",
  productadvies: "Productadvies",
  motivatie: "Motivatie",
  accountability: "Accountability",
  social: "Social media",
};

export function MentorTrainenForm() {
  const router = useRouter();
  const [doelgroep, setDoelgroep] = useState<Doelgroep>("member");
  const [categorie, setCategorie] = useState<Categorie>("algemeen");
  const [vraag, setVraag] = useState("");
  const [antwoord, setAntwoord] = useState("");
  const [tagsRuw, setTagsRuw] = useState("");
  const [bezig, setBezig] = useState(false);

  const vraagSpraak = gebruikSpraak({
    taal: "nl",
    maxSeconden: 90,
    onMaxBereikt: async () => {
      const r = await vraagSpraak.stop();
      if (r.tekst) setVraag((p) => (p ? p + " " + r.tekst : r.tekst));
    },
  });

  const antwoordSpraak = gebruikSpraak({
    taal: "nl",
    maxSeconden: 180,
    onMaxBereikt: async () => {
      const r = await antwoordSpraak.stop();
      if (r.tekst) setAntwoord((p) => (p ? p + " " + r.tekst : r.tekst));
    },
  });

  async function startStopVraag() {
    if (vraagSpraak.actief) {
      const r = await vraagSpraak.stop();
      if (r.fout) toast.error(r.fout);
      else if (r.tekst) setVraag((p) => (p ? p + " " + r.tekst : r.tekst));
    } else {
      await vraagSpraak.start();
    }
  }

  async function startStopAntwoord() {
    if (antwoordSpraak.actief) {
      const r = await antwoordSpraak.stop();
      if (r.fout) toast.error(r.fout);
      else if (r.tekst)
        setAntwoord((p) => (p ? p + " " + r.tekst : r.tekst));
    } else {
      await antwoordSpraak.start();
    }
  }

  async function bewaar() {
    if (vraag.trim().length < 5) {
      toast.error("Vraag is te kort, schrijf minimaal een paar woorden");
      return;
    }
    if (antwoord.trim().length < 10) {
      toast.error("Antwoord is te kort, geef wat meer context");
      return;
    }
    setBezig(true);
    try {
      const tags = tagsRuw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
      const res = await fetch("/api/mentor-trainen/voorbeeld", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doelgroep,
          categorie,
          vraag: vraag.trim(),
          goed_antwoord: antwoord.trim(),
          tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Opslaan mislukt");
        return;
      }
      toast.success("✓ Voorbeeld opgeslagen, Mentor leert er direct van");
      setVraag("");
      setAntwoord("");
      setTagsRuw("");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "fout";
      toast.error(`Opslaan mislukt: ${msg}`);
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="card space-y-4 border-l-4 border-cm-gold/60">
      <div>
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
          ➕ Nieuw voorbeeld
        </h2>
        <p className="text-cm-white opacity-70 text-xs mt-1 leading-relaxed">
          Tip: gebruik echte vragen uit WhatsApp en exact zoals jij geantwoord
          zou hebben. Hoe natuurlijker, hoe beter de Mentor leert.
        </p>
      </div>

      {/* Doelgroep + categorie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-cm-white text-xs opacity-70 mb-1 block">
            Doelgroep
          </label>
          <select
            value={doelgroep}
            onChange={(e) => setDoelgroep(e.target.value as Doelgroep)}
            className="input-cm w-full text-sm"
          >
            <option value="member">Member (ELEVA Mentor)</option>
            <option value="prospect">Prospect (programma-coach, later)</option>
          </select>
        </div>
        <div>
          <label className="text-cm-white text-xs opacity-70 mb-1 block">
            Categorie
          </label>
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value as Categorie)}
            className="input-cm w-full text-sm"
          >
            {(Object.keys(CATEGORIE_LABELS) as Categorie[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORIE_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vraag */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-cm-white text-xs opacity-70">
            De vraag (zoals member 'm zou stellen)
          </label>
          <button
            type="button"
            onClick={startStopVraag}
            disabled={!vraagSpraak.ondersteund}
            className={`text-xs px-2 py-1 rounded-md ${
              vraagSpraak.actief
                ? "bg-red-500 text-white animate-pulse"
                : "border border-cm-border text-cm-white hover:border-cm-gold-dim"
            } disabled:opacity-30`}
          >
            {vraagSpraak.actief
              ? `⏹️ Stop (${vraagSpraak.seconden}s)`
              : "🎙️ Inspreken"}
          </button>
        </div>
        <textarea
          value={vraag}
          onChange={(e) => setVraag(e.target.value)}
          rows={3}
          placeholder="Bijv: 'Hoe ga ik om met een prospect die zegt: ik heb geen tijd?'"
          className="textarea-cm w-full text-sm leading-relaxed"
        />
      </div>

      {/* Antwoord */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-cm-white text-xs opacity-70">
            Het goede antwoord (zoals jij zou reageren)
          </label>
          <button
            type="button"
            onClick={startStopAntwoord}
            disabled={!antwoordSpraak.ondersteund}
            className={`text-xs px-2 py-1 rounded-md ${
              antwoordSpraak.actief
                ? "bg-red-500 text-white animate-pulse"
                : "border border-cm-border text-cm-white hover:border-cm-gold-dim"
            } disabled:opacity-30`}
          >
            {antwoordSpraak.actief
              ? `⏹️ Stop (${antwoordSpraak.seconden}s)`
              : "🎙️ Inspreken"}
          </button>
        </div>
        <textarea
          value={antwoord}
          onChange={(e) => setAntwoord(e.target.value)}
          rows={6}
          placeholder="Schrijf precies zoals jij in WhatsApp zou antwoorden..."
          className="textarea-cm w-full text-sm leading-relaxed"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-cm-white text-xs opacity-70 mb-1 block">
          Tags (optioneel, komma-gescheiden)
        </label>
        <input
          type="text"
          value={tagsRuw}
          onChange={(e) => setTagsRuw(e.target.value)}
          placeholder="ondernemer, mid-warm, tijd-bezwaar"
          className="input-cm w-full text-sm"
        />
      </div>

      <button
        type="button"
        onClick={bewaar}
        disabled={bezig || !vraag.trim() || !antwoord.trim()}
        className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-50"
      >
        {bezig ? "Opslaan..." : "✓ Voorbeeld opslaan"}
      </button>
    </div>
  );
}
