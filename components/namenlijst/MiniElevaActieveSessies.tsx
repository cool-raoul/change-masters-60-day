import { createClient } from "@/lib/supabase/server";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

// ============================================================
// MiniElevaActieveSessies, server-component die laat zien wat er
// gebeurt in mini-ELEVA's voor één prospect. Komt onder de
// uitnodig-knop te staan op de prospect-detail-pagina.
//
// Toont per actieve of recente uitnodiging:
//   - status (actief / verlopen)
//   - aantal activiteiten (welke pagina's geopend, hoeveel mentor-vragen)
//   - eventuele haal-erbij-meldingen
//   - laatste 6 chatberichten van de prospect (read-only, member ziet
//     waar de prospect mee bezig is)
//
// Volgt de RLS-policies: member ziet eigen uitnodigingen, sponsor
// ziet die waar 'ie aan gekoppeld is.
// ============================================================

type Props = {
  prospectId: string;
};

type Invitation = {
  id: string;
  token: string;
  status: string;
  created_at: string;
  expires_at: string;
  laatste_activiteit_op: string | null;
};

type Activiteit = {
  module: string;
  detail: string | null;
  created_at: string;
};

type ChatBericht = {
  rol: string;
  content: string;
  created_at: string;
};

export async function MiniElevaActieveSessies({ prospectId }: Props) {
  const supabase = await createClient();

  // Probeer uitnodigingen te laden. Als tabel ontbreekt, render niets.
  const { data: invitations, error: invErr } = await supabase
    .from("prospect_invitations")
    .select(
      "id, token, status, created_at, expires_at, laatste_activiteit_op",
    )
    .eq("prospect_id", prospectId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (invErr || !invitations || invitations.length === 0) {
    return null;
  }

  const lijst = invitations as Invitation[];

  // Activiteit + chats voor alle uitnodigingen tegelijk ophalen
  const ids = lijst.map((i) => i.id);
  const [activiteitRes, chatsRes] = await Promise.all([
    supabase
      .from("mini_eleva_activiteit")
      .select("invitation_id, module, detail, created_at")
      .in("invitation_id", ids)
      .order("created_at", { ascending: false }),
    supabase
      .from("mini_eleva_chats")
      .select("invitation_id, rol, content, created_at")
      .in("invitation_id", ids)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  type ActiviteitMetId = Activiteit & { invitation_id: string };
  type ChatMetId = ChatBericht & { invitation_id: string };
  const alleActiviteit =
    (activiteitRes.data as ActiviteitMetId[] | null) ?? [];
  const alleChats = (chatsRes.data as ChatMetId[] | null) ?? [];

  return (
    <div className="card border-l-4 border-cm-gold/30 space-y-4">
      <div>
        <h3 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
          ✨ Mini-ELEVA-sessies
        </h3>
        <p className="text-cm-white/60 text-xs leading-relaxed mt-1">
          Wat de prospect doet binnen z'n mini-omgeving. Werkt in real-time, je
          kunt 'm even pingen of stilletjes meekijken.
        </p>
      </div>

      {lijst.map((inv) => {
        const verlopen =
          inv.status === "verlopen" ||
          new Date(inv.expires_at).getTime() < Date.now();
        const activiteit = alleActiviteit.filter(
          (a) => a.invitation_id === inv.id,
        );
        const chats = alleChats.filter((c) => c.invitation_id === inv.id);
        const aantalMentorVragen = activiteit.filter(
          (a) => a.module === "mentor-chat",
        ).length;
        const haalErbij = activiteit.filter(
          (a) => a.module === "sponsor-erbij",
        );
        const laatste = inv.laatste_activiteit_op ?? inv.created_at;

        return (
          <div
            key={inv.id}
            className={`bg-cm-surface-2 rounded-lg p-3 space-y-3 ${
              haalErbij.length > 0 ? "ring-2 ring-cm-gold/40" : ""
            }`}
          >
            {/* Status-rij */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                    verlopen
                      ? "bg-cm-white/10 text-cm-white/50"
                      : "bg-cm-gold/20 text-cm-gold"
                  }`}
                >
                  {verlopen ? "verlopen" : "actief"}
                </span>
                <span className="text-cm-white/60 text-xs">
                  Aangemaakt{" "}
                  {format(parseISO(inv.created_at), "d MMM HH:mm", {
                    locale: nl,
                  })}
                </span>
                {!verlopen && (
                  <span className="text-cm-white/40 text-xs">
                    · verloopt over{" "}
                    {formatDistanceToNow(parseISO(inv.expires_at), {
                      locale: nl,
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Haal-erbij notificatie */}
            {haalErbij.length > 0 && (
              <div className="bg-cm-gold/10 border border-cm-gold/30 rounded-lg p-2 text-xs">
                <p className="text-cm-gold font-semibold">
                  🤝 Prospect vroeg om hulp ({haalErbij.length}x)
                </p>
                <p className="text-cm-white/60 mt-0.5">
                  Laatste keer{" "}
                  {formatDistanceToNow(parseISO(haalErbij[0].created_at), {
                    locale: nl,
                    addSuffix: true,
                  })}
                  . Stuur 'm even een bericht.
                </p>
              </div>
            )}

            {/* Activiteit-samenvatting */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-cm-surface rounded p-2">
                <div className="text-cm-white text-lg font-bold">
                  {activiteit.length}
                </div>
                <div className="text-cm-white/50 text-[10px] uppercase tracking-wider">
                  acties
                </div>
              </div>
              <div className="bg-cm-surface rounded p-2">
                <div className="text-cm-white text-lg font-bold">
                  {aantalMentorVragen}
                </div>
                <div className="text-cm-white/50 text-[10px] uppercase tracking-wider">
                  vragen
                </div>
              </div>
              <div className="bg-cm-surface rounded p-2">
                <div className="text-cm-white text-xs font-semibold pt-0.5">
                  {formatDistanceToNow(parseISO(laatste), {
                    locale: nl,
                  })}
                </div>
                <div className="text-cm-white/50 text-[10px] uppercase tracking-wider">
                  geleden
                </div>
              </div>
            </div>

            {/* Recente prospect-vragen */}
            {chats.length > 0 && (
              <details className="text-xs">
                <summary className="text-cm-gold/80 cursor-pointer hover:text-cm-gold">
                  👀 Bekijk recente vragen ({chats.length})
                </summary>
                <div className="space-y-1.5 mt-2 max-h-64 overflow-y-auto">
                  {chats.slice(0, 12).map((c, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded ${
                        c.rol === "prospect"
                          ? "bg-cm-gold/10 border border-cm-gold/20"
                          : c.rol === "ai_mentor"
                            ? "bg-cm-surface border border-cm-white/10"
                            : "bg-cm-surface border border-cm-white/10"
                      }`}
                    >
                      <div className="text-[10px] text-cm-white/40 uppercase tracking-wider mb-0.5">
                        {c.rol === "ai_mentor" ? "Mentor" : c.rol}
                      </div>
                      <div className="text-cm-white/80 whitespace-pre-wrap leading-snug">
                        {c.content.length > 280
                          ? c.content.substring(0, 280) + "..."
                          : c.content}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}
