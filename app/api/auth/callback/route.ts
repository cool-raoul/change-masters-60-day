import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const sponsorId = searchParams.get("ref") || searchParams.get("team");
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const adminSupabase = createAdminClient();
      const effectieveSponsorId = sponsorId || data.user.user_metadata?.sponsor_id;

      if (effectieveSponsorId) {
        try {
          // 1. Sla sponsor_id op in profiles
          await adminSupabase
            .from("profiles")
            .update({ sponsor_id: effectieveSponsorId })
            .eq("id", data.user.id);

          // 2. Zoek prospect bij sponsor met hetzelfde e-mailadres → koppel automatisch
          const { data: prospect } = await adminSupabase
            .from("prospects")
            .select("id")
            .eq("user_id", effectieveSponsorId)
            .eq("email", data.user.email)
            .maybeSingle();

          if (prospect) {
            await adminSupabase
              .from("prospects")
              .update({ gekoppelde_user_id: data.user.id })
              .eq("id", prospect.id);
          }
        } catch (e) {
          console.error("Sponsor koppeling fout:", e);
        }
      }

      // 3. Maak onboarding voortgang aan
      try {
        await adminSupabase
          .from("onboarding_voortgang")
          .upsert({ user_id: data.user.id }, { onConflict: "user_id" });
      } catch (e) {
        console.error("Onboarding voortgang fout:", e);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
