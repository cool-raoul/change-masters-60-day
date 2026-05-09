import { createClient } from "@/lib/supabase/server";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { VerlengKnop } from "@/components/mini-eleva/VerlengKnop";
import { WisselSponsorKnop } from "@/components/mini-eleva/WisselSponsorKnop";

// ============================================================
// MiniElevaActieveSessies, server-component die GEAGGREGEERD
// momentum-overzicht laat zien voor één prospect.
//
// AVG-keuze A: GEEN letterlijke chat-inhoud. Wel:
//   - Status (actief / verlopen) + verloop-timer
//   - Aantal acties + aantal mentor-vragen + tijd-sinds-laatste
//   - "Haal sponsor erbij"-meldingen (consent-gegeven, telt als
//     activiteit-tikker hier)
//
// Layout: default INGEKLAPT met een 1-regel samenvatting + knop om
// te openen. Per sessie alleen de essentie, geen letterlijke quotes.
// Verlopen sessies onder een aparte 'eerdere sessies'-toggle.
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
  aantal_verlengd: number | null;
  sponsor_user_id: string | null;
};

type Activiteit = {
  module: string;
  detail: string | null;
  created_at: string;
};

export async function MiniElevaActieveSessies({ prospectId }: Props) {
  const supabase = await createClient();

  const { data: invitations, error: invErr } = await supabase
    .from("prospect_invitations")
    .select(
      "id, token, status, created_at, expires_at, laatste_activiteit_op, aantal_verlengd, sponsor_user_id",
    )
    .eq("prospect_id", prospectId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (invErr || !invitations || invitations.length === 0) {
    return null;
  }

  const lijst = invitations as Invitation[];
  const ids = lijst.map((i) => i.id);

  // Activiteit ophalen + leeskenmerk auto-update bij bezoek
  const [{ data: activiteitData }, { data: { user } }] = await Promise.all([
    supabase
      .from("mini_eleva_activiteit")
      .select("invitation_id, module, detail, created_at")
      .in("invitation_id", ids)
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  // Markeer mini-ELEVA-notificaties als gelezen
  if (user) {
    await supabase
      .from("mini_eleva_notificaties")
      .update({ gelezen: true })
      .eq("ontvanger_user_id", user.id)
      .eq("gelezen", false)
      .in("invitation_id", ids);
  }

  type ActiviteitMetId = Activiteit & { invitation_id: string };
  const alleActiviteit =
    (activiteitData as ActiviteitMetId[] | null) ?? [];

  // Huidige sponsor-naam per uitnodiging ophalen voor in de wisselknop
  const sponsorIds = Array.from(
    new Set(lijst.map((i) => i.sponsor_user_id).filter(Boolean)),
  ) as string[];
  const sponsorNaamMap = new Map<string, string>();
  if (sponsorIds.length > 0) {
    const { data: sponsors } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", sponsorIds);
    for (const s of (sponsors as { id: string; full_name: string }[] | null) ??
      []) {
      sponsorNaamMap.set(s.id, s.full_name ?? "");
    }
  }

  // Aggregaties over alle sessies
  const nu = Date.now();
  const actieveSessies = lijst.filter(
    (i) =>
      i.status !== "verlopen" && new Date(i.expires_at).getTime() >= nu,
  );
  const verlopenSessies = lijst.filter(
    (i) =>
      i.status === "verlopen" || new Date(i.expires_at).getTime() < nu,
  );
  const totaalActies = alleActiviteit.length;
  const totaalMentorVragen = alleActiviteit.filter(
    (a) => a.module === "mentor-chat",
  ).length;
  const totaalHaalErbij = alleActiviteit.filter(
    (a) => a.module === "sponsor-erbij",
  ).length;
  const laatsteAlles = alleActiviteit[0]?.created_at;

  return (
    <details className="card border-l-4 border-cm-gold/30 group">
      <summary className="cursor-pointer list-none flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
            ✨ Mini-ELEVA-momentum
          </h3>
          {actieveSessies.length > 0 && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-cm-gold/20 text-cm-gold">
              actief
            </span>
          )}
          {totaalHaalErbij > 0 && (
            <span className="bg-cm-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
              {totaalHaalErbij}× hulp gevraagd
            </span>
          )}
        </div>
        <span className="text-cm-gold text-sm group-open:hidden">+</span>
        <span className="text-cm-gold text-sm hidden group-open:inline">−</span>
      </summary>

      {/* Korte samenvatting altijd zichtbaar onder de header */}
      <p className="text-cm-white/60 text-xs leading-relaxed mt-2">
        {totaalActies} actie{totaalActies === 1 ? "" : "s"}
        {totaalMentorVragen > 0
          ? ` · ${totaalMentorVragen} vraag${totaalMentorVragen === 1 ? "" : "en"} aan mentor`
          : ""}
        {laatsteAlles
          ? ` · laatst actief ${formatDistanceToNow(parseISO(laatsteAlles), { locale: nl, addSuffix: true })}`
          : ""}
      </p>

      {/* Details na uitklap */}
      <div className="mt-4 space-y-3">
        <p className="text-cm-white/40 text-[11px] leading-relaxed">
          AVG: je ziet WANNEER {prospectId ? "" : ""}'r activiteit is en hoe
          vaak vragen worden gesteld, niet WAT er gevraagd wordt aan de mentor.
        </p>

        {/* Actieve sessies */}
        {actieveSessies.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-cm-white/70 text-[11px] uppercase tracking-wider font-semibold">
              Actief
            </h4>
            {actieveSessies.map((inv) => {
              const activiteit = alleActiviteit.filter(
                (a) => a.invitation_id === inv.id,
              );
              const aantalMentor = activiteit.filter(
                (a) => a.module === "mentor-chat",
              ).length;
              const laatste = inv.laatste_activiteit_op ?? inv.created_at;
              const huidigeSponsorNaam = inv.sponsor_user_id
                ? (sponsorNaamMap.get(inv.sponsor_user_id) ?? null)
                : null;
              return (
                <div
                  key={inv.id}
                  className="bg-cm-surface-2 rounded p-2 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex-1 min-w-[140px]">
                      <div className="text-cm-white">
                        Aangemaakt{" "}
                        {format(parseISO(inv.created_at), "d MMM HH:mm", {
                          locale: nl,
                        })}
                      </div>
                      <div className="text-cm-white/60 text-[11px]">
                        {activiteit.length} actie
                        {activiteit.length === 1 ? "" : "s"}
                        {aantalMentor > 0
                          ? ` · ${aantalMentor} vraag${aantalMentor === 1 ? "" : "en"}`
                          : ""}{" "}
                        · laatst{" "}
                        {formatDistanceToNow(parseISO(laatste), {
                          locale: nl,
                          addSuffix: true,
                        })}
                      </div>
                      <div className="text-cm-white/40 text-[10px] mt-0.5">
                        Verloopt over{" "}
                        {formatDistanceToNow(parseISO(inv.expires_at), {
                          locale: nl,
                        })}
                      </div>
                    </div>
                    <VerlengKnop
                      invitationId={inv.id}
                      aantalVerlengd={inv.aantal_verlengd ?? 0}
                    />
                  </div>
                  {/* Sponsor wisselen / upline toevoegen voor deze sessie.
                      Member kan kiezen uit de upline-keten via dropdown. */}
                  <WisselSponsorKnop
                    invitationId={inv.id}
                    huidigeSponsorId={inv.sponsor_user_id}
                    huidigeSponsorNaam={huidigeSponsorNaam}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Verlopen sessies samengevouwen */}
        {verlopenSessies.length > 0 && (
          <details className="text-xs">
            <summary className="text-cm-white/50 hover:text-cm-white/70 cursor-pointer">
              {verlopenSessies.length} eerdere sessie
              {verlopenSessies.length === 1 ? "" : "s"} (verlopen)
            </summary>
            <div className="space-y-1 mt-2">
              {verlopenSessies.map((inv) => {
                const activiteit = alleActiviteit.filter(
                  (a) => a.invitation_id === inv.id,
                );
                return (
                  <div
                    key={inv.id}
                    className="text-cm-white/50 px-2 py-1 bg-cm-surface rounded"
                  >
                    {format(parseISO(inv.created_at), "d MMM yyyy", {
                      locale: nl,
                    })}{" "}
                    · {activiteit.length} actie
                    {activiteit.length === 1 ? "" : "s"}
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </div>
    </details>
  );
}
