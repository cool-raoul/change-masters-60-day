"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { WelkomstfilmSpeler } from "./WelkomstfilmSpeler";

// Lid stelt z'n eigen welkomstfilm in voor een freebie. Drie opties:
//   - YouTube-link / Vimeo-link (gratis bandbreedte van hun kant)
//   - uploaden vanaf computer of telefoon → Supabase Storage (max 200 MB)
// Wie niks eigen instelt, valt terug op de algemene welkomstfilm.

const MAX_BYTES = 250 * 1024 * 1024; // 250 MB
const BUCKET = "welkomstfilms";

type Soort = "youtube" | "vimeo" | "upload";

export function WelkomstfilmKiezer({
  botSlug,
  huidigeSoort,
  huidigeUrl,
  veld = "welkomst",
  naam = "welkomstfilm",
  metFallback = true,
}: {
  botSlug: string;
  huidigeSoort?: string | null;
  huidigeUrl?: string | null;
  /** 'welkomst' = per lid; 'info' = founder-only, algemene info-film. */
  veld?: "welkomst" | "info";
  naam?: string;
  /** true: leeg = algemene film; false (info): leeg = geen film. */
  metFallback?: boolean;
}) {
  const [soort, setSoort] = useState<string | null>(huidigeSoort ?? null);
  const [url, setUrl] = useState<string | null>(huidigeUrl ?? null);
  const [tab, setTab] = useState<Soort>(
    (huidigeSoort as Soort) || "youtube",
  );
  const [linkInput, setLinkInput] = useState(
    huidigeSoort === "youtube" || huidigeSoort === "vimeo" ? huidigeUrl ?? "" : "",
  );
  const [bezig, setBezig] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);

  async function opslaan(nieuwSoort: string | null, nieuwUrl: string | null) {
    const res = await fetch("/api/freebie/welkomstfilm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botSlug, veld, soort: nieuwSoort, url: nieuwUrl }),
    });
    if (!res.ok) {
      toast.error("Opslaan mislukt. Probeer het opnieuw.");
      return false;
    }
    setSoort(nieuwSoort);
    setUrl(nieuwUrl);
    return true;
  }

  async function bewaarLink() {
    const v = linkInput.trim();
    if (!v) return toast.error("Plak eerst een link.");
    setBezig(true);
    const ok = await opslaan(tab, v);
    setBezig(false);
    if (ok) toast.success("Je welkomstfilm staat klaar.");
  }

  async function uploadBestand(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error(
        "Deze video is te groot (max 250 MB). Neem 'm korter of in 1080p op, of zet 'm op YouTube/Vimeo en plak de link.",
      );
      return;
    }
    setBezig(true);
    setUploadPct(0);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Je bent niet ingelogd.");
        return;
      }
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const prefix = veld === "info" ? "informatiefilm" : "welkomstfilm";
      const pad = `${user.id}/${prefix}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(pad, file, { upsert: true, contentType: file.type });
      if (upErr) {
        toast.error("Uploaden mislukt: " + upErr.message);
        return;
      }
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(pad);
      const ok = await opslaan("upload", pub.publicUrl);
      if (ok) toast.success("Je film is geüpload en staat klaar.");
    } catch {
      toast.error("Er ging iets mis bij het uploaden.");
    } finally {
      setBezig(false);
      setUploadPct(null);
    }
  }

  async function verwijderEigen() {
    setBezig(true);
    const ok = await opslaan(null, null);
    setBezig(false);
    if (ok) {
      setLinkInput("");
      toast.success(
        metFallback
          ? "Je eigen film is weg. De algemene staat weer aan."
          : "De film is weggehaald.",
      );
    }
  }

  const TABS: { id: Soort; label: string }[] = [
    { id: "youtube", label: "YouTube-link" },
    { id: "vimeo", label: "Vimeo-link" },
    { id: "upload", label: "Uploaden van je apparaat" },
  ];

  return (
    <div className="space-y-4">
      {/* Huidige film */}
      <div>
        <p className="text-xs text-cm-white/60 mb-1.5">
          {soort
            ? metFallback
              ? `Dit is jouw eigen ${naam}:`
              : `Dit is de huidige ${naam}:`
            : metFallback
              ? `Nu staat de algemene ${naam} aan. Stel hieronder je eigen in.`
              : `Er staat nog geen ${naam}. Stel 'm hieronder in.`}
        </p>
        <WelkomstfilmSpeler soort={soort} url={url} />
        {soort && (
          <button
            onClick={verwijderEigen}
            disabled={bezig}
            className="mt-2 text-xs text-cm-white/60 hover:text-rose-300 underline"
          >
            {metFallback ? "Eigen film weghalen (terug naar de algemene)" : "Film weghalen"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-xs font-semibold rounded-lg px-3 py-2 border transition-colors ${
              tab === t.id
                ? "border-cm-gold bg-cm-gold/15 text-cm-gold"
                : "border-cm-border text-cm-white/70 hover:border-cm-gold-dim"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <div className="space-y-2">
          <label className="block">
            <span className="sr-only">Kies een video</span>
            <input
              type="file"
              accept="video/*"
              disabled={bezig}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadBestand(f);
              }}
              className="block w-full text-sm text-cm-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-cm-gold/20 file:px-4 file:py-2 file:text-cm-gold file:font-semibold hover:file:bg-cm-gold/30"
            />
          </label>
          {bezig && uploadPct !== null && (
            <p className="text-xs font-semibold text-cm-gold">
              ⏳ Bezig met uploaden, dit kan bij een grotere video even duren.
              Houd dit tabblad open, je film verschijnt zodra het klaar is.
            </p>
          )}
          <p className="text-[11px] text-cm-white/50 leading-relaxed">
            Tip: neem op in 1080p (niet 4K) en houd 'm kort, een paar minuten is
            perfect. Op je telefoon kun je ook meteen een nieuwe opnemen. Max 250 MB.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder={
              tab === "youtube"
                ? "https://youtube.com/watch?v=..."
                : "https://vimeo.com/..."
            }
            className="input-cm"
          />
          <button
            onClick={bewaarLink}
            disabled={bezig}
            className="btn-gold text-sm disabled:opacity-50"
          >
            {bezig ? "Bezig..." : "Deze film gebruiken"}
          </button>
        </div>
      )}
    </div>
  );
}
