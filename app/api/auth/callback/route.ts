import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const teamId = searchParams.get("team");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Als er een team parameter is, koppel de nieuwe gebruiker aan de uitnodiger
      const invitedBy = teamId || data.user.user_metadata?.invited_by;

      if (invitedBy) {
        try {
          // Sla de invited_by op in het profiel
          await supabase
            .from("profiles")
            .update({ invited_by: invitedBy })
            .eq("id", data.user.id);

          // Maak team_members koppeling
          await supabase
            .from("team_members")
            .upsert({
              leider_id: invitedBy,
              lid_id: data.user.id,
              uitgenodigd_op: new Date().toISOString(),
              toegetreden_op: new Date().toISOString(),
            }, {
              onConflict: "leider_id,lid_id",
            });
        } catch (e) {
          console.error("Team koppeling fout:", e);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
