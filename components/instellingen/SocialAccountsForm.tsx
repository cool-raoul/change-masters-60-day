"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ============================================================
// SocialAccountsForm, instellingen-blok waar de member zijn eigen
// Facebook / Instagram / LinkedIn-profiel-URL kan invullen.
//
// De URLs worden opgeslagen op profiles.facebook_url / instagram_url /
// linkedin_url (zie migrations/sociale_accounts.sql).
//
// In /vandaag taken die naar socials verwijzen (bv. dag 3 stap 4 'losse
// chats op socials') tonen we via SocialPlatformKnoppen direct
// doorklik-knoppen naar deze URLs.
// ============================================================

type Props = {
  initieel: {
    facebook_url: string | null;
    instagram_url: string | null;
    linkedin_url: string | null;
  };
};

export function SocialAccountsForm({ initieel }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [facebook, setFacebook] = useState(initieel.facebook_url ?? "");
  const [instagram, setInstagram] = useState(initieel.instagram_url ?? "");
  const [linkedin, setLinkedin] = useState(initieel.linkedin_url ?? "");
  const [bezig, setBezig] = useState(false);

  function trim(v: string): string | null {
    const t = v.trim();
    return t.length > 0 ? t : null;
  }

  async function bewaar() {
    setBezig(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Niet ingelogd");
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          facebook_url: trim(facebook),
          instagram_url: trim(instagram),
          linkedin_url: trim(linkedin),
        })
        .eq("id", user.id);
      if (error) {
        // Kolommen bestaan mogelijk nog niet (migratie nog te draaien)
        if (
          error.message?.includes("does not exist") ||
          error.message?.includes("schema cache") ||
          error.code === "PGRST204"
        ) {
          toast.error(
            "Social-kolommen bestaan nog niet in Supabase. Vraag founder om migratie sociale_accounts.sql te draaien.",
          );
          return;
        }
        toast.error(error.message);
        return;
      }
      toast.success("Social-profielen opgeslagen");
      router.refresh();
    } catch {
      toast.error("Verbindingsfout");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div id="socials" className="card space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider flex items-center gap-2">
          📱 Mijn social-profielen
        </h2>
        <p className="text-cm-white opacity-70 text-sm mt-1">
          Vul de volledige URL in van je Facebook / Instagram / LinkedIn-profiel.
          ELEVA gebruikt deze om in /vandaag direct door te klikken naar het
          juiste platform op taken die naar socials verwijzen (bv. losse chats
          starten of een post plaatsen).
        </p>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-cm-white text-xs font-medium">📘 Facebook URL</span>
          <input
            type="url"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://www.facebook.com/jouw.naam"
            className="input-cm w-full mt-1 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-cm-white text-xs font-medium">📸 Instagram URL</span>
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://www.instagram.com/jouw_handle"
            className="input-cm w-full mt-1 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-cm-white text-xs font-medium">💼 LinkedIn URL</span>
          <input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://www.linkedin.com/in/jouw-naam"
            className="input-cm w-full mt-1 text-sm"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={bewaar}
        disabled={bezig}
        className="btn-gold text-sm"
      >
        {bezig ? "Opslaan..." : "Opslaan"}
      </button>

      <p className="text-cm-white/50 text-[11px] leading-relaxed">
        Tip: kopieer de URL uit de adresbalk van je browser als je op je eigen
        profiel staat. Voor Facebook werkt zowel facebook.com/jouw.naam als
        facebook.com/profile.php?id=...
      </p>
    </div>
  );
}
