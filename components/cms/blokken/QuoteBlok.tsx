"use client";

import type { QuoteInhoud } from "@/lib/cms/pagina-blokken";

// ============================================================
// QuoteBlok, gestyleerde pull-out citaat met bron.
// Voor mooie uitspraken van Worre, Brookes, Les Brown, eigen quotes.
// ============================================================

type Props = {
  inhoud: QuoteInhoud;
};

export function QuoteBlok({ inhoud }: Props) {
  return (
    <figure className="rounded-xl border-l-4 border-cm-gold bg-cm-surface-2/40 px-5 py-4 my-2">
      <blockquote className="text-cm-white text-base leading-relaxed italic font-serif-warm">
        <span className="text-cm-gold/60 text-2xl leading-none mr-1 align-top">
          &ldquo;
        </span>
        {inhoud.tekst}
        <span className="text-cm-gold/60 text-2xl leading-none ml-0.5 align-top">
          &rdquo;
        </span>
      </blockquote>
      {inhoud.bron && (
        <figcaption className="text-cm-gold text-xs font-semibold uppercase tracking-wider mt-2 text-right">
          — {inhoud.bron}
        </figcaption>
      )}
    </figure>
  );
}
