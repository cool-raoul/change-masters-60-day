"use client";

import { useState } from "react";
import type { AfbeeldingInhoud } from "@/lib/cms/pagina-blokken";

// ============================================================
// AfbeeldingBlok, image-tile met click-to-fullscreen en alt-text.
// Lazy-loading om paginalaadtijd niet onnodig te verzwaren.
// ============================================================

type Props = {
  inhoud: AfbeeldingInhoud;
  bestandUrl: string;
};

export function AfbeeldingBlok({ inhoud, bestandUrl }: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-cm-border bg-cm-surface">
        {inhoud.titel && (
          <p className="px-3 py-2 text-cm-gold text-xs font-semibold uppercase tracking-wider">
            {inhoud.titel}
          </p>
        )}
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="block w-full"
          title="Klik om groter te bekijken"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bestandUrl}
            alt={inhoud.alt}
            width={inhoud.breedte}
            height={inhoud.hoogte}
            className="w-full h-auto block"
            loading="lazy"
          />
        </button>
      </div>
      {fullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bestandUrl}
            alt={inhoud.alt}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
}
