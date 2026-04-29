"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { normaliseerNaarEmbed, detecteerProvider } from "@/lib/films/embed";

// ============================================================
// FilmInBlok — embed een film op slug uit de films-tabel.
//
// Gebruik:
//   <FilmInBlok slug="onboarding-stap-6-webshop"
//               fallbackTekst="Film volgt — vraag je sponsor om mee te kijken." />
//
// Werking:
// - Haalt de film op via slug uit de films-tabel
// - Toont placeholder met fallback-tekst als er nog geen video_url is
// - Toont YouTube/Vimeo iframe als er een URL is
// - Tracked dat de gebruiker de film GEZIEN heeft (gestart) en biedt
//   een knop om af te kruisen ("ik heb 'm afgekeken")
//
// Voor diepere tracking (realtime % afgekeken) staat dat geplant in
// fase 2 met YouTube IFrame API postMessage.
// ============================================================

type FilmData = {
  slug: string;
  titel: string;
  beschrijving: string | null;
  belangrijk: string | null;
  video_url: string | null;
  tonen: boolean;
  duur_seconden: number | null;
};

export function FilmInBlok({
  slug,
  fallbackTekst = "Film komt hier — wordt binnenkort toegevoegd.",
  fallbackTitel,
}: {
  slug: string;
  fallbackTekst?: string;
  fallbackTitel?: string;
}) {
  const supabase = createClient();
  const [film, setFilm] = useState<FilmData | null>(null);
  const [laden, setLaden] = useState(true);
  const [afgekeken, setAfgekeken] = useState(false);
  const [bezig, setBezig] = useState(false);
  const startVerstuurdRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function laad() {
      const { data: filmRow } = await supabase
        .from("films")
        .select("slug, titel, beschrijving, belangrijk, video_url, tonen, duur_seconden")
        .eq("slug", slug)
        .eq("tonen", true)
        .maybeSingle();
      if (cancelled) return;
      setFilm(filmRow as FilmData | null);

      // Heeft user al een view-rij? Dan bepalen of hij al afgekeken is.
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: view } = await supabase
          .from("film_views")
          .select("afgekeken")
          .eq("user_id", user.id)
          .eq("film_slug", slug)
          .maybeSingle();
        if (!cancelled && view?.afgekeken) setAfgekeken(true);
      }
      setLaden(false);
    }
    laad();
    return () => { cancelled = true; };
  }, [slug, supabase]);

  // Markeer "gestart" zodra de iframe geladen is (best-effort tracking).
  async function markeerGestart() {
    if (startVerstuurdRef.current) return;
    startVerstuurdRef.current = true;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("film_views")
      .upsert(
        {
          user_id: user.id,
          film_slug: slug,
          afgekeken: false,
          gestart_op: new Date().toISOString(),
        },
        { onConflict: "user_id,film_slug" },
      );
  }

  async function markeerAfgekeken() {
    setBezig(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setBezig(false);
      return;
    }
    await supabase
      .from("film_views")
      .upsert(
        {
          user_id: user.id,
          film_slug: slug,
          afgekeken: true,
          afgekeken_op: new Date().toISOString(),
        },
        { onConflict: "user_id,film_slug" },
      );
    setAfgekeken(true);
    setBezig(false);
  }

  if (laden) {
    return (
      <div className="aspect-video bg-cm-surface-2 rounded-lg flex items-center justify-center border border-cm-border">
        <div className="flex space-x-1.5">
          <div className="w-2 h-2 bg-cm-gold rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-cm-gold rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-cm-gold rounded-full animate-bounce delay-200" />
        </div>
      </div>
    );
  }

  // Geen film of geen URL → fallback-placeholder zoals voorheen
  if (!film || !film.video_url) {
    return (
      <div className="space-y-2">
        {fallbackTitel && (
          <h4 className="text-cm-gold font-semibold text-sm">{fallbackTitel}</h4>
        )}
        <div className="aspect-video bg-cm-surface-2 rounded-lg flex items-center justify-center border border-cm-border">
          <p className="text-cm-white text-sm opacity-50 italic px-6 text-center">
            {fallbackTekst}
          </p>
        </div>
      </div>
    );
  }

  const embedUrl = normaliseerNaarEmbed(film.video_url);
  const provider = detecteerProvider(film.video_url);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h4 className="text-cm-gold font-semibold text-sm">{film.titel}</h4>
        {afgekeken && (
          <span className="text-emerald-400 text-xs font-medium">✓ Afgekeken</span>
        )}
      </div>

      {/* Belangrijk-blok BOVEN de video — opvallend amber, zodat de
          gebruiker de instructie/waarschuwing zeker leest voordat hij
          de film start. */}
      {film.belangrijk && (
        <div className="bg-amber-900/25 border border-amber-500/40 rounded-lg p-3 mb-2">
          <p className="text-amber-200 text-sm leading-relaxed whitespace-pre-line">
            {film.belangrijk}
          </p>
        </div>
      )}

      <div className="aspect-video bg-black rounded-lg overflow-hidden border border-cm-border">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title={film.titel}
            onLoad={markeerGestart}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-cm-white text-sm opacity-50 italic px-6 text-center">
              Video kan niet geladen worden — controleer de URL ({provider}).
            </p>
          </div>
        )}
      </div>
      {film.beschrijving && (
        <p className="text-cm-white text-xs opacity-70 italic">{film.beschrijving}</p>
      )}
      {!afgekeken && (
        <button
          onClick={markeerAfgekeken}
          disabled={bezig}
          className="text-xs text-cm-white opacity-60 hover:opacity-100 hover:text-cm-gold underline underline-offset-2"
        >
          {bezig ? "Bezig..." : "Markeer als afgekeken"}
        </button>
      )}
    </div>
  );
}
