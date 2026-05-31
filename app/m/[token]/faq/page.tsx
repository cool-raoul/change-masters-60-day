import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { createClient } from "@/lib/supabase/server";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { MiniElevaFaqContent } from "./content";
import Link from "next/link";

// ============================================================
// /m/[token]/faq, aparte FAQ-pagina voor prospects (product + business
// secties). Eigen module op de landing, niet weggestopt onder een
// andere knop. Founder beheert content via /instellingen/mini-eleva-
// preview/faq.
// ============================================================

export const dynamic = "force-dynamic";

export default async function FaqPagina({
  params,
}: {
  params: { token: string };
}) {
  const ctx = await pakMiniElevaContext(params.token);
  if (!ctx || ctx.isVerlopen) {
    return (
      <div className="space-y-4 pt-12 text-center">
        <p className="text-cm-white/70">Deze link werkt niet meer.</p>
        <Link href={`/m/${params.token}`} className="text-cm-gold underline">
          Terug naar start
        </Link>
      </div>
    );
  }

  await logActiviteit(ctx.invitationId, "faq", "faq-pagina geopend");

  const supabase = await createClient();
  const blokkenMap = await haalPaginaBlokken(supabase, "mini-eleva-faq", "overzicht");
  const blokkenPerPositie: Record<string, Blok[]> = {};
  blokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });

  return (
    <MiniElevaFaqContent
      isFounder={false}
      memberNaam={ctx.memberNaam}
      sponsorNaam={ctx.sponsorNaam}
      terugHref={`/m/${ctx.token}`}
      blokkenPerPositie={blokkenPerPositie}
      spoor={ctx.soort}
    />
  );
}
