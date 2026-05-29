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

  // Vanuit de "wat nu?"-knop in Core: spoor terug naar je stap. Zodat
  // je niet verdwaalt als je even iets gaat opzoeken of doen, en in
  // één klik terugkomt waar je was (Raoul, 2026-05-28).
  if (van === "core-v9") {
    return (
      <div className="rounded-lg border border-cm-gold/40 bg-cm-gold/10 px-4 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-cm-white">
          Je kwam hier via{" "}
          <strong className="text-cm-gold">Wat nu?</strong>. Klaar? Eén klik en
          je staat weer bij je stap.
        </p>
        <Link
          href="/core-v9"
          className="text-xs px-3 py-1.5 rounded-full bg-cm-gold text-cm-black font-semibold hover:opacity-90 whitespace-nowrap"
        >
          ↩ Terug naar je stap
        </Link>
      </div>
    );
  }

  if (van !== "vandaag") return null;

  // Vanuit de "wat nu?"-knop in Sprint: spoor terug naar je stap. Net als
  // bij Core, maar dan zonder dag-nummer (de wat-nu-laag is modus-agnostisch
  // en kent geen specifieke dag). Eén klik en je staat weer in je dag-flow.
  if (!dag) {
    return (
      <div className="rounded-lg border border-cm-gold/40 bg-cm-gold/10 px-4 py-3 mb-4 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-cm-white">
          Je kwam hier via{" "}
          <strong className="text-cm-gold">Wat nu?</strong>. Klaar? Eén klik en
          je staat weer in je dag-flow.
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
