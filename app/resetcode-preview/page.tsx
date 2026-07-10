// File: app/resetcode-preview/page.tsx
//
// Founder-preview van de Resetcode-klantomgeving (ontwerp
// 2026-07-10, spec docs/superpowers/specs/2026-07-10-resetcode-
// klantomgeving-design.md). Toont de klant-reis als stations;
// elke fase klikt door naar het scherm zoals de klant het
// straks op de token-link ziet, inclusief werkende Mentor.
// Puur preview: geen database-wijzigingen, niets live.
// Toegang: alleen founders en testers.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RESET_STATIONS } from "@/lib/resetcode/programma";

export const dynamic = "force-dynamic";

export default async function ResetcodePreviewOverzicht() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_tester")
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as { role?: string | null; is_tester?: boolean | null } | null;
  const magKijken = p?.role === "founder" || p?.is_tester === true;
  if (!magKijken) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-cm-white">
      <div className="mb-8 rounded-lg border border-amber-400/50 bg-amber-400/10 px-4 py-3">
        <p className="text-amber-300 text-sm font-semibold">
          🔭 Resetcode-klantomgeving preview, nog niet live
        </p>
        <p className="text-cm-muted text-xs mt-1 leading-relaxed">
          Dit is wat een klant straks ziet op een persoonlijke link, zonder
          inlog. Members die het programma zelf doen krijgen dezelfde reis in
          de app. Documenten en video&apos;s zijn nu lege plekken die jij
          later vult. Er is nog niets aan de database of aan klanten
          gekoppeld.
        </p>
      </div>

      <header className="mb-6">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Founder-preview · De Resetcode
        </p>
        <h1 className="font-serif-warm text-3xl text-cm-white mt-2">
          Jouw Resetcode-reis
        </h1>
        <p className="mt-3 text-cm-muted text-sm leading-relaxed">
          Eerst 16 dagen Darmen in Balans, daarna de Holistic Reset in vier
          fases. Altijd maar één fase tegelijk in beeld, met de documenten en
          de Mentor van dat moment erbij.
        </p>
      </header>

      <div className="space-y-2">
        {RESET_STATIONS.map((s) => (
          <Link
            key={s.slug}
            href={`/resetcode-preview/${s.slug}`}
            className="card block hover:border-cm-gold/50 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <span className="mr-2">{s.emoji}</span>
                <span className="text-cm-gold/80 text-xs font-semibold mr-2">
                  Station {s.nummer}
                </span>
                <span className="text-cm-white font-medium text-base">
                  {s.naam}
                </span>
              </div>
              <span className="text-xs text-cm-gold/70 flex-shrink-0">
                Bekijk als klant →
              </span>
            </div>
            <p className="text-cm-muted text-xs mt-1.5">
              {s.duur} · {s.kern}
            </p>
          </Link>
        ))}
      </div>

      <footer className="mt-12 border-t border-cm-border pt-6 text-center text-xs text-cm-muted">
        <p>
          Klik elke fase door en praat vooral even met de Mentor (in beide
          stemmen). Geef daarna in chat je akkoord of aanpassings-richting;
          de database-stap en het live koppelen komen daarna als aparte,
          korte akkoord-ronde.
        </p>
      </footer>
    </main>
  );
}
