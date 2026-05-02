import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/mentor-trainen/toggle
//
// Form-action: schakelt voorbeeld actief/uit. Body als FormData
// (uit de standaard form-submit op de admin-pagina).
// ============================================================

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const formData = await req.formData();
  const id = String(formData.get("id") ?? "");
  const actiefStr = String(formData.get("actief") ?? "true");
  const actief = actiefStr === "true";

  if (id) {
    await supabase
      .from("coach_voorbeelden")
      .update({ actief, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.redirect(
    new URL("/instellingen/mentor-trainen", req.url),
  );
}
