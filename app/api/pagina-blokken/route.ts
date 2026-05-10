import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { haalPaginaBlokken, blokkenAlsRecord } from "@/lib/cms/pagina-blokken";

// ============================================================
// GET /api/pagina-blokken?namespace=X&id=Y
//
// Haalt alle blokken voor een pagina op (gegroepeerd per positie),
// inclusief signed URLs voor afbeelding/pdf. Voor client-side fetch
// vanuit pagina's die niet als server-component werken (zoals
// onboarding/page.tsx, een client-state-machine).
//
// Auth: alleen ingelogde users.
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const namespace = req.nextUrl.searchParams.get("namespace");
    const id = req.nextUrl.searchParams.get("id");
    if (!namespace || !id) {
      return NextResponse.json(
        { error: "namespace en id vereist" },
        { status: 400 },
      );
    }

    // Admin-client voor signed-URL-generatie (bucket privé)
    const admin = createAdminClient();
    const map = await haalPaginaBlokken(admin, namespace, id);
    return NextResponse.json({
      ok: true,
      blokken: blokkenAlsRecord(map),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ============================================================
// POST /api/pagina-blokken
//
// Body: {
//   pagina_namespace, pagina_id, positie, type,
//   inhoud (jsonb), storage_pad? (alleen bij upload-types)
// }
//
// Voegt een nieuw blok toe op de gegeven positie. Volgorde wordt
// auto-toegekend (max(huidige) + 1). Founder-only (extra check
// naast RLS-policy om duidelijke 403 te geven i.p.v. RLS-fout).
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

    const { data: profiel } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if ((profiel as { role?: string } | null)?.role !== "founder") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const body = await req.json();
    const {
      pagina_namespace,
      pagina_id,
      positie,
      type,
      inhoud,
      storage_pad,
    } = body;

    if (!pagina_namespace || !pagina_id || !positie || !type || !inhoud) {
      return NextResponse.json(
        { error: "Vereiste velden ontbreken" },
        { status: 400 },
      );
    }
    if (!["video", "afbeelding", "pdf", "audio", "quote"].includes(type)) {
      return NextResponse.json({ error: "Ongeldig type" }, { status: 400 });
    }

    // Bepaal volgende volgorde-waarde voor deze positie
    const { data: bestaande } = await supabase
      .from("pagina_blokken")
      .select("volgorde")
      .eq("pagina_namespace", pagina_namespace)
      .eq("pagina_id", pagina_id)
      .eq("positie", positie)
      .order("volgorde", { ascending: false })
      .limit(1);
    const nieuweVolgorde =
      bestaande && bestaande.length > 0
        ? (bestaande[0] as { volgorde: number }).volgorde + 1
        : 0;

    const { data, error } = await supabase
      .from("pagina_blokken")
      .insert({
        pagina_namespace,
        pagina_id,
        positie,
        volgorde: nieuweVolgorde,
        type,
        inhoud,
        storage_pad: storage_pad ?? null,
        updated_by: user.id,
      })
      .select("id")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: (data as { id: string }).id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
