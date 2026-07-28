import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push/sendPush";
import { logTeamSeintje } from "@/lib/team/seintjes";
import { dagVoorModusEnNummer } from "@/lib/playbook/dagen-voor-modus";
import type { Modus } from "@/lib/onboarding/voltooiingen";

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

    // Dag 0 = Jouw voorbereiding (volwaardige dag in de flow).
    if (!Number.isFinite(dagNummer) || dagNummer < 0 || dagNummer > 60) {
      return NextResponse.json(
        { error: "Ongeldig dagNummer" },
        { status: 400 },
      );
    }
    if (!taakId || typeof taakId !== "string") {
      return NextResponse.json({ error: "Taak-id ontbreekt" }, { status: 400 });
    }

    if (vink) {
      // Insert, gebruik upsert voor idempotentie. Onconflict op de
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

      // Sponsor-push, best-effort. ÉÉN rustig bericht per dag (feedback
      // Raoul 28 juli): pas als ALLE stappen van de dag zijn afgevinkt,
      // in resultaat-taal. Elke losse stap pushen was te onrustig, en de
      // taak-instructietekst las als een opdracht aan de sponsor.
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, sponsor_id, modus")
          .eq("id", user.id)
          .maybeSingle();
        const sponsorId = (profile as any)?.sponsor_id as string | null;
        const memberNaam = (profile as any)?.full_name as string | null;
        if (sponsorId && memberNaam) {
          // Dag-taken MODUS-BEWUST opzoeken (Core en Sprint hebben elk
          // hun eigen lijsten).
          const modus = (((profile as any)?.modus as string | null) ??
            "sprint") as Modus;
          const dag = dagVoorModusEnNummer(modus, dagNummer);
          const taken = dag?.vandaagDoen ?? [];
          const adminClient = createAdminClient();
          // Is de dag hiermee compleet?
          const { data: klaarRijen } = await adminClient
            .from("dag_voltooiingen")
            .select("taak_id")
            .eq("user_id", user.id)
            .eq("dag_nummer", dagNummer);
          const klaarSet = new Set(
            ((klaarRijen ?? []) as { taak_id: string }[]).map(
              (r) => r.taak_id,
            ),
          );
          const dagCompleet =
            taken.length > 0 && taken.every((t) => klaarSet.has(t.id));
          // Dedup: alleen pushen als DEZE afvink (die de dag compleet
          // maakte) net gebeurde; bij her-vinken is voltooid_op ouder.
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
          if (dagCompleet && rij) {
            const titel = `${memberNaam} heeft dag ${dagNummer} afgerond 🎉`;
            await sendPushToUser(sponsorId, {
              title: titel,
              body: `Alle ${taken.length} stappen van dag ${dagNummer} zijn gedaan. Tik om de voortgang te bekijken.`,
              // Direct naar het juiste teamlid: /team licht de kaart op
              // en toont daar de seintjes (feedback Raoul 28 juli).
              url: `/team?lid=${user.id}`,
              tag: `playbook-${user.id}-dag${dagNummer}`,
            });
            await logTeamSeintje(
              sponsorId,
              user.id,
              titel,
              `Gedaan: ${taken.map((t) => t.label).join(" · ")}`.slice(0, 500),
            );
          }
        }
      } catch (pushErr) {
        // Push-fouten zijn niet fataal, checkbox is wel gewoon opgeslagen
        console.error("Sponsor-push mislukt (niet fataal):", pushErr);
      }

      return NextResponse.json({ ok: true, voltooid: true });
    } else {
      // Uitvinken, delete de rij
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
