import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// /mijn-chats
//
// WhatsApp-stijl overzicht voor de member van alle mini-ELEVA-chats
// met al haar prospects. Eén tegel per prospect, met:
//   - Voornaam, ongelezen-badge, status
//   - Preview van laatste bericht (tekst of "🎤 spraak")
//   - Tijd-geleden
//   - Klik → opent prospect-detail-pagina met chat auto-open
//
// Server-component die de admin-client gebruikt voor de aggregatie
// (zelfde data als /api/mini-eleva/mijn-chats GET).
// ============================================================

export const dynamic = "force-dynamic";

type InvRow = {
  id: string;
  prospect_id: string;
  expires_at: string;
  status: string;
};

export default async function MijnChatsPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invitations, error } = await supabase
    .from("prospect_invitations")
    .select("id, prospect_id, expires_at, status")
    .eq("member_user_id", user.id);

  if (error) {
    return (
      <div className="space-y-6 pt-6">
        <h1 className="font-serif-warm text-3xl text-cm-white">Mijn chats</h1>
        <p className="text-cm-white/60">
          Mini-ELEVA-tabellen zijn nog niet geïnstalleerd. Vraag de founder om
          de SQL-migraties te draaien.
        </p>
      </div>
    );
  }

  const lijst = (invitations as InvRow[] | null) ?? [];
  if (lijst.length === 0) {
    return (
      <div className="space-y-6 pt-6">
        <div>
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Mini-ELEVA
          </p>
          <h1 className="font-serif-warm text-3xl text-cm-white leading-tight">
            Mijn chats
          </h1>
        </div>
        <div className="card text-center text-cm-white/60 text-sm">
          Nog geen mini-ELEVA-chats. Maak een uitnodiging aan vanaf een
          prospect-kaart, dan verschijnt 't gesprek hier.
        </div>
      </div>
    );
  }

  const allInvIds = lijst.map((i) => i.id);
  const prospectIds = Array.from(new Set(lijst.map((i) => i.prospect_id)));

  // Haal prospects + lees-stempels + berichten in parallel op
  const admin = createAdminClient();
  const [
    { data: prospects },
    { data: leesData },
    { data: berichten },
  ] = await Promise.all([
    supabase
      .from("prospects")
      .select("id, volledige_naam")
      .in("id", prospectIds),
    supabase
      .from("mini_eleva_leeskenmerk")
      .select("invitation_id, laatst_gelezen_op")
      .eq("user_id", user.id)
      .in("invitation_id", allInvIds),
    admin
      .from("mini_eleva_chats")
      .select("invitation_id, rol, type, content, transcriptie, created_at")
      .in("invitation_id", allInvIds)
      .eq("kanaal", "mens")
      .in("rol", ["prospect", "member", "sponsor"])
      .not("content", "like", "🤝 [haal-erbij]%")
      .order("created_at", { ascending: false }),
  ]);

  const prospectMap = new Map<string, string>();
  for (const p of (prospects as { id: string; volledige_naam: string }[] | null) ??
    []) {
    prospectMap.set(p.id, p.volledige_naam ?? "");
  }

  const leesMap = new Map<string, string>();
  for (const l of (leesData as
    | { invitation_id: string; laatst_gelezen_op: string }[]
    | null) ?? []) {
    leesMap.set(l.invitation_id, l.laatst_gelezen_op);
  }

  type Bericht = {
    invitation_id: string;
    rol: string;
    type: string;
    content: string;
    transcriptie: string | null;
    created_at: string;
  };
  const alleBerichten = (berichten as Bericht[] | null) ?? [];

  // Groeperen per prospect
  const nu = Date.now();
  const perProspect = new Map<
    string,
    {
      prospectId: string;
      prospectNaam: string;
      prospectVoornaam: string;
      invIds: string[];
      heeftActieveInvitatie: boolean;
      laatsteBericht: string | null;
      laatsteBerichtRol: string | null;
      laatsteBerichtType: string | null;
      laatsteBerichtTijd: string | null;
      ongelezenAantal: number;
    }
  >();

  for (const inv of lijst) {
    const naam = prospectMap.get(inv.prospect_id) ?? "Onbekende prospect";
    const verlopen =
      inv.status === "verlopen" || new Date(inv.expires_at).getTime() < nu;
    const bestaand = perProspect.get(inv.prospect_id);
    if (bestaand) {
      bestaand.invIds.push(inv.id);
      if (!verlopen) bestaand.heeftActieveInvitatie = true;
    } else {
      perProspect.set(inv.prospect_id, {
        prospectId: inv.prospect_id,
        prospectNaam: naam,
        prospectVoornaam: naam.split(" ")[0] || naam,
        invIds: [inv.id],
        heeftActieveInvitatie: !verlopen,
        laatsteBericht: null,
        laatsteBerichtRol: null,
        laatsteBerichtType: null,
        laatsteBerichtTijd: null,
        ongelezenAantal: 0,
      });
    }
  }

  for (const groep of Array.from(perProspect.values())) {
    const eersteHit = alleBerichten.find((b) =>
      groep.invIds.includes(b.invitation_id),
    );
    if (eersteHit) {
      const preview =
        eersteHit.type === "spraak"
          ? eersteHit.transcriptie
            ? `🎤 ${eersteHit.transcriptie.substring(0, 60)}${eersteHit.transcriptie.length > 60 ? "..." : ""}`
            : "🎤 Spraakbericht"
          : eersteHit.content.substring(0, 80) +
            (eersteHit.content.length > 80 ? "..." : "");
      groep.laatsteBericht = preview;
      groep.laatsteBerichtRol = eersteHit.rol;
      groep.laatsteBerichtType = eersteHit.type;
      groep.laatsteBerichtTijd = eersteHit.created_at;
    }

    let ongelezen = 0;
    for (const invId of groep.invIds) {
      const sinds = leesMap.get(invId) ?? "1970-01-01T00:00:00Z";
      ongelezen += alleBerichten.filter(
        (b) =>
          b.invitation_id === invId &&
          b.rol !== "member" &&
          b.created_at > sinds,
      ).length;
    }
    groep.ongelezenAantal = Math.min(ongelezen, 99);
  }

  const items = Array.from(perProspect.values())
    .filter((g) => g.laatsteBerichtTijd !== null || g.heeftActieveInvitatie)
    .sort((a, b) => {
      if (a.ongelezenAantal !== b.ongelezenAantal) {
        return b.ongelezenAantal - a.ongelezenAantal;
      }
      const at = a.laatsteBerichtTijd
        ? new Date(a.laatsteBerichtTijd).getTime()
        : 0;
      const bt = b.laatsteBerichtTijd
        ? new Date(b.laatsteBerichtTijd).getTime()
        : 0;
      return bt - at;
    });

  const totaalOngelezen = items.reduce((s, i) => s + i.ongelezenAantal, 0);

  return (
    <div className="space-y-5 pt-6">
      <div>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Mini-ELEVA
        </p>
        <h1 className="font-serif-warm text-3xl text-cm-white leading-tight">
          Mijn chats
        </h1>
        <p className="text-cm-white/60 text-sm mt-1">
          Alle gesprekken met je prospects op één plek. Nieuwe berichten
          bovenaan.
        </p>
      </div>

      {totaalOngelezen > 0 && (
        <div className="card border-l-4 border-cm-gold flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <p className="text-cm-gold text-sm font-semibold">
            {totaalOngelezen} ongelezen bericht
            {totaalOngelezen === 1 ? "" : "en"}
          </p>
        </div>
      )}

      {items.length === 0 && (
        <div className="card text-center text-cm-white/60 text-sm">
          Nog geen actieve chats. Berichten verschijnen hier zodra prospects
          reageren of jij iets stuurt.
        </div>
      )}

      <div className="space-y-2">
        {items.map((c) => {
          const ongelezen = c.ongelezenAantal > 0;
          const laatsteRolLabel =
            c.laatsteBerichtRol === "member"
              ? "Jij"
              : c.laatsteBerichtRol === "sponsor"
                ? "Sponsor"
                : c.prospectVoornaam;
          return (
            <Link
              key={c.prospectId}
              href={`/namenlijst/${c.prospectId}?chat=open#mini-eleva-chat`}
              className={`card flex items-center gap-3 hover:border-cm-gold-dim transition-colors ${
                !c.heeftActieveInvitatie ? "opacity-70" : ""
              }`}
            >
              {/* Avatar / initialen */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${
                  ongelezen
                    ? "bg-cm-gold text-black"
                    : "bg-cm-surface-2 text-cm-white"
                }`}
              >
                {c.prospectVoornaam
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3
                    className={`font-semibold text-sm truncate ${
                      ongelezen ? "text-cm-gold" : "text-cm-white"
                    }`}
                  >
                    {c.prospectNaam}
                  </h3>
                  {c.laatsteBerichtTijd && (
                    <span
                      className={`text-[10px] shrink-0 ${
                        ongelezen ? "text-cm-gold" : "text-cm-white/50"
                      }`}
                    >
                      {formatDistanceToNow(parseISO(c.laatsteBerichtTijd), {
                        locale: nl,
                        addSuffix: false,
                      })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p
                    className={`text-xs leading-snug truncate ${
                      ongelezen
                        ? "text-cm-white font-medium"
                        : "text-cm-white/60"
                    }`}
                  >
                    {c.laatsteBericht ? (
                      <>
                        <span className="text-cm-white/40">
                          {laatsteRolLabel}:
                        </span>{" "}
                        {c.laatsteBericht}
                      </>
                    ) : (
                      <span className="italic text-cm-white/40">
                        Nog geen berichten
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!c.heeftActieveInvitatie && (
                      <span className="text-[9px] uppercase tracking-wider text-cm-white/40">
                        verlopen
                      </span>
                    )}
                    {ongelezen && (
                      <span className="bg-cm-gold text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {c.ongelezenAantal > 9 ? "9+" : c.ongelezenAantal}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
