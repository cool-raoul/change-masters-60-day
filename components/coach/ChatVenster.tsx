"use client";

import { useState, useRef, useEffect } from "react";
import { ChatBericht, Prospect } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

interface Props {
  gesprekId: string;
  bestaandeBerichten: ChatBericht[];
  prospect: Pick<Prospect, "id" | "volledige_naam" | "pipeline_fase"> | null;
  alleProspects: Pick<Prospect, "id" | "volledige_naam" | "pipeline_fase">[];
  userId: string;
}

const SNELLE_VRAGEN = [
  "Schrijf een uitnodigings-DM voor dit prospect",
  "Hoe reageer ik op het bezwaar 'ik heb geen tijd'?",
  "Geef me een follow-up bericht",
  "Hoe sluit ik dit gesprek af?",
];

export function ChatVenster({
  gesprekId,
  bestaandeBerichten,
  prospect,
  alleProspects,
  userId,
}: Props) {
  const [berichten, setBerichten] = useState<ChatBericht[]>(bestaandeBerichten);
  const [invoer, setInvoer] = useState("");
  const [laden, setLaden] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(
    prospect?.id || ""
  );
  const chatEindRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    chatEindRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten]);

  async function stuurBericht(tekst?: string) {
    const berichtTekst = tekst || invoer;
    if (!berichtTekst.trim() || laden) return;

    const nieuwBericht: ChatBericht = {
      role: "user",
      content: berichtTekst,
      timestamp: new Date().toISOString(),
    };

    const bijgewerkt = [...berichten, nieuwBericht];
    setBerichten(bijgewerkt);
    setInvoer("");
    setLaden(true);

    // Update gesprek in DB met het nieuwe gebruikersbericht
    await supabase
      .from("ai_gesprekken")
      .update({
        berichten: bijgewerkt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gesprekId);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          berichten: bijgewerkt,
          prospectId: selectedProspect || null,
          gesprekId,
        }),
      });

      if (!response.ok) throw new Error("API fout");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Geen stream");

      const decoder = new TextDecoder();
      let antwoordTekst = "";

      const tijdelijkBericht: ChatBericht = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };
      setBerichten((prev) => [...prev, tijdelijkBericht]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        antwoordTekst += decoder.decode(value, { stream: true });
        setBerichten((prev) => {
          const nieuw = [...prev];
          nieuw[nieuw.length - 1] = {
            ...tijdelijkBericht,
            content: antwoordTekst,
          };
          return nieuw;
        });
      }

      // Sla volledig gesprek op
      const volledigBijgewerkt = [
        ...bijgewerkt,
        { role: "assistant" as const, content: antwoordTekst, timestamp: tijdelijkBericht.timestamp },
      ];
      await supabase
        .from("ai_gesprekken")
        .update({
          berichten: volledigBijgewerkt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", gesprekId);
    } catch {
      toast.error("Er is iets misgegaan met de coach. Probeer opnieuw.");
    } finally {
      setLaden(false);
    }
  }

  const huidigProspect = alleProspects.find((p) => p.id === selectedProspect);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/coach" className="text-cm-muted hover:text-cm-white">
            ←
          </Link>
          <div>
            <h1 className="text-lg font-display font-bold text-cm-white">
              🤖 AI Coach
            </h1>
            {huidigProspect && (
              <p className="text-cm-gold text-xs">
                Over: {huidigProspect.volledige_naam} ({huidigProspect.pipeline_fase})
              </p>
            )}
          </div>
        </div>

        {/* Prospect selector */}
        <select
          value={selectedProspect}
          onChange={(e) => setSelectedProspect(e.target.value)}
          className="input-cm text-sm w-auto max-w-[200px]"
        >
          <option value="">— Geen prospect —</option>
          {alleProspects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.volledige_naam}
            </option>
          ))}
        </select>
      </div>

      {/* Chat berichten */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {berichten.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-cm-muted mb-6">
              Stel je vraag aan de coach of kies een snelle vraag hieronder.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SNELLE_VRAGEN.map((v) => (
                <button
                  key={v}
                  onClick={() => stuurBericht(v)}
                  className="text-xs px-3 py-1.5 bg-cm-surface-2 border border-cm-border rounded-full text-cm-muted hover:text-cm-white hover:border-cm-gold-dim transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {berichten.map((bericht, i) => (
          <div
            key={i}
            className={`flex ${bericht.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                bericht.role === "user"
                  ? "bg-cm-gold text-cm-black font-medium rounded-br-sm"
                  : "bg-cm-surface-2 border border-cm-border text-cm-white rounded-bl-sm"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {bericht.content}
                {laden &&
                  i === berichten.length - 1 &&
                  bericht.role === "assistant" &&
                  bericht.content === "" && (
                    <span className="inline-flex gap-1 ml-1">
                      <span className="w-1.5 h-1.5 bg-cm-gold rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-cm-gold rounded-full animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 bg-cm-gold rounded-full animate-bounce delay-200" />
                    </span>
                  )}
              </p>
            </div>
          </div>
        ))}

        {laden && berichten[berichten.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-cm-surface-2 border border-cm-border rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-cm-gold rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-cm-gold rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-cm-gold rounded-full animate-bounce delay-200" />
              </span>
            </div>
          </div>
        )}
        <div ref={chatEindRef} />
      </div>

      {/* Snelle vragen (als er al berichten zijn) */}
      {berichten.length > 0 && berichten.length < 4 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {SNELLE_VRAGEN.map((v) => (
            <button
              key={v}
              onClick={() => stuurBericht(v)}
              disabled={laden}
              className="text-xs px-3 py-1.5 bg-cm-surface-2 border border-cm-border rounded-full text-cm-muted hover:text-cm-white hover:border-cm-gold-dim transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {/* Invoer */}
      <div className="border-t border-cm-border pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            stuurBericht();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={invoer}
            onChange={(e) => setInvoer(e.target.value)}
            placeholder="Stel je vraag aan de coach..."
            className="input-cm flex-1"
            disabled={laden}
          />
          <button
            type="submit"
            disabled={laden || !invoer.trim()}
            className="btn-gold px-6"
          >
            →
          </button>
        </form>
      </div>
    </div>
  );
}
