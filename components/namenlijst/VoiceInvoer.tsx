"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useTaal } from "@/lib/i18n/TaalContext";
import { PipelineFase } from "@/lib/supabase/types";

const MAX_SECONDEN = 120;

type ActieNieuweProspect = {
  type: "nieuwe_prospect";
  volledige_naam: string;
  pipeline_fase?: PipelineFase;
  notities?: string;
  relatie?: string;
};

type ActieUpdateProspect = {
  type: "update_prospect";
  prospect_id: string;
  pipeline_fase?: PipelineFase;
  notities_toevoegen?: string;
};

type ActieNotitie = {
  type: "notitie";
  prospect_naam: string;
  notitie: string;
};

type ActieTaak = {
  type: "taak";
  prospect_naam: string;
  titel: string;
  vervaldatum?: string;
};

type Actie = ActieNieuweProspect | ActieUpdateProspect | ActieNotitie | ActieTaak;

type ParseResultaat = {
  transcript: string;
  samenvatting: string;
  acties: Actie[];
  onduidelijk: string[];
};

type Fase = "dicht" | "opname" | "verwerken" | "preview" | "opslaan";

export function VoiceInvoer() {
  const { taal } = useTaal();
  const router = useRouter();
  const supabase = createClient();

  const [fase, setFase] = useState<Fase>("dicht");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [seconden, setSeconden] = useState(0);
  const [resultaat, setResultaat] = useState<ParseResultaat | null>(null);
  const [acties, setActies] = useState<Actie[]>([]);
  const [spraakOndersteund, setSpraakOndersteund] = useState(true);
  const [magOpnemen, setMagOpnemen] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");
  const actiefRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpraakOndersteund(!!SR);
  }, []);

  function taalNaarLocale(t: string): string {
    const map: Record<string, string> = {
      nl: "nl-NL", en: "en-US", fr: "fr-FR", es: "es-ES", de: "de-DE", pt: "pt-PT",
    };
    return map[t] || "nl-NL";
  }

  function startOpname() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMagOpnemen(false);
      setFase("opname");
      return;
    }

    try {
      const rec = new SR();
      rec.lang = taalNaarLocale(taal);
      rec.continuous = true;
      rec.interimResults = true;

      finalTranscriptRef.current = "";
      setTranscript("");
      setInterim("");

      rec.onresult = (event: any) => {
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const stukje = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += stukje + " ";
          } else {
            interimText += stukje;
          }
        }
        setTranscript(finalTranscriptRef.current);
        setInterim(interimText);
      };

      rec.onerror = (event: any) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          toast.error("Microfoon toegang nodig");
          setMagOpnemen(false);
        } else if (event.error === "no-speech") {
          // laat lopen
        } else {
          console.error("Speech error:", event.error);
        }
      };

      rec.onend = () => {
        if (actiefRef.current) {
          try { rec.start(); } catch {}
        }
      };

      actiefRef.current = true;
      rec.start();
      recognitionRef.current = rec;

      setFase("opname");
      setSeconden(0);
      timerRef.current = setInterval(() => {
        setSeconden((s) => {
          if (s + 1 >= MAX_SECONDEN) {
            stopOpname();
            return MAX_SECONDEN;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Start opname fout:", err);
      toast.error("Kon opname niet starten");
      setFase("dicht");
    }
  }

  function stopOpname() {
    actiefRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const eindTranscript = (finalTranscriptRef.current + " " + interim).trim();
    if (eindTranscript.length < 3) {
      toast.error("Geen tekst opgevangen");
      setFase("dicht");
      return;
    }
    verwerk(eindTranscript);
  }

  async function verwerk(tekst: string) {
    setFase("verwerken");
    try {
      const res = await fetch("/api/voice-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: tekst, taal }),
      });
      if (!res.ok) {
        const err = await res.text();
        toast.error("Verwerken mislukt: " + err);
        setFase("dicht");
        return;
      }
      const data: ParseResultaat = await res.json();
      setResultaat(data);
      setActies(data.acties);
      setFase("preview");
    } catch (err: any) {
      toast.error("Fout: " + (err?.message || "onbekend"));
      setFase("dicht");
    }
  }

  async function bevestig() {
    if (!resultaat) return;
    setFase("opslaan");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Niet ingelogd");
      setFase("preview");
      return;
    }

    try {
      const naamNaarId: Record<string, string> = {};

      // Haal bestaande namen op voor fuzzy match bij notitie/taak
      const { data: bestaand } = await supabase
        .from("prospects")
        .select("id, volledige_naam")
        .eq("user_id", user.id)
        .eq("gearchiveerd", false);

      (bestaand || []).forEach((p: any) => {
        naamNaarId[p.volledige_naam.toLowerCase()] = p.id;
      });

      // 1. Nieuwe prospects
      for (const a of acties) {
        if (a.type === "nieuwe_prospect") {
          const notitieVeld = [
            a.notities || "",
            a.relatie ? `Relatie: ${a.relatie}` : "",
          ].filter(Boolean).join("\n\n");

          const { data, error } = await supabase
            .from("prospects")
            .insert({
              user_id: user.id,
              volledige_naam: a.volledige_naam,
              pipeline_fase: a.pipeline_fase || "prospect",
              bron: "warm",
              prioriteit: "normaal",
              notities: notitieVeld || null,
            })
            .select()
            .single();

          if (error) {
            console.error("Insert prospect fout:", error);
            toast.error(`Kon ${a.volledige_naam} niet aanmaken`);
          } else if (data) {
            naamNaarId[a.volledige_naam.toLowerCase()] = data.id;
          }
        }
      }

      // 2. Update bestaande prospects
      for (const a of acties) {
        if (a.type === "update_prospect") {
          const updates: any = { updated_at: new Date().toISOString() };
          if (a.pipeline_fase) updates.pipeline_fase = a.pipeline_fase;

          if (a.notities_toevoegen) {
            const { data: huidig } = await supabase
              .from("prospects")
              .select("notities")
              .eq("id", a.prospect_id)
              .single();
            const bestaandeNotitie = huidig?.notities || "";
            updates.notities = bestaandeNotitie
              ? `${bestaandeNotitie}\n\n[${new Date().toLocaleDateString("nl-NL")}] ${a.notities_toevoegen}`
              : a.notities_toevoegen;
          }

          const { error } = await supabase
            .from("prospects")
            .update(updates)
            .eq("id", a.prospect_id)
            .eq("user_id", user.id);

          if (error) console.error("Update prospect fout:", error);
        }
      }

      // 3. Notities (op bestaande of net-aangemaakte prospects)
      for (const a of acties) {
        if (a.type === "notitie") {
          const id = naamNaarId[a.prospect_naam.toLowerCase()];
          if (!id) continue;
          const { data: huidig } = await supabase
            .from("prospects")
            .select("notities")
            .eq("id", id)
            .single();
          const bestaandeNotitie = huidig?.notities || "";
          const nieuweNotitie = bestaandeNotitie
            ? `${bestaandeNotitie}\n\n[${new Date().toLocaleDateString("nl-NL")}] ${a.notitie}`
            : a.notitie;
          await supabase
            .from("prospects")
            .update({ notities: nieuweNotitie, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("user_id", user.id);
        }
      }

      // 4. Taken / herinneringen
      for (const a of acties) {
        if (a.type === "taak") {
          const id = naamNaarId[a.prospect_naam.toLowerCase()] || null;
          const vervaldatum = a.vervaldatum || standaardDatum();
          await supabase.from("herinneringen").insert({
            user_id: user.id,
            prospect_id: id,
            herinnering_type: "custom",
            titel: a.titel,
            beschrijving: a.prospect_naam,
            vervaldatum,
            verlooptijd: new Date(vervaldatum + "T09:00:00").toISOString(),
          });
        }
      }

      toast.success("Opgeslagen!");
      setFase("dicht");
      setTranscript("");
      setInterim("");
      setResultaat(null);
      setActies([]);
      router.refresh();
    } catch (err: any) {
      console.error("Opslaan fout:", err);
      toast.error("Opslaan mislukt: " + (err?.message || "onbekend"));
      setFase("preview");
    }
  }

  function annuleer() {
    actiefRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setFase("dicht");
    setTranscript("");
    setInterim("");
    setSeconden(0);
    setResultaat(null);
    setActies([]);
    finalTranscriptRef.current = "";
  }

  function formatTijd(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function verwijderActie(idx: number) {
    setActies((prev) => prev.filter((_, i) => i !== idx));
  }

  if (fase === "dicht") {
    return (
      <button
        onClick={startOpname}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-cm-gold text-cm-black font-semibold hover:opacity-90 transition"
        aria-label="Inspreken"
      >
        🎙️ Inspreken
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-cm-surface border border-cm-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        {fase === "opname" && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600 animate-pulse mb-3">
                <span className="text-4xl">🎙️</span>
              </div>
              <p className="text-cm-white text-lg font-semibold">Luisteren...</p>
              <p className="text-cm-gold font-mono text-2xl mt-1">
                {formatTijd(seconden)} / {formatTijd(MAX_SECONDEN)}
              </p>
            </div>

            {!spraakOndersteund || !magOpnemen ? (
              <div className="space-y-2">
                <p className="text-sm text-cm-white opacity-80">
                  Spraak-herkenning werkt niet in deze browser. Gebruik de microfoon-knop op je toetsenbord om te dicteren:
                </p>
                <textarea
                  value={transcript}
                  onChange={(e) => {
                    finalTranscriptRef.current = e.target.value;
                    setTranscript(e.target.value);
                  }}
                  className="textarea-cm text-sm w-full"
                  rows={6}
                  placeholder="Tik hier en gebruik je toetsenbord-microfoon..."
                  autoFocus
                />
              </div>
            ) : (
              <div className="card bg-cm-surface-2 min-h-[120px]">
                {transcript || interim ? (
                  <p className="text-cm-white text-sm whitespace-pre-wrap">
                    {transcript}
                    <span className="opacity-50">{interim}</span>
                  </p>
                ) : (
                  <p className="text-cm-white text-sm opacity-50 italic">
                    Begin met praten... bijv.: "Vandaag Pieter de Hoogh ingeschreven..."
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={annuleer} className="btn-secondary flex-1">
                Annuleren
              </button>
              <button
                onClick={stopOpname}
                className="btn-gold flex-1"
                disabled={transcript.trim().length < 3}
              >
                ✓ Klaar, verwerken
              </button>
            </div>
          </div>
        )}

        {fase === "verwerken" && (
          <div className="p-8 text-center space-y-3">
            <div className="inline-block w-12 h-12 border-4 border-cm-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-cm-white">ELEVA begrijpt wat je zei...</p>
          </div>
        )}

        {fase === "preview" && resultaat && (
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-display font-bold text-cm-white mb-1">
                🎙️ Klopt dit?
              </h2>
              <p className="text-cm-white text-sm opacity-80">{resultaat.samenvatting}</p>
            </div>

            {/* Transcript */}
            <details className="card bg-cm-surface-2 text-sm">
              <summary className="cursor-pointer text-cm-white opacity-70">Jouw tekst</summary>
              <p className="text-cm-white text-sm mt-2 whitespace-pre-wrap">{resultaat.transcript}</p>
            </details>

            {/* Acties */}
            {acties.length === 0 ? (
              <p className="text-cm-white opacity-60 text-sm italic text-center py-4">
                Geen acties herkend. Probeer opnieuw.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-cm-white uppercase tracking-wider opacity-60">
                  Wat ELEVA gaat doen:
                </p>
                {acties.map((a, i) => (
                  <ActieKaart key={i} actie={a} onVerwijder={() => verwijderActie(i)} />
                ))}
              </div>
            )}

            {resultaat.onduidelijk.length > 0 && (
              <div className="card border-yellow-500/30 bg-yellow-500/5">
                <p className="text-xs text-yellow-400 uppercase tracking-wider mb-1">Vragen</p>
                {resultaat.onduidelijk.map((v, i) => (
                  <p key={i} className="text-cm-white text-sm">• {v}</p>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={annuleer} className="btn-secondary flex-1">
                Annuleren
              </button>
              <button
                onClick={bevestig}
                className="btn-gold flex-1"
                disabled={acties.length === 0}
              >
                ✅ Opslaan
              </button>
            </div>
          </div>
        )}

        {fase === "opslaan" && (
          <div className="p-8 text-center space-y-3">
            <div className="inline-block w-12 h-12 border-4 border-cm-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-cm-white">Opslaan...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActieKaart({ actie, onVerwijder }: { actie: Actie; onVerwijder: () => void }) {
  const content = (() => {
    switch (actie.type) {
      case "nieuwe_prospect":
        return {
          icoon: "📥",
          titel: "Nieuwe: " + actie.volledige_naam,
          details: [
            actie.pipeline_fase ? `Fase: ${actie.pipeline_fase}` : null,
            actie.notities || null,
            actie.relatie ? `👨‍👩‍👧 ${actie.relatie}` : null,
          ].filter(Boolean) as string[],
        };
      case "update_prospect":
        return {
          icoon: "🔄",
          titel: "Bijwerken",
          details: [
            actie.pipeline_fase ? `Nieuwe fase: ${actie.pipeline_fase}` : null,
            actie.notities_toevoegen ? `Notitie: ${actie.notities_toevoegen}` : null,
          ].filter(Boolean) as string[],
        };
      case "notitie":
        return {
          icoon: "📝",
          titel: `Notitie bij ${actie.prospect_naam}`,
          details: [actie.notitie],
        };
      case "taak":
        return {
          icoon: "⏰",
          titel: actie.titel,
          details: [
            `Bij: ${actie.prospect_naam}`,
            actie.vervaldatum ? `Datum: ${actie.vervaldatum}` : null,
          ].filter(Boolean) as string[],
        };
    }
  })();

  return (
    <div className="card bg-cm-surface-2 flex gap-3">
      <span className="text-2xl">{content.icoon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-cm-white font-semibold text-sm">{content.titel}</p>
        {content.details.map((d, i) => (
          <p key={i} className="text-cm-white text-xs opacity-70 mt-0.5">{d}</p>
        ))}
      </div>
      <button
        onClick={onVerwijder}
        className="text-red-400 hover:text-red-300 text-sm"
        title="Verwijder deze actie"
      >
        ✕
      </button>
    </div>
  );
}

function standaardDatum(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}
