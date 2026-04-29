import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { DAGEN } from "@/lib/playbook/dagen";

// ============================================================
// POST /api/playbook/vink-af
//
// Body: { dagNummer: number, taakId: string, vink: boolean }
//
// vink=true: insert rij in dag_voltooiingen + push naar sponsor
//            (alleen eerste keer voltooien, geen dubbele meldingen)
// vink=false: delete rij (uitvinken)
//
// Sponsor-notificatie via push: zo ziet de sponsor in zijn bel hoe
// de starter dag voor dag vordert. Eerste 21 dagen vooral relevant.
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await req.json();
    const dagNummer: number = body.dagNummer;
    const taakId: string = body.taakId;
    const vink: boolean = body.vink;

    if (!Number.isFinite(dagNummer) || dagNummer < 1 || dagNummer > 60) {
      return NextResponse.json(
        { error: "Ongeldig dagNummer" },
        { status: 400 },
      );
    }
    if (!taakId || typeof taakId !== "string") {
      return NextResponse.json({ error: "Taak-id ontbreekt" }, { status: 400 });
    }

    if (vink) {
      // Insert — gebruik upsert voor idempotentie. Onconflict op de
      // unieke (user_id, dag_nummer, taak_id) constraint.
      const { error: insertErr } = await supabase
        .from("dag_voltooiingen")
        .upsert(
          {
            user_id: user.id,
            dag_nummer: dagNummer,
            taak_id: taakId,
            voltooid_op: new Date().toISOString(),
          },
          { onConflict: "user_id,dag_nummer,taak_id" },
        );
      if (insertErr) {
        console.error("Vink-af insert mislukt:", insertErr);
        return NextResponse.json(
          { error: "Opslaan mislukt: " + insertErr.message },
          { status: 500 },
        );
      }

      // Sponsor-push — best-effort. We sturen één push per voltooide taak.
      // De sponsor ziet zo realtime hoe de eerste 21 dagen verlopen.
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, sponsor_id")
          .eq("id", user.id)
          .maybeSingle();
        const sponsorId = (profile as any)?.sponsor_id as string | null;
        const memberNaam = (profile as any)?.full_name as string | null;
        if (sponsorId && memberNaam) {
          // Vind label van de taak in DAGEN voor in de push-tekst.
          const dag = DAGEN.find((d) => d.nummer === dagNummer);
          const taak = dag?.vandaagDoen.find((t) => t.id === taakId);
          const taakLabel = taak?.label || taakId;
          const adminClient = createAdminClient();
          // Vermijd dubbele pushes: alleen sturen als we via de admin-
          // client zien dat dit de EERSTE keer is dat deze taak op deze
          // dag voor deze user is voltooid. We checken op count = 1
          // (eigenlijk net na de upsert is het 1; bij her-vinken stopt de
          // upsert via onconflict en is count nog steeds 1, maar dan
          // is voltooid_op niet net nu — dus checken we daarop).
          const tienSecondenGeleden = new Date(
            Date.now() - 10_000,
          ).toISOString();
          const { data: rij } = await adminClient
            .from("dag_voltooiingen")
            .select("voltooid_op")
            .eq("user_id", user.id)
            .eq("dag_nummer", dagNummer)
            .eq("taak_id", taakId)
            .gte("voltooid_op", tienSecondenGeleden)
            .maybeSingle();
          if (rij) {
            await sendPushToUser(sponsorId, {
              title: `${memberNaam} — dag ${dagNummer} stap voltooid`,
              body: taakLabel,
              url: "/team",
              tag: `playbook-${user.id}-dag${dagNummer}`,
            });
          }
        }
      } catch (pushErr) {
        // Push-fouten zijn niet fataal — checkbox is wel gewoon opgeslagen
        console.error("Sponsor-push mislukt (niet fataal):", pushErr);
      }

      return NextResponse.json({ ok: true, voltooid: true });
    } else {
      // Uitvinken — delete de rij
      const { error: deleteErr } = await supabase
        .from("dag_voltooiingen")
        .delete()
        .eq("user_id", user.id)
        .eq("dag_nummer", dagNummer)
        .eq("taak_id", taakId);
      if (deleteErr) {
        console.error("Uitvink delete mislukt:", deleteErr);
        return NextResponse.json(
          { error: "Verwijderen mislukt: " + deleteErr.message },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, voltooid: false });
    }
  } catch (e) {
    console.error("Vink-af exception:", e);
    return NextResponse.json(
      { error: "Onverwachte fout" },
      { status: 500 },
    );
  }
}
