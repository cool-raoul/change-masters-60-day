import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { createClient } from "@/lib/supabase/server";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import {
  haalTekstOverridesMulti,
  namespaceAlsRecord,
} from "@/lib/cms/tekst-overrides";
import { MiniElevaVerhalenContent } from "./content";
import Link from "next/link";

// ============================================================
// /m/[token]/verhalen, succesverhalen-bibliotheek voor prospects.
// Acht thema-secties, MediaBlokken per thema, prospect-view read-only.
// Founder beheert content via /instellingen/mini-eleva-preview/verhalen.
// ============================================================

export const dynamic = "force-dynamic";

export default async function VerhalenPagina({
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

  await logActiviteit(ctx.invitationId, "verhalen", "verhalen-pagina geopend");

  const supabase = await createClient();
  const blokkenMap = await haalPaginaBlokken(supabase, "mini-eleva-verhalen", "overzicht");
  const blokkenPerPositie: Record<string, Blok[]> = {};
  blokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });

  const overridesPerNamespace = await haalTekstOverridesMulti(supabase, [
    "mini-eleva-verhalen",
  ]);
  const tekstOverrides = namespaceAlsRecord(
    overridesPerNamespace,
    "mini-eleva-verhalen",
  );

  return (
    <MiniElevaVerhalenContent
      isFounder={false}
      prospectVoornaam={ctx.prospectNaam.split(" ")[0]}
      memberNaam={ctx.memberNaam}
      terugHref={`/m/${ctx.token}`}
      blokkenPerPositie={blokkenPerPositie}
      tekstOverrides={tekstOverrides}
      spoor={ctx.soort}
    />
  );
}
