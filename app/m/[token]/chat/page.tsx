import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { MensChatVenster } from "@/components/mini-eleva/MensChatVenster";
import { ProspectPushOptIn } from "@/components/mini-eleva/ProspectPushOptIn";
import Link from "next/link";

// ============================================================
// /m/[token]/chat, drie-persoonschat voor de prospect.
//
// Apart van /m/[token]/mentor (AI). Deze pagina is voor het echte
// gesprek met member en sponsor (mens-tot-mens). Berichten gaan via
// /api/mini-eleva/bericht en triggeren push-meldingen aan de andere
// kant.
// ============================================================

export const dynamic = "force-dynamic";

export default async function ProspectChatPagina({
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

  await logActiviteit(ctx.invitationId, "mens-chat", "chat-pagina geopend");

  const memberDeel = ctx.memberNaam
    ? ctx.memberNaam.split(" ")[0]
    : "de member";
  const sponsorDeel = ctx.sponsorNaam ? ctx.sponsorNaam.split(" ")[0] : null;

  const titelChat = sponsorDeel
    ? `Chat met ${memberDeel} + ${sponsorDeel}`
    : `Chat met ${memberDeel}`;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] pt-2">
      <Link
        href={`/m/${ctx.token}`}
        className="text-cm-white/60 hover:text-cm-white text-sm flex items-center gap-1 mb-3"
      >
        ← Terug naar overzicht
      </Link>

      <div className="mb-3">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Chat met echte mensen
        </p>
        <h1 className="font-serif-warm text-2xl text-cm-white leading-tight">
          {titelChat}
        </h1>
      </div>

      {/* Push-opt-in: bij eerste bezoek vragen we de prospect of
          'ie meldingen wil ontvangen, zodat 'ie weet wanneer
          ${memberDeel} of ${sponsorDeel} reageert. */}
      <ProspectPushOptIn token={ctx.token} memberNaam={ctx.memberNaam} />

      <MensChatVenster
        token={ctx.token}
        uitlegregel={`${memberDeel}${sponsorDeel ? ` en ${sponsorDeel}` : ""} kr${sponsorDeel ? "ijgen" : "ijgt"} een seintje wanneer je iets stuurt. Schrijven, spraakberichten, alles mag, en je krijgt zelf ook een melding wanneer ze reageren.`}
        rolLabels={{
          prospect: ctx.prospectNaam.split(" ")[0],
          member: memberDeel,
          sponsor: sponsorDeel ?? "Sponsor",
        }}
      />
    </div>
  );
}
