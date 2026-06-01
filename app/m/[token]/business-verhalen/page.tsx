import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { createClient } from "@/lib/supabase/server";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import {
  haalTekstOverridesMulti,
  namespaceAlsRecord,
} from "@/lib/cms/tekst-overrides";
import { MiniElevaBusinessVerhalenContent } from "./content";
import Link from "next/link";
import { redirect } from "next/navigation";

// ============================================================
// /m/[token]/business-verhalen, alleen voor business-spoor-prospects.
// Acht thema-secties met opbouw-ervaringen plus MediaBlokken.
// Product-spoor wordt teruggestuurd naar landing.
// ============================================================

export const dynamic = "force-dynamic";

export default async function BusinessVerhalenPagina({
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

  // Product-spoor: deze pagina is niet voor jou bedoeld. Terug naar landing.
  if (ctx.soort === "product") {
    redirect(`/m/${ctx.token}`);
  }

  await logActiviteit(ctx.invitationId, "business-verhalen", "business-verhalen-pagina geopend");

  const supabase = await createClient();
  const blokkenMap = await haalPaginaBlokken(
    supabase,
    "mini-eleva-business-verhalen",
    "overzicht",
  );
  const blokkenPerPositie: Record<string, Blok[]> = {};
  blokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });

  const overridesPerNamespace = await haalTekstOverridesMulti(supabase, [
    "mini-eleva-business-verhalen",
  ]);
  const tekstOverrides = namespaceAlsRecord(
    overridesPerNamespace,
    "mini-eleva-business-verhalen",
  );

  return (
    <MiniElevaBusinessVerhalenContent
      isFounder={false}
      prospectVoornaam={ctx.prospectNaam.split(" ")[0]}
      memberNaam={ctx.memberNaam}
      sponsorNaam={ctx.sponsorNaam}
      terugHref={`/m/${ctx.token}`}
      blokkenPerPositie={blokkenPerPositie}
      tekstOverrides={tekstOverrides}
    />
  );
}
