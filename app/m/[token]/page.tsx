import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import {
  notifeerVoorUitnodiging,
  isEersteBezoek,
} from "@/lib/mini-eleva/notificaties";
import { PWAInstallPrompt } from "@/components/mini-eleva/PWAInstallPrompt";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import Link from "next/link";

// ============================================================
// /m/[token], landing-pagina voor prospects.
//
// Dit is de eerste pagina die een prospect ziet zodra hij of zij op
// de mini-ELEVA-link klikt. Token wordt server-side gevalideerd via
// de admin-client (omzeilt RLS, want prospect heeft geen account).
//
// Vanaf hier navigeert de prospect naar:
//   - /m/[token]/welkom, welkomstvideo's van member en sponsor
//   - /m/[token]/verhalen, succesverhalen-bibliotheek (Fase 6c)
//   - /m/[token]/producten, productcatalogus (Fase 6c)
//   - /m/[token]/mentor, AI-mentor-chat (Fase 6b)
//   - /m/[token]/chat, drie-persoons-chat (Fase 6b)
//
// In Fase 6a renderen we vooral de welkom-pagina + placeholders.
// ============================================================

export const dynamic = "force-dynamic";

export default async function MiniElevaLandingPagina({
  params,
}: {
  params: { token: string };
}) {
  const ctx = await pakMiniElevaContext(params.token);

  if (!ctx) {
    return (
      <div className="space-y-4 pt-12 text-center">
        <h1 className="text-2xl font-display text-cm-white">
          Deze link werkt niet
        </h1>
        <p className="text-cm-white/70">
          De link die je hebt gevolgd is niet geldig. Vraag de persoon die je
          uitnodigde om een nieuwe link.
        </p>
      </div>
    );
  }

  if (ctx.isVerlopen) {
    return (
      <div className="space-y-4 pt-12 text-center">
        <h1 className="text-2xl font-display text-cm-white">
          Je toegang is voorbij
        </h1>
        <p className="text-cm-white/70 max-w-md mx-auto leading-relaxed">
          Mini-ELEVA-uitnodigingen zijn 72 uur geldig. Wil je nog spreken met{" "}
          <strong className="text-cm-white">{ctx.memberNaam ?? "de member"}</strong>?
          Vraag of ze je opnieuw uitnodigen, dan krijg je een verse link.
        </p>
        <p className="text-cm-white/40 text-xs mt-6">
          Verlopen op{" "}
          {format(parseISO(ctx.expiresAt), "d MMMM yyyy 'om' HH:mm", {
            locale: nl,
          })}
        </p>
      </div>
    );
  }

  // Detecteer eerste-bezoek VOORDAT we activiteit loggen, anders telt
  // ie 'm dubbel
  const eersteKeer = await isEersteBezoek(ctx.invitationId);

  // Log dat de prospect het welkomscherm heeft geopend
  await logActiviteit(ctx.invitationId, "welkom", "landing geopend");

  // Bij eerste bezoek: notificeer member + sponsor (push + in-app)
  if (eersteKeer) {
    await notifeerVoorUitnodiging({
      invitationId: ctx.invitationId,
      type: "eerste-bezoek",
      titel: `${ctx.prospectNaam.split(" ")[0]} kijkt rond in mini-ELEVA`,
      detail: "Net het welkomscherm geopend",
      url: `/namenlijst/${ctx.prospectId}#mini-eleva`,
    });
  }

  const verlooptOver = formatDistanceToNow(parseISO(ctx.expiresAt), {
    locale: nl,
    addSuffix: false,
  });

  return (
    <div className="space-y-6 pt-6">
      {/* PWA-install-prompt: vriendelijke uitnodiging om ELEVA op
          beginscherm te zetten. Toont alleen als app niet al als PWA
          draait, en niet als prospect 'm onlangs heeft weggeklikt. */}
      <PWAInstallPrompt memberNaam={ctx.memberNaam} />

      {/* Hero / welkom */}
      <div className="text-center space-y-2">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Welkom in je eigen omgeving
        </p>
        <h1 className="font-serif-warm text-3xl text-cm-white leading-tight">
          Hoi {ctx.prospectNaam.split(" ")[0]}!
        </h1>
        <p className="text-cm-white/80 leading-relaxed mt-3">
          {ctx.memberNaam ?? "Iemand uit je netwerk"} heeft je uitgenodigd om
          rustig kennis te maken met wat ze aan het doen zijn. Geen pitch, geen
          druk, gewoon kijken wat erbij past.
        </p>
      </div>

      {/* Status-balk: verlooptijd */}
      <div className="card border-l-4 border-cm-gold/60 text-sm">
        <p className="text-cm-white">
          ⏳ Je toegang is{" "}
          <strong className="text-cm-gold">{verlooptOver}</strong> geldig. Je
          kunt op je eigen tempo door de pagina's heen, en altijd terugkomen
          binnen die periode.
        </p>
      </div>

      {/* Modules-overzicht */}
      <div className="space-y-3">
        <h2 className="text-cm-gold text-sm font-semibold uppercase tracking-wider">
          Wat kun je hier?
        </h2>

        <Link
          href={`/m/${ctx.token}/welkom`}
          className="card flex items-center gap-3 hover:border-cm-gold-dim transition-colors"
        >
          <span className="text-2xl">👋</span>
          <div className="flex-1">
            <h3 className="text-cm-white font-semibold text-sm">
              Welkomstvideo's
            </h3>
            <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
              Een korte introductie van {ctx.memberNaam ?? "de member"}
              {ctx.sponsorNaam ? ` en ${ctx.sponsorNaam}` : ""}, zodat je weet
              wie je voor je hebt.
            </p>
          </div>
          <span className="text-cm-gold">→</span>
        </Link>

        {/* Placeholders voor latere fases. Tonen ze al zodat de prospect
            weet wat eraan komt en de member kan zien dat er een
            structuur is. */}
        <div className="card flex items-center gap-3 opacity-50 cursor-not-allowed">
          <span className="text-2xl">📖</span>
          <div className="flex-1">
            <h3 className="text-cm-white font-semibold text-sm">
              Succesverhalen
            </h3>
            <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
              Korte verhalen van mensen die hetzelfde pad hebben gelopen. Komt
              binnenkort.
            </p>
          </div>
          <span className="text-cm-white/40">later</span>
        </div>

        <Link
          href={`/m/${ctx.token}/mentor`}
          className="card flex items-center gap-3 hover:border-cm-gold-dim transition-colors"
        >
          <span className="text-2xl">🤖</span>
          <div className="flex-1">
            <h3 className="text-cm-white font-semibold text-sm">
              ELEVA-mentor
            </h3>
            <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
              Stel je vragen, 24/7 beschikbaar. Eerlijk over wat 'ie wel en
              niet weet, en wat blijft tussen jullie.
            </p>
          </div>
          <span className="text-cm-gold">→</span>
        </Link>

        <Link
          href={`/m/${ctx.token}/chat`}
          className="card flex items-center gap-3 hover:border-cm-gold-dim transition-colors"
        >
          <span className="text-2xl">💬</span>
          <div className="flex-1">
            <h3 className="text-cm-white font-semibold text-sm">
              Chat met {ctx.memberNaam ?? "member"}
              {ctx.sponsorNaam ? ` + ${ctx.sponsorNaam}` : ""}
            </h3>
            <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
              Echt gesprek met mensen. Tekst- en spraakberichten. Reactie komt
              wanneer ze tijd hebben — je krijgt een seintje op je telefoon.
            </p>
          </div>
          <span className="text-cm-gold">→</span>
        </Link>
      </div>

      {/* Privacy-strook, AVG-transparantie. Prospect moet weten wat
          er gedeeld wordt en wat niet. */}
      <div className="bg-cm-surface-2/40 rounded-lg p-3 text-xs text-cm-white/60 leading-relaxed space-y-1.5 mt-2">
        <p className="text-cm-white/80 font-semibold">🔒 Wat blijft privé?</p>
        <p>
          {ctx.memberNaam ?? "De member"} ziet wanneer je actief bent en
          hoeveel vragen je stelt, maar niet wát je aan de ELEVA-mentor
          vraagt of welk antwoord je krijgt.
        </p>
        <p>
          Als je iets wilt delen of een mens erbij wilt halen, druk dan op de{" "}
          <span className="text-cm-gold font-semibold">"haal sponsor erbij"</span>
          -knop in de chat. Pas dan ziet {ctx.memberNaam ?? "de member"}
          {ctx.sponsorNaam ? ` of ${ctx.sponsorNaam}` : ""} jouw oproep.
        </p>
        <p className="text-cm-white/40 text-[10px] pt-1">
          Je hebt geen account nodig. Je toegang werkt via deze persoonlijke
          link en wordt na 30 dagen automatisch gewist.
        </p>
      </div>
    </div>
  );
}
