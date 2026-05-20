"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ============================================================
// TerugNaarPlaybookBanner
//
// Toont een prominente "↩ Terug"-balk bovenaan een pagina wanneer de
// URL `?van=vandaag&dag=N` bevat. Member kwam dan vanuit zijn /vandaag
// dag-flow hierheen om een actie uit te voeren, na de actie willen we
// dat hij in één klik terugkeert. De guided flow herstelt vanuit
// localStorage de exacte taak waar 'ie was.
//
// De legacy `?van=playbook` route is per 2026-05-20 uit deze banner
// gehaald. /playbook?dag=N werd niet meer actief gebruikt (founders
// bewerken nu direct op /vandaag). De UI-route blijft bestaan voor
// backwards-compat met oude bookmarks, maar wordt niet langer als
// terug-bestemming aangeboden.
//
// Gebruik op elke pagina die als actieRoute van een ControllableTaak
// kan dienen (/coach, /namenlijst, /team, etc.).
// ============================================================

export function TerugNaarPlaybookBanner() {
  const sp = useSearchParams();
  const van = sp.get("van");
  const dag = sp.get("dag");

  if (van !== "vandaag" || !dag) return null;

  const dagNummer = Number(dag);
  if (!Number.isFinite(dagNummer) || dagNummer < 1 || dagNummer > 21) {
    return null;
  }

  return (
    <div className="rounded-lg border border-cm-gold/40 bg-cm-gold/10 px-4 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
      <p className="text-sm text-cm-white">
        Je bent hier vanuit je{" "}
        <strong className="text-cm-gold">dag-flow</strong>. Klaar? Eén klik en
        je staat weer bij je volgende stap.
      </p>
      <Link
        href="/vandaag"
        className="text-xs px-3 py-1.5 rounded-full bg-cm-gold text-cm-black font-semibold hover:opacity-90 whitespace-nowrap"
      >
        ↩ Terug naar dag-flow
      </Link>
    </div>
  );
}
