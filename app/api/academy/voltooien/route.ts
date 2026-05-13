import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geefLes } from "@/lib/academy/trainingen";

// ============================================================
// POST /api/academy/voltooien
// Body: { trainingSlug: string, lesSleutel: string }
//
// Markeert een les voor de huidige user als voltooid in
// training_voortgang. UPSERT, dus herhaalde aanroepen zijn
// idempotent (geen duplicates door de UNIQUE constraint).
// ============================================================

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  let body: { trainingSlug?: string; lesSleutel?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const { trainingSlug, lesSleutel } = body;
  if (!trainingSlug || !lesSleutel) {
    return NextResponse.json(
      { error: "trainingSlug en lesSleutel zijn verplicht" },
      { status: 400 },
    );
  }

  // Valideer dat de les bestaat in onze content (voorkomt
  // arbitraire 'voltooiing' van niet-bestaande les-sleutels).
  const bestaat = geefLes(trainingSlug, lesSleutel);
  if (!bestaat) {
    return NextResponse.json(
      { error: "Les bestaat niet in deze training" },
      { status: 404 },
    );
  }

  // UPSERT op de unique-key (user_id, training_slug, les_sleutel).
  // Bij conflict: 'updated_at' wordt aangepast, voltooid_op blijft
  // de oorspronkelijke. Dat past bij onze definitie: voltooid_op
  // = eerste keer afgevinkt.
  const { error } = await supabase
    .from("training_voortgang")
    .upsert(
      {
        user_id: user.id,
        training_slug: trainingSlug,
        les_sleutel: lesSleutel,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,training_slug,les_sleutel",
        ignoreDuplicates: false,
      },
    );

  if (error) {
    return NextResponse.json(
      { error: `Opslaan mislukt: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
