import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// POST /api/mentor-trainen/verwijder
//
// Form-action: verwijdert voorbeeld definitief. Alleen founders
// (RLS doet de check). Body als FormData.
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

  if (id) {
    await supabase.from("coach_voorbeelden").delete().eq("id", id);
  }

  return NextResponse.redirect(
    new URL("/instellingen/mentor-trainen", req.url),
  );
}
