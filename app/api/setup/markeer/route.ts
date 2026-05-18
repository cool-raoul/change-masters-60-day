import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markeerVoltooid, type Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// POST /api/setup/markeer
// Body: { slug }
// Schrijft een admin-item als voltooid in onboarding_voltooiingen
// onder de huidige user-modus.
// ============================================================

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "niet ingelogd" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { slug } = body as { slug?: string };
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug ontbreekt" }, { status: 400 });
  }

  const { data: prof } = await supabase
    .from("profiles")
    .select("modus")
    .eq("id", user.id)
    .maybeSingle();
  const modus = ((prof as { modus?: string | null } | null)?.modus ?? "sprint") as Modus;

  await markeerVoltooid(supabase, user.id, slug, modus, { via: "setup" });
  return NextResponse.json({ ok: true });
}
