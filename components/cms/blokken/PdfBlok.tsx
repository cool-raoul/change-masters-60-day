"use client";

import type { PdfInhoud } from "@/lib/cms/pagina-blokken";

// ============================================================
// PdfBlok, klikbare download-card. Opent PDF in nieuwe tab i.p.v.
// inline preview want PDF-viewers verschillen sterk per browser en
// een download-flow is voorspelbaarder.
// ============================================================

type Props = {
  inhoud: PdfInhoud;
  bestandUrl: string;
};

export function PdfBlok({ inhoud, bestandUrl }: Props) {
  return (
    <a
      href={bestandUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={inhoud.bestandsnaam}
      className="flex items-center gap-3 p-4 rounded-xl border border-cm-border bg-cm-surface hover:border-cm-gold-dim transition-colors"
    >
      <span className="text-3xl flex-shrink-0">📄</span>
      <div className="flex-1 min-w-0">
        <p className="text-cm-white font-semibold text-sm truncate">
          {inhoud.titel}
        </p>
        {inhoud.beschrijving && (
          <p className="text-cm-white/60 text-xs mt-0.5 leading-snug">
            {inhoud.beschrijving}
          </p>
        )}
        <p className="text-cm-gold text-xs mt-1.5">Open / download →</p>
      </div>
    </a>
  );
}
