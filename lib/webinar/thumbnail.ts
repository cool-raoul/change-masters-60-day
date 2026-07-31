// ============================================================
// De voorproef-afbeelding bij een webinar.
//
// Niemand wil handmatig een plaatje zoeken: als er een video-URL
// staat, halen we de thumbnail gewoon bij de bron op. Vimeo levert
// 'm via oEmbed, YouTube heeft een vast adres per video-id. Wil de
// founder een eigen plaatje, dan vult hij het veld zelf en laten we
// het met rust.
// ============================================================

export type VideoInfo = {
  thumbnail: string | null;
  titel: string | null;
  duurMinuten: number | null;
};

export async function haalVideoInfo(videoUrl: string): Promise<VideoInfo> {
  const leeg: VideoInfo = { thumbnail: null, titel: null, duurMinuten: null };
  const url = (videoUrl ?? "").trim();
  if (!url) return leeg;

  // YouTube: het thumbnail-adres is voorspelbaar, geen API nodig.
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  );
  if (yt) {
    return {
      thumbnail: `https://img.youtube.com/vi/${yt[1]}/maxresdefault.jpg`,
      titel: null,
      duurMinuten: null,
    };
  }

  // Vimeo: oEmbed geeft thumbnail, titel en duur in één keer.
  if (/vimeo\.com\//i.test(url)) {
    try {
      const schoon = url.split("?")[0];
      const res = await fetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(schoon)}&width=1280`,
        { cache: "no-store" },
      );
      if (!res.ok) return leeg;
      const j = (await res.json()) as {
        thumbnail_url?: string;
        title?: string;
        duration?: number;
      };
      return {
        thumbnail: j.thumbnail_url ?? null,
        titel: j.title ?? null,
        duurMinuten: j.duration ? Math.round(j.duration / 60) : null,
      };
    } catch {
      return leeg;
    }
  }

  return leeg;
}
