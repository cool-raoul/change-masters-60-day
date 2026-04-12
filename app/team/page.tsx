import { createClient } from "@/lib/supabase/server";
import { differenceInDays } from "date-fns";
import KopieerLink from "@/components/team/KopieerLink";

const RUN_START = new Date("2026-04-12");

export default async function TeamPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: teamleden } = await supabase
    .from("team_members")
    .select("lid_id, toegetreden_op, profiles:lid_id(full_name, email, run_startdatum)")
    .eq("leider_id", user.id);

  const dag = Math.max(1, Math.min(60, differenceInDays(new Date(), RUN_START) + 1));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            Mijn Team
          </h1>
          <p className="text-cm-muted mt-1">
            Dag {dag} van 60 — {teamleden?.length || 0} teamleden
          </p>
        </div>
      </div>

      {/* Uitnodigingslink */}
      <div className="card border-gold-subtle">
        <h2 className="text-cm-gold font-semibold mb-2">🔗 Teamlid uitnodigen</h2>
        <p className="text-cm-muted text-sm mb-3">
          Stuur dit registratielink naar je nieuwe teamleden. Ze worden
          automatisch aan jouw team gekoppeld.
        </p>
        <KopieerLink userId={user.id} />
      </div>

      {/* Teamleden lijst */}
      {!teamleden || teamleden.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-cm-white font-semibold mb-2">
            Nog geen teamleden
          </p>
          <p className="text-cm-muted text-sm">
            Deel de uitnodigingslink hierboven om je eerste teamlid toe te voegen.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {teamleden.map((lid) => (
            <div key={lid.lid_id} className="card flex items-center justify-between">
              <div>
                <p className="text-cm-white font-semibold">
                  {(lid.profiles as unknown as { full_name: string })?.full_name || "Teamlid"}
                </p>
                <p className="text-cm-muted text-sm">
                  {(lid.profiles as unknown as { email: string })?.email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-cm-gold text-sm">
                  {lid.toegetreden_op ? "✓ Actief" : "⏳ Uitgenodigd"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
