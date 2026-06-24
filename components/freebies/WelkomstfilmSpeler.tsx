import { normaliseerNaarEmbed, youtubeEmbedMetOpties } from "@/lib/films/embed";

// Speelt de welkomstfilm af in de freebie. Drie bronnen:
//   - youtube / vimeo → iframe-embed (gratis bandbreedte van hun kant)
//   - upload          → eigen <video> uit Supabase Storage
// Geen film ingesteld → een nette placeholder (geen leeg/grijs vak).

export function WelkomstfilmSpeler({
  soort,
  url,
}: {
  soort?: string | null;
  url?: string | null;
}) {
  if (!url || !soort) {
    return (
      <div className="aspect-video w-full rounded-2xl border border-[#ead8a0] bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] text-[#c9a961] flex items-center justify-center text-center p-6 text-sm">
        🎬 Hier komt de welkomstfilm
      </div>
    );
  }

  if (soort === "upload") {
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#ead8a0] bg-black shadow-md">
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full"
        />
      </div>
    );
  }

  const basis = normaliseerNaarEmbed(url);
  const embed = basis ? youtubeEmbedMetOpties(basis) : undefined;
  return (
    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-[#ead8a0] bg-black shadow-md">
      <iframe
        src={embed}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title="Welkomstfilm"
      />
    </div>
  );
}
