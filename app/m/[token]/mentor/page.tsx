import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProspectMentorChat } from "@/components/mini-eleva/ProspectMentorChat";
import Link from "next/link";

// ============================================================
// /m/[token]/mentor, AI-mentor-chat voor de prospect.
//
// Server-side laden we de bestaande chat-geschiedenis + quotum-stand
// in, zodat de UI bij refresh meteen door kan. Daarna nemen we het
// gesprek over via de client-component die op /api/mini-eleva/chat
// streamt.
// ============================================================

export const dynamic = "force-dynamic";

const HARD_QUOTUM = 50;

export default async function MentorPagina({
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

  await logActiviteit(ctx.invitationId, "mentor", "mentor-pagina geopend");

  // Bestaande berichten laden
  const admin = createAdminClient();
  const { data: berichtenRaw } = await admin
    .from("mini_eleva_chats")
    .select("id, rol, content, created_at")
    .eq("invitation_id", ctx.invitationId)
    .order("created_at", { ascending: true });

  const { count: aiCount } = await admin
    .from("mini_eleva_chats")
    .select("id", { count: "exact", head: true })
    .eq("invitation_id", ctx.invitationId)
    .eq("rol", "ai_mentor");

  type DbBericht = {
    id: string;
    rol: "prospect" | "ai_mentor" | "member" | "sponsor";
    content: string;
    created_at: string;
  };
  const berichten = (berichtenRaw as DbBericht[] | null) ?? [];

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
          AI-Mentor
        </p>
        <h1 className="font-serif-warm text-2xl text-cm-white leading-tight">
          Stel je vragen
        </h1>
      </div>

      <ProspectMentorChat
        token={ctx.token}
        prospectVoornaam={ctx.prospectNaam.split(" ")[0]}
        initieleBerichten={berichten}
        initieelGebruikt={aiCount ?? 0}
        limiet={HARD_QUOTUM}
        memberNaam={ctx.memberNaam}
        sponsorNaam={ctx.sponsorNaam}
      />
    </div>
  );
}
