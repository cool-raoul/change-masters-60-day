import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import Link from "next/link";

// ============================================================
// /m/[token]/welkom, welkomstvideo's van member en sponsor.
//
// In Fase 6a tonen we placeholder-blokken. In een latere fase wordt
// hier een uploader voor de member gebouwd zodat 'ie zijn eigen video
// kan maken voor de prospect, plus een herbruikbare video van de
// sponsor.
// ============================================================

export const dynamic = "force-dynamic";

export default async function WelkomPagina({
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

  await logActiviteit(ctx.invitationId, "welkom-videos", "welkom-pagina geopend");

  return (
    <div className="space-y-6 pt-6">
      <Link
        href={`/m/${ctx.token}`}
        className="text-cm-white/60 hover:text-cm-white text-sm flex items-center gap-1"
      >
        ← Terug
      </Link>

      <div>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Welkomstvideo's
        </p>
        <h1 className="font-serif-warm text-2xl text-cm-white leading-tight mt-1">
          Maak even kennis
        </h1>
      </div>

      {/* Welkom van member, persoonlijk per prospect */}
      <div className="card space-y-3">
        <h2 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
          👋 Bericht van {ctx.memberNaam ?? "de member"}
        </h2>
        <div className="aspect-video rounded-lg bg-cm-surface-2 flex items-center justify-center text-cm-white/40 text-sm">
          📹 Persoonlijke welkomstvideo komt hier
        </div>
        <p className="text-cm-white/60 text-xs leading-relaxed">
          {ctx.memberNaam ?? "De member"} kan via zijn eigen ELEVA een korte
          video opnemen die hier verschijnt. In de huidige fase staat hier nog
          een placeholder, de upload-functie komt in een volgende update.
        </p>
      </div>

      {/* Welkom van sponsor, herbruikbaar over alle prospects */}
      {ctx.sponsorNaam && (
        <div className="card space-y-3">
          <h2 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
            🤝 Bericht van {ctx.sponsorNaam}
          </h2>
          <div className="aspect-video rounded-lg bg-cm-surface-2 flex items-center justify-center text-cm-white/40 text-sm">
            📹 Welkomstvideo van sponsor komt hier
          </div>
          <p className="text-cm-white/60 text-xs leading-relaxed">
            {ctx.sponsorNaam} is de mentor van {ctx.memberNaam ?? "de member"}
            . Hij of zij neemt eenmalig een welkomstvideo op die voor alle
            mini-ELEVA's gebruikt wordt.
          </p>
        </div>
      )}

      <Link
        href={`/m/${ctx.token}`}
        className="block text-center text-cm-gold text-sm hover:underline pt-4"
      >
        ← Terug naar overzicht
      </Link>
    </div>
  );
}
