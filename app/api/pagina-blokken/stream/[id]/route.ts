import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// GET /api/pagina-blokken/stream/[id]
//
// Streamt het storage-bestand van een blok via onze eigen origin met
// correcte HTTP-headers (Content-Type, Content-Length, Accept-Ranges,
// 206-Range-responses). Zelfde patroon als /api/mini-eleva/voice —
// nodig om iOS Safari <audio>-cutoff op signed-URLs te omzeilen.
//
// Gebruikt voor audio-blokken; werkt ook voor afbeelding/pdf maar
// die hebben dat (nog) niet nodig.
//
// Auth: alleen ingelogde users.
// ============================================================

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: blok } = await admin
      .from("pagina_blokken")
      .select("type, storage_pad")
      .eq("id", id)
      .maybeSingle();
    if (!blok) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }
    const blokRow = blok as { type: string; storage_pad: string | null };
    if (!blokRow.storage_pad) {
      return NextResponse.json(
        { error: "Geen bestand bij dit blok" },
        { status: 404 },
      );
    }

    const { data: download, error: dlErr } = await admin.storage
      .from("pagina-media")
      .download(blokRow.storage_pad);
    if (dlErr || !download) {
      return NextResponse.json(
        { error: "Bestand niet te laden: " + (dlErr?.message ?? "onbekend") },
        { status: 500 },
      );
    }

    const ext = blokRow.storage_pad.split(".").pop()?.toLowerCase() ?? "bin";
    const contentType =
      ext === "wav"
        ? "audio/wav"
        : ext === "mp3"
          ? "audio/mpeg"
          : ext === "m4a"
            ? "audio/mp4"
            : ext === "ogg"
              ? "audio/ogg"
              : ext === "webm"
                ? "audio/webm"
                : ext === "jpg" || ext === "jpeg"
                  ? "image/jpeg"
                  : ext === "png"
                    ? "image/png"
                    : ext === "pdf"
                      ? "application/pdf"
                      : "application/octet-stream";

    const arrayBuffer = await download.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const totalLength = bytes.byteLength;

    // Range-request ondersteuning voor <audio>-playback
    const range = req.headers.get("range");
    if (range) {
      const match = /^bytes=(\d+)-(\d+)?$/.exec(range);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : totalLength - 1;
        if (start >= 0 && end < totalLength && start <= end) {
          const slice = bytes.slice(start, end + 1);
          return new Response(slice, {
            status: 206,
            headers: {
              "Content-Type": contentType,
              "Content-Length": String(slice.byteLength),
              "Content-Range": `bytes ${start}-${end}/${totalLength}`,
              "Accept-Ranges": "bytes",
              "Cache-Control": "private, max-age=3600",
            },
          });
        }
      }
    }

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(totalLength),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Onbekend";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
