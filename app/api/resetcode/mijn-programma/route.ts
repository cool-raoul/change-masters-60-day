import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// POST /api/resetcode/mijn-programma  { programma }
//
// Een member start zijn EIGEN programma-omgeving (Mijn programma):
// een klant-link waarbij de sponsor de begeleider is (die krijgt de
// seintjes) en de bouwer-vlag aan staat (geen webshop-verhalen).
// klant_user_id koppelt de link aan dit account, zodat het
// privacy-schild de member zelf doorlaat en de sponsor blokkeert.
// ============================================================

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Niet ingelogd", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const programma = (body.programma as string | undefined) ?? "";
  if (!["darm", "reset", "producten"].includes(programma)) {
    return new Response("onbekend programma", { status: 400 });
  }

  const admin = createAdminClient();

  // Bestaande actieve eigen link? Dan die gewoon teruggeven.
  const { data: bestaand } = await admin
    .from("resetcode_klant_links")
    .select("token")
    .eq("klant_user_id", user.id)
    .eq("status", "actief")
    .order("created_at", { ascending: false })
    .limit(1);
  const bestaandToken = (bestaand as { token: string }[] | null)?.[0]?.token;
  if (bestaandToken) {
    return Response.json({ ok: true, token: bestaandToken });
  }

  const { data: profiel } = await admin
    .from("profiles")
    .select("full_name, sponsor_id")
    .eq("id", user.id)
    .maybeSingle();
  const p = profiel as {
    full_name?: string | null;
    sponsor_id?: string | null;
  } | null;
  const naam = (p?.full_name ?? "").trim() || "ELEVA-member";
  // Sponsor = begeleider; zonder sponsor (founder) is de member zijn
  // eigen begeleider (het schild laat hem door via klant_user_id).
  const begeleiderId = p?.sponsor_id ?? user.id;

  const token = `k-${randomUUID().replace(/-/g, "")}`;
  const { error } = await admin.from("resetcode_klant_links").insert({
    token,
    member_id: begeleiderId,
    klant_user_id: user.id,
    klant_naam: naam,
    programma,
    is_bouwer: true,
  });
  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ ok: true, token });
}
