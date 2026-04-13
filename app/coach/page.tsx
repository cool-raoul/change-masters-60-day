import { createClient } from "@/lib/supabase/server";
import { NieuwGesprekKnop } from "@/components/coach/NieuwGesprekKnop";
import { GesprekkenLijst } from "@/components/coach/GesprekkenLijst";

export default async function CoachPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: gesprekken }, { data: prospects }] = await Promise.all([
    supabase
      .from("ai_gesprekken")
      .select("*, prospect:prospects(volledige_naam)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("prospects")
      .select("id, volledige_naam, pipeline_fase")
      .eq("user_id", user.id)
      .eq("gearchiveerd", false)
      .order("volledige_naam"),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            🤖 AI Coach
          </h1>
          <p className="text-cm-white mt-1">
            Jouw persoonlijke DM & outreach coach — altijd klaar
          </p>
        </div>
        <NieuwGesprekKnop userId={user.id} prospects={prospects || []} />
      </div>

      {/* Info kaart */}
      <div className="card border-gold-subtle">
        <div className="flex gap-4">
          <div className="text-4xl">🎓</div>
          <div>
            <h2 className="text-cm-white font-semibold mb-1">
              Wat kan de coach voor jou doen?
            </h2>
            <ul className="text-cm-white text-sm space-y-1">
              <li>✓ DM-scripts schrijven op maat voor een specifiek prospect</li>
              <li>✓ Bezwaren behandelen met Feel-Felt-Found</li>
              <li>✓ Follow-up berichten formuleren</li>
              <li>✓ De Doel-Tijd-Termijn closing toepassen</li>
              <li>✓ Strategisch advies per pipeline-fase</li>
              <li>✓ Mindset coaching en motivatie op moeilijke momenten</li>
              <li>✓ Persoonlijke tips en adviezen voor jouw situatie</li>
              <li>✓ Accountability — houd jij je aan jouw dagelijkse acties?</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Eerdere gesprekken */}
      <div>
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
          Eerdere gesprekken
        </h2>

        <GesprekkenLijst gesprekken={gesprekken || []} />
      </div>
    </div>
  );
}
