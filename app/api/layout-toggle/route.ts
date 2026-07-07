import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Zet de nieuwe layout aan/uit voor het eigen account. Alleen founders en
// testers (de preview-groep); voor de rest bestaat de schakelaar niet.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role, is_tester")
    .eq("id", user.id)
    .maybeSingle();
  const p = profiel as { role?: string | null; is_tester?: boolean | null } | null;
  if (p?.role !== "founder" && p?.is_tester !== true) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const aan = body.aan === true;

  const { error } = await supabase
    .from("profiles")
    .update({ nieuwe_layout: aan })
    .eq("id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, aan });
}
