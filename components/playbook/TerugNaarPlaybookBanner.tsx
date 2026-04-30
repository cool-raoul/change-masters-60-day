"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ============================================================
// TerugNaarPlaybookBanner
//
// Toont een prominente "↩ Terug"-balk bovenaan een pagina wanneer de
// URL `?van=...&dag=N` bevat. Member kwam dan vanuit een dag-flow
// hierheen om een actie uit te voeren — na de actie willen we dat
// hij in één klik terugkeert naar de juiste plek:
//   - `?van=vandaag` → terug naar /vandaag (de guided flow herstelt
//     vanuit localStorage de exacte taak waar 'ie was).
//   - `?van=playbook` (legacy) → terug naar /playbook?dag=N
//
// Gebruik op elke pagina die als actieRoute van een ControllableTaak
// kan dienen (/coach, /namenlijst, /team, etc.).
// ============================================================

export function TerugNaarPlaybookBanner() {
  const sp = useSearchParams();
  const van = sp.get("van");
  const dag = sp.get("dag");

  if ((van !== "playbook" && van !== "vandaag") || !dag) return null;

  const dagNummer = Number(dag);
  if (!Number.isFinite(dagNummer) || dagNummer < 1 || dagNummer > 21) {
    return null;
  }

  const isVandaag = van === "vandaag";
  const terugHref = isVandaag ? "/vandaag" : `/playbook?dag=${dagNummer}`;
  const label = isVandaag
    ? "↩ Terug naar dag-flow"
    : `↩ Terug naar dag ${dagNummer}`;
  const beschrijving = isVandaag ? (
    <>
      Je bent hier vanuit je <strong className="text-cm-gold">dag-flow</strong>.
      Klaar? Eén klik en je staat weer bij je volgende stap.
    </>
  ) : (
    <>
      Je bent hier vanuit je{" "}
      <strong className="text-cm-gold">playbook dag {dagNummer}</strong>. Klaar?
      Vink de stap dan af in je playbook.
    </>
  );

  return (
    <div className="rounded-lg border border-cm-gold/40 bg-cm-gold/10 px-4 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
      <p className="text-sm text-cm-white">{beschrijving}</p>
      <Link
        href={terugHref}
        className="text-xs px-3 py-1.5 rounded-full bg-cm-gold text-cm-black font-semibold hover:opacity-90 whitespace-nowrap"
      >
        {label}
      </Link>
    </div>
  );
}
