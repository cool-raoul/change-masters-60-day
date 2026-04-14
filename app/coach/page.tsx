import { createClient } from "@/lib/supabase/server";
import { NieuwGesprekKnop } from "@/components/coach/NieuwGesprekKnop";
import { GesprekkenLijst } from "@/components/coach/GesprekkenLijst";
import { getServerTaal, v } from "@/lib/i18n/server";

export default async function CoachPagina() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const taal = await getServerTaal();

  const [{ data: gesprekken }, { data: prospects }] = await Promise.all([
    supabase.from("ai_gesprekken").select("*, prospect:prospects(volledige_naam)").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(20),
    supabase.from("prospects").select("id, volledige_naam, pipeline_fase").eq("user_id", user.id).eq("gearchiveerd", false).order("volledige_naam"),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            🤖 {v("coach.titel", taal)}
          </h1>
          <p className="text-cm-white mt-1">{v("coach.subtitel", taal)}</p>
        </div>
        <NieuwGesprekKnop userId={user.id} prospects={prospects || []} />
      </div>

      {/* Info kaart */}
      <div className="card border-gold-subtle">
        <div className="flex gap-4">
          <div className="text-4xl">🎓</div>
          <div>
            <h2 className="text-cm-white font-semibold mb-2">{v("coach.wat_kan", taal)}</h2>
            <ul className="text-cm-white text-sm space-y-1">
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
