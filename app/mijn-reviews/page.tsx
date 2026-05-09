import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";

// ============================================================
// /mijn-reviews, archief van wekelijkse reviews voor de member.
//
// Toont alle reviews op chronologische volgorde (nieuwste eerst), met
// per review de drie antwoorden + de sponsor-deel-status. Vanaf hier
// kan de member terugzien wat hij eerder heeft geschreven, en
// patronen herkennen over de weken.
// ============================================================

export const dynamic = "force-dynamic";

export default async function MijnReviewsPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: reviews, error } = await supabase
    .from("wekelijkse_reviews")
    .select(
      "id, week_nummer, ingevuld_op, ging_goed, niet_soepel, focus_volgende_week, gedeeld_met_sponsor",
    )
    .eq("user_id", user.id)
    .order("ingevuld_op", { ascending: false });

  const tabelOntbreekt =
    error?.code === "42P01" ||
    error?.message?.includes("does not exist") ||
    error?.message?.includes("schema cache");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1"
      >
        ← Terug
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          Mijn reviews
        </h1>
        <p className="text-cm-white opacity-70 text-sm mt-1">
          Alle wekelijkse reflecties die je hebt ingevuld, nieuwste eerst.
        </p>
      </div>

      {tabelOntbreekt && (
        <div className="card border border-amber-500/40 bg-amber-900/20 text-cm-white text-sm space-y-2">
          <p className="font-semibold text-amber-300">
            Reviews-archief is nog niet ingericht
          </p>
          <p className="opacity-80 leading-relaxed">
            De founder moet de SQL-migratie{" "}
            <code className="text-cm-gold">
              lib/supabase/migrations/wekelijkse_reviews.sql
            </code>{" "}
            in Supabase draaien voordat reviews opgeslagen kunnen worden.
          </p>
        </div>
      )}

      {!tabelOntbreekt && (!reviews || reviews.length === 0) && (
        <div className="card border-l-4 border-cm-gold/60 space-y-2">
          <p className="text-cm-white text-sm">
            Nog geen reviews ingevuld. Vul je eerste review in op{" "}
            <Link href="/statistieken" className="text-cm-gold underline">
              /statistieken
            </Link>{" "}
            of via dag 7 / 14 / 21 in je playbook.
          </p>
        </div>
      )}

      {!tabelOntbreekt && reviews && reviews.length > 0 && (
        <div className="space-y-4">
          {(reviews as Array<{
            id: string;
            week_nummer: number;
            ingevuld_op: string;
            ging_goed: string | null;
            niet_soepel: string | null;
            focus_volgende_week: string | null;
            gedeeld_met_sponsor: boolean;
          }>).map((r) => (
            <div key={r.id} className="card border-l-4 border-cm-gold/60 space-y-3">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <h3 className="text-cm-gold font-semibold">
                  Week {r.week_nummer}
                </h3>
                <p className="text-cm-white/60 text-xs">
                  {format(parseISO(r.ingevuld_op), "d MMMM yyyy 'om' HH:mm", {
                    locale: nl,
                  })}
                </p>
              </div>

              {r.ging_goed && (
                <div>
                  <p className="text-cm-white/60 text-xs uppercase tracking-wider mb-1">
                    ✅ Wat ging goed
                  </p>
                  <p className="text-cm-white text-sm whitespace-pre-line">
                    {r.ging_goed}
                  </p>
                </div>
              )}

              {r.niet_soepel && (
                <div>
                  <p className="text-cm-white/60 text-xs uppercase tracking-wider mb-1">
                    ⚠️ Wat liep niet soepel
                  </p>
                  <p className="text-cm-white text-sm whitespace-pre-line">
                    {r.niet_soepel}
                  </p>
                </div>
              )}

              {r.focus_volgende_week && (
                <div>
                  <p className="text-cm-white/60 text-xs uppercase tracking-wider mb-1">
                    🎯 Focus volgende week
                  </p>
                  <p className="text-cm-white text-sm whitespace-pre-line">
                    {r.focus_volgende_week}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-cm-border">
                <p className="text-cm-white/60 text-xs">
                  {r.gedeeld_met_sponsor
                    ? "👀 Gedeeld met sponsor"
                    : "🔒 Privé, niet gedeeld"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
