import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { WelcomePopup } from "@/components/layout/WelcomePopup";
import { TaalProvider } from "@/lib/i18n/TaalContext";
import { Taal } from "@/lib/i18n/vertalingen";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_klaar")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_klaar) redirect("/mijn-why");

  // Lees taal uit user metadata — direct beschikbaar voor alle client componenten
  const taal = (user.user_metadata?.taal as Taal) || "nl";

  return (
    <TaalProvider initialTaal={taal}>
      <div className="flex h-dvh bg-cm-black overflow-hidden">
        <WelcomePopup />
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <Topbar gebruikersnaam={profile?.full_name || user.email || "Teamlid"} />
          <main className="flex-1 overflow-y-auto overscroll-y-contain p-6 mobile-scroll">{children}</main>
        </div>
      </div>
    </TaalProvider>
  );
}
