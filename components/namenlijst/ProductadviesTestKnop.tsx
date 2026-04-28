"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DeelKnoppen } from "@/components/shared/DeelKnoppen";

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
  darmvragenlijst_uitslag?: {
    bucket: "basis" | "plus";
    bucket_label: string;
  } | null;
  darmvragenlijst_ingevuld_op?: string | null;
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
  // wilNieuwe: gebruiker drukte op de refresh-knop nadat er al een ingevulde
  // vragenlijst was. Dan willen we de dialog tonen om een NIEUWE link te maken
  // i.p.v. de bestaande uitslag-chips. Reset bij sluiten van dialog.
  const [wilNieuwe, setWilNieuwe] = useState(false);

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

  // Bij sluiten van de dialog: ook 'wilNieuwe' resetten zodat de
  // ingevuld-UI weer terugkomt.
  function sluitDialog() {
    setOpen(false);
    setWilNieuwe(false);
  }

  // Als er een ingevulde vragenlijst is EN we niet bezig zijn met een
  // nieuwe te versturen: toon compacte advies-rij. Inline-flex zodat de
  // knoppen niet onder elkaar springen op brede schermen.
  if (
    bestaande?.status === "ingevuld" &&
    bestaande.uitslag &&
    !wilNieuwe
  ) {
    return (
      <div className="inline-flex items-center gap-1 flex-wrap">
        <a
          href={`/test/${bestaande.token}/resultaat`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm"
          title={`Vragenlijst ingevuld op ${bestaande.ingevuld_op?.split("T")[0]}`}
        >
          ✓ {bestaande.uitslag.categorieLabel} {bestaande.uitslag.niveau}
        </a>
        {bestaande.darmvragenlijst_uitslag && (
          <a
            href={`/test/${bestaande.token}/darm-keuze`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
            title={`Darmvragenlijst ingevuld op ${bestaande.darmvragenlijst_ingevuld_op?.split("T")[0]}`}
          >
            🌿 {bestaande.darmvragenlijst_uitslag.bucket_label}
          </a>
        )}
        <button
          onClick={() => {
            // Reset token en open dialog om een NIEUWE vragenlijst te genereren
            setToken(null);
            setWilNieuwe(true);
            setOpen(true);
          }}
          className="btn-secondary text-sm px-2"
          title="Genereer een nieuwe vragenlijst-link en deel die opnieuw"
        >
          🔄
        </button>
      </div>
    );
  }

  // Knop-tekst:
  //   wilNieuwe (member klikte op refresh-icoon na een ingevulde test) →
  //     "Vragenlijst opnieuw versturen" (nieuwe link, oude advies wordt
  //     vervangen door de uitslag van deze nieuwe vragenlijst)
  //   bestaande verstuurd → "Deel link opnieuw" (bestaande link delen)
  //   geen test nog → "Stuur vragenlijst"
  const knopTekst = wilNieuwe
    ? "Vragenlijst opnieuw versturen"
    : bestaande?.status === "verstuurd"
      ? "Deel link opnieuw"
      : "Stuur vragenlijst";

  // Geen of nog-niet-ingevulde vragenlijst: open dialog
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary text-sm"
      >
        📋 {knopTekst}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={sluitDialog}
        >
          <div
            className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#3a3a3a]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Productadvies-vragenlijst versturen
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Voor {prospectNaam}
                  </p>
                </div>
                <button
                  onClick={sluitDialog}
                  className="text-gray-400 hover:text-white text-xl"
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
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-[#3a3a3a] bg-[#222] cursor-pointer hover:border-cm-gold">
                      <input
                        type="checkbox"
                        checked={isSixtyDay}
                        onChange={(e) => setIsSixtyDay(e.target.checked)}
                        className="mt-1 w-5 h-5 accent-cm-gold"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">
                          60 Day Run aanpak
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
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
                    {bezig
                      ? "Bezig..."
                      : wilNieuwe
                        ? "Genereer nieuwe vragenlijst-link"
                        : "Genereer vragenlijst-link"}
                  </button>
                  {wilNieuwe && (
                    <p className="text-xs text-gray-400 mt-2">
                      Het oude advies blijft staan tot de prospect deze nieuwe
                      vragenlijst invult — daarna wordt het overschreven door
                      de nieuwste uitslag.
                    </p>
                  )}

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
// DeelOpties — wrapper rond DeelKnoppen voor de productadvies-test context
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
  const voornaam = prospectNaam.split(" ")[0];

  const tekst = `Hé ${voornaam}!

Er is een korte vragenlijst die je even kan doen waarmee ik kan zien welke ondersteuning het beste bij jou past. Duurt zo'n 3 minuten op je telefoon.

Klik hier: ${testUrl}

Aan het eind krijg je een advies dat past bij wat jij aangeeft. Ik kijk daarna graag samen met je naar het resultaat 🥰`;

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-white">
        Vragenlijst-link voor {prospectNaam}
      </div>

      <DeelKnoppen
        url={testUrl}
        tekst={tekst}
        onderwerp={`Een korte vragenlijst voor jou, ${voornaam}`}
        variant="donker"
      />

      {/* Voorbeeld bericht-tekst */}
      <details className="text-xs">
        <summary className="cursor-pointer text-gray-400 hover:text-white">
          Bekijk de tekst die wordt verzonden
        </summary>
        <div className="mt-2 p-3 bg-[#222] rounded-lg border border-[#3a3a3a] whitespace-pre-wrap text-gray-300">
          {tekst}
        </div>
      </details>
    </div>
  );
}
