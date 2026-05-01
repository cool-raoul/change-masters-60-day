"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  PROSPECT_FILM_SLUGS,
  PROSPECT_FILM_BESCHRIJVINGEN,
} from "@/lib/films/embed";
import { DeelKnoppen } from "@/components/shared/DeelKnoppen";

// ============================================================
// StuurFilmKnop, op een prospect-kaart.
//
// Member klikt → modal met dropdown van beschikbare prospect-films
// (alleen die de founder daadwerkelijk een URL voor heeft gezet).
// Selectie + 'Genereer link' → API maakt unieke share-token + URL.
// DeelKnoppen-modal verschijnt om via WhatsApp/mail/kopieer te delen.
//
// Als prospect later de film afkijkt: member krijgt een herinnering
// + de prospect schuift automatisch naar followup-fase.
// ============================================================

type Props = {
  prospectId: string;
  prospectNaam: string;
  /** Voornaam van de member zelf, voor de gegenereerde share-tekst. */
  memberVoornaam: string;
};

type FilmOptie = {
  slug: string;
  titel: string;
  beschikbaar: boolean;
};

export function StuurFilmKnop({
  prospectId,
  prospectNaam,
  memberVoornaam,
}: Props) {
  const [open, setOpen] = useState(false);
  const [opties, setOpties] = useState<FilmOptie[]>([]);
  const [laden, setLaden] = useState(false);
  const [gekozenSlug, setGekozenSlug] = useState<string>("");
  const [bezig, setBezig] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Bij openen modal: laad welke films de founder heeft gevuld.
  useEffect(() => {
    if (!open || opties.length > 0) return;
    let cancelled = false;
    async function laad() {
      setLaden(true);
      const supabase = createClient();
      const slugs = Object.values(PROSPECT_FILM_SLUGS);
      const { data: films } = await supabase
        .from("films")
        .select("slug, titel, video_url, tonen")
        .in("slug", slugs);
      if (cancelled) return;
      const filmMap = new Map(
        ((films as Array<{ slug: string; titel: string; video_url: string | null; tonen: boolean }>) || []).map(
          (f) => [f.slug, f],
        ),
      );
      const lijst: FilmOptie[] = slugs.map((slug) => {
        const f = filmMap.get(slug);
        const meta = PROSPECT_FILM_BESCHRIJVINGEN[slug];
        return {
          slug,
          titel: f?.titel || meta?.suggestieTitel || slug,
          beschikbaar: !!f && !!f.video_url && f.tonen !== false,
        };
      });
      setOpties(lijst);
      // Auto-select de eerste beschikbare
      const eersteBeschikbaar = lijst.find((o) => o.beschikbaar);
      if (eersteBeschikbaar) setGekozenSlug(eersteBeschikbaar.slug);
      setLaden(false);
    }
    void laad();
    return () => {
      cancelled = true;
    };
  }, [open, opties.length]);

  async function genereerLink() {
    if (!gekozenSlug) {
      toast.error("Kies eerst een film");
      return;
    }
    setBezig(true);
    try {
      const res = await fetch("/api/prospect-film/share-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId, filmSlug: gekozenSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Aanmaken mislukt");
        return;
      }
      setShareUrl(data.url);
      if (data.hergebruikt) {
        toast.success("Bestaande link hergebruikt");
      } else {
        toast.success("Share-link aangemaakt");
      }
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  function sluit() {
    setOpen(false);
    setShareUrl(null);
    setGekozenSlug("");
  }

  const aantalBeschikbaar = opties.filter((o) => o.beschikbaar).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary text-sm flex items-center gap-1.5"
        title="Stuur een film naar deze prospect"
      >
        📺 Stuur film
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={sluit}
        >
          <div
            className="bg-cm-bg border-2 border-cm-gold/60 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                    Film delen
                  </h2>
                  <p className="text-lg font-display font-bold text-cm-white mt-0.5">
                    Stuur naar {prospectNaam}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={sluit}
                  className="text-cm-white opacity-50 hover:opacity-100 text-2xl leading-none"
                  aria-label="Sluit"
                >
                  ×
                </button>
              </div>

              {!shareUrl ? (
                <>
                  <p className="text-cm-white opacity-80 text-sm leading-relaxed">
                    Kies een film, ELEVA maakt een unieke link voor{" "}
                    {prospectNaam}. Als 'ie afkijkt krijg jij een herinnering
                    en schuift {prospectNaam} automatisch naar de
                    follow-up-fase.
                  </p>

                  {laden ? (
                    <p className="text-cm-white opacity-50 text-sm italic">
                      Films laden…
                    </p>
                  ) : aantalBeschikbaar === 0 ? (
                    <div className="rounded-md bg-amber-900/20 border border-amber-500/40 p-3 text-xs text-amber-200 leading-relaxed">
                      <p className="font-semibold mb-1">
                        Nog geen prospect-films beschikbaar
                      </p>
                      <p className="opacity-90">
                        Vraag de hoofdbeheerder om in /instellingen/films de
                        sectie "📺 Prospect-films" te vullen. Daarna kun je hier
                        kiezen wat je verstuurt.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {opties.map((o) => (
                        <label
                          key={o.slug}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            !o.beschikbaar
                              ? "border-cm-border bg-cm-surface opacity-50 cursor-not-allowed"
                              : gekozenSlug === o.slug
                                ? "border-cm-gold bg-cm-gold/10"
                                : "border-cm-border bg-cm-surface hover:border-cm-gold-dim"
                          }`}
                        >
                          <input
                            type="radio"
                            name="film-keuze"
                            value={o.slug}
                            checked={gekozenSlug === o.slug}
                            onChange={() =>
                              o.beschikbaar && setGekozenSlug(o.slug)
                            }
                            disabled={!o.beschikbaar}
                            className="accent-cm-gold flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-cm-white font-medium truncate">
                              {o.titel}
                            </p>
                            {!o.beschikbaar && (
                              <p className="text-[10px] text-cm-white opacity-50 italic">
                                nog niet ingevuld door hoofdbeheerder
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={genereerLink}
                    disabled={bezig || !gekozenSlug}
                    className="btn-gold w-full py-3 text-sm font-semibold disabled:opacity-50"
                  >
                    {bezig ? "Bezig..." : "🔗 Genereer share-link"}
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-md bg-emerald-900/20 border border-emerald-500/40 p-3 text-xs text-emerald-200 leading-relaxed">
                    <p className="font-semibold mb-1">
                      ✓ Link klaar, deel 'm hieronder
                    </p>
                    <p className="opacity-90">
                      Wanneer {prospectNaam} de film afkijkt zie je dat hier in
                      ELEVA + krijg je een herinnering om op te volgen.
                    </p>
                  </div>
                  <DeelKnoppen
                    url={shareUrl}
                    tekst={`Hé ${prospectNaam}! Ik heb iets voor je dat ik denk dat je interessant gaat vinden${memberVoornaam ? ` — gewoon even kijken` : ""}. Hieronder de link.`}
                    onderwerp={`Een korte film van ${memberVoornaam || "ELEVA"}`}
                    variant="donker"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
