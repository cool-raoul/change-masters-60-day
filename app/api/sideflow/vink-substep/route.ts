// File: app/api/sideflow/vink-substep/route.ts
//
// POST endpoint om een substep binnen een sideflow (pre-post of
// 21-dagen-post) af te vinken of weer ongedaan te maken. Slaat op in
// core_v6_substep_voltooiingen met ankerstap_nummer = 0 (sideflow-
// marker, onderscheidt zich van Core-ankerstappen 1-21).
//
// Verhuisd uit /api/core-v9/vink-substep op 2026-05-31, na verwijdering
// van /core-v9 member-routes. Bug-fix in deze verhuizing: de oude API
// rejecteerde ankerstap < 1, waardoor sideflow-vinking effectief faalde.

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/push/sendPush";
import { logTeamSeintje } from "@/lib/team/seintjes";

const SIDEFLOW_ANKERSTAP_MARKER = 0;

// Cruciale momenten waar de sponsor van wil weten (feedback Raoul 28
// juli: geen ruis per stap, wél de betekenisvolle keuzes en resultaten,
// in resultaat-taal). {n} = voornaam/naam van het teamlid.
const CRUCIALE_MOMENTEN: Record<string, string> = {
  "core-v9-sideflow-prepost-1-uitleg":
    "{n} heeft gekozen voor de pre-post 🌱",
  "core-v9-sideflow-21dagen-1-uitleg":
    "{n} heeft gekozen voor de 21-dagen-post 🌱",
  "core-v9-sideflow-prepost-5-plaatsen":
    "{n} heeft de pre-post geplaatst op social media 🎉",
  "core-v9-sideflow-21dagen-6-plaatsen":
    "{n} heeft de 21-dagen-post geplaatst op social media 🎉",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Niet ingelogd" },
      { status: 401 },
    );
  }

  let payload: { taakId?: string; voltooid?: boolean };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ongeldige body" },
      { status: 400 },
    );
  }

  const taakId = String(payload.taakId ?? "");
  const voltooid = Boolean(payload.voltooid);

  if (!taakId) {
    return NextResponse.json(
      { ok: false, error: "taakId vereist" },
      { status: 400 },
    );
  }

  try {
    if (voltooid) {
      // Voor de cruciale-momenten-melding: was deze stap al eens gedaan?
      // (Alleen bij de EERSTE keer een sponsor-seintje, her-vinken niet.)
      const { data: bestond } = await supabase
        .from("core_v6_substep_voltooiingen")
        .select("taak_id")
        .eq("user_id", user.id)
        .eq("ankerstap_nummer", SIDEFLOW_ANKERSTAP_MARKER)
        .eq("taak_id", taakId)
        .maybeSingle();
      const { error } = await supabase
        .from("core_v6_substep_voltooiingen")
        .upsert(
          {
            user_id: user.id,
            ankerstap_nummer: SIDEFLOW_ANKERSTAP_MARKER,
            taak_id: taakId,
            voltooid_op: new Date().toISOString(),
          },
          { onConflict: "user_id,ankerstap_nummer,taak_id" },
        );
      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 },
        );
      }
      // Cruciaal moment + eerste keer -> sponsor weet wat er ECHT is
      // gedaan ("heeft gekozen voor de 21-dagen-post"), met teruglees-log.
      if (!bestond && CRUCIALE_MOMENTEN[taakId]) {
        try {
          const admin = createAdminClient();
          const { data: profiel } = await admin
            .from("profiles")
            .select("full_name, sponsor_id")
            .eq("id", user.id)
            .maybeSingle();
          const sponsorId = (profiel as any)?.sponsor_id as string | null;
          const naam =
            ((profiel as any)?.full_name as string | null) || "Een teamlid";
          if (sponsorId) {
            const titel = CRUCIALE_MOMENTEN[taakId].replaceAll("{n}", naam);
            await sendPushToUser(sponsorId, {
              title: titel,
              body: "Tik om de voortgang te bekijken.",
              url: `/team?lid=${user.id}`,
              tag: `sideflow-${user.id}-${taakId}`,
            });
            await logTeamSeintje(sponsorId, user.id, titel, null);
          }
        } catch (e) {
          console.warn("cruciaal-moment-seintje mislukt (niet fataal):", e);
        }
      }
    } else {
      const { error } = await supabase
        .from("core_v6_substep_voltooiingen")
        .delete()
        .eq("user_id", user.id)
        .eq("ankerstap_nummer", SIDEFLOW_ANKERSTAP_MARKER)
        .eq("taak_id", taakId);
      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 },
        );
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "onbekend" },
      { status: 500 },
    );
  }
}
