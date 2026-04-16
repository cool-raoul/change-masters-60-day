import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ gebruik: 0, limiet: 20, isPremium: false });
  }

  const vandaagStr = new Date().toISOString().split("T")[0];

  const [{ data: gebruik }, { data: profile }] = await Promise.all([
    supabase
      .from("coach_gebruik")
      .select("berichten_count")
      .eq("user_id", user.id)
      .eq("datum", vandaagStr)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("premium_tot")
      .eq("id", user.id)
      .single(),
  ]);

  const isPremium = profile?.premium_tot
    ? new Date(profile.premium_tot) >= new Date()
    : false;

  return NextResponse.json({
    gebruik: gebruik?.berichten_count || 0,
    limiet: 20,
    isPremium,
    premiumTot: profile?.premium_tot || null,
  });
}
