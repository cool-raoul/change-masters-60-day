import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================
// GET /api/resetcode/prospects?q=co
//
// Live-zoeken in de eigen namenlijst voor het klant-link-veld:
// terwijl het member typt, verschijnen de kaarten die matchen,
// zodat een nieuwe klant-link automatisch aan de juiste kaart
// gekoppeld wordt. RLS beperkt tot eigen prospects.
// ============================================================

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Niet ingelogd" }, { status: 401 });

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 1) return Response.json({ ok: true, prospects: [] });

  const veilig = q.replace(/([\\%_])/g, "\\$1");
  const { data } = await supabase
    .from("prospects")
    .select("id, volledige_naam, telefoon, pipeline_fase")
    .eq("gearchiveerd", false)
    .ilike("volledige_naam", `%${veilig}%`)
    .order("updated_at", { ascending: false })
    .limit(8);

  return Response.json({
    ok: true,
    prospects: (data ?? []).map((p) => ({
      id: (p as { id: string }).id,
      naam: (p as { volledige_naam: string | null }).volledige_naam ?? "",
      telefoon: (p as { telefoon: string | null }).telefoon,
      fase: (p as { pipeline_fase: string | null }).pipeline_fase,
    })),
  });
}
