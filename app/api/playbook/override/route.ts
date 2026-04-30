import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/playbook/override
//
// Body: { dagNummer: 1-21, titel?, watJeLeert?, faseDoel?,
//         waaromWerktDitTekst?, waaromWerktDitBron? }
//
// Founder-only. Slaat per dag een override op die het hardcoded
// dagen.ts overrijdt. Lege strings worden NULL → fallback naar de
// standaardtekst.
//
// Tweede mode: { dagNummer, reset: true } verwijdert de hele
// override-rij voor deze dag (handig om alles in 1 klik terug te
// zetten naar standaard).
// ============================================================

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

    const trim = (v: unknown) =>
      typeof v === "string" && v.trim().length > 0 ? v.trim() : null;

    const payload = {
      dag_nummer: dagNummer,
      titel: trim(body.titel),
      wat_je_leert: trim(body.watJeLeert),
      fase_doel: trim(body.faseDoel),
      waarom_werkt_dit_tekst: trim(body.waaromWerktDitTekst),
      waarom_werkt_dit_bron: trim(body.waaromWerktDitBron),
      updated_by: user.id,
    };

    // Als ALLE velden leeg zijn: weg met de rij — dat is hetzelfde
    // als reset, en houdt de tabel schoon.
    const ietsGevuld =
      payload.titel ||
      payload.wat_je_leert ||
      payload.fase_doel ||
      payload.waarom_werkt_dit_tekst ||
      payload.waarom_werkt_dit_bron;

    if (!ietsGevuld) {
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
