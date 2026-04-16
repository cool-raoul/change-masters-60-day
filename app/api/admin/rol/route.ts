import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  // Alleen leider mag rollen aanpassen
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "leider") {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { userId, rol } = await request.json();

  if (!userId || !["leider", "lid"].includes(rol)) {
    return NextResponse.json({ error: "userId en geldige rol vereist" }, { status: 400 });
  }

  // Mag niet de eigen rol veranderen
  if (userId === user.id) {
    return NextResponse.json({ error: "Je kunt je eigen rol niet wijzigen" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("profiles")
    .update({ role: rol })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, rol });
}
