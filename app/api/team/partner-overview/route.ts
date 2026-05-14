import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { haalPartnerOverview } from "@/lib/team/partner-overview";

// ============================================================
// GET /api/team/partner-overview
//
// Returnt directe partners + 2e laag voor de ingelogde gebruiker.
// Server-helper roept SECURITY DEFINER-RPC aan; de RPC zelf doet
// de toegangscheck op auth.uid() = sponsorUserId.
// ============================================================

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const overview = await haalPartnerOverview(supabase, user.id);
    return NextResponse.json(overview);
  } catch (err) {
    console.error("partner-overview route exception:", err);
    return NextResponse.json({ error: "Onverwachte fout" }, { status: 500 });
  }
}
