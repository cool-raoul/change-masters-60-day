// ============================================================
// PLAYBOOK PREVIEW — read-only inkijk op alle 21 dagen +
// 7 weekdagen + 3 fasen. Bedoeld voor content-review zonder
// dat je 21 dagen hoeft te wachten of de echte run hoeft te
// doorlopen.
//
// Geen DB-calls, geen state — gewoon de data-laag uit
// /lib/playbook in een lange scrollpagina.
//
// Toegang: achter dezelfde auth-laag als de rest van de app.
// Niet publiek — alleen ingelogde gebruikers.
// ============================================================

import Link from "next/link";
import { FASEN } from "@/lib/playbook/fasen";
import { DAGEN } from "@/lib/playbook/dagen";
import { WEEKRITME } from "@/lib/playbook/weekritme";
import type {
  ControllableTaak,
  ElevaPad,
  Dag,
  Fase,
  Weekdag,
} from "@/lib/playbook/types";

const WEEKDAG_LABELS: Record<number, string> = {
  1: "Maandag",
  2: "Dinsdag",
  3: "Woensdag",
  4: "Donderdag",
  5: "Vrijdag",
  6: "Zaterdag",
  0: "Zondag",
};

function FaseKaart({ fase }: { fase: Fase }) {
  return (
    <div className="card" id={`fase-${fase.nummer}`}>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-xl font-display font-bold text-cm-gold">
          Fase {fase.nummer} — {fase.titel}
        </h3>
        <span className="text-cm-white opacity-60 text-sm">
          dag {fase.dagen[0]}-{fase.dagen[1]}
        </span>
      </div>

      <p className="text-cm-white text-sm leading-relaxed mb-4">
        {fase.samenvatting}
      </p>

      <div className="mb-4">
        <h4 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-2">
          ✅ Controllable-lat
        </h4>
        <ul className="space-y-1">
          {fase.controllableLat.map((item, i) => (
            <li key={i} className="text-cm-white text-sm flex gap-2">
              <span className="text-cm-gold">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-1">
          🎯 Niet-controleerbaar doel
        </h4>
        <p className="text-cm-white text-sm">{fase.doel}</p>
      </div>

      <div>
        <h4 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-1">
          🌱 Kernprincipe
        </h4>
        <p className="text-cm-white text-sm italic opacity-80">
          {fase.kernprincipe}
        </p>
      </div>
    </div>
  );
}

function TaakRij({ taak }: { taak: ControllableTaak }) {
  return (
    <div className="flex gap-3 items-start py-1.5">
      <span
        className={`mt-0.5 inline-flex h-4 w-4 rounded border ${
          taak.verplicht
            ? "border-cm-gold"
            : "border-cm-white opacity-40"
        }`}
        aria-hidden
      />
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-cm-white text-sm">{taak.label}</span>
          {!taak.verplicht && (
            <span className="text-[10px] uppercase tracking-wider text-cm-white opacity-50">
              optioneel
            </span>
          )}
        </div>
        {taak.uitleg && (
          <p className="text-cm-white text-xs opacity-70 mt-1 leading-relaxed">
            {taak.uitleg}
          </p>
        )}
        <p className="text-[10px] text-cm-white opacity-30 mt-0.5 font-mono">
          id: {taak.id}
        </p>
      </div>
    </div>
  );
}

function ElevaPadRij({ pad }: { pad: ElevaPad }) {
  return (
    <div className="text-cm-white text-sm">
      <p className="font-medium">{pad.actie}</p>
      {pad.menupad && (
        <p className="text-xs opacity-70 mt-0.5">📍 {pad.menupad}</p>
      )}
      {pad.spraak && (
        <p className="text-xs opacity-70 mt-0.5">
          🎙️ <span className="italic">"{pad.spraak}"</span>
        </p>
      )}
      {pad.route && (
        <p className="text-xs opacity-50 mt-0.5 font-mono">{pad.route}</p>
      )}
    </div>
  );
}

function DagBlok({ dag }: { dag: Dag }) {
  return (
    <div className="card" id={`dag-${dag.nummer}`}>
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-xl font-display font-bold text-cm-white">
          <span className="text-cm-gold">Dag {dag.nummer}</span> — {dag.titel}
        </h3>
        <span className="text-xs uppercase tracking-wider text-cm-white opacity-50">
          fase {dag.fase}
        </span>
      </div>

      {/* 1. Vandaag doen */}
      <div className="mb-5">
        <h4 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-2">
          ✅ Vandaag doen
        </h4>
        <div className="space-y-1">
          {dag.vandaagDoen.map((t) => (
            <TaakRij key={t.id} taak={t} />
          ))}
        </div>
      </div>

      {/* 2. Fase-doel */}
      <div className="mb-5">
        <h4 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-1">
          🎯 Fase-doel (niet afvinkbaar)
        </h4>
        <p className="text-cm-white text-sm">{dag.faseDoel}</p>
      </div>

      {/* 3. Waar in ELEVA */}
      <div className="mb-5">
        <h4 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-2">
          📍 Waar in ELEVA
        </h4>
        <div className="space-y-3">
          {dag.waarInEleva.map((p, i) => (
            <ElevaPadRij key={i} pad={p} />
          ))}
        </div>
      </div>

      {/* 4. Wat je leert */}
      <div className="mb-5">
        <h4 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-2">
          💡 Wat je leert
        </h4>
        <div className="text-cm-white text-sm leading-relaxed whitespace-pre-line">
          {dag.watJeLeert}
        </div>
      </div>

      {/* 5. Waarom werkt dit */}
      <div>
        <h4 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-2">
          🌱 Waarom werkt dit
        </h4>
        <blockquote className="border-l-2 border-cm-gold/50 pl-3 text-cm-white text-sm italic opacity-90">
          "{dag.waaromWerktDit.tekst}"
          {dag.waaromWerktDit.bron && (
            <footer className="text-xs opacity-60 not-italic mt-1">
              — {dag.waaromWerktDit.bron}
            </footer>
          )}
        </blockquote>
      </div>
    </div>
  );
}

function WeekdagBlok({ wd }: { wd: Weekdag }) {
  return (
    <div className="card" id={`weekdag-${wd.dagVanDeWeek}`}>
      <h3 className="text-xl font-display font-bold text-cm-white mb-1">
        <span className="text-cm-gold">{WEEKDAG_LABELS[wd.dagVanDeWeek]}</span>
        <span className="opacity-70 text-base"> — {wd.titel.replace(/^.*?—\s*/, "")}</span>
      </h3>
      <p className="text-cm-white text-sm mb-4 opacity-90 leading-relaxed">
        {wd.focus}
      </p>

      <div className="mb-4">
        <h4 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-2">
          ✅ Vandaag doen
        </h4>
        <div className="space-y-1">
          {wd.vandaagDoen.map((t) => (
            <TaakRij key={t.id} taak={t} />
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-2">
          📍 Waar in ELEVA
        </h4>
        <div className="space-y-3">
          {wd.waarInEleva.map((p, i) => (
            <ElevaPadRij key={i} pad={p} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-2">
          💡 Teaching
        </h4>
        <p className="text-cm-white text-sm leading-relaxed whitespace-pre-line opacity-90">
          {wd.teaching}
        </p>
      </div>
    </div>
  );
}

export default function PlaybookPreviewPagina() {
  // Volgorde week: ma → zo (1..6, 0)
  const weekVolgorde: Weekdag[] = [
    ...WEEKRITME.filter((w) => w.dagVanDeWeek !== 0).sort(
      (a, b) => a.dagVanDeWeek - b.dagVanDeWeek
    ),
    ...WEEKRITME.filter((w) => w.dagVanDeWeek === 0),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Banner */}
      <div className="bg-cm-gold/10 border border-cm-gold/30 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-xl">🔍</span>
        <div className="flex-1">
          <p className="text-cm-gold text-sm font-semibold mb-0.5">
            Preview-modus — content-review
          </p>
          <p className="text-cm-white text-xs opacity-80 leading-relaxed">
            Read-only inkijk op alle 21 dagen + weekritme + 3 fasen. Niet
            voor gebruik door members. Geen voortgang wordt opgeslagen.
            Sla wijzigingen door aan Claude — die past de bron-bestanden
            aan in <code className="opacity-60">lib/playbook/*</code>.
          </p>
        </div>
      </div>

      <div>
        <Link
          href="/dashboard"
          className="text-cm-white opacity-60 hover:opacity-100 text-sm"
        >
          ← Terug naar dashboard
        </Link>
        <h1 className="text-3xl font-display font-bold text-cm-white mt-2">
          📖 Playbook-preview
        </h1>
        <p className="text-cm-white opacity-70 text-sm mt-1">
          De volledige 60-dagenrun in tekst — fasen, dag 1-21, weekritme
          dag 22-60.
        </p>
      </div>

      {/* Inhoudsopgave */}
      <div className="card">
        <h2 className="text-cm-white text-xs uppercase tracking-wider opacity-60 mb-3">
          Inhoudsopgave
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-sm">
          <a
            href="#fasen"
            className="text-cm-gold hover:text-cm-gold-light"
          >
            → 3 fasen
          </a>
          <a
            href="#dag-1"
            className="text-cm-gold hover:text-cm-gold-light"
          >
            → Fase 1 (dag 1-7)
          </a>
          <a
            href="#dag-8"
            className="text-cm-gold hover:text-cm-gold-light"
          >
            → Fase 2 (dag 8-14)
          </a>
          <a
            href="#dag-15"
            className="text-cm-gold hover:text-cm-gold-light"
          >
            → Fase 3 (dag 15-21)
          </a>
          <a
            href="#weekritme"
            className="text-cm-gold hover:text-cm-gold-light"
          >
            → Weekritme (22-60)
          </a>
        </div>

        {/* Per dag dropdown */}
        <details className="mt-4">
          <summary className="text-cm-white opacity-60 hover:opacity-100 text-xs cursor-pointer uppercase tracking-wider">
            Springen naar specifieke dag…
          </summary>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5 mt-3">
            {DAGEN.map((d) => (
              <a
                key={d.nummer}
                href={`#dag-${d.nummer}`}
                className="text-center text-cm-white text-xs py-1.5 rounded border border-cm-white/10 hover:border-cm-gold hover:text-cm-gold transition-colors"
              >
                Dag {d.nummer}
              </a>
            ))}
          </div>
        </details>
      </div>

      {/* Fasen-overzicht */}
      <section id="fasen" className="space-y-4 scroll-mt-6">
        <h2 className="text-2xl font-display font-bold text-cm-white border-b border-cm-white/10 pb-2">
          De 3 fasen
        </h2>
        {FASEN.map((f) => (
          <FaseKaart key={f.nummer} fase={f} />
        ))}
      </section>

      {/* Dag 1-21 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-bold text-cm-white border-b border-cm-white/10 pb-2">
          Dag 1 t/m 21 — de leerschool
        </h2>
        {DAGEN.map((d) => (
          <DagBlok key={d.nummer} dag={d} />
        ))}
      </section>

      {/* Weekritme */}
      <section id="weekritme" className="space-y-4 scroll-mt-6">
        <h2 className="text-2xl font-display font-bold text-cm-white border-b border-cm-white/10 pb-2">
          Weekritme — dag 22 t/m 60
        </h2>
        <p className="text-cm-white text-sm opacity-70 leading-relaxed">
          Vanaf dag 22 zit de member in onderhouds-modus. Elke weekdag
          heeft een vaste focus. Dit ritme loopt door tot dag 60.
        </p>
        {weekVolgorde.map((wd) => (
          <WeekdagBlok key={wd.dagVanDeWeek} wd={wd} />
        ))}
      </section>

      <div className="card text-center py-6">
        <p className="text-cm-white opacity-60 text-sm">
          Einde preview — terug naar{" "}
          <Link
            href="/dashboard"
            className="text-cm-gold hover:text-cm-gold-light"
          >
            dashboard
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
