"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ============================================================
// TerugNaarPlaybookBanner
//
// Toont een prominente "↩ Terug naar dag N" balk bovenaan een pagina
// wanneer de URL `?van=playbook&dag=N` bevat. Member kwam dan vanuit
// het 21-daagse playbook hierheen om een actie uit te voeren — na
// de actie willen we dat hij makkelijk terugkeert naar zijn dagtegel.
//
// Gebruik op elke pagina die als actieRoute van een ControllableTaak
// kan dienen (/coach, /instellingen/bestellinks, /namenlijst, etc.).
// ============================================================

export function TerugNaarPlaybookBanner() {
  const sp = useSearchParams();
  const van = sp.get("van");
  const dag = sp.get("dag");

  if (van !== "playbook" || !dag) return null;

  const dagNummer = Number(dag);
  if (!Number.isFinite(dagNummer) || dagNummer < 1 || dagNummer > 21) {
    return null;
  }

  return (
    <div className="rounded-lg border border-cm-gold/40 bg-cm-gold/10 px-4 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
      <p className="text-sm text-cm-white">
        Je bent hier vanuit je <strong className="text-cm-gold">playbook dag {dagNummer}</strong>.
        Klaar? Vink de stap dan af in je playbook.
      </p>
      <Link
        href={`/playbook?dag=${dagNummer}`}
        className="text-xs px-3 py-1.5 rounded-full bg-cm-gold text-cm-black font-semibold hover:opacity-90 whitespace-nowrap"
      >
        ↩ Terug naar dag {dagNummer}
      </Link>
    </div>
  );
}
