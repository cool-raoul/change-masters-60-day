"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { normaliseerNaarEmbed } from "@/lib/films/embed";

// ============================================================
// FilmRowEditor — een rij om één film te beheren in /instellingen/films.
//
// Toont per slug: titel, video_url, beschrijving, tonen-toggle.
// Met preview rechts zodra er een (geldige) URL staat.
// ============================================================

type Bestaande = {
  id: string;
  slug: string;
  titel: string;
  beschrijving: string | null;
  video_url: string | null;
  tonen: boolean;
  duur_seconden: number | null;
  updated_at: string;
} | null;

export function FilmRowEditor({
  slug: initSlug,
  plekBeschrijving,
  suggestieTitel,
  bestaande,
  userId,
  isNieuw,
}: {
  slug: string;
  plekBeschrijving: string;
  suggestieTitel: string;
  bestaande: Bestaande;
  userId: string;
  isNieuw?: boolean;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [slug, setSlug] = useState(bestaande?.slug ?? initSlug);
  const [titel, setTitel] = useState(bestaande?.titel ?? suggestieTitel ?? "");
  const [beschrijving, setBeschrijving] = useState(bestaande?.beschrijving ?? "");
  const [videoUrl, setVideoUrl] = useState(bestaande?.video_url ?? "");
  const [tonen, setTonen] = useState(bestaande?.tonen ?? true);
  const [bezig, setBezig] = useState(false);
  const [open, setOpen] = useState(!!bestaande || isNieuw);

  const embedPreview = normaliseerNaarEmbed(videoUrl);
  const heeftVideo = !!bestaande?.video_url;
  const heeftWijziging =
    titel !== (bestaande?.titel ?? "") ||
    beschrijving !== (bestaande?.beschrijving ?? "") ||
    videoUrl !== (bestaande?.video_url ?? "") ||
    tonen !== (bestaande?.tonen ?? true) ||
    slug !== (bestaande?.slug ?? initSlug);

  async function bewaar() {
    if (!slug.trim()) {
      toast.error("Slug is verplicht");
      return;
    }
    if (!titel.trim()) {
      toast.error("Titel is verplicht");
      return;
    }
    setBezig(true);
    const payload: Record<string, unknown> = {
      slug: slug.trim(),
      titel: titel.trim(),
      beschrijving: beschrijving.trim() || null,
      video_url: videoUrl.trim() || null,
      tonen,
      toegevoegd_door: userId,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("films")
      .upsert(payload, { onConflict: "slug" });
    setBezig(false);
    if (error) {
      console.error("Film opslaan mislukt:", error);
      toast.error("Opslaan mislukt: " + error.message);
      return;
    }
    toast.success("Film opgeslagen");
    router.refresh();
  }

  async function verwijder() {
    if (!bestaande) return;
    if (!confirm(`Weet je zeker dat je "${bestaande.titel}" wil verwijderen?`)) return;
    setBezig(true);
    const { error } = await supabase
      .from("films")
      .delete()
      .eq("slug", bestaande.slug);
    setBezig(false);
    if (error) {
      toast.error("Verwijderen mislukt: " + error.message);
      return;
    }
    toast.success("Film verwijderd");
    router.refresh();
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            {plekBeschrijving}
          </p>
          {bestaande?.titel && !open && (
            <p className="text-cm-white text-sm mt-1 truncate">
              {bestaande.titel}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {heeftVideo && (
            <span
              className={`text-xs font-medium ${
                bestaande?.tonen ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {bestaande?.tonen ? "● Aan" : "● Uit"}
            </span>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-xs text-cm-white opacity-70 hover:opacity-100 hover:text-cm-gold underline-offset-2"
          >
            {open ? "Inklappen" : "Bewerken"}
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-3 pt-1">
          {isNieuw && (
            <div>
              <label className="block text-xs text-cm-white opacity-70 mb-1">
                Slug (uniek, bv. prospect-intro-1)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                className="input-cm w-full"
                placeholder="prospect-intro-1"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-cm-white opacity-70 mb-1">
              Titel
            </label>
            <input
              type="text"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className="input-cm w-full"
              placeholder={suggestieTitel || "Bv. Lifeplus webshop in 5 minuten"}
            />
          </div>

          <div>
            <label className="block text-xs text-cm-white opacity-70 mb-1">
              Video-URL (YouTube of Vimeo)
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="input-cm w-full"
              placeholder="https://youtu.be/... of https://vimeo.com/..."
            />
            {videoUrl && embedPreview && embedPreview !== videoUrl && (
              <p className="text-xs text-cm-white opacity-50 mt-1 italic">
                Wordt opgeslagen als: <code>{embedPreview}</code>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-cm-white opacity-70 mb-1">
              Beschrijving (optioneel — onder de film)
            </label>
            <textarea
              value={beschrijving}
              onChange={(e) => setBeschrijving(e.target.value)}
              className="textarea-cm w-full"
              rows={2}
              placeholder="Korte uitleg wat de kijker gaat zien"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tonen}
              onChange={(e) => setTonen(e.target.checked)}
              className="w-4 h-4 accent-cm-gold"
            />
            <span className="text-cm-white text-sm">Tonen aan members en prospects</span>
          </label>

          {/* Live-preview als er een video is */}
          {embedPreview && (
            <div className="rounded-lg overflow-hidden border border-cm-border bg-black">
              <iframe
                src={embedPreview}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                title="Preview"
              />
            </div>
          )}

          <div className="flex gap-2 flex-wrap pt-2">
            <button
              onClick={bewaar}
              disabled={bezig || !heeftWijziging}
              className="btn-gold text-sm disabled:opacity-40"
            >
              {bezig ? "Opslaan..." : bestaande ? "Wijzigingen opslaan" : "Aanmaken"}
            </button>
            {bestaande && (
              <button
                onClick={verwijder}
                disabled={bezig}
                className="text-sm text-red-400 hover:text-red-300 underline-offset-2"
              >
                Verwijderen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
