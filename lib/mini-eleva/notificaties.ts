import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { warmNaarOpvolgen } from "@/lib/prospect/warm-naar-opvolgen";

// ============================================================
// Mini-ELEVA notificatie-helper.
//
// Eén functie voor alle prospect-acties die member en/of sponsor
// moeten weten:
//   - Slaat een mini_eleva_notificaties-rij op (voor in-app badges)
//   - Stuurt een push naar de ontvanger ALS die push aan heeft
//
// AVG-Keuze A: GEEN chat-inhoud meesturen. Alleen geaggregeerde
// signalen ("Sarah heeft je nodig", "Sarah is voor 't eerst actief").
// ============================================================

type NotificatieType =
  | "eerste-bezoek"
  | "haal-erbij"
  | "mijlpaal-vragen"
  | "mentor-bezoek";

type Args = {
  invitationId: string;
  type: NotificatieType;
  titel: string;
  detail?: string;
  /** URL waar member naartoe gaat als ze op de push klikken */
  url?: string;
};

/**
 * Maak een notificatie + verstuur push naar member en sponsor van
 * deze uitnodiging. Faalt stilletjes als push uit staat — we slaan de
 * in-app notificatie altijd op.
 */
export async function notifeerVoorUitnodiging(args: Args): Promise<void> {
  try {
    const admin = createAdminClient();

    // Haal member + sponsor op
    const { data: invRaw } = await admin
      .from("prospect_invitations")
      .select("id, member_user_id, sponsor_user_id, prospect_id")
      .eq("id", args.invitationId)
      .maybeSingle();

    if (!invRaw) return;

    const inv = invRaw as {
      id: string;
      member_user_id: string;
      sponsor_user_id: string | null;
      prospect_id: string;
    };

    // Mini-ELEVA-activiteit (alles behalve het eerste bezoek) is een warm
    // signaal: schuif de prospect naar Opvolgen + maak een opvolg-herinnering
    // voor de member. Het eerste bezoek blijft bewust alleen een melding.
    if (args.type !== "eerste-bezoek") {
      await warmNaarOpvolgen({
        admin,
        prospectId: inv.prospect_id,
        memberId: inv.member_user_id,
        reden: args.titel,
        beschrijving: args.detail ?? null,
      });
    }

    const ontvangers: string[] = [inv.member_user_id];
    if (inv.sponsor_user_id) ontvangers.push(inv.sponsor_user_id);

    // 1. In-app notificatie opslaan voor elke ontvanger
    const rijen = ontvangers.map((uid) => ({
      invitation_id: args.invitationId,
      ontvanger_user_id: uid,
      type: args.type,
      titel: args.titel,
      detail: args.detail ?? null,
    }));

    await admin.from("mini_eleva_notificaties").insert(rijen);

    // 2. Push versturen naar elke ontvanger (faalt stilletjes als
    // push niet aan staat). Faalt-stilletjes is OK — in-app
    // notificatie staat al klaar.
    const pushUrl =
      args.url ?? `/namenlijst/${inv.prospect_id}#mini-eleva`;

    await Promise.all(
      ontvangers.map((uid) =>
        sendPushToUser(uid, {
          title: args.titel,
          body: args.detail ?? "Open ELEVA voor meer details",
          url: pushUrl,
          tag: `mini-eleva-${args.type}-${inv.id}`,
        }).catch((e) => {
          // Stilletjes loggen, niet bubbelen
          console.warn("[mini-eleva] push faal stilletjes:", e?.message);
        }),
      ),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "onbekend";
    console.error("[mini-eleva] notificatie-fout:", msg);
  }
}

/**
 * Detecteer of dit het eerste bezoek van de prospect is binnen de
 * uitnodiging. Gebruikt om een "eerste-bezoek"-melding te triggeren
 * bij landing-pagina-open. We tellen activiteit-rijen voor deze
 * uitnodiging (vóór de huidige actie); 0 = eerste keer.
 */
export async function isEersteBezoek(
  invitationId: string,
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { count } = await admin
      .from("mini_eleva_activiteit")
      .select("id", { count: "exact", head: true })
      .eq("invitation_id", invitationId);
    // 0 of 1 telt nog als "eerste bezoek" want logActiviteit() is mogelijk
    // net gedraaid voordat we deze check doen. We willen 'm 1x triggeren.
    return (count ?? 0) <= 1;
  } catch {
    return false;
  }
}
