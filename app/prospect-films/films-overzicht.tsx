"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { normaliseerNaarEmbed, embedMetOpties } from "@/lib/films/embed";
import { DeelKnoppen } from "@/components/shared/DeelKnoppen";
import { filterOpZoek } from "@/lib/namenlijst/zoek";

type Film = {
  slug: string;
  titel: string;
  beschrijving: string;
  videoUrl: string | null;
};

type ProspectKeuze = {
  id: string;
  volledige_naam: string;
  email: string | null;
  telefoon: string | null;
  pipeline_fase: string | null;
  actief: boolean | null;
};

type Props = {
  films: Film[];
  prospects: ProspectKeuze[];
  memberVoornaam: string;
};

export function FilmsOverzicht({ films, prospects, memberVoornaam }: Props) {
  // Welke film kijk je zelf terug, en welke stuur je door? Twee losse
  // modals, zodat "even zelf kijken" nooit per ongeluk in een deel-flow
  // eindigt.
  const [bekijkFilm, setBekijkFilm] = useState<Film | null>(null);
  const [stuurFilm, setStuurFilm] = useState<Film | null>(null);
  const [zoek, setZoek] = useState("");
  const [gekozen, setGekozen] = useState<ProspectKeuze | null>(null);
  const [bezig, setBezig] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  function sluitStuur() {
    setStuurFilm(null);
    setZoek("");
    setGekozen(null);
    setShareUrl(null);
  }

  async function genereerLink(prospect: ProspectKeuze) {
    if (!stuurFilm) return;
    setGekozen(prospect);
    setBezig(true);
    try {
      const res = await fetch("/api/prospect-film/share-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: prospect.id,
          filmSlug: stuurFilm.slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Aanmaken mislukt");
        setGekozen(null);
        return;
      }
      setShareUrl(data.url);
      if (data.hergebruikt) {
        toast.success("Bestaande link hergebruikt");
      } else {
        toast.success("Link klaar");
      }
    } catch {
      toast.error("Verbindingsfout");
      setGekozen(null);
    } finally {
      setBezig(false);
    }
  }

  if (films.length === 0) {
    return (
      <div className="card space-y-2">
        <p className="text-cm-white font-medium">
          Er staan nog geen films klaar
        </p>
        <p className="text-cm-white opacity-70 text-sm leading-relaxed">
          Zodra de hoofdbeheerder films toevoegt verschijnen ze hier vanzelf.
          Je kunt ondertussen wel al een freebie of een masterclass delen.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/instellingen/mijn-tracking-links"
            className="btn-secondary text-sm"
          >
            🎁 Naar mijn freebies
          </Link>
          <Link href="/instellingen/webinar" className="btn-secondary text-sm">
            🎥 Naar de masterclasses
          </Link>
        </div>
      </div>
    );
  }

  // Zoeken werkt hier hetzelfde als op de namenlijst: typ je "co", dan
  // blijven alle Corry's en Cor's over. Nooit een hele naam typen.
  const gevonden = filterOpZoek(prospects, zoek);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {films.map((film) => (
          <div key={film.slug} className="card space-y-3 flex flex-col">
            <div className="flex-1">
              <h2 className="text-cm-white font-semibold leading-snug">
                {film.titel}
              </h2>
              {film.beschrijving && (
                <p className="text-cm-white opacity-60 text-sm mt-1.5 leading-relaxed">
                  {film.beschrijving}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBekijkFilm(film)}
                className="btn-secondary text-sm"
              >
                ▶ Zelf bekijken
              </button>
              <button
                type="button"
                onClick={() => setStuurFilm(film)}
                className="btn-gold text-sm"
              >
                📤 Versturen
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Zelf terugkijken: weten wat je stuurt voor je het stuurt. */}
      {bekijkFilm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setBekijkFilm(null)}
        >
          <div
            className="bg-cm-surface border-2 border-cm-gold/60 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-display font-bold text-cm-white">
                  {bekijkFilm.titel}
                </h2>
                <button
                  type="button"
                  onClick={() => setBekijkFilm(null)}
                  className="text-cm-white opacity-50 hover:opacity-100 text-2xl leading-none"
                  aria-label="Sluit"
                >
                  ×
                </button>
              </div>
              {(() => {
                const embed = normaliseerNaarEmbed(bekijkFilm.videoUrl);
                if (!embed) {
                  return (
                    <p className="text-cm-white opacity-70 text-sm">
                      Deze film kon niet worden geladen.
                    </p>
                  );
                }
                return (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={embedMetOpties(embed)}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      title={bekijkFilm.titel}
                    />
                  </div>
                );
              })()}
              <button
                type="button"
                onClick={() => {
                  const f = bekijkFilm;
                  setBekijkFilm(null);
                  setStuurFilm(f);
                }}
                className="btn-gold w-full py-2.5 text-sm font-semibold"
              >
                📤 Deze versturen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Versturen: eerst de persoon kiezen, dan de link. */}
      {stuurFilm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={sluitStuur}
        >
          <div
            className="bg-cm-surface border-2 border-cm-gold/60 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
                    Film versturen
                  </h2>
                  <p className="text-lg font-display font-bold text-cm-white mt-0.5 leading-snug">
                    {stuurFilm.titel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={sluitStuur}
                  className="text-cm-white opacity-50 hover:opacity-100 text-2xl leading-none"
                  aria-label="Sluit"
                >
                  ×
                </button>
              </div>

              {!shareUrl ? (
                <>
                  <p className="text-cm-white opacity-80 text-sm leading-relaxed">
                    Naar wie gaat 'ie? Iedereen krijgt een eigen link, dus je
                    ziet per persoon wanneer er gekeken is.
                  </p>

                  {prospects.length === 0 ? (
                    <div className="rounded-md bg-cm-surface-2 border border-cm-border p-3 space-y-2">
                      <p className="text-cm-white text-sm">
                        Je namenlijst is nog leeg.
                      </p>
                      <Link
                        href="/namenlijst/nieuw"
                        className="btn-secondary text-sm inline-block"
                      >
                        + Eerste naam toevoegen
                      </Link>
                    </div>
                  ) : (
                    <>
                      <input
                        type="search"
                        value={zoek}
                        onChange={(e) => setZoek(e.target.value)}
                        placeholder="Zoek een naam..."
                        aria-label="Zoek een naam"
                        autoFocus
                        className="input-cm"
                      />
                      <div className="max-h-64 overflow-y-auto space-y-1">
                        {gevonden.length === 0 ? (
                          <p className="text-cm-white opacity-60 text-sm py-3 text-center">
                            Geen naam gevonden met "{zoek.trim()}"
                          </p>
                        ) : (
                          gevonden.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              disabled={bezig}
                              onClick={() => genereerLink(p)}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors disabled:opacity-50 ${
                                gekozen?.id === p.id
                                  ? "border-cm-gold bg-cm-gold/10"
                                  : "border-cm-border bg-cm-surface-2 hover:border-cm-gold-dim"
                              }`}
                            >
                              <span className="flex-1 min-w-0">
                                <span className="block text-sm text-cm-white font-medium truncate">
                                  {p.volledige_naam}
                                </span>
                                {p.actief === false && (
                                  <span className="block text-[10px] text-cm-white opacity-50">
                                    niet actief
                                  </span>
                                )}
                              </span>
                              <span className="text-cm-gold text-sm flex-shrink-0">
                                {bezig && gekozen?.id === p.id ? "..." : "→"}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-md bg-emerald-900/20 border border-emerald-500/40 p-3 text-xs text-emerald-200 leading-relaxed">
                    <p className="font-semibold mb-1">
                      ✓ Link klaar voor {gekozen?.volledige_naam}
                    </p>
                    <p className="opacity-90">
                      Zodra {gekozen?.volledige_naam} de film afkijkt zie je dat
                      hier in ELEVA en krijg je een herinnering om op te volgen.
                    </p>
                  </div>
                  <DeelKnoppen
                    url={shareUrl}
                    tekst={`Hé ${gekozen?.volledige_naam ?? ""}! Ik heb iets voor je dat ik denk dat je interessant gaat vinden, gewoon even kijken. Hieronder de link.`}
                    onderwerp={`Een korte film van ${memberVoornaam || "ELEVA"}`}
                    variant="donker"
                    prospectId={gekozen?.id}
                    prospectNaam={gekozen?.volledige_naam}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShareUrl(null);
                      setGekozen(null);
                      setZoek("");
                    }}
                    className="btn-secondary w-full text-sm"
                  >
                    Naar nog iemand sturen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
