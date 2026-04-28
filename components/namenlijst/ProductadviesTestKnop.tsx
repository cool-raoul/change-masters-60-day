"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// ============================================================
// ProductadviesTestKnop — knop op de prospect-kaart om een
// productadvies-test te versturen. Toont status indien al verstuurd.
//
// Flow:
//   1. Member klikt "Stuur test" → kiest 60-day-toggle → kant-en-klaar
//      WhatsApp / Email / Kopieer-link / QR-code
//   2. Als al een test is verstuurd: toon status + uitkomst (indien ingevuld)
// ============================================================

type Status = "geen" | "verstuurd" | "ingevuld";

type Test = {
  token: string;
  status: Status;
  trigger_60day?: string | null;
  uitslag?: {
    categorieLabel: string;
    niveau: string;
  } | null;
  ingevuld_op?: string | null;
};

export function ProductadviesTestKnop({
  prospectId,
  prospectNaam,
  memberNaam,
  bestaande,
}: {
  prospectId: string;
  prospectNaam: string;
  memberNaam: string;
  bestaande: Test | null;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [isSixtyDay, setIsSixtyDay] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [token, setToken] = useState<string | null>(bestaande?.token ?? null);
  const [fout, setFout] = useState<string | null>(null);

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const testUrl = token ? `${baseUrl}/test/${token}` : null;

  async function maakAan() {
    setBezig(true);
    setFout(null);
    try {
      const res = await fetch("/api/productadvies-test/maak-aan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, isSixtyDay }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFout(data.error ?? "Aanmaken mislukt");
        setBezig(false);
        return;
      }
      setToken(data.token);
      setBezig(false);
    } catch (e) {
      setFout("Verbindingsfout. Probeer het zo opnieuw.");
      setBezig(false);
    }
  }

  // Als er al een ingevulde test is: knop toont resultaat-status
  if (bestaande?.status === "ingevuld" && bestaande.uitslag) {
    return (
      <a
        href={`/test/${bestaande.token}/resultaat`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary text-sm"
        title={`Test ingevuld op ${bestaande.ingevuld_op?.split("T")[0]}`}
      >
        ✓ {bestaande.uitslag.categorieLabel} {bestaande.uitslag.niveau}
      </a>
    );
  }

  // Geen of nog-niet-ingevulde test: open dialog
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary text-sm"
      >
        📋 {bestaande?.status === "verstuurd" ? "Test opnieuw delen" : "Stuur test"}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-cm-bg-secondary border border-cm-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-cm-border">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-cm-white">
                    Productadvies-test versturen
                  </h2>
                  <p className="text-xs text-cm-white opacity-60 mt-1">
                    Voor {prospectNaam}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-cm-white opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {!token && (
                <>
                  {/* 60 Day Run toggle */}
                  <div>
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-cm-border cursor-pointer hover:border-cm-gold">
                      <input
                        type="checkbox"
                        checked={isSixtyDay}
                        onChange={(e) => setIsSixtyDay(e.target.checked)}
                        className="mt-1 w-5 h-5 accent-cm-gold"
                      />
                      <div>
                        <div className="text-sm font-medium text-cm-white">
                          60 Day Run aanpak
                        </div>
                        <div className="text-xs text-cm-white opacity-60 mt-1">
                          Wanneer aangevinkt: prospect krijgt direct het Complete-pakket
                          (~200 IP) als advies. Anders: vrije keuze tussen Essential, Plus
                          of Complete op basis van zijn antwoorden.
                        </div>
                      </div>
                    </label>
                  </div>

                  <button
                    onClick={maakAan}
                    disabled={bezig}
                    className="w-full py-3 rounded-lg bg-cm-gold text-cm-bg font-semibold disabled:opacity-40"
                  >
                    {bezig ? "Bezig..." : "Genereer test-link"}
                  </button>

                  {fout && (
                    <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      {fout}
                    </div>
                  )}
                </>
              )}

              {token && testUrl && (
                <DeelOpties
                  testUrl={testUrl}
                  prospectNaam={prospectNaam}
                  memberNaam={memberNaam}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// DeelOpties — toont WhatsApp / Email / kopieer / QR opties
// na het genereren van een test-link
// ============================================================

function DeelOpties({
  testUrl,
  prospectNaam,
  memberNaam,
}: {
  testUrl: string;
  prospectNaam: string;
  memberNaam: string;
}) {
  const [gekopieerd, setGekopieerd] = useState(false);

  const voornaam = prospectNaam.split(" ")[0];

  const whatsappTekst = `Hé ${voornaam}!

Ik heb een korte test gemaakt waarmee ik kan zien welke ondersteuning het beste bij jou past. Het duurt zo'n 3 minuten op je telefoon.

Klik hier: ${testUrl}

Aan het eind krijg je een advies dat past bij wat jij aangeeft. Ik kijk daarna graag samen met je naar het resultaat 🥰`;

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(whatsappTekst)}`;
  const emailSubject = `Een korte test voor jou, ${voornaam}`;
  const emailBody = whatsappTekst;
  const emailLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  async function kopieer() {
    try {
      await navigator.clipboard.writeText(testUrl);
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 2000);
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-cm-white">
        <strong>Test-link voor {prospectNaam}:</strong>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={testUrl}
          readOnly
          className="flex-1 px-3 py-2 rounded-lg bg-cm-bg border border-cm-border text-cm-white text-xs font-mono"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <button
          onClick={kopieer}
          className="px-4 py-2 rounded-lg bg-cm-bg border border-cm-border text-cm-white text-sm whitespace-nowrap"
        >
          {gekopieerd ? "✓ Gekopieerd" : "Kopieer"}
        </button>
      </div>

      <div className="text-xs text-cm-white opacity-60 mt-2">
        Stuur de test naar {prospectNaam}:
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 text-sm"
        >
          💬 WhatsApp
        </a>
        <a
          href={emailLink}
          className="flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 text-sm"
        >
          ✉️ Email
        </a>
      </div>

      {/* Voorbeeld bericht-tekst */}
      <details className="text-xs">
        <summary className="cursor-pointer text-cm-white opacity-70 hover:opacity-100">
          Bekijk de tekst die wordt verzonden
        </summary>
        <div className="mt-2 p-3 bg-cm-bg rounded-lg border border-cm-border whitespace-pre-wrap text-cm-white opacity-80">
          {whatsappTekst}
        </div>
      </details>
    </div>
  );
}
