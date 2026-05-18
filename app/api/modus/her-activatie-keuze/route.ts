import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/modus/her-activatie-keuze
// Body: { modus, keuze: "opnieuw" | "oppakken" }
//
// Wordt aangeroepen vanuit ModusSwitchBanner als de huidige modus
// eerder al actief is geweest. Bij "opnieuw": startdatum-veld voor
// die modus wordt op vandaag gezet, dag-teller begint weer bij 1.
// Bij "oppakken": startdatum-veld blijft staan, dag-teller rolt
// door vanaf de oude datum.
// ============================================================

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "niet ingelogd" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { modus, keuze } = body as {
    modus?: "sprint" | "core";
    keuze?: "opnieuw" | "oppakken";
  };

  if (modus !== "sprint" && modus !== "core") {
    return NextResponse.json({ error: "ongeldige modus" }, { status: 400 });
  }
  if (keuze !== "opnieuw" && keuze !== "oppakken") {
    return NextResponse.json({ error: "ongeldige keuze" }, { status: 400 });
  }

  const veld = modus === "sprint" ? "sprint_startdatum" : "core_startdatum";

  if (keuze === "opnieuw") {
    const today = new Date().toISOString().slice(0, 10);
    await supabase
      .from("profiles")
      .update({ [veld]: today })
      .eq("id", user.id);
  }
  // Bij "oppakken": niets aanpassen, de oude startdatum blijft staan.

  return NextResponse.json({ ok: true });
}
