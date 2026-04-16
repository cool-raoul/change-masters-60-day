"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatBericht, Prospect } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { useTaal } from "@/lib/i18n/TaalContext";
import { UpgradeModal } from "./UpgradeModal";

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
  { icoon: "💬", labelKey: "coach.snel.dm", berichtKey: "coach.snel.dm.bericht" },
  { icoon: "🛡️", labelKey: "coach.snel.bezwaar", berichtKey: "coach.snel.bezwaar.bericht" },
  { icoon: "🔄", labelKey: "coach.snel.followup", berichtKey: "coach.snel.followup.bericht" },
  { icoon: "✅", labelKey: "coach.snel.accountability", berichtKey: "coach.snel.accountability.bericht" },
  { icoon: "🔥", labelKey: "coach.snel.motivatie", berichtKey: "coach.snel.motivatie.bericht" },
  { icoon: "🎯", labelKey: "coach.snel.closing", berichtKey: "coach.snel.closing.bericht" },
];

// Gratis eerste antwoorden — geen API call nodig!
// De coach vraagt door zodat het 2e bericht (met context) wél naar de API gaat
const GRATIS_ANTWOORDEN: Record<string, Record<string, string>> = {
  "coach.snel.dm.bericht": {
    nl: "Top! Voor wie wil je een DM schrijven? Vertel me even:\n\n1. Hoe heet diegene?\n2. Hoe kennen jullie elkaar?\n3. Heb je al eerder over de business gepraat?",
    en: "Great! Who do you want to write a DM for? Tell me:\n\n1. What's their name?\n2. How do you know each other?\n3. Have you talked about the business before?",
  },
  "coach.snel.bezwaar.bericht": {
    nl: "Oké, welk bezwaar krijg je? Vertel me even:\n\n1. Wat zegt de persoon precies?\n2. In welke fase van het gesprek kwam dit?\n3. Denk je dat er iets anders achter zit?",
    en: "Okay, what objection are you getting? Tell me:\n\n1. What exactly did they say?\n2. At what point in the conversation?\n3. Do you think there's something else behind it?",
  },
  "coach.snel.followup.bericht": {
    nl: "Goed! Vertel me even over deze persoon:\n\n1. Hoe heet diegene?\n2. Wat was jullie laatste contact?\n3. Hoe reageerde hij/zij toen?",
    en: "Good! Tell me about this person:\n\n1. What's their name?\n2. What was your last contact?\n3. How did they respond?",
  },
  "coach.snel.accountability.bericht": {
    nl: "Laten we even eerlijk kijken. Vertel me:\n\n1. Hoeveel mensen heb je deze week gesproken?\n2. Hoeveel uitnodigingen verstuurd?\n3. Waar loop je tegenaan?",
    en: "Let's take an honest look. Tell me:\n\n1. How many people did you talk to this week?\n2. How many invitations sent?\n3. Where are you stuck?",
  },
  "coach.snel.motivatie.bericht": {
    nl: "Ik ben er voor je. Vertel me even:\n\n1. Wat maakt het lastig op dit moment?\n2. Welke dag van je 60 dagenrun ben je?\n3. Wat was je laatste succes (hoe klein ook)?",
    en: "I'm here for you. Tell me:\n\n1. What's making it tough right now?\n2. What day of your 60-day run are you on?\n3. What was your last win (however small)?",
  },
  "coach.snel.closing.bericht": {
    nl: "Goed dat je hiermee aan de slag gaat! Vertel me:\n\n1. Over wie gaat het?\n2. Wat weten ze al van het plan?\n3. Hebben ze al interesse getoond of twijfelen ze nog?",
    en: "Great that you're working on this! Tell me:\n\n1. Who is it about?\n2. What do they already know?\n3. Have they shown interest or are they still hesitant?",
  },
};

// Berichten per taal voor snelle opties
const SNELLE_BERICHTEN: Record<string, Record<string, string>> = {
  "coach.snel.dm.bericht": {
    nl: "Help me met een DM",
    en: "Help me with a DM",
    fr: "Aide-moi avec un DM",
    es: "Ayúdame con un DM",
    de: "Hilf mir mit einer DM",
    pt: "Me ajude com um DM",
  },
  "coach.snel.bezwaar.bericht": {
    nl: "Help me met een bezwaar",
    en: "Help me with an objection",
    fr: "Aide-moi avec une objection",
    es: "Ayúdame con una objeción",
    de: "Hilf mir mit einem Einwand",
    pt: "Me ajude com uma objeção",
  },
  "coach.snel.followup.bericht": {
    nl: "Help me met een follow up bericht",
    en: "Help me with a follow-up message",
    fr: "Aide-moi avec un message de suivi",
    es: "Ayúdame con un mensaje de seguimiento",
    de: "Hilf mir mit einer Follow-up Nachricht",
    pt: "Me ajude com uma mensagem de acompanhamento",
  },
  "coach.snel.accountability.bericht": {
    nl: "Help me met accountability",
    en: "Help me with accountability",
    fr: "Aide-moi avec l'accountability",
    es: "Ayúdame con la responsabilidad",
    de: "Hilf mir mit Accountability",
    pt: "Me ajude com accountability",
  },
  "coach.snel.motivatie.bericht": {
    nl: "Help me met motivatie",
    en: "Help me with motivation",
    fr: "Aide-moi avec la motivation",
    es: "Ayúdame con la motivación",
    de: "Hilf mir mit Motivation",
    pt: "Me ajude com motivação",
  },
  "coach.snel.closing.bericht": {
    nl: "Help me met een gesprek afsluiten / closen / iemand tot een beslissing brengen",
    en: "Help me close a conversation / bring someone to a decision",
    fr: "Aide-moi à conclure une conversation / amener quelqu'un à prendre une décision",
    es: "Ayúdame a cerrar una conversación / llevar a alguien a una decisión",
    de: "Hilf mir ein Gespräch abzuschließen / jemanden zu einer Entscheidung zu bringen",
    pt: "Me ajude a fechar uma conversa / levar alguém a uma decisão",
  },
};

// Parse coach bericht: splits normale tekst en [STUUR]...[/STUUR] blokken
function parseerCoachBericht(content: string): { type: "tekst" | "stuur"; inhoud: string }[] {
  const delen: { type: "tekst" | "stuur"; inhoud: string }[] = [];
  const regex = /\[STUUR\]([\s\S]*?)\[\/STUUR\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const tekst = content.slice(lastIndex, match.index).trim();
      if (tekst) delen.push({ type: "tekst", inhoud: tekst });
    }
    delen.push({ type: "stuur", inhoud: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const tekst = content.slice(lastIndex).trim();
    if (tekst) delen.push({ type: "tekst", inhoud: tekst });
  }

  return delen.length > 0 ? delen : [{ type: "tekst", inhoud: content }];
}

// Kopieerbaar DM-blok component
function StuurBlok({ tekst }: { tekst: string }) {
  const [gekopieerd, setGekopieerd] = useState(false);

  function kopieer() {
    navigator.clipboard.writeText(tekst).then(() => {
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    });
  }

  return (
    <div className="mt-3 rounded-xl border-2 border-cm-gold bg-cm-gold/10 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cm-gold/30">
        <span className="text-cm-gold text-xs font-bold uppercase tracking-wide">📋 Klaar om te sturen</span>
        <button
          onClick={kopieer}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
            gekopieerd
              ? "bg-green-500 text-white"
              : "bg-cm-gold text-cm-black hover:bg-cm-gold/80"
          }`}
        >
          {gekopieerd ? "✓ Gekopieerd!" : "Kopieer"}
        </button>
      </div>
      <p className="px-3 py-3 text-sm text-cm-white leading-relaxed whitespace-pre-wrap">{tekst}</p>
    </div>
  );
}

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
  const [upgradeTonen, setUpgradeTonen] = useState(false);
  const [gebruikVandaag, setGebruikVandaag] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const chatEindRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { taal, v } = useTaal();

  useEffect(() => {
    chatEindRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten]);

  useEffect(() => {
    fetch("/api/coach/gebruik")
      .then((r) => r.json())
      .then((data) => {
        setGebruikVandaag(data.gebruik || 0);
        setIsPremium(data.isPremium || false);
      })
      .catch(() => {});
  }, []);

  function getSnelBericht(key: string): string {
    return SNELLE_BERICHTEN[key]?.[taal] || SNELLE_BERICHTEN[key]?.["nl"] || "";
  }

  // Gratis eerste antwoord: geen API call, coach vraagt door
  async function stuurSnelStart(berichtKey: string) {
    const berichtTekst = getSnelBericht(berichtKey);
    if (!berichtTekst.trim() || laden) return;

    const userBericht: ChatBericht = {
      role: "user",
      content: berichtTekst,
      timestamp: new Date().toISOString(),
    };

    const gratisAntwoord = GRATIS_ANTWOORDEN[berichtKey]?.[taal]
      || GRATIS_ANTWOORDEN[berichtKey]?.["nl"]
      || "";

    const coachBericht: ChatBericht = {
      role: "assistant",
      content: gratisAntwoord,
      timestamp: new Date().toISOString(),
    };

    const bijgewerkt = [userBericht, coachBericht];
    setBerichten(bijgewerkt);

    // Sla op in DB met auto-titel
    const autoTitel = berichtTekst.length > 40
      ? berichtTekst.substring(0, 37) + "..."
      : berichtTekst;

    await supabase
      .from("ai_gesprekken")
      .update({
        berichten: bijgewerkt,
        titel: autoTitel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gesprekId);
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
          taal,
        }),
      });

      if (response.status === 429) {
        const data = await response.json();
        setGebruikVandaag(data.gebruik || 20);
        setUpgradeTonen(true);
        setLaden(false);
        return;
      }

      if (!response.ok) {
        const foutTekst = await response.text().catch(() => "onbekend");
        throw new Error(`API fout ${response.status}: ${foutTekst}`);
      }

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
    } catch (err: any) {
      const melding = err?.message || "Onbekende fout";
      console.error("Coach fout:", melding);
      toast.error(melding.length > 80 ? melding.substring(0, 80) + "..." : melding);
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
            ←
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
            <div className="text-5xl mb-4">🌟</div>
            <p className="text-cm-white mb-6">
              {v("coach.stel_vraag")}
            </p>
            {/* Snelle opties grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
              {SNELLE_OPTIES.map((optie) => (
                <button
                  key={optie.labelKey}
                  onClick={() => stuurSnelStart(optie.berichtKey)}
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
            {bericht.role === "user" ? (
              <div className="rounded-2xl px-4 py-3 bg-cm-gold text-cm-black font-medium rounded-br-sm">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{bericht.content}</p>
              </div>
            ) : (
              <div className="rounded-2xl px-4 py-3 bg-cm-surface-2 border border-cm-border text-cm-white rounded-bl-sm">
                {bericht.content === "" && laden && i === berichten.length - 1 ? (
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cm-gold rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-cm-gold rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-cm-gold rounded-full animate-bounce delay-200" />
                  </span>
                ) : (
                  parseerCoachBericht(bericht.content).map((deel, di) =>
                    deel.type === "stuur" ? (
                      <StuurBlok key={di} tekst={deel.inhoud} />
                    ) : (
                      <p key={di} className="text-sm leading-relaxed whitespace-pre-wrap">
                        {deel.inhoud}
                      </p>
                    )
                  )
                )}
              </div>
            )}
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
          <div className="flex flex-col items-end gap-1">
            <button
              type="submit"
              disabled={laden || !invoer.trim()}
              className="btn-gold px-6"
            >
              →
            </button>
            {!isPremium && (
              <span className="text-xs text-cm-white opacity-40 whitespace-nowrap">
                {gebruikVandaag}/20 vandaag
              </span>
            )}
          </div>
        </form>
      </div>

      {upgradeTonen && (
        <UpgradeModal gebruik={gebruikVandaag} onSluit={() => setUpgradeTonen(false)} />
      )}
    </div>
  );
}
