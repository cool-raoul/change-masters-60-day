"use client";

import type { VideoInhoud } from "@/lib/cms/pagina-blokken";
import { vimeoId, youtubeId } from "@/lib/cms/pagina-blokken";

// ============================================================
// VideoBlok, embed voor Vimeo of YouTube via iframe.
//
// Parsen URL → embed-URL → iframe in 16:9-aspectratio. Bij niet-
// herkende URL: rode foutmelding zodat founder ziet dat 'r iets mis
// is met de URL die-ie heeft ingevoerd.
// ============================================================

type Props = {
  inhoud: VideoInhoud;
};

export function VideoBlok({ inhoud }: Props) {
  const vimId = vimeoId(inhoud.url);
  const ytId = youtubeId(inhoud.url);

  let embed: string | null = null;
  if (vimId) embed = `https://player.vimeo.com/video/${vimId}`;
  else if (ytId) embed = `https://www.youtube.com/embed/${ytId}`;

  if (!embed) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-900/20 p-4 text-red-200 text-sm">
        Video-URL niet herkend (alleen Vimeo en YouTube ondersteund). Vraag
        Raoul om de URL te checken.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden bg-cm-black border border-cm-border">
      {inhoud.titel && (
        <p className="px-3 py-2 text-cm-gold text-xs font-semibold uppercase tracking-wider">
          {inhoud.titel}
        </p>
      )}
      <div className="relative aspect-video w-full">
        <iframe
          src={embed}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={inhoud.titel ?? "Video"}
        />
      </div>
    </div>
  );
}
