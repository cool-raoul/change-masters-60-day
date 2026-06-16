import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leesMentorProfiel, patchMentorProfiel } from "@/lib/mentor-profiel/helpers";

// ============================================================
// POST /api/playbook/zin-bewaar
//
// Body: { slug: string, label: string, waarde: string,
//         bronDag?: number, bronTaak?: string, autoVink?: boolean }
//
// Slaat een eigen-zin op in `eigen_zinnen` (upsert op user+slug).
// Als autoVink=true en bronDag+bronTaak gevuld: vinkt de bijhorende
// playbook-taak ook automatisch af in dag_voltooiingen, zodat de
// member niet apart op de checkbox hoeft te klikken.
// ============================================================

const MAX_TEKENS_HARD = 5000; // safety bovenaan, per inlineActie kan strenger

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await req.json();
    const slug: string = body.slug;
    const label: string = body.label;
    const waarde: string = body.waarde;
    const bronDag: number | undefined = body.bronDag;
    const bronTaak: string | undefined = body.bronTaak;
    const autoVink: boolean = body.autoVink === true;

    if (!slug || typeof slug !== "string" || slug.length > 80) {
      return NextResponse.json({ error: "Ongeldige slug" }, { status: 400 });
    }
    if (!label || typeof label !== "string" || label.length > 200) {
      return NextResponse.json({ error: "Label ontbreekt" }, { status: 400 });
    }
    if (typeof waarde !== "string") {
      return NextResponse.json({ error: "Waarde ontbreekt" }, { status: 400 });
    }
    const trimmed = waarde.trim();
    if (trimmed.length === 0) {
      return NextResponse.json({ error: "Lege zin" }, { status: 400 });
    }
    if (trimmed.length > MAX_TEKENS_HARD) {
      return NextResponse.json(
        { error: `Te lang (max ${MAX_TEKENS_HARD} tekens)` },
        { status: 400 },
      );
    }

    const { error: upsertErr } = await supabase.from("eigen_zinnen").upsert(
      {
        user_id: user.id,
        slug: slug.trim(),
        label: label.trim(),
        waarde: trimmed,
        bron_dag:
          typeof bronDag === "number" && Number.isFinite(bronDag)
            ? bronDag
            : null,
        bron_taak:
          typeof bronTaak === "string" && bronTaak.length > 0
            ? bronTaak
            : null,
      },
      { onConflict: "user_id,slug" },
    );
    if (upsertErr) {
      console.error("eigen_zinnen upsert mislukt:", upsertErr);
      return NextResponse.json(
        { error: "Opslaan mislukt: " + upsertErr.message },
        { status: 500 },
      );
    }

    // Stem-capture: een eigen zin is een echt stem-voorbeeld. Voeg 'm toe aan
    // het Mentor-profiel (append, dedupe, cap 6), zodat de Mentor voortaan in
    // de eigen stem van de member kan schrijven. Niet fataal bij fout.
    try {
      if (trimmed.length <= 600) {
        const huidig = await leesMentorProfiel(user.id);
        const bestaand = Array.isArray(huidig.stemVoorbeelden)
          ? huidig.stemVoorbeelden
          : [];
        const gezien = new Set(bestaand.map((s) => s.trim().toLowerCase()));
        if (!gezien.has(trimmed.toLowerCase())) {
          const nieuw = [...bestaand, trimmed].slice(-6);
          await patchMentorProfiel(user.id, { stemVoorbeelden: nieuw });
        }
      }
    } catch (e) {
      console.warn("stem-capture mislukt (niet fataal):", e);
    }

    // Optioneel: vink de bijhorende playbook-taak af. Member hoeft dan
    // niet apart op de checkbox te klikken, bewaren = klaar.
    if (autoVink && typeof bronDag === "number" && bronTaak) {
      const { error: vinkErr } = await supabase.from("dag_voltooiingen").upsert(
        {
          user_id: user.id,
          dag_nummer: bronDag,
          taak_id: bronTaak,
          voltooid_op: new Date().toISOString(),
        },
        { onConflict: "user_id,dag_nummer,taak_id" },
      );
      if (vinkErr) {
        // Niet fataal, de zin is wel bewaard. Member kan handmatig vinken.
        console.error("auto-vink mislukt (niet fataal):", vinkErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("zin-bewaar exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
