import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

// ============================================================
// /sponsor/mini-eleva
//
// Overzicht voor de sponsor (bijv. Gaby) van alle actieve mini-ELEVA-
// uitnodigingen waar zij aan gekoppeld is. Per uitnodiging zie je:
//   - Welke member 'm heeft aangemaakt
//   - Welke prospect 't betreft
//   - Status, verlooptijd, ongelezen-teller
//
// Klikken op een tegel opent /sponsor/mini-eleva/[id] met de chat.
// ============================================================

export const dynamic = "force-dynamic";

type InvRow = {
  id: string;
  status: string;
  created_at: string;
  expires_at: string;
  laatste_activiteit_op: string | null;
  member_user_id: string;
  prospect_id: string;
};

export default async function SponsorMiniElevaOverzicht() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invitations, error } = await supabase
    .from("prospect_invitations")
    .select(
      "id, status, created_at, expires_at, laatste_activiteit_op, member_user_id, prospect_id",
    )
    .eq("sponsor_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-4 pt-6">
        <h1 className="text-2xl font-display text-cm-white">
          Mini-ELEVA's onder mij
        </h1>
        <p className="text-cm-white/60 text-sm">
          De mini-ELEVA-tabellen zijn nog niet geïnstalleerd. Vraag de founder
          om de SQL-migraties te draaien.
        </p>
      </div>
    );
  }

  const lijst = (invitations as InvRow[] | null) ?? [];

  // Member- en prospect-namen ophalen
  const memberIds = Array.from(new Set(lijst.map((i) => i.member_user_id)));
  const prospectIds = Array.from(new Set(lijst.map((i) => i.prospect_id)));

  // Admin-client voor de prospect-namen: sponsor heeft via RLS geen
  // toegang tot prospects van member-X (die zijn user_id-locked), maar
  // mag de naam wel zien want ze is sponsor van de invitation. Dus
  // server-side admin met handmatige authorization (sponsor_user_id
  // matcht in invitations is al gecheckt hierboven).
  const admin = createAdminClient();
  const [{ data: members }, { data: prospects }] = await Promise.all([
    memberIds.length
      ? admin.from("profiles").select("id, full_name").in("id", memberIds)
      : Promise.resolve({ data: [] }),
    prospectIds.length
      ? admin
          .from("prospects")
          .select("id, volledige_naam")
          .in("id", prospectIds)
      : Promise.resolve({ data: [] }),
  ]);

  const memberMap = new Map<string, string>();
  for (const m of (members as { id: string; full_name: string }[] | null) ??
    []) {
    memberMap.set(m.id, m.full_name ?? "");
  }
  const prospectMap = new Map<string, string>();
  for (const p of (prospects as { id: string; volledige_naam: string }[] | null) ??
    []) {
    prospectMap.set(p.id, p.volledige_naam ?? "");
  }

  // Per invitation het aantal ongelezen mens-berichten ophalen
  const { data: leesData } = await supabase
    .from("mini_eleva_leeskenmerk")
    .select("invitation_id, laatst_gelezen_op")
    .eq("user_id", user.id);
  const leesMap = new Map<string, string>();
  for (const l of (leesData as
    | { invitation_id: string; laatst_gelezen_op: string }[]
    | null) ?? []) {
    leesMap.set(l.invitation_id, l.laatst_gelezen_op);
  }

  const lijstMetTeller = await Promise.all(
    lijst.map(async (inv) => {
      const sinds = leesMap.get(inv.id) ?? "1970-01-01T00:00:00Z";
      const { count } = await supabase
        .from("mini_eleva_chats")
        .select("id", { count: "exact", head: true })
        .eq("invitation_id", inv.id)
        .eq("kanaal", "mens")
        .in("rol", ["prospect", "member"])
        .gt("created_at", sinds);
      const verlopen =
        inv.status === "verlopen" ||
        new Date(inv.expires_at).getTime() < Date.now();
      return {
        ...inv,
        verlopen,
        ongelezen: count ?? 0,
        memberNaam: memberMap.get(inv.member_user_id) ?? "Onbekende member",
        prospectNaam:
          prospectMap.get(inv.prospect_id) ?? "Onbekende prospect",
      };
    }),
  );

  // Sorteer: actief eerst, dan op meeste ongelezen
  const gesorteerd = lijstMetTeller.sort((a, b) => {
    if (a.verlopen !== b.verlopen) return a.verlopen ? 1 : -1;
    if (a.ongelezen !== b.ongelezen) return b.ongelezen - a.ongelezen;
    return (
      new Date(b.laatste_activiteit_op ?? b.created_at).getTime() -
      new Date(a.laatste_activiteit_op ?? a.created_at).getTime()
    );
  });

  const totaalOngelezen = gesorteerd.reduce((s, i) => s + i.ongelezen, 0);

  return (
    <div className="space-y-6 pt-6">
      <div>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Sponsor-zicht
        </p>
        <h1 className="font-serif-warm text-3xl text-cm-white leading-tight">
          Mini-ELEVA's onder mij
        </h1>
        <p className="text-cm-white/70 text-sm mt-2 leading-relaxed">
          Hier zie je alle prospects die jouw members via mini-ELEVA hebben
          uitgenodigd. Klik op een chat om te reageren. Jij bent de tweede
          mens in dat gesprek.
        </p>
      </div>

      {totaalOngelezen > 0 && (
        <div className="card border-l-4 border-cm-gold">
          <p className="text-cm-gold font-semibold text-sm">
            🔔 {totaalOngelezen} ongelezen bericht
            {totaalOngelezen === 1 ? "" : "en"}
          </p>
        </div>
      )}

      {gesorteerd.length === 0 && (
        <div className="card text-center text-cm-white/60 text-sm">
          Nog geen mini-ELEVA's onder jou. Zodra een van je members 'r een
          aanmaakt en jou als sponsor koppelt, verschijnt 'ie hier.
        </div>
      )}

      <div className="space-y-3">
        {gesorteerd.map((inv) => (
          <Link
            key={inv.id}
            href={`/sponsor/mini-eleva/${inv.id}`}
            className={`card flex items-center gap-3 hover:border-cm-gold-dim transition-colors ${
              inv.verlopen ? "opacity-60" : ""
            }`}
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-cm-white font-semibold text-sm">
                  {inv.prospectNaam}
                </h3>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                    inv.verlopen
                      ? "bg-cm-white/10 text-cm-white/50"
                      : "bg-cm-gold/20 text-cm-gold"
                  }`}
                >
                  {inv.verlopen ? "verlopen" : "actief"}
                </span>
                {inv.ongelezen > 0 && (
                  <span className="bg-cm-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {inv.ongelezen} nieuw
                  </span>
                )}
              </div>
              <p className="text-cm-white/60 text-xs">
                Member: <span className="text-cm-white">{inv.memberNaam}</span>
              </p>
              <p className="text-cm-white/40 text-[11px]">
                Aangemaakt{" "}
                {format(parseISO(inv.created_at), "d MMM HH:mm", {
                  locale: nl,
                })}
                {!inv.verlopen &&
                  ` · verloopt over ${formatDistanceToNow(parseISO(inv.expires_at), { locale: nl })}`}
              </p>
            </div>
            <span className="text-cm-gold">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
