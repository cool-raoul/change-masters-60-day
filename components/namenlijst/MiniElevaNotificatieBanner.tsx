import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { nl } from "date-fns/locale";

// ============================================================
// MiniElevaNotificatieBanner, server-component die bovenaan
// /namenlijst laat zien wat er nieuw is binnen mini-ELEVA-sessies.
//
// Toont elke ongelezen notificatie als klikbare regel met:
//   - Type-emoji (🤝 haal-erbij, ✨ eerste-bezoek, 📚 mijlpaal)
//   - Titel (geen chat-inhoud, AVG-Keuze A)
//   - Tijd-geleden + link naar prospect-detail-pagina
//
// Klikken op een regel opent de prospect → daar markeert het zicht
// op MiniElevaActieveSessies de notificaties als gelezen via auto-
// gelezen logica.
//
// Faalt stilletjes (rendert null) als tabel niet bestaat (migratie
// nog niet gerund).
// ============================================================

const TYPE_EMOJI: Record<string, string> = {
  "haal-erbij": "🤝",
  "eerste-bezoek": "✨",
  "mijlpaal-vragen": "📚",
  "mentor-bezoek": "🤖",
};

type Notificatie = {
  id: string;
  invitation_id: string;
  type: string;
  titel: string;
  detail: string | null;
  created_at: string;
};

export async function MiniElevaNotificatieBanner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Haal ongelezen notificaties + bijbehorende prospect_id op
  const { data: notRaw, error } = await supabase
    .from("mini_eleva_notificaties")
    .select("id, invitation_id, type, titel, detail, created_at")
    .eq("ontvanger_user_id", user.id)
    .eq("gelezen", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !notRaw || notRaw.length === 0) {
    return null;
  }

  const notificaties = notRaw as Notificatie[];

  // Map invitation_id → prospect_id zodat we de juiste link kunnen bouwen
  const invIds = Array.from(new Set(notificaties.map((n) => n.invitation_id)));
  const { data: invMapRaw } = await supabase
    .from("prospect_invitations")
    .select("id, prospect_id")
    .in("id", invIds);
  const invMap = new Map(
    ((invMapRaw as { id: string; prospect_id: string }[] | null) ?? []).map(
      (r) => [r.id, r.prospect_id],
    ),
  );

  return (
    <div className="card border-l-4 border-cm-gold/60 mb-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
          🔔 Mini-ELEVA: {notificaties.length} nieuwe melding
          {notificaties.length === 1 ? "" : "en"}
        </h3>
      </div>
      <div className="space-y-1.5">
        {notificaties.map((n) => {
          const prospectId = invMap.get(n.invitation_id);
          const emoji = TYPE_EMOJI[n.type] ?? "•";
          if (!prospectId) {
            return (
              <div
                key={n.id}
                className="text-xs text-cm-white/50 leading-relaxed"
              >
                {emoji} {n.titel}
              </div>
            );
          }
          return (
            <Link
              key={n.id}
              href={`/namenlijst/${prospectId}#mini-eleva`}
              className="block text-xs text-cm-white/80 hover:text-cm-white leading-relaxed bg-cm-surface-2 rounded p-2 hover:border-cm-gold-dim border border-transparent transition-colors"
            >
              <div className="flex items-start gap-2">
                <span>{emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-cm-white">{n.titel}</div>
                  {n.detail && (
                    <div className="text-cm-white/60 mt-0.5 leading-snug">
                      {n.detail}
                    </div>
                  )}
                  <div className="text-cm-white/40 text-[10px] mt-1">
                    {formatDistanceToNow(parseISO(n.created_at), {
                      locale: nl,
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <span className="text-cm-gold text-xs">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
