import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// PATCH /api/pagina-blokken/[id]
//
// Body: { verplaats: 'omhoog' | 'omlaag' }
//   Wisselt volgorde-veld met buurman in dezelfde positie.
//
// DELETE /api/pagina-blokken/[id]
//   Verwijdert blok-rij + bijbehorend Storage-bestand (als upload-type).
//
// Founder-only (extra check + RLS).
// ============================================================

async function checkFounder(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<{ ok: boolean; userId: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, userId: null };
  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return {
    ok: (profiel as { role?: string } | null)?.role === "founder",
    userId: user.id,
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await checkFounder(supabase);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.userId ? "Geen toegang" : "Niet ingelogd" },
        { status: auth.userId ? 403 : 401 },
      );
    }

    const body = await req.json();
    const verplaats = body.verplaats as "omhoog" | "omlaag" | undefined;

    if (verplaats) {
      // Haal huidig blok op
      const { data: huidig } = await supabase
        .from("pagina_blokken")
        .select("pagina_namespace, pagina_id, positie, volgorde")
        .eq("id", id)
        .maybeSingle();
      if (!huidig) {
        return NextResponse.json(
          { error: "Blok niet gevonden" },
          { status: 404 },
        );
      }
      const h = huidig as {
        pagina_namespace: string;
        pagina_id: string;
        positie: string;
        volgorde: number;
      };

      // Vind buur in dezelfde positie met hogere/lagere volgorde
      let buurQuery = supabase
        .from("pagina_blokken")
        .select("id, volgorde")
        .eq("pagina_namespace", h.pagina_namespace)
        .eq("pagina_id", h.pagina_id)
        .eq("positie", h.positie);

      if (verplaats === "omhoog") {
        buurQuery = buurQuery
          .lt("volgorde", h.volgorde)
          .order("volgorde", { ascending: false });
      } else {
        buurQuery = buurQuery
          .gt("volgorde", h.volgorde)
          .order("volgorde", { ascending: true });
      }

      const { data: buur } = await buurQuery.limit(1);
      if (!buur || buur.length === 0) {
        return NextResponse.json(
          { error: "Geen buur om mee te wisselen" },
          { status: 400 },
        );
      }
      const b = buur[0] as { id: string; volgorde: number };

      // Wissel volgorde-velden via tijdelijke -1 om unique-conflict
      // op (positie, volgorde) te voorkomen — al hebben we geen unique
      // index, defensief patroon voor toekomstige strikt-sortering.
      await supabase
        .from("pagina_blokken")
        .update({ volgorde: -1 })
        .eq("id", id);
      await supabase
        .from("pagina_blokken")
        .update({ volgorde: h.volgorde })
        .eq("id", b.id);
      await supabase
        .from("pagina_blokken")
        .update({ volgorde: b.volgorde })
        .eq("id", id);
      return NextResponse.json({ ok: true });
    }

    // Andere PATCH-acties (inhoud bewerken) — voor nu alleen verplaats
    return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const auth = await checkFounder(supabase);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.userId ? "Geen toegang" : "Niet ingelogd" },
        { status: auth.userId ? 403 : 401 },
      );
    }

    // Haal storage_pad op om bestand op te ruimen
    const { data: blok } = await supabase
      .from("pagina_blokken")
      .select("storage_pad")
      .eq("id", id)
      .maybeSingle();
    const storagePad = (blok as { storage_pad: string | null } | null)
      ?.storage_pad;

    // Bestand uit storage verwijderen (admin-client want service-role nodig)
    if (storagePad) {
      try {
        const admin = createAdminClient();
        await admin.storage.from("pagina-media").remove([storagePad]);
      } catch {
        // Niet kritiek; rij wordt zo verwijderd
      }
    }

    const { error } = await supabase
      .from("pagina_blokken")
      .delete()
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
