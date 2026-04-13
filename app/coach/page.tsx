import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { NieuwGesprekKnop } from "@/components/coach/NieuwGesprekKnop";

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
            </ul>
          </div>
        </div>
      </div>

      {/* Eerdere gesprekken */}
      <div>
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider mb-3">
          Eerdere gesprekken
        </h2>

        {(!gesprekken || gesprekken.length === 0) ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-cm-white">
              Nog geen gesprekken. Start een nieuw gesprek met de coach!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {gesprekken.map((g) => (
              <Link
                key={g.id}
                href={`/coach/${g.id}`}
                className="card hover:border-cm-gold-dim transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-cm-white font-medium text-sm">
                    {g.titel || "Gesprek met coach"}
                  </p>
                  <p className="text-cm-white text-xs mt-0.5">
                    {g.prospect?.volledige_naam ? `👤 ${g.prospect.volledige_naam} • ` : ""}
                    {g.berichten?.length || 0} berichten •{" "}
                    {format(new Date(g.updated_at), "d MMM HH:mm", { locale: nl })}
                  </p>
                </div>
                <span className="text-cm-white">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
