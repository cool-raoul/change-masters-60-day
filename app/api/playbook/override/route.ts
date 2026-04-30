import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/playbook/override
//
// Body: { dagNummer: 1-21, titel?, watJeLeert?, faseDoel?,
//         waaromWerktDitTekst?, waaromWerktDitBron?, reset?: boolean }
//
// PARTIAL update: alleen velden die in de body staan worden gewijzigd.
// Velden die NIET in de body staan behouden hun bestaande waarde in
// de DB. Lege string ("") in de body betekent: zet veld terug op NULL
// (= valt terug op de standaardtekst uit dagen.ts).
//
// Reset-mode: { dagNummer, reset: true } verwijdert de hele override-
// rij voor deze dag in 1 klik.
// ============================================================

const VELDEN_MAP: Record<string, string> = {
  titel: "titel",
  watJeLeert: "wat_je_leert",
  faseDoel: "fase_doel",
  waaromWerktDitTekst: "waarom_werkt_dit_tekst",
  waaromWerktDitBron: "waarom_werkt_dit_bron",
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    // Founder-check via profile.role. RLS doet de echte gate, dit is
    // een snelle vroege return met nette error-tekst.
    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profiel as { role?: string | null } | null)?.role !== "founder") {
      return NextResponse.json(
        { error: "Geen toegang — alleen voor founders" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const dagNummer: number = body.dagNummer;
    if (!Number.isFinite(dagNummer) || dagNummer < 1 || dagNummer > 21) {
      return NextResponse.json(
        { error: "Ongeldig dagnummer" },
        { status: 400 },
      );
    }

    // Reset-mode: hele rij weg → fallback naar standaard
    if (body.reset === true) {
      const { error: delErr } = await supabase
        .from("playbook_overrides")
        .delete()
        .eq("dag_nummer", dagNummer);
      if (delErr) {
        return NextResponse.json(
          { error: "Reset mislukt: " + delErr.message },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, reset: true });
    }

    // Partial update: alleen velden die in de body staan worden gewijzigd.
    // Lees eerst de bestaande rij zodat we ongewijzigde velden kunnen
    // behouden (anders zou de upsert ze op NULL zetten).
    const { data: bestaand } = await supabase
      .from("playbook_overrides")
      .select(
        "titel, wat_je_leert, fase_doel, waarom_werkt_dit_tekst, waarom_werkt_dit_bron",
      )
      .eq("dag_nummer", dagNummer)
      .maybeSingle();

    const trim = (v: unknown) =>
      typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

    const huidig = (bestaand ?? {}) as Record<string, string | null>;

    const payload: Record<string, unknown> = {
      dag_nummer: dagNummer,
      updated_by: user.id,
    };
    for (const [bodyKey, dbKey] of Object.entries(VELDEN_MAP)) {
      if (Object.prototype.hasOwnProperty.call(body, bodyKey)) {
        // Veld zit in de body → trim & overschrijf
        payload[dbKey] = trim(body[bodyKey]);
      } else {
        // Veld zit NIET in de body → behoud bestaande waarde
        payload[dbKey] = huidig[dbKey] ?? null;
      }
    }

    // Als ALLE velden NULL zijn na merge: weg met de rij — schoon.
    const allesLeeg = Object.values(VELDEN_MAP).every(
      (k) => !payload[k],
    );
    if (allesLeeg) {
      const { error: delErr } = await supabase
        .from("playbook_overrides")
        .delete()
        .eq("dag_nummer", dagNummer);
      if (delErr) {
        return NextResponse.json(
          { error: "Opschonen mislukt: " + delErr.message },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, leeg: true });
    }

    const { error: upsertErr } = await supabase
      .from("playbook_overrides")
      .upsert(payload, { onConflict: "dag_nummer" });
    if (upsertErr) {
      return NextResponse.json(
        { error: "Opslaan mislukt: " + upsertErr.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("playbook/override exception:", e);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
