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
import { EditModeProvider } from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { haalPaginaBlokken, type Blok } from "@/lib/cms/pagina-blokken";
import { RESET_PROGRAMMAS } from "@/lib/resetcode/programma";

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
  const isFounder = p?.role === "founder";

  // Gevulde media-plekken voor alle programma's, zodat de founder ze in
  // de preview kan vullen (edit-modus) en meteen ziet wat de klant ziet.
  const mediaBlokken: Record<string, Blok[]> = {};
  for (const prog of RESET_PROGRAMMAS) {
    const blokkenMap = await haalPaginaBlokken(
      supabase,
      "resetcode-klant",
      prog.slug,
    );
    blokkenMap.forEach((blokken, positie) => {
      mediaBlokken[`${prog.slug}/${positie}`] = blokken;
    });
  }

  return (
    <EditModeProvider>
      <div
        className="mx-auto flex flex-col"
        style={{ maxWidth: 560, height: "100dvh" }}
      >
        {/* Smalle preview-balk boven de app, alleen voor founders/testers */}
        <div className="flex items-center justify-center gap-3 bg-amber-400/90 px-3 py-1 flex-shrink-0">
          <span className="text-[10px] font-bold text-amber-950">
            🔭 preview
          </span>
          <Link
            href="/resetcode-preview/brainstorm"
            className="text-[10px] font-semibold text-amber-900 underline"
          >
            andere richtingen
          </Link>
        </div>
        <div className="flex-1 min-h-0">
          <MentorWereld
            begeleiderNaam={begeleider}
            mediaBlokken={mediaBlokken}
            isFounder={isFounder}
          />
        </div>
      </div>
      {isFounder && <EditModeToggle isFounder={true} />}
    </EditModeProvider>
  );
}
