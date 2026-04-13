import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Herinnering } from "@/lib/supabase/types";
import { HerinneringActies } from "@/components/herinneringen/HerinneringActies";
import Link from "next/link";

export default async function HerinneringenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const vandaag = new Date().toISOString().split("T")[0];
  const over7Dagen = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: herinneringen } = await supabase
    .from("herinneringen")
    .select("*, prospect:prospects(id, volledige_naam)")
    .eq("user_id", user.id)
    .eq("voltooid", false)
    .order("vervaldatum", { ascending: true });

  const lijst = (herinneringen as (Herinnering & { prospect: { id: string; volledige_naam: string } | null })[]) || [];

  const verlopen = lijst.filter((h) => h.vervaldatum < vandaag);
  const vandaagLijst = lijst.filter((h) => h.vervaldatum === vandaag);
  const komendeLijst = lijst.filter(
    (h) => h.vervaldatum > vandaag && h.vervaldatum <= over7Dagen
  );
  const laterLijst = lijst.filter((h) => h.vervaldatum > over7Dagen);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          Herinneringen
        </h1>
        <p className="text-cm-white mt-1">
          {lijst.length} openstaande herinneringen
        </p>
      </div>

      {lijst.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-cm-white font-semibold mb-2">Alles bijgewerkt!</p>
          <p className="text-cm-white">
            Geen openstaande herinneringen. Ga zo door!
          </p>
        </div>
      )}

      {verlopen.length > 0 && (
        <HerinneringenGroep
          titel="Verlopen"
          herinneringen={verlopen}
          kleur="border-l-red-500"
          icoonKleur="text-red-400"
        />
      )}
      {vandaagLijst.length > 0 && (
        <HerinneringenGroep
          titel="Vandaag"
          herinneringen={vandaagLijst}
          kleur="border-l-cm-gold"
          icoonKleur="text-cm-gold"
        />
      )}
      {komendeLijst.length > 0 && (
        <HerinneringenGroep
          titel="Komende 7 dagen"
          herinneringen={komendeLijst}
          kleur="border-l-blue-500"
          icoonKleur="text-blue-400"
        />
      )}
      {laterLijst.length > 0 && (
        <HerinneringenGroep
          titel="Later"
          herinneringen={laterLijst}
          kleur="border-l-cm-border"
          icoonKleur="text-cm-white"
        />
      )}
    </div>
  );
}

function HerinneringenGroep({
  titel,
  herinneringen,
  kleur,
  icoonKleur,
}: {
  titel: string;
  herinneringen: (Herinnering & { prospect: { id: string; volledige_naam: string } | null })[];
  kleur: string;
  icoonKleur: string;
}) {
  const TYPE_ICOON: Record<string, string> = {
    followup: "🔄",
    product_herbestelling: "📦",
    custom: "📌",
  };

  return (
    <div>
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${icoonKleur}`}>
        {titel} ({herinneringen.length})
      </h2>
      <div className="space-y-2">
        {herinneringen.map((her) => (
          <div
            key={her.id}
            className={`card border-l-4 ${kleur} flex items-center justify-between gap-4`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{TYPE_ICOON[her.herinnering_type] || "📌"}</span>
                <p className="text-cm-white font-semibold text-sm">{her.titel}</p>
              </div>
              {her.beschrijving && (
                <p className="text-cm-white text-xs mt-1 ml-7">{her.beschrijving}</p>
              )}
              {her.prospect && (
                <Link
                  href={`/namenlijst/${her.prospect.id}`}
                  className="text-cm-gold text-xs mt-0.5 ml-7 hover:text-cm-gold-light transition-colors flex items-center gap-1 w-fit"
                >
                  👤 {her.prospect.volledige_naam} →
                </Link>
              )}
              <p className="text-cm-white text-xs mt-1 ml-7">
                {format(new Date(her.vervaldatum), "EEEE d MMMM yyyy", {
                  locale: nl,
                })}
              </p>
            </div>
            <HerinneringActies herinneringId={her.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
