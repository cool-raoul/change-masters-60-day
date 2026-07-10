// File: app/resetcode-preview/page.tsx
//
// De Resetcode-klantomgeving als MENTOR-WERELD (richting D,
// gekozen door Raoul 10 juli): de hele omgeving is één gesprek
// met de Mentor. Programma-keuze, fases, lijsten, video's en
// contactmomenten verschijnen als kaartjes in de chat; praten
// via de grote microfoon staat centraal.
// Founder-preview: toegang alleen founders en testers.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MentorWereld from "@/components/resetcode/MentorWereld";

export const dynamic = "force-dynamic";

export default async function ResetcodePreviewPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_tester, full_name")
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as {
    role?: string | null;
    is_tester?: boolean | null;
    full_name?: string | null;
  } | null;
  if (!(p?.role === "founder" || p?.is_tester === true)) redirect("/dashboard");

  const begeleider = (p?.full_name ?? "").split(" ")[0] || "je begeleider";

  return (
    <div className="relative mx-auto" style={{ maxWidth: 560 }}>
      {/* Smalle preview-strip, alleen zichtbaar voor founders/testers */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-amber-400/95 px-3 py-1 shadow">
        <span className="text-[10px] font-bold text-amber-950">🔭 preview</span>
        <Link
          href="/resetcode-preview/brainstorm"
          className="text-[10px] font-semibold text-amber-900 underline"
        >
          andere richtingen
        </Link>
      </div>
      <MentorWereld begeleiderNaam={begeleider} />
    </div>
  );
}
