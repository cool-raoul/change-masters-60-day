// File: app/resetcode-links/page.tsx
//
// Member-kant van de Resetcode-klantomgeving: klant-links
// aanmaken, delen via WhatsApp en beheren. Hier komen ook de
// push-seintjes uit (klant geopend, klant naar volgende stap,
// contactmomenten). Pilot-fase: founders en testers.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LinksBeheer from "@/components/resetcode/LinksBeheer";

export const dynamic = "force-dynamic";

export default async function ResetcodeLinksPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_tester, telefoon")
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as {
    role?: string | null;
    is_tester?: boolean | null;
    telefoon?: string | null;
  } | null;
  if (!(p?.role === "founder" || p?.is_tester === true)) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-cm-white">
      <header className="mb-6">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-cm-muted hover:text-cm-white mb-3"
        >
          ← Terug naar dashboard
        </a>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          De Resetcode
        </p>
        <h1 className="font-serif-warm text-3xl text-cm-white mt-2">
          Mijn klanten
        </h1>
        <p className="mt-3 text-cm-muted text-sm leading-relaxed">
          Elke klant krijgt een eigen persoonlijke link met de Mentor-wereld:
          het gekozen programma, meereizend geheugen en een appje-knop naar
          jou. Jij krijgt een pushbericht als je klant start, een stap verder
          gaat of bij een contactmoment komt.
        </p>
        {!p?.telefoon && (
          <p className="mt-3 rounded-lg border border-amber-400/50 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
            Tip: vul je telefoonnummer in bij Instellingen, dan opent de
            appje-knop bij jouw klanten direct WhatsApp naar jou.
          </p>
        )}
      </header>
      <LinksBeheer />
    </main>
  );
}
