import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { createClient } from "@/lib/supabase/server";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { MiniElevaBusinessContent } from "./content";
import Link from "next/link";

// ============================================================
// /m/[token]/business, alleen zichtbaar voor business-spoor-prospects.
// Verdienmodel, rang-ladder, Builder-mijlpaal, plus MediaBlokken.
// ============================================================

export const dynamic = "force-dynamic";

export default async function BusinessPagina({
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

  // Zodra het soort-veld op de invitation bestaat: blokkeer product-spoor.
  // Voor nu draait alles op default 'business', dus iedereen mag erin tot
  // we de filter aanzetten.

  await logActiviteit(ctx.invitationId, "business", "business-pagina geopend");

  const supabase = await createClient();
  const blokkenMap = await haalPaginaBlokken(supabase, "mini-eleva-business", "overzicht");
  const blokkenPerPositie: Record<string, Blok[]> = {};
  blokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });

  return (
    <MiniElevaBusinessContent
      isFounder={false}
      prospectVoornaam={ctx.prospectNaam.split(" ")[0]}
      memberNaam={ctx.memberNaam}
      sponsorNaam={ctx.sponsorNaam}
      terugHref={`/m/${ctx.token}`}
      blokkenPerPositie={blokkenPerPositie}
    />
  );
}
