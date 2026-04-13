"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatBericht, Prospect } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { useTaal } from "@/lib/i18n/TaalContext";

interface Props {
  gesprekId: string;
  bestaandeBerichten: ChatBericht[];
  prospect: Pick<Prospect, "id" | "volledige_naam" | "pipeline_fase"> | null;
  alleProspects: Pick<Prospect, "id" | "volledige_naam" | "pipeline_fase">[];
  userId: string;
}

interface SnelleOptie {
  icoon: string;
  labelKey: string;
  berichtKey: string;
}

const SNELLE_OPTIES: SnelleOptie[] = [
  { icoon: "\u{1F4AC}", labelKey: "coach.snel.dm", berichtKey: "coach.snel.dm.bericht" },
  { icoon: "\u{1F6E1}", labelKey: "coach.snel.bezwaar", berichtKey: "coach.snel.bezwaar.bericht" },
  { icoon: "\u{1F504}", labelKey: "coach.snel.followup", berichtKey: "coach.snel.followup.bericht" },
  { icoon: "\u2705", labelKey: "coach.snel.accountability", berichtKey: "coach.snel.accountability.bericht" },
  { icoon: "\u{1F525}", labelKey: "coach.snel.motivatie", berichtKey: "coach.snel.motivatie.bericht" },
  { icoon: "\u{1F3AF}", labelKey: "coach.snel.closing", berichtKey: "coach.snel.closing.bericht" },
];

// Berichten per taal voor snelle opties
const SNELLE_BERICHTEN: Record<string, Record<string, string>> = {
  "coach.snel.dm.bericht": {
    nl: "Schrijf een uitnodigings DM voor dit prospect",
    en: "Write an invitation DM for this prospect",
    fr: "\u00c9cris un DM d'invitation pour ce prospect",
    es: "Escribe un DM de invitaci\u00f3n para este prospecto",
    de: "Schreibe eine Einladungs-DM f\u00fcr diesen Kontakt",
    pt: "Escreva um DM de convite para este prospecto",
  },
  "coach.snel.bezwaar.bericht": {
    nl: "Hoe reageer ik op het bezwaar 'ik heb geen tijd'?",
    en: "How do I respond to the objection 'I don't have time'?",
    fr: "Comment r\u00e9pondre \u00e0 l'objection 'je n'ai pas le temps' ?",
    es: "\u00bfC\u00f3mo respondo a la objeci\u00f3n 'no tengo tiempo'?",
    de: "Wie reagiere ich auf den Einwand 'Ich habe keine Zeit'?",
    pt: "Como respondo \u00e0 obje\u00e7\u00e3o 'n\u00e3o tenho tempo'?",
  },
  "coach.snel.followup.bericht": {
    nl: "Geef me een follow up bericht",
    en: "Give me a follow-up message",
    fr: "Donne-moi un message de suivi",
    es: "Dame un mensaje de seguimiento",
    de: "Gib mir eine Follow-up Nachricht",
    pt: "Me d\u00ea uma mensagem de acompanhamento",
  },
  "coach.snel.accountability.bericht": {
    nl: "Houd me accountable! Wat had ik vandaag moeten doen en wat heb ik echt gedaan? Stel me de lastige vragen.",
    en: "Hold me accountable! What should I have done today and what did I actually do? Ask me the tough questions.",
    fr: "Tiens-moi responsable ! Qu'est-ce que j'aurais d\u00fb faire aujourd'hui et qu'est-ce que j'ai vraiment fait ?",
    es: "\u00a1Hazme responsable! \u00bfQu\u00e9 deber\u00eda haber hecho hoy y qu\u00e9 hice realmente?",
    de: "Halte mich verantwortlich! Was h\u00e4tte ich heute tun sollen und was habe ich wirklich getan?",
    pt: "Me cobre! O que eu deveria ter feito hoje e o que realmente fiz?",
  },
  "coach.snel.motivatie.bericht": {
    nl: "Ik heb even een motivatie boost nodig. Het valt me zwaar vandaag. Help me om door te zetten.",
    en: "I need a motivation boost. It's been tough today. Help me push through.",
    fr: "J'ai besoin d'un coup de boost. C'est dur aujourd'hui. Aide-moi \u00e0 tenir.",
    es: "Necesito un impulso de motivaci\u00f3n. Ha sido dif\u00edcil hoy. Ay\u00fadame a seguir.",
    de: "Ich brauche einen Motivations-Boost. Es f\u00e4llt mir heute schwer. Hilf mir durchzuhalten.",
    pt: "Preciso de um impulso de motiva\u00e7\u00e3o. Est\u00e1 dif\u00edcil hoje. Me ajude a continuar.",
  },
  "coach.snel.closing.bericht": {
    nl: "Hoe sluit ik dit gesprek af en vraag ik om de beslissing?",
    en: "How do I close this conversation and ask for the decision?",
    fr: "Comment conclure cette conversation et demander la d\u00e9cision ?",
    es: "\u00bfC\u00f3mo cierro esta conversaci\u00f3n y pido la decisi\u00f3n?",
    de: "Wie schlie\u00dfe ich dieses Gespr\u00e4ch ab und frage nach der Entscheidung?",
    pt: "Como fecho esta conversa e pe\u00e7o a decis\u00e3o?",
  },
};

function SwipeableBericht({
  bericht,
  index,
  isLaatste,
  laden,
  onVerwijder,
  children,
}: {
  bericht: ChatBericht;
  index: number;
  isLaatste: boolean;
  laden: boolean;
  onVerwijder: (index: number) => void;
  children: React.ReactNode;
}) {
  const berichtRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [toonVerwijder, setToonVerwijder] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    if (diff < 0) {
      setOffset(Math.max(-100, diff));
    }
  };

  const handleTouchEnd = () => {
    if (offset < -60) {
      setToonVerwijder(true);
      setOffset(-80);
    } else {
      setOffset(0);
      setToonVerwijder(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {toonVerwijder && (
        <div className="absolute inset-y-0 right-0 flex items-center z-0">
          <button
            onClick={() => {
              onVerwijder(index);
              setOffset(0);
              setToonVerwijder(false);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-semibold h-full"
          >
            Wis
          </button>
        </div>
      )}

      <div
        ref={berichtRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${offset}px)`, transition: offset === 0 ? "transform 0.2s" : "none" }}
        className="relative z-10 bg-cm-black"
      >
        <div className={`flex ${bericht.role === "user" ? "justify-end" : "justify-start"} group`}>
          <div className="relative max-w-[85%]">
            {children}
            <button
              onClick={() => onVerwijder(index)}
              className="hidden group-hover:flex absolute -top-2 -right-2 w-5 h-5 bg-cm-surface-2 border border-cm-border rounded-full items-center justify-center text-cm-white hover:text-red-400 hover:border-red-400 transition-colors text-xs"
              title="Bericht verwijderen"
            >
              x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const { taal, v } = useTaal();

  useEffect(() => {
    chatEindRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten]);

  function getSnelBericht(key: string): string {
    return SNELLE_BERICHTEN[key]?.[taal] || SNELLE_BERICHTEN[key]?.["nl"] || "";
  }

  async function verwijderBericht(index: number) {
    const bijgewerkt = berichten.filter((_, i) => i !== index);
    setBerichten(bijgewerkt);

    await supabase
      .from("ai_gesprekken")
      .update({
        berichten: bijgewerkt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gesprekId);

    toast.success("Bericht verwijderd");
  }

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

    // Auto-genereer titel uit eerste bericht
    const isEersteBericht = berichten.length === 0;

    // Update gesprek in DB
    const updateData: Record<string, unknown> = {
      berichten: bijgewerkt,
      updated_at: new Date().toISOString(),
    };

    // Auto-titel uit eerste gebruikersbericht
    if (isEersteBericht) {
      const autoTitel = berichtTekst.length > 40
        ? berichtTekst.substring(0, 37) + "..."
        : berichtTekst;
      updateData.titel = autoTitel;
    }

    await supabase
      .from("ai_gesprekken")
      .update(updateData)
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
          <Link href="/coach" className="text-cm-white hover:text-cm-white">
            \u2190
          </Link>
          <div>
            <h1 className="text-lg font-display font-bold text-cm-white">
              {v("coach.titel")}
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
          <option value="">{v("coach.geen_prospect")}</option>
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
          <div className="text-center py-8">
            <div className="text-5xl mb-4">\ud83e\udd16</div>
            <p className="text-cm-white mb-6">
              {v("coach.stel_vraag")}
            </p>
            {/* Snelle opties grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
              {SNELLE_OPTIES.map((optie) => (
                <button
                  key={optie.labelKey}
                  onClick={() => stuurBericht(getSnelBericht(optie.berichtKey))}
                  className="flex flex-col items-center gap-2 p-4 bg-cm-surface-2 border border-cm-border rounded-xl text-cm-white hover:border-cm-gold-dim hover:text-cm-gold transition-colors"
                >
                  <span className="text-2xl">{optie.icoon}</span>
                  <span className="text-xs font-medium">{v(optie.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {berichten.map((bericht, i) => (
          <SwipeableBericht
            key={`${i}-${bericht.timestamp}`}
            bericht={bericht}
            index={i}
            isLaatste={i === berichten.length - 1}
            laden={laden}
            onVerwijder={verwijderBericht}
          >
            <div
              className={`rounded-2xl px-4 py-3 ${
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
          </SwipeableBericht>
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
            placeholder={v("coach.placeholder")}
            className="input-cm flex-1"
            disabled={laden}
          />
          <button
            type="submit"
            disabled={laden || !invoer.trim()}
            className="btn-gold px-6"
          >
            \u2192
          </button>
        </form>
      </div>
    </div>
  );
}
