import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MensChatVenster } from "@/components/mini-eleva/MensChatVenster";

// ============================================================
// /sponsor/mini-eleva/[id], detail-chat voor de sponsor.
//
// Sponsor opent één specifieke mini-ELEVA-chat van een member onder
// haar. Toegang via sponsor_user_id-match in prospect_invitations.
// Bij openen markeren we ook de leeskenmerk-stempel zodat de
// ongelezen-teller op de overzichtspagina reset.
// ============================================================

export const dynamic = "force-dynamic";

export default async function SponsorMiniElevaDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invitation, error } = await supabase
    .from("prospect_invitations")
    .select(
      "id, status, expires_at, member_user_id, sponsor_user_id, prospect_id",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !invitation) notFound();

  const inv = invitation as {
    id: string;
    status: string;
    expires_at: string;
    member_user_id: string;
    sponsor_user_id: string | null;
    prospect_id: string;
  };

  if (inv.sponsor_user_id !== user.id) {
    return (
      <div className="space-y-4 pt-12 text-center">
        <p className="text-cm-white/70">
          Je bent geen sponsor van deze mini-ELEVA.
        </p>
        <Link href="/sponsor/mini-eleva" className="text-cm-gold underline">
          Terug naar overzicht
        </Link>
      </div>
    );
  }

  // Member- en prospect-naam via admin-client. Sponsor heeft via RLS
  // geen leestoegang op prospects van een andere member, maar mag de
  // naam zien want ze is sponsor van de invitation (al gecheckt
  // hierboven met sponsor_user_id-match).
  const admin = createAdminClient();
  const [{ data: member }, { data: prospect }] = await Promise.all([
    admin
      .from("profiles")
      .select("full_name")
      .eq("id", inv.member_user_id)
      .maybeSingle(),
    admin
      .from("prospects")
      .select("volledige_naam")
      .eq("id", inv.prospect_id)
      .maybeSingle(),
  ]);

  const memberNaam =
    (member as { full_name?: string } | null)?.full_name ?? "Member";
  const prospectNaam =
    (prospect as { volledige_naam?: string } | null)?.volledige_naam ??
    "Prospect";

  // Markeer leeskenmerk: bij open zetten we 'm op nu
  await supabase.from("mini_eleva_leeskenmerk").upsert(
    {
      invitation_id: inv.id,
      user_id: user.id,
      laatst_gelezen_op: new Date().toISOString(),
    },
    { onConflict: "invitation_id,user_id,prospect_token" },
  );

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] pt-2">
      <Link
        href="/sponsor/mini-eleva"
        className="text-cm-white/60 hover:text-cm-white text-sm flex items-center gap-1 mb-3"
      >
        ← Terug naar overzicht
      </Link>

      <div className="mb-3">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Sponsor-chat
        </p>
        <h1 className="font-serif-warm text-2xl text-cm-white leading-tight">
          {prospectNaam}
        </h1>
        <p className="text-cm-white/60 text-xs mt-1">
          Mini-ELEVA van member{" "}
          <span className="text-cm-white">{memberNaam}</span>
        </p>
      </div>

      <MensChatVenster
        invitationId={inv.id}
        rolLabels={{
          prospect: prospectNaam.split(" ")[0],
          member: memberNaam.split(" ")[0] || "Member",
          sponsor: "Jij",
        }}
        uitlegregel={`Je antwoorden gaan via push-melding naar ${prospectNaam.split(" ")[0]} en ${memberNaam.split(" ")[0]}. Tekst en spraak werken allebei.`}
      />
    </div>
  );
}
