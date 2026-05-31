// File: app/wat-nu/[slug]/page.tsx
//
// Volledige uitleg-pagina per "wat nu?"-situatie. Het menu (WatNuKnop)
// is de wegwijzer, deze pagina is de plek met de hele uitleg, en pas
// onderaan de knop naar de tool. Raoul (2026-05-29): elke situatie
// verdient een hele pagina, geen paar zinnen.
//
// ALL-CAPS-blokken in de uitleg worden als koppen gerenderd. Media per
// situatie kan de founder toevoegen (namespace "wat-nu", paginaId = slug).

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { vindSituatie } from "@/lib/playbook/wat-nu-situaties";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { MediaBlokken } from "@/components/cms/MediaBlokken";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

// Een blok is een kop als de hele tekst in hoofdletters staat (en letters
// bevat). Numbered lists, quotes en gewone zinnen hebben lowercase, dus
// die vallen er vanzelf buiten.
function isKop(blok: string): boolean {
  const t = blok.trim();
  if (t.length < 3 || t.length > 70) return false;
  if (!/[A-ZÀ-Ý]/.test(t)) return false;
  return t === t.toUpperCase();
}

export default async function WatNuPagina({ params }: { params: Params }) {
  const { slug } = await params;
  const situatie = vindSituatie(slug);
  if (!situatie) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Beschikbaar voor elke ingelogde member, Sprint én Core. De wat-nu-laag
  // is modus-agnostisch (zie spec). Alleen "terug naar je stap" is
  // modus-afhankelijk.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, modus")
    .eq("id", user.id)
    .maybeSingle();
  const isFounder = (profile as { role?: string } | null)?.role === "founder";
  const modus = (profile as { modus?: string } | null)?.modus ?? "sprint";
  // Zowel core als sprint draaien nu op /vandaag (V9 is sinds 2026-05-31
  // de live member-Core via /vandaag).
  const stapRoute = "/vandaag";
  const vanParam = "vandaag";

  const mediaBlokkenMap = await haalPaginaBlokken(supabase, "wat-nu", slug);
  const blokkenPerPositie: Record<string, Blok[]> = {};
  mediaBlokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });
  const blokken = (positie: string): Blok[] =>
    blokkenPerPositie[positie] ?? [];

  const blokjes = situatie.uitleg.split(/\n\n+/);

  // De actie-knop. Routes naar de oude /core-v9-prefix mappen op /vandaag
  // (V9 draait sinds 2026-05-31 op /vandaag). Andere routes krijgen een
  // ?van=-spoor zodat je op de bestemming een terug-balk ziet.
  const actieHref =
    situatie.actieRoute.startsWith("/core-v9") ||
    situatie.actieRoute === "/vandaag"
      ? stapRoute
      : situatie.actieRoute +
        (situatie.actieRoute.includes("?") ? "&" : "?") +
        "van=" +
        vanParam;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 text-cm-white">
      <div className="mb-4">
        <Link
          href={stapRoute}
          className="text-cm-muted text-sm hover:text-cm-white"
        >
          ← Terug naar je stap
        </Link>
      </div>

      <header className="mb-5">
        <div className="text-3xl mb-2">{situatie.emoji}</div>
        <h1 className="font-serif-warm text-cm-gold text-2xl">
          {situatie.label}
        </h1>
      </header>

      {/* Media bovenaan (founder kan video/uitleg toevoegen) */}
      <MediaBlokken
        paginaNamespace="wat-nu"
        paginaId={slug}
        positie="boven"
        blokken={blokken("boven")}
        isFounder={isFounder}
      />

      {/* De volledige uitleg */}
      <div className="space-y-3">
        {blokjes.map((blok, i) =>
          isKop(blok) ? (
            <h2
              key={i}
              className="text-cm-gold text-sm font-semibold uppercase tracking-wider pt-3"
            >
              {blok.trim()}
            </h2>
          ) : (
            <p
              key={i}
              className="text-cm-white/90 text-sm leading-relaxed whitespace-pre-line"
            >
              {blok.trim()}
            </p>
          ),
        )}
      </div>

      {/* Media onderaan */}
      <div className="mt-4">
        <MediaBlokken
          paginaNamespace="wat-nu"
          paginaId={slug}
          positie="onder"
          blokken={blokken("onder")}
          isFounder={isFounder}
        />
      </div>

      {/* En pas hier de knop naar de tool. Met ?van=core-v9 zodat je op
          de bestemming een "terug naar je stap"-balk krijgt. */}
      <div className="mt-8 rounded-xl border border-cm-gold/40 bg-cm-gold/5 p-5">
        <p className="text-cm-white/70 text-xs mb-3">
          Klaar om het te doen? Hier ga je verder:
        </p>
        <Link
          href={actieHref}
          className="inline-flex items-center gap-2 rounded-full bg-cm-gold text-cm-bg px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {situatie.actieLabel}
          <span>→</span>
        </Link>
      </div>

      <div className="mt-6 text-center">
        <Link
          href={stapRoute}
          className="text-cm-muted text-xs hover:text-cm-white"
        >
          ↩ Terug naar je stap
        </Link>
      </div>
    </main>
  );
}
