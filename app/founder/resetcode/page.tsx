// File: app/founder/resetcode/page.tsx
//
// Founder-hub voor de klanten-Mentor (De Resetcode): één voordeur
// naar alle beheer-plekken, met een teller voor open team-vragen.
// Gebouwd op verzoek Raoul 21 juli ("een plek van waaruit ik alles
// kan bedienen"; de kennis-pagina was alleen via pushberichten te
// vinden).

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResetcodeFounderHub() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((profile as { role?: string | null } | null)?.role !== "founder") {
    redirect("/dashboard");
  }

  // Open team-vragen + waakhond-meldingen (RLS: founder mag lezen).
  const { count: openVragen } = await supabase
    .from("resetcode_kennis")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  const tegels: Array<{
    href: string;
    icoon: string;
    titel: string;
    tekst: string;
    badge?: number;
  }> = [
    {
      href: "/resetcode-kennis",
      icoon: "🧠",
      titel: "Mentor-kennis",
      tekst:
        "Open vragen van klanten beantwoorden (de Mentor leert direct) en zelf kennis toevoegen. Waakhond-meldingen komen hier ook binnen.",
      badge: openVragen ?? 0,
    },
    {
      href: "/resetcode-links",
      icoon: "🌿",
      titel: "Mijn klanten",
      tekst:
        "Alle klant-links: aanmaken, delen, pauzeren. Met per klant het laatste seintje.",
    },
    {
      href: "/resetcode-preview",
      icoon: "🔭",
      titel: "Klant-preview",
      tekst:
        "De klantomgeving zelf doorlopen als testklant, met tijdmachine-knoppen (dag 5-7, dag 10, week-overzicht, einde). Media vul je hier via de edit-modus (potlood).",
    },
    {
      href: "/founder/spraak-mentor",
      icoon: "🤖",
      titel: "Spraak naar Mentor (member-kant)",
      tekst: "De bestaande plek voor de member-Mentor en spraak-instellingen.",
    },
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-cm-white">
      <header className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-cm-muted hover:text-cm-white mb-3"
        >
          ← Terug naar dashboard
        </Link>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Founder-beheer
        </p>
        <h1 className="font-serif-warm text-3xl mt-2">De Resetcode</h1>
        <p className="mt-3 text-cm-muted text-sm leading-relaxed">
          Alles rond de klanten-Mentor op één plek. Teksten en gedrag van de
          Mentor zelf verbeteren gaat via de kennisbank hieronder (of spreek
          het in: &quot;voeg toe aan het Mentor-brein: ...&quot;).
        </p>
      </header>

      <div className="space-y-3">
        {tegels.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="block rounded-2xl border border-cm-border bg-cm-surface px-4 py-3.5 hover:border-cm-gold/50 transition-colors"
          >
            <p className="text-[15px] font-bold flex items-center gap-2">
              <span className="text-xl">{t.icoon}</span> {t.titel}
              {typeof t.badge === "number" && t.badge > 0 && (
                <span className="ml-auto rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[12px] font-bold text-amber-300">
                  {t.badge} open
                </span>
              )}
            </p>
            <p className="text-xs text-cm-muted leading-relaxed mt-1">
              {t.tekst}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
