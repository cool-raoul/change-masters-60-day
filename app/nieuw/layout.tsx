// Nieuwe layout, FOUNDER/TESTER-PREVIEW (/nieuw).
//
// Voorstel 1 "Rustig thuis" uit layout-voorstellen.html, werkend gemaakt
// bovenop de echte data. Alleen zichtbaar voor founders en testers; het
// bestaande systeem (AppShell/Sidebar/dashboard) blijft volledig
// ongewijzigd. Bevalt de richting, dan verhuist deze schil naar de echte
// AppShell in een aparte bouwronde.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NieuwRail, NieuwBottomNav } from "./nav";

export const dynamic = "force-dynamic";

export default async function NieuwLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role, is_tester, sponsor_id")
    .eq("id", user.id)
    .maybeSingle();
  const p = profiel as {
    role?: string | null;
    is_tester?: boolean | null;
    sponsor_id?: string | null;
  } | null;
  const magKijken = p?.role === "founder" || p?.is_tester === true;
  if (!magKijken) redirect("/dashboard");

  let sponsorNaam: string | null = null;
  if (p?.sponsor_id) {
    const { data: sponsor } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", p.sponsor_id)
      .maybeSingle();
    sponsorNaam =
      (sponsor as { full_name?: string | null } | null)?.full_name?.split(
        " ",
      )[0] ?? null;
  }

  return (
    <div className="flex min-h-dvh bg-cm-black">
      <NieuwRail sponsorNaam={sponsorNaam} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-cm-gold/10 border-b border-cm-gold/30 px-4 py-1.5 text-center text-[11px] font-semibold tracking-wider uppercase text-cm-gold">
          ✨ Nieuwe layout · preview, alleen zichtbaar voor jou
        </div>
        <main className="flex-1 px-4 sm:px-8 py-6 pb-24 lg:pb-8 max-w-3xl w-full mx-auto">
          {children}
        </main>
      </div>
      <NieuwBottomNav />
    </div>
  );
}
