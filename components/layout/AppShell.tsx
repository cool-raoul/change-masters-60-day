import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { berekenHuidigeDag } from "@/lib/playbook/bereken-dag";
import { WelcomePopup } from "@/components/layout/WelcomePopup";
import { TaalProvider } from "@/lib/i18n/TaalContext";
import { Taal } from "@/lib/i18n/vertalingen";
import { VoiceFab } from "@/components/voice/VoiceFab";
import { Rondleiding } from "@/components/rondleiding/Rondleiding";
import { type Rol } from "@/lib/features/registry";
import { TerugNaarPlaybookBanner } from "@/components/playbook/TerugNaarPlaybookBanner";
import { WelkomstFilm } from "@/components/welkom/WelkomstFilm";
import { PresenceHeartbeat } from "@/components/presence/PresenceHeartbeat";
import { PullToRefresh } from "@/components/layout/PullToRefresh";
import { haalSponsorNaam } from "@/lib/sponsors/haal-sponsor-naam";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_klaar, role, run_startdatum, is_tester, sponsor_id")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_klaar) redirect("/mijn-why");

  // Lees taal uit user metadata, direct beschikbaar voor alle client componenten
  const taal = (user.user_metadata?.taal as Taal) || "nl";

  // Bereken huidige dag op zelfde manier als dashboard, zodat de Topbar-cirkel
  // altijd hetzelfde getal toont als de header op het dashboard. Members
  // krijgen voortgang-modus, founders/testers krijgen kalender.
  const profielData = profile as {
    role?: string | null;
    run_startdatum?: string | null;
    is_tester?: boolean | null;
  };
  const isFounderOfTester =
    profielData.role === "founder" || profielData.is_tester === true;
  // Rol voor de features-registry. Members en lege/onbekende rollen krijgen
  // 'member' (standaard, restrictiefste view). Zo ziet niemand per ongeluk
  // founder-features waar 'ie geen rechten op heeft.
  const rolVoorFeatures: Rol =
    profielData.role === "founder"
      ? "founder"
      : profielData.role === "leider"
        ? "leider"
        : "member";
  const { data: voltooiingen } = await supabase
    .from("dag_voltooiingen")
    .select("dag_nummer, taak_id")
    .eq("user_id", user.id);
  const huidigeDag = berekenHuidigeDag(
    (voltooiingen ?? []) as { dag_nummer: number; taak_id: string }[],
    profielData.run_startdatum ?? null,
    { isTester: isFounderOfTester },
  );

  // Sponsor-naam voor de mens-eerst-strip onderin de sidebar.
  // Drie-traps fallback (zelfde patroon als prospect-detail/dashboards).
  const sponsorNaamSidebar = await haalSponsorNaam(
    supabase,
    (profile as { sponsor_id?: string | null } | null)?.sponsor_id ?? null,
    profielData.role ?? null,
  );

  return (
    <TaalProvider initialTaal={taal}>
      <div className="flex h-dvh bg-cm-black overflow-hidden">
        <WelcomePopup />
        <Sidebar
          isLeider={(profile as any)?.role === "leider"}
          sponsorNaam={sponsorNaamSidebar}
        />
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <Topbar
            gebruikersnaam={profile?.full_name || user.email || "Teamlid"}
            huidigeDag={huidigeDag}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain p-6 pb-28 lg:pb-6 mobile-scroll">
            {/* Toont alleen iets bij ?van=playbook&dag=N, anders renders null. */}
            <Suspense fallback={null}>
              <TerugNaarPlaybookBanner />
            </Suspense>
            {children}
          </main>
        </div>
        {/* Mobile bottom-nav (lg:hidden), naast de continu-zichtbare
            desktop-Sidebar. Op mobile zijn ze allebei beschikbaar:
            BottomNav voor de top-4-acties + 'Meer' opent de sidebar-drawer. */}
        <BottomNav />
        <VoiceFab />
        <Rondleiding rol={rolVoorFeatures} />
        {/* Welkomstfilm: auto-pop-up bij eerste bezoek (localStorage-flag),
            altijd handmatig terug op te roepen via Topbar 🎬-knop. */}
        <WelkomstFilm />
        {/* Presence-heartbeat: elke 60s ping naar /api/presence/ping als
            member z'n zichtbaarheid heeft aangezet (default uit). */}
        <PresenceHeartbeat />
        {/* Pull-to-refresh: trek op mobiel het scherm naar beneden
            vanuit bovenaan om de pagina te verversen. */}
        <PullToRefresh />
      </div>
    </TaalProvider>
  );
}
