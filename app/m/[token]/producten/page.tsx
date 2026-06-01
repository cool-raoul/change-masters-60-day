import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { createClient } from "@/lib/supabase/server";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import {
  haalTekstOverridesMulti,
  namespaceAlsRecord,
} from "@/lib/cms/tekst-overrides";
import { MiniElevaProductenContent } from "./content";
import Link from "next/link";

// ============================================================
// /m/[token]/producten, productcatalogus voor prospects.
//
// Prospect-view (geen account, isFounder=false). Toont de categorieen
// met claim-vrije uitleg in onze stem, plus MediaBlokken per categorie
// waar Gaby filmpjes en uitleg-content kan toevoegen via de founder-
// preview-route /instellingen/mini-eleva-preview/producten.
// ============================================================

export const dynamic = "force-dynamic";

export default async function ProductenPagina({
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

  await logActiviteit(ctx.invitationId, "producten", "producten-pagina geopend");

  // MediaBlokken voor namespace 'mini-eleva-producten', paginaId 'overzicht'.
  // Gaby beheert de inhoud via de founder-preview-route.
  const supabase = await createClient();
  const blokkenMap = await haalPaginaBlokken(supabase, "mini-eleva-producten", "overzicht");
  const blokkenPerPositie: Record<string, Blok[]> = {};
  blokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });

  // Tekst-overrides: prospect leest hier de evt. founder-aangepaste versies.
  // Edit-knoppen zijn voor prospect onzichtbaar (isFounder=false).
  const overridesPerNamespace = await haalTekstOverridesMulti(supabase, [
    "mini-eleva-producten",
  ]);
  const tekstOverrides = namespaceAlsRecord(
    overridesPerNamespace,
    "mini-eleva-producten",
  );

  return (
    <MiniElevaProductenContent
      isFounder={false}
      prospectVoornaam={ctx.prospectNaam.split(" ")[0]}
      memberNaam={ctx.memberNaam}
      terugHref={`/m/${ctx.token}`}
      blokkenPerPositie={blokkenPerPositie}
      tekstOverrides={tekstOverrides}
    />
  );
}
