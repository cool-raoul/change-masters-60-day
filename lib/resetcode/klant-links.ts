import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";

// ============================================================
// Server-helpers voor de Resetcode-klant-links. Zelfde principe
// als mini-ELEVA: de klant heeft geen account, het token in de
// URL is de sleutel. Validatie loopt via de admin-client.
// ============================================================

export type ResetKlantContext = {
  linkId: string;
  token: string;
  klantNaam: string;
  klantVoornaam: string;
  programmaSlug: "darm" | "reset" | "producten";
  stationSlug: string | null;
  status: "actief" | "gepauzeerd" | "gesloten";
  prospectId: string | null;
  /** Business-verhalen die deze klant al kreeg, samengevoegd over alle
   *  links van dezelfde prospect (darm → reset → basis telt als één mens). */
  touchpoints: string[];
  /** Bouwt zelf al mee aan de business → geen webshop-verhalen. */
  isBouwer: boolean;
  /** Sinds wanneer de klant in de huidige stap zit (voor dag 7-momenten). */
  stationSinds: string | null;
  /** Zelfgekozen startdatum (YYYY-MM-DD): vanaf dan telt dag 1. */
  startDatum: string | null;
  memberId: string;
  memberNaam: string | null;
  memberVoornaam: string;
  memberTelefoon: string | null;
};

export async function pakResetKlantContext(
  token: string,
): Promise<ResetKlantContext | null> {
  if (!token || token.length < 16) return null;
  const admin = createAdminClient();

  const { data: linkRaw } = await admin
    .from("resetcode_klant_links")
    .select(
      "id, token, member_id, klant_naam, programma, station_slug, status, prospect_id, touchpoints, is_bouwer, station_sinds, start_datum",
    )
    .eq("token", token)
    .maybeSingle();
  if (!linkRaw) return null;
  const link = linkRaw as {
    id: string;
    token: string;
    member_id: string;
    klant_naam: string;
    programma: "darm" | "reset" | "producten";
    station_slug: string | null;
    status: "actief" | "gepauzeerd" | "gesloten";
    prospect_id: string | null;
    touchpoints: unknown;
    is_bouwer: boolean | null;
    station_sinds: string | null;
    start_datum: string | null;
  };

  // Touchpoints samenvoegen over alle links van dezelfde prospect: wie
  // eerder het darmprogramma deed en nu de reset, krijgt het kern-verhaal
  // niet nog een keer.
  let touchpoints = Array.isArray(link.touchpoints)
    ? (link.touchpoints as string[])
    : [];
  if (link.prospect_id) {
    const { data: zusterLinks } = await admin
      .from("resetcode_klant_links")
      .select("touchpoints")
      .eq("prospect_id", link.prospect_id)
      .eq("member_id", link.member_id)
      .neq("id", link.id);
    for (const rij of (zusterLinks ?? []) as { touchpoints: unknown }[]) {
      if (Array.isArray(rij.touchpoints)) {
        touchpoints = touchpoints.concat(rij.touchpoints as string[]);
      }
    }
    touchpoints = Array.from(new Set(touchpoints));
  }

  const { data: memberRaw } = await admin
    .from("profiles")
    .select("full_name, telefoon")
    .eq("id", link.member_id)
    .maybeSingle();
  const member = memberRaw as {
    full_name?: string | null;
    telefoon?: string | null;
  } | null;

  const memberNaam = member?.full_name ?? null;
  return {
    linkId: link.id,
    token: link.token,
    klantNaam: link.klant_naam,
    klantVoornaam: link.klant_naam.split(" ")[0],
    programmaSlug: link.programma,
    stationSlug: link.station_slug,
    status: link.status,
    prospectId: link.prospect_id,
    touchpoints,
    isBouwer: Boolean(link.is_bouwer),
    stationSinds: link.station_sinds,
    startDatum: link.start_datum,
    memberId: link.member_id,
    memberNaam,
    memberVoornaam: (memberNaam ?? "").split(" ")[0] || "je begeleider",
    memberTelefoon: member?.telefoon ?? null,
  };
}

/** Chat-items van een link, oud → nieuw. */
export async function pakResetChats(linkId: string, limiet = 200) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("resetcode_chats")
    .select("van, soort, kaart, station_slug, tekst, created_at")
    .eq("link_id", linkId)
    .order("created_at", { ascending: true })
    .limit(limiet);
  return (data ?? []) as {
    van: "klant" | "mentor";
    soort: "tekst" | "kaart" | "foto";
    kaart: string | null;
    station_slug: string | null;
    tekst: string | null;
    created_at: string;
  }[];
}

/** Sla chat-items op (fire-and-forget vanuit routes). */
export async function bewaarResetChats(
  linkId: string,
  items: {
    van: "klant" | "mentor";
    soort: "tekst" | "kaart" | "foto";
    kaart?: string | null;
    stationSlug?: string | null;
    tekst?: string | null;
  }[],
) {
  if (!items.length) return;
  const admin = createAdminClient();
  await admin.from("resetcode_chats").insert(
    items.map((i) => ({
      link_id: linkId,
      van: i.van,
      soort: i.soort,
      kaart: i.kaart ?? null,
      station_slug: i.stationSlug ?? null,
      tekst: i.tekst ?? null,
    })),
  );
  await admin
    .from("resetcode_klant_links")
    .update({ laatste_activiteit: new Date().toISOString() })
    .eq("id", linkId);
}

/** Push-seintje naar de begeleider (member). Faalt stil. */
export async function seintjeNaarMember(
  ctx: ResetKlantContext,
  titel: string,
  detail: string,
) {
  try {
    await sendPushToUser(ctx.memberId, {
      title: titel,
      body: detail,
      // Klik door naar de klantenkaart als de link daaraan hangt,
      // anders naar het Mijn klanten-overzicht.
      url: ctx.prospectId ? `/namenlijst/${ctx.prospectId}` : "/resetcode-links",
      tag: `resetcode-${ctx.linkId}`,
    });
  } catch (e) {
    console.error("resetcode seintje mislukt:", e);
  }
}
