import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NieuwGesprekKnop } from "@/components/coach/NieuwGesprekKnop";
import { GesprekkenLijst } from "@/components/coach/GesprekkenLijst";
import { ProductadviesAlgemeenKnop } from "@/components/coach/ProductadviesAlgemeenKnop";
import { productadviesBeschikbaar } from "@/lib/features/productadvies";
import { getServerTaal, v } from "@/lib/i18n/server";

export default async function CoachPagina({
  searchParams,
}: {
  searchParams: Promise<{ prospect?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Als ?prospect=ID in de URL staat (klik vanaf prospect-kaart): start
  // automatisch een nieuw coach-gesprek met die prospect als context. Zo hoeft
  // de member niet opnieuw te selecteren — de mentor weet direct over wie het
  // gaat. We checken eerst of de prospect bestaat en van deze member is.
  const sp = await searchParams;
  const prospectIdParam = sp.prospect;
  if (prospectIdParam) {
    const { data: prospectVoor } = await supabase
      .from("prospects")
      .select("id, volledige_naam")
      .eq("id", prospectIdParam)
      .eq("user_id", user.id)
      .maybeSingle();
    if (prospectVoor) {
      const { data: nieuw } = await supabase
        .from("ai_gesprekken")
        .insert({
          user_id: user.id,
          prospect_id: prospectVoor.id,
          titel: `Over ${prospectVoor.volledige_naam}`,
          berichten: [],
        })
        .select("id")
        .single();
      if (nieuw?.id) {
        redirect(`/coach/${nieuw.id}`);
      }
    }
  }

  const taal = await getServerTaal();

  const [{ data: gesprekken }, { data: prospects }, { data: eigenProfiel }] = await Promise.all([
    supabase.from("ai_gesprekken").select("*, prospect:prospects(volledige_naam)").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(20),
    supabase.from("prospects").select("id, volledige_naam, pipeline_fase").eq("user_id", user.id).eq("gearchiveerd", false).order("volledige_naam"),
    supabase.from("profiles").select("role").eq("id", user.id).single(),
  ]);

  const toonProductadvies = productadviesBeschikbaar((eigenProfiel as { role?: string | null } | null)?.role);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            🤖 {v("coach.titel", taal)}
          </h1>
          <p className="text-cm-white mt-1">{v("coach.subtitel", taal)}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {toonProductadvies && <ProductadviesAlgemeenKnop userId={user.id} />}
          <NieuwGesprekKnop userId={user.id} prospects={prospects || []} />
        </div>
      </div>

      {/* Info kaart */}
      <div className="card border-gold-subtle">
        <div className="flex gap-4">
          <div className="text-4xl">🎓</div>
          <div>
            <h2 className="text-cm-white font-semibold mb-2">{v("coach.wat_kan", taal)}</h2>
            <ul className="text-cm-white text-sm space-y-1">
              <li>✓ {v("coach.kan_drieweg", taal)}</li>
              <li>✓ {v("coach.kan_dm", taal)}</li>
              <li>✓ {v("coach.kan_bezwaar", taal)}</li>
              <li>✓ {v("coach.kan_followup", taal)}</li>
              <li>✓ {v("coach.kan_closing", taal)}</li>
              <li>✓ {v("coach.kan_strategie", taal)}</li>
              <li>✓ {v("coach.kan_mindset", taal)}</li>
              <li>✓ {v("coach.kan_accountability", taal)}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Eerdere gesprekken */}
      <div>
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
          {v("coach.eerdere", taal)}
        </h2>
        <GesprekkenLijst gesprekken={gesprekken || []} />
      </div>
    </div>
  );
}
