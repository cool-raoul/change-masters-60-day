"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { MentorProfiel, Talent } from "@/lib/mentor-profiel/types";

const TALENTEN: { waarde: Talent; label: string }[] = [
  { waarde: "schrijver", label: "Schrijver" },
  { waarde: "spreker", label: "Spreker" },
  { waarde: "filmer", label: "Filmer" },
  { waarde: "DM-er", label: "DM-er" },
];

export default function MentorProfielPagina() {
  const [laden, setLaden] = useState(true);
  const [bezig, setBezig] = useState(false);
  const [p, setP] = useState<MentorProfiel>({});

  useEffect(() => {
    fetch("/api/mentor-profiel")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.profiel) setP(d.profiel as MentorProfiel);
      })
      .catch(() => {})
      .finally(() => setLaden(false));
  }, []);

  async function bewaar() {
    setBezig(true);
    try {
      const r = await fetch("/api/mentor-profiel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profiel: p }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        toast.error(d.error || "Opslaan mislukt");
        return;
      }
      const d = await r.json();
      if (d?.profiel) setP(d.profiel as MentorProfiel);
      toast.success("Opgeslagen, de Mentor kent je nu beter");
    } catch {
      toast.error("Opslaan mislukt, probeer 't opnieuw");
    } finally {
      setBezig(false);
    }
  }

  function zetVerhaal(k: "persoonlijk" | "product" | "business", v: string) {
    setP((prev) => ({ ...prev, drieVerhalen: { ...(prev.drieVerhalen ?? {}), [k]: v } }));
  }

  if (laden) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-cm-gold rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-cm-gold rounded-full animate-bounce delay-100" />
          <div className="w-3 h-3 bg-cm-gold rounded-full animate-bounce delay-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <Link
        href="/instellingen"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm inline-flex items-center gap-1"
      >
        ← Instellingen
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white flex items-center gap-2">
          🧠 Wat de Mentor over je weet
        </h1>
        <p className="text-cm-white/75 text-sm mt-1 leading-relaxed">
          Dit is wat de Mentor van je heeft onthouden. Hij gebruikt het om in
          jouw stem en vanuit jouw niche te schrijven, ook voor reels op maat.
          Het groeit vanzelf naarmate je met de Mentor werkt, en je mag het hier
          altijd bijschaven of weghalen. Alleen jij ziet dit.
        </p>
      </div>

      <Link
        href={`/coach?prefill=${encodeURIComponent(
          "Maak een reel op maat voor mij, in mijn stem en mijn niche.",
        )}`}
        className="card flex items-center justify-between gap-3 border-cm-gold/40 hover:border-cm-gold transition-colors"
      >
        <div>
          <p className="text-cm-gold font-semibold text-sm">
            🎬 Vraag de Mentor om een reel op maat
          </p>
          <p className="text-cm-white/70 text-sm mt-0.5">
            Hij gebruikt je stem en je niche van hieronder.
          </p>
        </div>
        <span className="text-cm-gold text-lg flex-shrink-0">→</span>
      </Link>

      {p.historieNotitie && (
        <div className="card border-cm-gold/30">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider mb-1">
            Jouw weg tot nu toe
          </p>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            {p.historieNotitie}
          </p>
          <p className="text-cm-white/40 text-xs mt-2 italic">
            Dit houdt de Mentor zelf bij terwijl je werkt.
          </p>
        </div>
      )}

      <div className="card space-y-4">
        <Veld label="Je situatie" hint="In het kort: wie ben je, wat doe je.">
          <textarea
            className="input-cm w-full"
            rows={2}
            value={p.situatie ?? ""}
            onChange={(e) => setP({ ...p, situatie: e.target.value })}
            placeholder="Bv. moeder van twee, werkt parttime in de zorg"
          />
        </Veld>

        <Veld label="Je niche" hint="Waar ligt jouw natuurlijke focus.">
          <input
            className="input-cm w-full"
            value={p.nicheZaadje ?? ""}
            onChange={(e) => setP({ ...p, nicheZaadje: e.target.value })}
            placeholder="Bv. drukke moeders met weinig energie"
          />
        </Veld>

        <Veld label="Je ideale klant" hint="Voor wie kun je het meest betekenen.">
          <input
            className="input-cm w-full"
            value={p.idealeKlant ?? ""}
            onChange={(e) => setP({ ...p, idealeKlant: e.target.value })}
            placeholder="Bv. vrouwen rond de overgang die balans zoeken"
          />
        </Veld>

        <Veld label="Je talent" hint="Waar word jij blij van.">
          <div className="flex flex-wrap gap-2">
            {TALENTEN.map((t) => (
              <button
                key={t.waarde}
                type="button"
                onClick={() =>
                  setP({ ...p, talent: p.talent === t.waarde ? undefined : t.waarde })
                }
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  p.talent === t.waarde
                    ? "border-cm-gold bg-cm-gold/10 text-cm-gold"
                    : "border-cm-border text-cm-white/70 hover:border-cm-gold/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Veld>
      </div>

      <div className="card space-y-4">
        <LijstBewerker
          label="Stem-voorbeelden"
          hint="Zinnen in jouw eigen woorden. Hier zit de goudmijn: hoe meer echte eigen zinnen, hoe beter de Mentor klinkt als jij."
          items={p.stemVoorbeelden ?? []}
          onChange={(v) => setP({ ...p, stemVoorbeelden: v })}
          placeholder="Plak of typ een zin zoals jij 'm echt zou zeggen"
          multiline
        />
        <LijstBewerker
          label="Producten die je zelf gebruikt"
          hint="Zodat de Mentor weet wat je echt kent."
          items={p.eigenProducten ?? []}
          onChange={(v) => setP({ ...p, eigenProducten: v })}
          placeholder="Bv. Daily BioBasics"
        />
        <LijstBewerker
          label="Je passies"
          hint="Waar je over kunt blijven praten."
          items={p.passies ?? []}
          onChange={(v) => setP({ ...p, passies: v })}
          placeholder="Bv. hardlopen, gezond koken"
        />
      </div>

      <div className="card space-y-4">
        <p className="text-cm-gold font-semibold text-sm">Je drie verhalen</p>
        <Veld label="Persoonlijk verhaal" hint="Waarom jij hieraan begon.">
          <textarea
            className="input-cm w-full"
            rows={3}
            value={p.drieVerhalen?.persoonlijk ?? ""}
            onChange={(e) => zetVerhaal("persoonlijk", e.target.value)}
          />
        </Veld>
        <Veld label="Product-verhaal" hint="Wat je zelf hebt gemerkt, claim-vrij.">
          <textarea
            className="input-cm w-full"
            rows={3}
            value={p.drieVerhalen?.product ?? ""}
            onChange={(e) => zetVerhaal("product", e.target.value)}
          />
        </Veld>
        <Veld label="Business-verhaal" hint="Waarom de manier van werken je aanspreekt.">
          <textarea
            className="input-cm w-full"
            rows={3}
            value={p.drieVerhalen?.business ?? ""}
            onChange={(e) => zetVerhaal("business", e.target.value)}
          />
        </Veld>
      </div>

      <button
        onClick={bewaar}
        disabled={bezig}
        className="btn-gold w-full py-3 font-semibold disabled:opacity-50"
      >
        {bezig ? "Opslaan..." : "Opslaan"}
      </button>
    </div>
  );
}

function Veld({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-cm-white text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-cm-white/50 text-xs mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function LijstBewerker({
  label,
  hint,
  items,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [nieuw, setNieuw] = useState("");

  function voegToe() {
    const t = nieuw.trim();
    if (!t) return;
    onChange([...items, t]);
    setNieuw("");
  }

  return (
    <div>
      <label className="block text-cm-white text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-cm-white/50 text-xs mb-1.5">{hint}</p>}
      <div className="space-y-2 mb-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 bg-cm-surface-2 border border-cm-border rounded-lg px-3 py-2"
          >
            <span className="flex-1 text-cm-white text-sm whitespace-pre-wrap break-words">
              {item}
            </span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-cm-white/50 hover:text-red-400 text-sm flex-shrink-0"
              title="Verwijderen"
            >
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-cm-white/40 text-xs italic">Nog niets opgeslagen.</p>
        )}
      </div>
      <div className="flex gap-2">
        {multiline ? (
          <textarea
            className="input-cm flex-1"
            rows={2}
            value={nieuw}
            onChange={(e) => setNieuw(e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <input
            className="input-cm flex-1"
            value={nieuw}
            onChange={(e) => setNieuw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                voegToe();
              }
            }}
            placeholder={placeholder}
          />
        )}
        <button
          type="button"
          onClick={voegToe}
          className="btn-secondary px-4 text-sm flex-shrink-0"
        >
          + Toevoegen
        </button>
      </div>
    </div>
  );
}
