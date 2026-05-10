import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/pagina-blokken/upload
//
// Multipart form upload voor afbeelding/pdf naar Supabase Storage
// bucket 'pagina-media'. Founder-only.
//
// Velden:
//   bestand          (Blob)
//   paginaNamespace  (text)
//   paginaId         (text)
//
// Returns: { ok: true, storage_pad: string }
// ============================================================

const MAX_AFBEELDING_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

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

    const fd = await req.formData();
    const bestand = fd.get("bestand");
    const paginaNamespace = fd.get("paginaNamespace") as string | null;
    const paginaId = fd.get("paginaId") as string | null;

    if (!(bestand instanceof Blob) || !paginaNamespace || !paginaId) {
      return NextResponse.json(
        { error: "Ongeldige form-data" },
        { status: 400 },
      );
    }

    const ext = (bestand as File).name?.split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "pdf"].includes(ext)) {
      return NextResponse.json(
        { error: "Alleen JPG, PNG of PDF" },
        { status: 400 },
      );
    }

    const isPdf = ext === "pdf";
    const max = isPdf ? MAX_PDF_BYTES : MAX_AFBEELDING_BYTES;
    if (bestand.size > max) {
      return NextResponse.json(
        {
          error: `Bestand te groot (max ${isPdf ? "10MB" : "5MB"})`,
        },
        { status: 413 },
      );
    }

    const id = crypto.randomUUID();
    const path = `${paginaNamespace}/${paginaId}/${id}.${ext}`;
    const buffer = Buffer.from(await bestand.arrayBuffer());

    const admin = createAdminClient();
    const { error: upErr } = await admin.storage
      .from("pagina-media")
      .upload(path, buffer, {
        contentType: bestand.type,
        upsert: false,
      });
    if (upErr) {
      return NextResponse.json(
        { error: "Upload mislukt: " + upErr.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, storage_pad: path });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekende fout";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
