"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ============================================================
// SocialPlatformKnoppen, vier knoppen die direct doorlinken naar de
// vier bronnen waar de member nieuwe namen kan halen:
//
//   1. Eleva-geheugen (interne namenlijst) — STAAT VOORAAN, want
//      mensen die hier al in zitten zijn de eerste plek om te kijken
//      voordat je naar een externe socials gaat scrollen.
//   2. Facebook (eigen profiel)
//   3. Instagram (eigen profiel)
//   4. LinkedIn (eigen profiel)
//
// De social-URLs worden opgehaald uit profiles.facebook_url /
// instagram_url / linkedin_url. Leeg = prompt om het in te stellen
// op /instellingen. Eleva-geheugen is altijd actief — geen URL nodig.
//
// Gebruikt in vandaag-flow op taken waar de member nieuwe namen
// moet vinden (bv. dag 3 + dag 4 'voeg N nieuwe namen toe').
// ============================================================

type SocialUrls = {
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
};

export function SocialPlatformKnoppen() {
  const [urls, setUrls] = useState<SocialUrls | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    let actief = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("facebook_url, instagram_url, linkedin_url")
          .eq("id", user.id)
          .maybeSingle();
        if (!actief) return;
        setUrls(
          (profile as SocialUrls | null) ?? {
            facebook_url: null,
            instagram_url: null,
            linkedin_url: null,
          },
        );
      } catch {
        // negeer
      } finally {
        if (actief) setLaden(false);
      }
    })();
    return () => {
      actief = false;
    };
  }, []);

  const heeftFb = !!urls?.facebook_url;
  const heeftIg = !!urls?.instagram_url;
  const heeftLi = !!urls?.linkedin_url;
  const heeftIetsIngevuld = heeftFb || heeftIg || heeftLi;

  return (
    <div className="rounded-lg border border-cm-gold/30 bg-cm-gold/5 px-4 py-3 space-y-3">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          📚 Vier plekken om namen te vinden
        </p>
        <Link
          href="/instellingen#socials"
          className="text-cm-white/60 hover:text-cm-white text-[11px] underline-offset-2 hover:underline"
        >
          {heeftIetsIngevuld ? "Wijzig socials" : "+ Voeg je profielen toe"}
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* 1. Eleva-geheugen, altijd zichtbaar en als EERSTE links. Mensen
            die hier al in zitten zijn de natuurlijke eerste plek voordat
            je naar externe socials gaat scrollen. */}
        <Link
          href="/namenlijst"
          className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
        >
          <span className="text-lg">📚</span>
          <span className="font-semibold">Eleva-geheugen</span>
          <span className="opacity-60 text-[11px]">Uit je lijst</span>
        </Link>
        {heeftFb ? (
          <a
            href={urls!.facebook_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
          >
            <span className="text-lg">📘</span>
            <span className="font-semibold">Facebook</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-border bg-cm-surface-2/40 text-cm-white/40 text-xs text-center cursor-not-allowed"
          >
            <span className="text-lg opacity-40">📘</span>
            <span className="font-semibold">Facebook</span>
            <span className="text-[10px] opacity-70">Nog niet ingesteld</span>
          </button>
        )}
        {heeftIg ? (
          <a
            href={urls!.instagram_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
          >
            <span className="text-lg">📸</span>
            <span className="font-semibold">Instagram</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-border bg-cm-surface-2/40 text-cm-white/40 text-xs text-center cursor-not-allowed"
          >
            <span className="text-lg opacity-40">📸</span>
            <span className="font-semibold">Instagram</span>
            <span className="text-[10px] opacity-70">Nog niet ingesteld</span>
          </button>
        )}
        {heeftLi ? (
          <a
            href={urls!.linkedin_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-gold/30 bg-cm-surface-2 hover:bg-cm-surface text-cm-white text-xs text-center transition-colors"
          >
            <span className="text-lg">💼</span>
            <span className="font-semibold">LinkedIn</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border border-cm-border bg-cm-surface-2/40 text-cm-white/40 text-xs text-center cursor-not-allowed"
          >
            <span className="text-lg opacity-40">💼</span>
            <span className="font-semibold">LinkedIn</span>
            <span className="text-[10px] opacity-70">Nog niet ingesteld</span>
          </button>
        )}
      </div>
      {!laden && !heeftIetsIngevuld && (
        <p className="text-cm-white/60 text-[11px] leading-relaxed">
          Voeg je eigen Facebook, Instagram of LinkedIn-link toe via{" "}
          <Link href="/instellingen#socials" className="underline">
            Instellingen
          </Link>{" "}
          om hier direct door te klikken.
        </p>
      )}
    </div>
  );
}
