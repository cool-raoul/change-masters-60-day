import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  // Alleen leider mag dit
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "leider") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { userId, maanden = 1 } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId vereist" }, { status: 400 });
  }

  // Bereken einddatum (X maanden vanaf nu)
  const einddatum = new Date();
  einddatum.setMonth(einddatum.getMonth() + maanden);

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("profiles")
    .update({ premium_tot: einddatum.toISOString().split("T")[0] })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    premium_tot: einddatum.toISOString().split("T")[0],
  });
}
