import { createClient } from "@/lib/supabase/server";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

// ============================================================
// MiniElevaActieveSessies, server-component die laat zien wat er
// gebeurt in mini-ELEVA's voor één prospect.
//
// AVG-keuze A: ALLEEN GEAGGREGEERDE SIGNALEN, GEEN LETTERLIJKE
// CHATBERICHTEN. De prospect heeft niet expliciet ingestemd met
// member-leeszicht op gesprekken met de ELEVA-mentor. Wat we WEL
// tonen:
//   - Status (actief / verlopen) + verloop-timer
//   - Aantal acties + aantal mentor-vragen + tijd-sinds-laatste
//   - "Haal sponsor erbij"-meldingen, want daar drukt de prospect
//     EXPLICIET op = consent voor doorgifte van die ene specifieke
//     vraag/oproep
//
// Wat we NIET tonen:
//   - De inhoud van prospect-vragen aan de mentor
//   - De inhoud van mentor-antwoorden
//   - Themas, keywords, of samenvattingen (zou alsnog gevoelig zijn)
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
  const ids = lijst.map((i) => i.id);

  // Activiteit ophalen, dat is het enige inhoudelijke dat we nu nog
  // tonen. Chat-berichten laden we BEWUST NIET, ook al zou dat met
  // RLS technisch wel mogen, omdat de prospect niet heeft ingestemd
  // met member-leeszicht op AI-gesprekken.
  const { data: activiteitData } = await supabase
    .from("mini_eleva_activiteit")
    .select("invitation_id, module, detail, created_at")
    .in("invitation_id", ids)
    .order("created_at", { ascending: false });

  // Voor "haal sponsor erbij"-knop ophalen we WEL de tekst, want daar
  // heeft de prospect bewust op gedrukt = consent voor delen van die
  // specifieke vraag.
  const { data: haalErbijChats } = await supabase
    .from("mini_eleva_chats")
    .select("invitation_id, content, created_at")
    .in("invitation_id", ids)
    .like("content", "🤝 [haal-erbij]%")
    .order("created_at", { ascending: false });

  type ActiviteitMetId = Activiteit & { invitation_id: string };
  type HaalErbijMetId = {
    invitation_id: string;
    content: string;
    created_at: string;
  };
  const alleActiviteit =
    (activiteitData as ActiviteitMetId[] | null) ?? [];
  const alleHaalErbij = (haalErbijChats as HaalErbijMetId[] | null) ?? [];

  return (
    <div className="card border-l-4 border-cm-gold/30 space-y-4">
      <div>
        <h3 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
          ✨ Mini-ELEVA-sessies
        </h3>
        <p className="text-cm-white/60 text-xs leading-relaxed mt-1">
          Momentum-overzicht per uitnodiging. De inhoud van vragen aan de
          ELEVA-mentor blijft privé, je ziet alleen of er activiteit is en
          wanneer de prospect je erbij wil halen.
        </p>
      </div>

      {lijst.map((inv) => {
        const verlopen =
          inv.status === "verlopen" ||
          new Date(inv.expires_at).getTime() < Date.now();
        const activiteit = alleActiviteit.filter(
          (a) => a.invitation_id === inv.id,
        );
        const aantalMentorVragen = activiteit.filter(
          (a) => a.module === "mentor-chat",
        ).length;
        const haalErbij = alleHaalErbij.filter(
          (h) => h.invitation_id === inv.id,
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

            {/* Haal-erbij notificatie. WEL inhoudelijk zichtbaar omdat
                de prospect daar expliciet op heeft gedrukt = consent. */}
            {haalErbij.length > 0 && (
              <div className="bg-cm-gold/10 border border-cm-gold/30 rounded-lg p-3 text-xs space-y-2">
                <p className="text-cm-gold font-semibold">
                  🤝 Prospect vroeg om hulp ({haalErbij.length}x)
                </p>
                <div className="space-y-1.5">
                  {haalErbij.slice(0, 3).map((h, i) => (
                    <div key={i} className="text-cm-white/80 leading-snug">
                      <span className="text-cm-white/40 text-[10px]">
                        {formatDistanceToNow(parseISO(h.created_at), {
                          locale: nl,
                          addSuffix: true,
                        })}
                        {" · "}
                      </span>
                      {h.content
                        .replace("🤝 [haal-erbij]", "")
                        .trim()
                        .substring(0, 240)}
                    </div>
                  ))}
                </div>
                <p className="text-cm-white/50 text-[10px] italic pt-1">
                  Stuur 'm even een bericht of bel.
                </p>
              </div>
            )}

            {/* Geaggregeerde stats — geen inhoudelijke gegevens */}
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

            {/* Welke modules de prospect heeft geopend (welkom, mentor),
                geen inhoud, alleen gedrag-signalen */}
            {activiteit.length > 0 && (
              <details className="text-xs">
                <summary className="text-cm-white/50 cursor-pointer hover:text-cm-white/70">
                  Welke modules zijn bezocht
                </summary>
                <div className="space-y-1 mt-2 max-h-40 overflow-y-auto">
                  {Array.from(
                    new Map(
                      activiteit.map((a) => [
                        a.module,
                        activiteit.filter((b) => b.module === a.module).length,
                      ]),
                    ).entries(),
                  ).map(([module, count]) => (
                    <div
                      key={module}
                      className="flex justify-between text-cm-white/70 px-2 py-1 bg-cm-surface rounded"
                    >
                      <span>{module}</span>
                      <span className="text-cm-white/40">{count}x</span>
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
