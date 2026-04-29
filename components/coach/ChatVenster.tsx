"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatBericht, Prospect } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { useTaal } from "@/lib/i18n/TaalContext";
import { UpgradeModal } from "./UpgradeModal";
import { VoiceInputKnop } from "@/components/voice/VoiceInputKnop";
import { useSearchParams } from "next/navigation";
import { ProductadviesKnop } from "@/components/namenlijst/ProductadviesKnop";
import { ProductadviesTestKnop } from "@/components/namenlijst/ProductadviesTestKnop";

interface Props {
  gesprekId: string;
  gesprekTitel?: string;
  bestaandeBerichten: ChatBericht[];
  prospect: Pick<Prospect, "id" | "volledige_naam" | "pipeline_fase"> | null;
  prospectNotities?: string | null;
  alleProspects: Pick<Prospect, "id" | "volledige_naam" | "pipeline_fase">[];
  userId: string;
  memberNaam?: string;
  productadviesTest?: {
    token: string;
    status: "verstuurd" | "ingevuld" | "geen";
    trigger_60day?: string | null;
    uitslag?: { categorieLabel: string; niveau: string } | null;
    ingevuld_op?: string | null;
    darmvragenlijst_uitslag?: { bucket: "basis" | "plus"; bucket_label: string } | null;
    darmvragenlijst_ingevuld_op?: string | null;
  } | null;
  /**
   * Optionele prefill voor het invoerveld (bv. "Check mijn edification-zin: ...")
   * komt vanuit het playbook via ?prefill=... in de URL. Wordt alleen
   * toegepast bij een nieuw, leeg gesprek — niet bij het heropenen van een
   * bestaand gesprek met geschiedenis.
   */
  initialInvoer?: string;
  /**
   * Als true (en initialInvoer is gevuld + gesprek is leeg): verstuur de
   * prefill direct na mount, zodat de mentor meteen begint te antwoorden
   * en de member niet eerst nog op de pijl hoeft te klikken.
   */
  autoVerstuur?: boolean;
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
  { icoon: "🤝", labelKey: "coach.snel.drieweg", berichtKey: "coach.snel.drieweg.bericht" },
  { icoon: "🧭", labelKey: "coach.snel.mentor", berichtKey: "coach.snel.mentor.bericht" },
];

// Gratis eerste antwoorden — geen API call nodig!
// De coach vraagt door zodat het 2e bericht (met context) wél naar de API gaat
const GRATIS_ANTWOORDEN: Record<string, Record<string, string>> = {
  "coach.snel.mentor.bericht": {
    nl: "Fijn dat je even wilt bijpraten 🧭\n\nVertel me eerlijk:\n\n1. Hoe voel je je op dit moment — in de business én als mens?\n2. Waar ben je trots op deze week, hoe klein ook?\n3. Waar loop je tegenaan of waar zit je mee?",
    en: "Good to talk 🧭\n\nTell me honestly:\n\n1. How are you feeling right now — in the business and as a person?\n2. What are you proud of this week, however small?\n3. What are you struggling with or thinking about?",
  },
  "coach.snel.drieweg.bericht": {
    nl: "De 3-weg gesprek scripts staan klaar in ELEVA! 🤝\n\nGa naar het profiel van je prospect in de namenlijst → klik op '💬 3-weg gesprek scripts'. Daar kies je:\n\n1. Product (vitaliteit) of Business flow\n2. Naam + geslacht van je sponsor (vrouw/man)\n3. Geslacht van je prospect (vrouw/man)\n\nAlle stap-voor-stap berichten worden automatisch op naam en geslacht ingevuld — klaar om te kopiëren of direct via WhatsApp te sturen.\n\nWil je ook hulp bij de voorbereiding? Vertel me:\n- Is het product of business?\n- Wie is je prospect en hoe kennen jullie elkaar?\n- Wie is je sponsor?",
    en: "The 3-way conversation scripts are ready in ELEVA! 🤝\n\nGo to your prospect's profile in the name list → click '💬 3-way conversation scripts'. There you choose:\n\n1. Product (vitality) or Business flow\n2. Sponsor name + gender (female/male)\n3. Prospect gender (female/male)\n\nAll step-by-step messages are automatically filled in with name and gender — ready to copy or send via WhatsApp.\n\nWant help with preparation? Tell me:\n- Product or business?\n- Who is your prospect and how do you know them?\n- Who is your sponsor?",
  },
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
  "coach.snel.drieweg.bericht": {
    nl: "Help me een 3-weg gesprek opzetten",
    en: "Help me set up a 3-way conversation",
    fr: "Aide-moi à organiser une conversation à 3",
    es: "Ayúdame a organizar una conversación a 3",
    de: "Hilf mir ein 3-Wege-Gespräch einzurichten",
    pt: "Me ajude a organizar uma conversa a 3",
  },
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
  "coach.snel.mentor.bericht": {
    nl: "Ik wil even een mentor gesprek",
    en: "I want a mentor conversation",
    fr: "Je veux une conversation avec le mentor",
    es: "Quiero una conversación con el mentor",
    de: "Ich möchte ein Mentoren-Gespräch",
    pt: "Quero uma conversa com o mentor",
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
  gesprekTitel,
  bestaandeBerichten,
  prospect,
  prospectNotities,
  alleProspects,
  userId,
  memberNaam,
  productadviesTest,
  initialInvoer,
  autoVerstuur,
}: Props) {
  const [berichten, setBerichten] = useState<ChatBericht[]>(bestaandeBerichten);
  // Bij autoVerstuur willen we de invoer NIET zichtbaar in het veld zetten
  // (anders staat de tekst dubbel: in de bubbel + in de invoer). De prefill
  // wordt dan direct als user-bericht in stuurBericht() meegegeven via een
  // useEffect verderop in dit component.
  const [invoer, setInvoer] = useState(
    initialInvoer && !autoVerstuur ? initialInvoer : "",
  );
  const [laden, setLaden] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(
    prospect?.id || ""
  );
  const [upgradeTonen, setUpgradeTonen] = useState(false);
  const [gebruikVandaag, setGebruikVandaag] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const chatEindRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const invoerRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const autoVerstuurdRef = useRef(false);
  const { taal, v } = useTaal();

  // Slimme auto-scroll:
  //  - Bij elk NIEUW bericht (lengte groeit, dus nieuw user-vraag of nieuw
  //    mentor-antwoord begint): ALTIJD naar onderen springen, ongeacht
  //    waar de user zat. Zo zie je je net-verstuurde inspraak meteen
  //    onder in beeld én het moment dat de mentor begint te antwoorden.
  //  - Tijdens STREAMING (lengte gelijk, laatste bericht content groeit):
  //    alleen meebewegen als de user nog redelijk dicht bij de bodem zit
  //    (300px). Zo kan iemand wél tijdens een lang antwoord rustig
  //    omhoog scrollen om iets terug te lezen, zonder dat elke nieuwe
  //    token weer naar beneden rukt.
  //  - Bij stevig omhoog scrollen tijdens streaming: laat de user dáár.
  //    Zodra een volgend NIEUW bericht komt, springt het systeem
  //    weer naar de actieve plek.
  const vorigeAantalBerichten = useRef(berichten.length);
  useEffect(() => {
    const scrollEl = chatScrollRef.current;
    if (!scrollEl) return;
    const isNieuwBericht = berichten.length > vorigeAantalBerichten.current;
    const afstandTotBodem =
      scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
    if (isNieuwBericht || afstandTotBodem < 300) {
      chatEindRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }
    vorigeAantalBerichten.current = berichten.length;
  }, [berichten]);

  // Als de laad-bolletjes verschijnen (na een user-bericht, vóór mentor
  // begint te streamen): ook naar onderen scrollen zodat de "antwoord
  // wordt geschreven"-indicator zichtbaar is.
  useEffect(() => {
    if (!laden) return;
    const laatste = berichten[berichten.length - 1];
    if (laatste?.role !== "user") return;
    chatEindRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laden]);

  // Auto-grow van de textarea: telkens als de invoer-string wijzigt (door
  // typen, plakken, voice-input of prefill), passen we de hoogte aan op
  // basis van scrollHeight. Boven 240px (~10 regels) wordt 't scrollbaar.
  useEffect(() => {
    const el = invoerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [invoer]);

  // Bij prefill ZONDER auto-verstuur: focus + cursor aan eind + scroll
  // tekst naar boven zodat het begin zichtbaar is.
  useEffect(() => {
    if (!initialInvoer || autoVerstuur) return;
    const el = invoerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
    const len = el.value.length;
    el.focus();
    try {
      el.setSelectionRange(len, len);
    } catch {
      // sommige browsers ondersteunen dit niet op alle text-inputs
    }
    el.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bij prefill + autoVerstuur (= klik vanuit het playbook): de prefill
  // wordt direct als user-bericht verstuurd zodra het component mount.
  // Zo komt de member meteen op het juiste scherm met de gouden bubbel
  // + de mentor begint zelf met antwoorden — geen extra klik nodig.
  // autoVerstuurdRef voorkomt dubbele submits onder React StrictMode.
  useEffect(() => {
    if (!autoVerstuur) return;
    if (!initialInvoer || !initialInvoer.trim()) return;
    if (bestaandeBerichten.length > 0) return;
    if (autoVerstuurdRef.current) return;
    autoVerstuurdRef.current = true;
    // Microtask zodat alle state-init eerst is afgerond
    queueMicrotask(() => {
      stuurBericht(initialInvoer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch("/api/coach/gebruik")
      .then((r) => r.json())
      .then((data) => {
        setGebruikVandaag(data.gebruik || 0);
        setIsPremium(data.isPremium || false);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const autoBericht = searchParams?.get("auto");
    if (autoBericht && !autoVerstuurdRef.current && berichten.length === 0) {
      autoVerstuurdRef.current = true;
      stuurBericht(autoBericht);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Fallback: productadvies-gesprek zonder opening-bericht → coach opent zelf met
  // de intake-vraag. Gebeurt alleen als er nog geen enkele bericht is.
  const openerInjectedRef = useRef(false);
  useEffect(() => {
    if (openerInjectedRef.current) return;
    if (berichten.length > 0) return;
    if (!gesprekTitel || !gesprekTitel.toLowerCase().startsWith("productadvies")) return;
    openerInjectedRef.current = true;

    const prospectNaam = prospect?.volledige_naam || null;
    const opener: ChatBericht = {
      role: "assistant",
      content: prospectNaam
        ? `Geef me zoveel mogelijk informatie zodat ik een gepast Lifeplus-productadvies voor ${prospectNaam} kan samenstellen. Denk bijvoorbeeld aan doel of klacht, leeftijd, leefstijl, medische context en budget.`
        : "Geef me zoveel mogelijk informatie zodat ik een gepast Lifeplus-productadvies voor je kan samenstellen. Denk bijvoorbeeld aan je doel of klacht, leeftijd, leefstijl, medische context en budget.",
      timestamp: new Date().toISOString(),
    };
    setBerichten([opener]);
    supabase
      .from("ai_gesprekken")
      .update({ berichten: [opener], updated_at: new Date().toISOString() })
      .eq("id", gesprekId)
      .then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gesprekTitel]);

  async function wijzigProspect(nieuwId: string) {
    const huidig = selectedProspect;
    if (nieuwId === huidig) return;
    setSelectedProspect(nieuwId);

    const { error } = await supabase
      .from("ai_gesprekken")
      .update({
        prospect_id: nieuwId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gesprekId);

    if (error) {
      setSelectedProspect(huidig);
      toast.error("Kon prospect niet koppelen");
      return;
    }

    if (nieuwId) {
      const naam = alleProspects.find((p) => p.id === nieuwId)?.volledige_naam ?? "prospect";
      toast.success(`Gesprek gekoppeld aan ${naam}`);
    } else {
      toast.success("Koppeling met prospect losgemaakt");
    }
  }

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
    <div className="flex flex-col h-[calc(100vh-14rem)] sm:h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
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

          {/* Prospect selector — koppelt gesprek aan prospect, ook achteraf */}
          <select
            value={selectedProspect}
            onChange={(e) => wijzigProspect(e.target.value)}
            className="input-cm text-sm w-auto max-w-[200px]"
            title="Koppel dit gesprek aan een prospect (kan altijd gewijzigd worden)"
          >
            <option value="">{v("coach.geen_prospect")}</option>
            {alleProspects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.volledige_naam}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Chat berichten */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto overscroll-contain space-y-4 mb-4 pr-1"
      >
        {berichten.length === 0 && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🌟</div>
            <p className="text-cm-white mb-6">
              {v("coach.stel_vraag")}
            </p>

            {/* Acties voor deze prospect — alleen als er een prospect-context
                is. Dit zijn DIRECTE acties (niet AI-prompts) zodat de member
                snel een vragenlijst kan sturen of een handmatig pakket-advies
                kan opstellen zonder eerst terug naar de prospect-kaart te
                hoeven. Visueel onderscheidend (gouden border) van de
                AI-snelle-opties hieronder. */}
            {prospect && (
              <div className="max-w-md mx-auto mb-6">
                <div className="text-xs font-semibold text-cm-gold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="h-px flex-1 bg-cm-gold/30" />
                  Acties voor {prospect.volledige_naam.split(" ")[0]}
                  <span className="h-px flex-1 bg-cm-gold/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-cm-surface-2 border-2 border-cm-gold/40 rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl">📦</span>
                    <span className="text-xs font-medium text-cm-white">
                      Pakket-advies
                    </span>
                    <span className="text-[10px] text-cm-white opacity-60 -mt-1">
                      Handmatig samenstellen samen met de coach
                    </span>
                    <ProductadviesKnop
                      prospectId={prospect.id}
                      prospectNaam={prospect.volledige_naam}
                      userId={userId}
                      notities={prospectNotities ?? null}
                      huidigGesprekId={gesprekId}
                    />
                  </div>
                  <div className="bg-cm-surface-2 border-2 border-cm-gold/40 rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl">📋</span>
                    <span className="text-xs font-medium text-cm-white">
                      Vragenlijst
                    </span>
                    <span className="text-[10px] text-cm-white opacity-60 -mt-1">
                      Prospect zelf laten invullen
                    </span>
                    <ProductadviesTestKnop
                      prospectId={prospect.id}
                      prospectNaam={prospect.volledige_naam}
                      memberNaam={memberNaam ?? "je member"}
                      bestaande={productadviesTest ?? null}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-cm-white opacity-50 mt-2 italic">
                  Het verschil: bij <strong>Pakket-advies</strong> kies jij
                  samen met de coach welk pakket past. Bij{" "}
                  <strong>Vragenlijst</strong> beantwoordt de prospect zelf 30
                  korte vragen en krijgt automatisch een advies.
                </p>
              </div>
            )}

            {/* Snelle opties grid (AI-prompts) */}
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
          <textarea
            ref={invoerRef}
            value={invoer}
            onChange={(e) => setInvoer(e.target.value)}
            onKeyDown={(e) => {
              // Enter = versturen, Shift+Enter = nieuwe regel
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (invoer.trim() && !laden) {
                  stuurBericht();
                }
              }
            }}
            placeholder={v("coach.placeholder")}
            className="input-cm flex-1 resize-none leading-relaxed"
            disabled={laden}
            rows={1}
            style={{
              minHeight: "3rem",
              maxHeight: "15rem",
              overflowY: "auto",
            }}
          />
          <VoiceInputKnop
            huidigeWaarde={invoer}
            onTekst={setInvoer}
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
