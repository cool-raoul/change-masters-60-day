"use client";

// File: components/namenlijst/StuurFreebieKnop.tsx
//
// Knop op de prospect-kaart om een freebie te sturen. Dropdown met alle
// beschikbare freebies. Bij keuze: dialog met deelopties (WhatsApp, mail,
// kopieer-link, QR) via de bestaande DeelKnoppen-component.
//
// Beschikbare freebies:
//   1. Productadvies-vragenlijst (voor iedereen) — genereert een prospect-
//      gebonden unieke link via /api/productadvies-test/maak-aan
//   2. Score-bots (Energie & Focus, Hormonen & Overgang) — gebruiken
//      member's eigen tracking-link. Bij intekening matcht de e-mail op
//      deze prospect en wordt de prospect-kaart aangevuld.

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DeelKnoppen } from "@/components/shared/DeelKnoppen";

type FreebieKey =
  | "productadvies"
  | "energie-en-focus"
  | "hormonen-en-overgang";

type Freebie = {
  key: FreebieKey;
  titel: string;
  icoon: string;
  beschrijving: string;
  alleenCore?: boolean;
};

const FREEBIES: Freebie[] = [
  {
    key: "productadvies",
    titel: "Productadvies-vragenlijst",
    icoon: "📋",
    beschrijving: "Drie minuten, persoonlijk pakket-advies aan het eind.",
  },
  {
    key: "energie-en-focus",
    titel: "Energie & Focus",
    icoon: "⚡",
    beschrijving:
      "Vijf-minuten score-vragenlijst over energie, slaap, focus en leefstijl.",
  },
  {
    key: "hormonen-en-overgang",
    titel: "Hormonen & Overgang",
    icoon: "🌸",
    beschrijving:
      "Vijf-minuten score-vragenlijst over hormoon-signalen, slaap, stemming en lichaam.",
  },
];

export function StuurFreebieKnop({
  prospectId,
  prospectNaam,
  memberNaam,
  memberModus,
  memberRole,
}: {
  prospectId: string;
  prospectNaam: string;
  memberNaam: string;
  memberModus: string | null;
  memberRole: string | null;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [actieveFreebie, setActieveFreebie] = useState<Freebie | null>(null);

  const isFounder = memberRole === "founder";
  const isCore = memberModus === "core";
  const ziet_core_only = isFounder || isCore;

  const beschikbaar = FREEBIES.filter(
    (f) => !f.alleenCore || ziet_core_only,
  );

  function kiesFreebie(freebie: Freebie) {
    setDropdownOpen(false);
    setActieveFreebie(freebie);
  }

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="btn-secondary text-sm"
        >
          🎁 Stuur freebie
          <span className="ml-1 text-xs opacity-60">▼</span>
        </button>

        {dropdownOpen && (
          <>
            {/* Backdrop sluit dropdown bij klik elders */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2 z-50 w-80 rounded-xl border border-cm-border bg-cm-surface-2 shadow-2xl overflow-hidden">
              <div className="p-2 space-y-1">
                {beschikbaar.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => kiesFreebie(f)}
                    className="w-full text-left p-3 rounded-lg hover:bg-cm-gold/10 transition-colors flex items-start gap-3"
                  >
                    <span className="text-2xl flex-shrink-0">{f.icoon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-cm-white">
                        {f.titel}
                      </div>
                      <div className="text-xs text-cm-white opacity-60 mt-0.5">
                        {f.beschrijving}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {actieveFreebie && (
        <FreebieDeelDialog
          freebie={actieveFreebie}
          prospectId={prospectId}
          prospectNaam={prospectNaam}
          memberNaam={memberNaam}
          onSluit={() => setActieveFreebie(null)}
        />
      )}
    </>
  );
}

// ============================================================
// Dialog voor de gekozen freebie: laad of genereer link, toon
// DeelKnoppen + voorbeeldtekst.
// ============================================================

function FreebieDeelDialog({
  freebie,
  prospectId,
  prospectNaam,
  memberNaam,
  onSluit,
}: {
  freebie: Freebie;
  prospectId: string;
  prospectNaam: string;
  memberNaam: string;
  onSluit: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [bezig, setBezig] = useState(true);
  const [fout, setFout] = useState<string | null>(null);

  const supabase = createClient();
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    let geannuleerd = false;
    async function laad() {
      try {
        if (freebie.key === "productadvies") {
          // Hergebruik bestaande maak-aan-endpoint voor prospect-gebonden test
          const res = await fetch("/api/productadvies-test/maak-aan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prospectId, isSixtyDay: false }),
          });
          const data = await res.json();
          if (geannuleerd) return;
          if (!res.ok) {
            setFout(data.error ?? "Aanmaken mislukt");
            setBezig(false);
            return;
          }
          setUrl(`${baseUrl}/test/${data.token}`);
          setBezig(false);
        } else {
          // Score-bot: member's eigen tracking-link gebruiken. Bij
          // intekening matcht de e-mail op deze prospect als die
          // hetzelfde adres invult.
          const botSlug = freebie.key;
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            setFout("Niet ingelogd");
            setBezig(false);
            return;
          }
          const { data: bestaand } = await supabase
            .from("freebie_bot_member_tokens")
            .select("token")
            .eq("member_id", user.id)
            .eq("bot_slug", botSlug)
            .maybeSingle();
          let token = bestaand?.token as string | undefined;
          if (!token) {
            const res = await fetch("/api/freebie-bot/maak-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ botSlug }),
            });
            const data = await res.json();
            if (geannuleerd) return;
            if (!res.ok) {
              setFout(data.error ?? "Token aanmaken mislukt");
              setBezig(false);
              return;
            }
            token = data.token;
          }
          setUrl(`${baseUrl}/bot/${botSlug}/${token}`);
          setBezig(false);
        }
      } catch (e) {
        if (geannuleerd) return;
        setFout("Verbindingsfout. Probeer het zo opnieuw.");
        setBezig(false);
      }
    }
    laad();
    return () => {
      geannuleerd = true;
    };
  }, [freebie.key, prospectId, baseUrl, supabase]);

  const voornaam = prospectNaam.split(" ")[0];

  const berichtTekst = (() => {
    if (freebie.key === "productadvies") {
      return `Hé ${voornaam}!

Er is een korte vragenlijst die je even kan doen waarmee ik kan zien welke ondersteuning het beste bij jou past. Duurt zo'n 3 minuten op je telefoon.

Klik hier: ${url ?? ""}

Aan het eind krijg je een advies dat past bij wat jij aangeeft. Ik kijk daarna graag samen met je naar het resultaat 🥰`;
    }
    if (freebie.key === "energie-en-focus") {
      return `Hé ${voornaam}!

Ik heb iets voor je dat in vijf minuten een persoonlijk beeld geeft van waar het op het gebied van energie, slaap en focus voor jou loopt en waar het stroef gaat. Tien korte vragen, daarna een score plus concrete handvatten.

Klik hier: ${url ?? ""}

Je ontvangt het ook in je mail zodat je het rustig kunt teruglezen ⚡`;
    }
    return `Hé ${voornaam}!

Ik heb iets voor je dat in vijf minuten een persoonlijk beeld geeft van wat er speelt rond hormonen en de overgang. Tien korte vragen, daarna een score per thema plus concrete handvatten en voedingsstoffen die in deze fase vaak belangrijk worden.

Klik hier: ${url ?? ""}

Je ontvangt het ook in je mail zodat je het rustig kunt teruglezen 🌸`;
  })();

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onSluit}
    >
      <div
        className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#3a3a3a]">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-white">
                {freebie.icoon} {freebie.titel}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Voor {prospectNaam}
              </p>
            </div>
            <button
              onClick={onSluit}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {bezig && (
            <div className="text-sm text-gray-400 text-center py-6">
              Bezig met laden van je persoonlijke link...
            </div>
          )}

          {fout && (
            <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded">
              {fout}
            </div>
          )}

          {url && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-white">
                Link voor {prospectNaam}
              </div>

              <DeelKnoppen
                url={url}
                tekst={berichtTekst}
                onderwerp={
                  freebie.key === "productadvies"
                    ? `Een korte vragenlijst voor jou, ${voornaam}`
                    : `${freebie.titel}, een persoonlijk overzicht voor jou, ${voornaam}`
                }
                variant="donker"
                prospectId={prospectId}
                prospectNaam={prospectNaam}
              />

              <details className="text-xs">
                <summary className="cursor-pointer text-gray-400 hover:text-white">
                  Bekijk de tekst die wordt verzonden
                </summary>
                <div className="mt-2 p-3 bg-[#222] rounded-lg border border-[#3a3a3a] whitespace-pre-wrap text-gray-300">
                  {berichtTekst}
                </div>
              </details>

              {freebie.key !== "productadvies" && (
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  Goed om te weten: {freebie.titel} gebruikt jouw vaste
                  tracking-link. Als {voornaam} zich intekent met haar
                  e-mailadres, wordt haar bot-resultaat automatisch
                  toegevoegd aan deze prospect-kaart, op basis van het
                  e-mailadres.
                </p>
              )}

              <div className="text-xs text-gray-500">
                Voor {memberNaam}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
