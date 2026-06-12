import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/ui/Reveal";
import {
  ACADEMY_TRAININGEN,
  totaalAantalLessen,
} from "@/lib/academy/trainingen";

// ============================================================
// /academy
//
// Hoofd-overzicht van ELEVA Academy: alle trainingen die binnen
// de Academy beschikbaar zijn. Eerste training is 'Social Media
// Strategie'; later komen meer (leiderschap, mindset, etc.).
//
// Toont per training:
//   - Naam, emoji, pitch
//   - Doorlooptijd + totaal aantal lessen
//   - Voortgang voor deze user (X / Y lessen voltooid)
//   - Klikbaar door naar /academy/[slug]
// ============================================================

export const dynamic = "force-dynamic";

export default async function AcademyHoofdPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Voortgang per training ophalen, in 1 query alle voltooide lessen
  // van de user. Daarna in geheugen per training-slug groeperen.
  const { data: voortgangRows } = await supabase
    .from("training_voortgang")
    .select("training_slug, les_sleutel")
    .eq("user_id", user.id);

  const voortgangPerTraining = new Map<string, Set<string>>();
  for (const r of (voortgangRows as Array<{
    training_slug: string;
    les_sleutel: string;
  }> | null) ?? []) {
    if (!voortgangPerTraining.has(r.training_slug)) {
      voortgangPerTraining.set(r.training_slug, new Set());
    }
    voortgangPerTraining.get(r.training_slug)!.add(r.les_sleutel);
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-8 space-y-6">
      {/* Terug-knop */}
      <Link
        href="/dashboard"
        className="text-cm-white/60 hover:text-cm-white text-sm flex items-center gap-1"
      >
        ← Terug naar dashboard
      </Link>

      {/* Header */}
      <Reveal richting="fade">
        <div className="space-y-2">
          <h1 className="font-serif-warm text-3xl text-cm-white">
            📚 ELEVA Academy
          </h1>
          <p className="text-cm-white/70 leading-relaxed max-w-2xl">
            De overkoepelende leeromgeving binnen ELEVA. Diepere
            trainingen waar je in jouw eigen tempo doorheen kunt. Begin
            met de training die bij jouw moment past, kom terug wanneer
            je verder wilt.
          </p>
        </div>
      </Reveal>

      {/* Trainingen-lijst */}
      <div className="space-y-4">
        {ACADEMY_TRAININGEN.map((t, i) => {
          const voltooid = voortgangPerTraining.get(t.slug) ?? new Set();
          const totaal = totaalAantalLessen(t);
          const procent = totaal > 0 ? Math.round((voltooid.size / totaal) * 100) : 0;
          const isGestart = voltooid.size > 0;

          return (
            <Reveal key={t.slug} delay={Math.min(i * 75, 600)}>
            <Link
              href={`/academy/${t.slug}`}
              className="block card group transition-all duration-300 hover:border-cm-gold/60 hover:-translate-y-1 hover:shadow-gold"
            >
              <div className="flex gap-4 items-start">
                <div className="text-4xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">{t.emoji}</div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h2 className="text-cm-white text-xl font-display font-bold group-hover:text-cm-gold transition-colors">
                      {t.titel}
                    </h2>
                    <p className="text-cm-white/70 text-sm leading-relaxed mt-1">
                      {t.pitch}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-cm-white/55">
                    <span>
                      📖 <strong className="text-cm-white">{totaal}</strong>{" "}
                      lessen
                    </span>
                    <span>
                      ⏱️{" "}
                      <strong className="text-cm-white">
                        {t.doorlooptijdDagen} dagen
                      </strong>{" "}
                      bij 1 les/dag
                    </span>
                    <span>
                      🎯 Modules:{" "}
                      <strong className="text-cm-white">
                        {t.modules.length}
                      </strong>
                    </span>
                  </div>

                  {/* Voortgangsbalk */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cm-white/60">
                        {isGestart ? (
                          <>
                            <strong className="text-cm-gold">
                              {voltooid.size}
                            </strong>{" "}
                            van {totaal} lessen voltooid
                          </>
                        ) : (
                          "Nog niet gestart"
                        )}
                      </span>
                      {isGestart && (
                        <span className="text-cm-gold font-semibold">
                          {procent}%
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 bg-cm-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cm-gold transition-all"
                        style={{ width: `${procent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <span className="text-cm-gold text-2xl flex-shrink-0 self-center transition-transform duration-300 group-hover:translate-x-1.5">
                  →
                </span>
              </div>
            </Link>
            </Reveal>
          );
        })}

        {/* Hint voor toekomstige trainingen */}
        <Reveal delay={Math.min(ACADEMY_TRAININGEN.length * 75, 600)}>
          <div className="card border-dashed border-cm-border/50 opacity-60">
            <p className="text-cm-white/60 text-sm text-center">
              🌱 Meer trainingen komen later: leiderschap, mindset,
              productkennis, en meer.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
