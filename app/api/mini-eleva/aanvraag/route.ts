// File: app/api/mini-eleva/aanvraag/route.ts
//
// GET /api/mini-eleva/aanvraag?optin=<opt_in_id>&dag=<n>
//
// Publieke "vraag je eigen omgeving aan"-link die in de freebie-mails
// staat. Een PROSPECT klikt erop; pas op DAT moment wordt de mini-ELEVA-
// uitnodiging aangemaakt (niet vooraf, niet bij het invullen van de bot).
//
// Flow:
//   1. opt-in opzoeken op id → member + lead-email.
//   2. prospect van die member met dat e-mailadres opzoeken.
//   3. zorgVoorMiniElevaInvitation: maakt (of hergebruikt) een actieve
//      uitnodiging. Idempotent, dus meermaals klikken = zelfde omgeving.
//   4. redirect naar /m/<token>. Die pagina logt het bezoek en stuurt de
//      member de "eerste-bezoek"-melding (push + in-app). Daardoor ziet de
//      member vanzelf dat de prospect z'n omgeving heeft geopend, plus de
//      activiteit die erop volgt.
//
// Faalt veilig: bij een onbekende/ongeldige opt-in of een mislukte
// aanmaak sturen we de bezoeker naar de homepage in plaats van een 500.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { zorgVoorMiniElevaInvitation } from "@/lib/mini-eleva/auto-invitation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const naarHome = () => NextResponse.redirect(`${origin}/`, { status: 302 });

  try {
    const optInId = req.nextUrl.searchParams.get("optin");
    const dagParam = req.nextUrl.searchParams.get("dag");
    const bron = dagParam ? `mail-d${dagParam}` : "mail-aanvraag";

    if (!optInId) return naarHome();

    const admin = createAdminClient();

    // 1. Opt-in → member + lead-email
    const { data: optIn } = await admin
      .from("freebie_opt_ins")
      .select("id, member_id, lead_email")
      .eq("id", optInId)
      .maybeSingle();
    if (!optIn?.member_id || !optIn?.lead_email) return naarHome();

    // 2. Prospect van deze member met dit e-mailadres
    const { data: prospect } = await admin
      .from("prospects")
      .select("id")
      .eq("user_id", optIn.member_id)
      .ilike("email", optIn.lead_email)
      .maybeSingle();
    if (!prospect?.id) return naarHome();

    // 3. Uitnodiging aanmaken of hergebruiken (idempotent)
    const resultaat = await zorgVoorMiniElevaInvitation(admin, {
      prospectId: prospect.id as string,
      memberUserId: optIn.member_id as string,
    });
    if (!resultaat?.token) return naarHome();

    // 4. Door naar de eigen omgeving. /m/[token] logt het bezoek en
    //    stuurt de member de eerste-bezoek-melding (push + in-app).
    return NextResponse.redirect(
      `${origin}/m/${resultaat.token}?bron=${bron}`,
      { status: 302 },
    );
  } catch (e) {
    console.warn(
      "[mini-eleva/aanvraag] fout:",
      e instanceof Error ? e.message : e,
    );
    return naarHome();
  }
}
