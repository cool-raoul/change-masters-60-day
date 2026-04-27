"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ZELFTEST_UITSPRAKEN,
  getZichtbareUitspraken,
  shuffleUitspraken,
  type Trigger60Day,
  type Geslacht,
  type Antwoord,
} from "@/lib/zelftest/vragen";

// ============================================================
// Client form voor de productadvies-test
//
// Stappen:
//   1. Trigger-vraag: 60 Day Run ja/nee/weet-niet
//   2. Geslacht
//   3. ~30 uitspraken op 3-puntsschaal (Niet/Soms/Vaak)
//   4. AVG-vinkje
//   5. Submit
// ============================================================

type Stap = "trigger" | "geslacht" | "uitspraken" | "submit";

export function TestForm({
  token,
  prospectNaam,
  memberNaam,
}: {
  token: string;
  prospectNaam: string | null;
  memberNaam: string;
}) {
  const router = useRouter();
  const [stap, setStap] = useState<Stap>("trigger");
  const [trigger, setTrigger] = useState<Trigger60Day | null>(null);
  const [geslacht, setGeslacht] = useState<Geslacht | null>(null);
  const [responses, setResponses] = useState<Record<string, Antwoord>>({});
  const [avgAkkoord, setAvgAkkoord] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [foutmelding, setFoutmelding] = useState<string | null>(null);

  // Zichtbare uitspraken op basis van geslacht, deterministisch geshuffled op token
  const zichtbareUitspraken = useMemo(() => {
    if (!geslacht) return [];
    const filtered = getZichtbareUitspraken(geslacht);
    return shuffleUitspraken(filtered, token);
  }, [geslacht, token]);

  const aantalBeantwoord = Object.keys(responses).length;
  const totaalUitspraken = zichtbareUitspraken.length;
  const alleBeantwoord = aantalBeantwoord === totaalUitspraken;

  async function submit() {
    if (!trigger || !geslacht || !alleBeantwoord || !avgAkkoord) return;
    setBezig(true);
    setFoutmelding(null);
    try {
      const res = await fetch("/api/productadvies-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          trigger60day: trigger,
          geslacht,
          avg_akkoord: avgAkkoord,
          responses,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFoutmelding(data.error ?? "Er ging iets mis");
        setBezig(false);
        return;
      }
      router.push(data.redirect ?? `/test/${token}/resultaat`);
    } catch (e) {
      setFoutmelding("Verbindingsfout. Probeer het zo opnieuw.");
      setBezig(false);
    }
  }

  // ============================================================
  // STAP 1 — Commitment-vraag (bepaalt of we Complete adviseren)
  // ============================================================
  if (stap === "trigger") {
    return (
      <Card>
        <CardTitel>Stap 1 van 4</CardTitel>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Hoe wil je dit aanpakken?
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Geen verkeerd antwoord. Dit helpt {memberNaam} om het advies op jou
          af te stemmen.
        </p>
        <div className="space-y-2">
          <KeuzeKnop
            label="Ik wil vol gaan"
            beschrijving="Geef me het meest complete advies om in de komende weken écht resultaat te zien."
            checked={trigger === "ja"}
            onClick={() => setTrigger("ja")}
          />
          <KeuzeKnop
            label="Ik wil bewust starten"
            beschrijving="Laat me kiezen tussen een lichte instap, een uitgebreide aanpak of het complete pakket."
            checked={trigger === "nee"}
            onClick={() => setTrigger("nee")}
          />
          <KeuzeKnop
            label="Ik wil eerst zien wat past"
            beschrijving="Toon me de mogelijkheden, ik kies daarna wat bij me past."
            checked={trigger === "weet_niet"}
            onClick={() => setTrigger("weet_niet")}
          />
        </div>
        <Volgende enabled={!!trigger} onClick={() => setStap("geslacht")} />
      </Card>
    );
  }

  // ============================================================
  // STAP 2 — Geslacht (voor productkeuze, geen profilering)
  // ============================================================
  if (stap === "geslacht") {
    return (
      <Card>
        <CardTitel>Stap 2 van 4</CardTitel>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Ben je een vrouw of een man?
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          We gebruiken dit om de juiste producten voor jou te selecteren. Voor
          vrouwen en mannen zijn er soms andere ondersteuningen.
        </p>
        <div className="space-y-2">
          <KeuzeKnop
            label="Vrouw"
            checked={geslacht === "vrouw"}
            onClick={() => setGeslacht("vrouw")}
          />
          <KeuzeKnop
            label="Man"
            checked={geslacht === "man"}
            onClick={() => setGeslacht("man")}
          />
          <KeuzeKnop
            label="Zeg ik liever niet"
            beschrijving="Dan volgen we de standaard productselectie."
            checked={geslacht === "zeg-niet"}
            onClick={() => setGeslacht("zeg-niet")}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setStap("trigger")}
            className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 font-medium"
          >
            Terug
          </button>
          <button
            onClick={() => setStap("uitspraken")}
            disabled={!geslacht}
            className="flex-1 py-3 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-40"
          >
            Verder
          </button>
        </div>
      </Card>
    );
  }

  // ============================================================
  // STAP 3 — Uitspraken op 3-puntsschaal
  // ============================================================
  if (stap === "uitspraken") {
    return (
      <Card>
        <CardTitel>Stap 3 van 4</CardTitel>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Hoe sterk herken je jezelf in elke uitspraak?
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Geen goed of fout. Het gaat om wat voor jou resoneert. Kies bij elke
          zin: <strong>Niet</strong>, <strong>Soms</strong> of{" "}
          <strong>Vaak</strong>.
        </p>
        <p className="text-xs text-gray-500 mb-6">
          {aantalBeantwoord} van {totaalUitspraken} beantwoord
        </p>

        <div className="space-y-3">
          {zichtbareUitspraken.map((u, idx) => (
            <UitspraakItem
              key={u.id}
              nummer={idx + 1}
              tekst={u.tekst}
              waarde={responses[u.id]}
              onChange={(v) => setResponses({ ...responses, [u.id]: v })}
            />
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setStap("geslacht")}
            className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 font-medium"
          >
            Terug
          </button>
          <button
            onClick={() => setStap("submit")}
            disabled={!alleBeantwoord}
            className="flex-1 py-3 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-40"
          >
            {alleBeantwoord
              ? "Naar het advies"
              : `Nog ${totaalUitspraken - aantalBeantwoord} te gaan`}
          </button>
        </div>
      </Card>
    );
  }

  // ============================================================
  // STAP 4 — AVG-akkoord + submit
  // ============================================================
  return (
    <Card>
      <CardTitel>Stap 4 van 4</CardTitel>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Bijna klaar
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        We bewaren alleen de uitkomst van je test (welk pakket past bij jou),
        niet je individuele antwoorden. {memberNaam} ziet de uitkomst zodat
        jullie er samen over kunnen praten als je dat wil.
      </p>

      <label className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100 cursor-pointer">
        <input
          type="checkbox"
          checked={avgAkkoord}
          onChange={(e) => setAvgAkkoord(e.target.checked)}
          className="mt-1 w-5 h-5 accent-emerald-600"
        />
        <span className="text-sm text-gray-700">
          Ik geef toestemming dat de uitkomst van deze test wordt opgeslagen en
          gedeeld met {memberNaam}.
        </span>
      </label>

      {foutmelding && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {foutmelding}
        </div>
      )}

      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setStap("uitspraken")}
          className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 font-medium"
          disabled={bezig}
        >
          Terug
        </button>
        <button
          onClick={submit}
          disabled={!avgAkkoord || bezig}
          className="flex-1 py-3 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-40"
        >
          {bezig ? "Bezig..." : "Toon mijn advies"}
        </button>
      </div>
    </Card>
  );
}

// ============================================================
// UI helpers
// ============================================================

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
      {children}
    </div>
  );
}

function CardTitel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs uppercase tracking-wider text-emerald-600 font-medium mb-2">
      {children}
    </div>
  );
}

function KeuzeKnop({
  label,
  beschrijving,
  checked,
  onClick,
}: {
  label: string;
  beschrijving?: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        checked
          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
          : "border-gray-200 bg-white text-gray-900 hover:border-emerald-400"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            checked ? "border-emerald-600 bg-emerald-600" : "border-gray-400"
          }`}
        >
          {checked && (
            <span className="w-2 h-2 rounded-full bg-white"></span>
          )}
        </span>
        <div className="flex-1">
          <div className="font-medium">{label}</div>
          {beschrijving && (
            <div
              className={`text-sm mt-1 ${
                checked ? "text-emerald-800" : "text-gray-600"
              }`}
            >
              {beschrijving}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function Volgende({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className="w-full mt-4 py-3 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-40"
    >
      Verder
    </button>
  );
}

function UitspraakItem({
  nummer,
  tekst,
  waarde,
  onChange,
}: {
  nummer: number;
  tekst: string;
  waarde: Antwoord | undefined;
  onChange: (v: Antwoord) => void;
}) {
  return (
    <div className="border border-gray-100 rounded-lg p-4 bg-white">
      <div className="flex gap-3 mb-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex items-center justify-center">
          {nummer}
        </span>
        <p className="text-sm sm:text-base text-gray-800 leading-snug">
          {tekst}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SchaalKnop
          label="Niet"
          actief={waarde === 0}
          onClick={() => onChange(0)}
        />
        <SchaalKnop
          label="Soms"
          actief={waarde === 1}
          onClick={() => onChange(1)}
        />
        <SchaalKnop
          label="Vaak"
          actief={waarde === 2}
          onClick={() => onChange(2)}
        />
      </div>
    </div>
  );
}

function SchaalKnop({
  label,
  actief,
  onClick,
}: {
  label: string;
  actief: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2 rounded-md text-sm font-medium transition-all ${
        actief
          ? "bg-emerald-600 text-white"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}
