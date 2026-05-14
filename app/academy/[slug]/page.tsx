import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  geefTraining,
  totaalAantalLessen,
  eerstvolgendeLes,
  isLesVergrendeld,
} from "@/lib/academy/trainingen";

// ============================================================
// /academy/[slug]
//
// Detail-overzicht van één training: alle modules + lessen, met
// voltooide vinkjes per les. Klikbaar door naar individuele
// les-pagina's.
//
// Inclusief 'Doorgaan'-knop bovenaan die naar de eerstvolgende
// niet-voltooide les springt.
// ============================================================

export const dynamic = "force-dynamic";

export default async function AcademyTrainingPagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const training = geefTraining(slug);
  if (!training) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Haal voortgang voor deze training op.
  const { data: voortgangRows } = await supabase
    .from("training_voortgang")
    .select("les_sleutel")
    .eq("user_id", user.id)
    .eq("training_slug", slug);

  const voltooid = new Set(
    ((voortgangRows as Array<{ les_sleutel: string }> | null) ?? []).map(
      (r) => r.les_sleutel,
    ),
  );

  const totaal = totaalAantalLessen(training);
  const procent = totaal > 0 ? Math.round((voltooid.size / totaal) * 100) : 0;
  const volgende = eerstvolgendeLes(training, voltooid);

  return (
    <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">
      {/* Terug-knop */}
      <Link
        href="/academy"
        className="text-cm-white/60 hover:text-cm-white text-sm flex items-center gap-1"
      >
        ← Terug naar Academy
      </Link>

      {/* Header met training-titel + voortgang */}
      <div className="space-y-3">
        <div className="flex items-start gap-4">
          <div className="text-5xl flex-shrink-0">{training.emoji}</div>
          <div className="flex-1 space-y-2">
            <h1 className="font-serif-warm text-3xl text-cm-white">
              {training.titel}
            </h1>
            <p className="text-cm-white/70 leading-relaxed">
              {training.pitch}
            </p>
          </div>
        </div>

        {/* Voortgangsbalk */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-cm-white/70">
              <strong className="text-cm-gold">{voltooid.size}</strong> van{" "}
              {totaal} lessen voltooid
            </span>
            <span className="text-cm-gold font-semibold">{procent}%</span>
          </div>
          <div className="h-2 bg-cm-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-cm-gold transition-all"
              style={{ width: `${procent}%` }}
            />
          </div>
        </div>

        {/* Doorgaan-knop bovenin als er nog lessen open zijn */}
        {volgende && (
          <Link
            href={`/academy/${slug}/les/${volgende}`}
            className="btn-gold inline-flex items-center gap-2 text-sm font-semibold"
          >
            {voltooid.size === 0 ? "▶ Start eerste les" : "▶ Doorgaan waar je was"}
          </Link>
        )}
        {!volgende && (
          <div className="rounded-xl bg-emerald-900/30 border border-emerald-500/40 px-4 py-3">
            <p className="text-emerald-300 font-semibold text-sm">
              🎉 Alle lessen voltooid! Tijd om je 30-dagen-plan in actie te
              brengen.
            </p>
          </div>
        )}
      </div>

      {/* Modules-lijst */}
      <div className="space-y-3">
        {training.modules.map((mod) => {
          const lesseninModule = mod.lessen.length;
          const voltooidInModule = mod.lessen.filter((l) =>
            voltooid.has(l.sleutel),
          ).length;
          const moduleProcent =
            lesseninModule > 0
              ? Math.round((voltooidInModule / lesseninModule) * 100)
              : 0;
          const moduleIsKlaar = voltooidInModule === lesseninModule;

          return (
            <div
              key={mod.nummer}
              className={`card space-y-3 ${
                moduleIsKlaar
                  ? "border-emerald-500/40"
                  : voltooidInModule > 0
                    ? "border-cm-gold/40"
                    : ""
              }`}
            >
              {/* Module-header */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cm-surface-2 flex items-center justify-center text-cm-gold font-bold">
                  {mod.nummer}
                </div>
                <div className="flex-1">
                  <h3 className="text-cm-white font-semibold flex items-center gap-2">
                    {mod.emoji && <span>{mod.emoji}</span>}
                    Module {mod.nummer}: {mod.titel}
                  </h3>
                  <p className="text-cm-white/60 text-xs mt-0.5">
                    {mod.samenvatting}
                  </p>
                </div>
                <div className="text-xs text-cm-white/55 flex-shrink-0 self-center">
                  {voltooidInModule}/{lesseninModule}
                </div>
              </div>

              {/* Mini-voortgangsbalk per module */}
              <div className="h-1 bg-cm-surface-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    moduleIsKlaar ? "bg-emerald-400" : "bg-cm-gold"
                  }`}
                  style={{ width: `${moduleProcent}%` }}
                />
              </div>

              {/* Lessen-lijst per module. Lessen kunnen vergrendeld
                  zijn (introVerplicht=true en intro nog niet voltooid).
                  Dan rendert de regel als een niet-klikbare <div> met
                  een hangslot-icoon en grijze tekst, in plaats van de
                  klikbare <Link>. */}
              <div className="space-y-1">
                {mod.lessen.map((les) => {
                  const isVoltooid = voltooid.has(les.sleutel);
                  const vergrendeld = isLesVergrendeld(
                    training,
                    les.sleutel,
                    voltooid,
                  );

                  if (vergrendeld) {
                    return (
                      <div
                        key={les.sleutel}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed"
                        title="Luister eerst de intro"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full border border-cm-white/15 flex items-center justify-center text-[10px] text-cm-white/40">
                          🔒
                        </span>
                        <span className="flex-1 text-sm text-cm-white/40">
                          <span className="text-cm-white/25 text-xs mr-2">
                            {les.sleutel}
                          </span>
                          {les.titel}
                          <span className="ml-2 italic text-cm-white/35 text-xs">
                            — luister eerst de intro
                          </span>
                        </span>
                        {les.leestijdMinuten && (
                          <span className="text-cm-white/25 text-xs flex-shrink-0">
                            {les.leestijdMinuten} min
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={les.sleutel}
                      href={`/academy/${slug}/les/${les.sleutel}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-cm-surface-2 transition-colors group"
                    >
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                          isVoltooid
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-cm-white/30"
                        }`}
                      >
                        {isVoltooid && "✓"}
                      </span>
                      <span
                        className={`flex-1 text-sm ${
                          isVoltooid
                            ? "text-cm-white/60 line-through-soft"
                            : "text-cm-white"
                        } group-hover:text-cm-gold transition-colors`}
                      >
                        <span className="text-cm-white/40 text-xs mr-2">
                          {les.sleutel}
                        </span>
                        {les.titel}
                      </span>
                      {les.leestijdMinuten && (
                        <span className="text-cm-white/40 text-xs flex-shrink-0">
                          {les.leestijdMinuten} min
                        </span>
                      )}
                      <span className="text-cm-gold opacity-0 group-hover:opacity-100 transition-opacity text-sm flex-shrink-0">
                        →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
