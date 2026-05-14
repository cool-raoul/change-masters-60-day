"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AvatarFoto } from "@/components/ui/AvatarFoto";

// ============================================================
// ProfielFotoUpload, kaart op /instellingen voor avatar-upload.
//
// Path-conventie: profile-photos/{user_id}/avatar.{ext}
// Bestaande foto wordt overschreven (upsert: true), zodat een user
// maar één avatar heeft. Public URL wordt opgeslagen in
// profiles.foto_url voor snelle lookup zonder extra signed-url-call.
//
// Max 5MB, alleen JPEG/PNG/WEBP (RLS dwingt dit ook af op storage).
// ============================================================

type Props = {
  userId: string;
  naam: string | null;
  initieleFotoUrl: string | null;
};

const TOEGESTANE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

function extensieVoor(mimeType: string): string {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export function ProfielFotoUpload({ userId, naam, initieleFotoUrl }: Props) {
  const [fotoUrl, setFotoUrl] = useState<string | null>(initieleFotoUrl);
  const [bezig, setBezig] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  async function uploaden(bestand: File) {
    if (!TOEGESTANE_TYPES.includes(bestand.type)) {
      toast.error("Alleen JPG, PNG of WEBP toegestaan");
      return;
    }
    if (bestand.size > MAX_BYTES) {
      toast.error("Foto mag maximaal 5MB zijn");
      return;
    }

    setBezig(true);
    try {
      const ext = extensieVoor(bestand.type);
      const pad = `${userId}/avatar.${ext}`;

      // Verwijder eerst eventueel oude varianten met andere extensie.
      for (const oudExt of ["jpg", "png", "webp"]) {
        if (oudExt !== ext) {
          await supabase.storage
            .from("profile-photos")
            .remove([`${userId}/avatar.${oudExt}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(pad, bestand, { upsert: true, cacheControl: "0" });

      if (uploadError) {
        toast.error("Uploaden mislukt: " + uploadError.message);
        return;
      }

      const { data: publicData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(pad);

      // Cache-buster om browser-cache te omzeilen na overschrijven
      const verseUrl = `${publicData.publicUrl}?t=${Date.now()}`;

      const { error: profielError } = await supabase
        .from("profiles")
        .update({ foto_url: verseUrl })
        .eq("id", userId);

      if (profielError) {
        toast.error("Opslaan in profiel mislukt");
        return;
      }

      setFotoUrl(verseUrl);
      toast.success("Foto bijgewerkt!");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Onverwachte fout bij uploaden");
    } finally {
      setBezig(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function verwijderen() {
    if (!confirm("Foto verwijderen? Je avatar valt terug op je initialen.")) return;
    setBezig(true);
    try {
      // Verwijder alle drie mogelijke extensies (we weten niet welke er staat)
      await supabase.storage
        .from("profile-photos")
        .remove([
          `${userId}/avatar.jpg`,
          `${userId}/avatar.png`,
          `${userId}/avatar.webp`,
        ]);

      await supabase.from("profiles").update({ foto_url: null }).eq("id", userId);
      setFotoUrl(null);
      toast.success("Foto verwijderd");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Verwijderen mislukt");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
        🖼️ Profielfoto
      </h2>
      <div className="flex items-center gap-4">
        <AvatarFoto naam={naam} fotoUrl={fotoUrl} maat="lg" />
        <div className="space-y-1.5">
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={bezig}
              className="btn-gold py-1.5 px-3 text-sm"
            >
              {bezig ? "Bezig..." : fotoUrl ? "Andere foto kiezen" : "Foto uploaden"}
            </button>
            {fotoUrl && (
              <button
                type="button"
                onClick={verwijderen}
                disabled={bezig}
                className="btn-secondary py-1.5 px-3 text-sm"
              >
                Verwijderen
              </button>
            )}
          </div>
          <p className="text-cm-white/60 text-xs">
            JPG, PNG of WEBP. Maximaal 5MB. Verschijnt overal in ELEVA waar
            je naam staat.
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploaden(file);
        }}
      />
    </div>
  );
}
