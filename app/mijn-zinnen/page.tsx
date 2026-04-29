import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buildSlugContextMap, type SlugContext } from "@/lib/playbook/zinSlugs";
import { ZinKaart } from "./zin-kaart";

// ============================================================
// /mijn-zinnen — overzicht van alle eigen zinnen die de member
// vanuit het 21-daagse playbook heeft opgeslagen (edification,
// 30-sec-pitch, why-introductie, etc.).
//
// Toont:
// - elke opgeslagen zin met titel + waarde + 'hoort bij dag X'-link
// - bewerk-knop per zin → in-place textarea + bewaren
// - preview van slugs die nog NIET opgeslagen zijn (uit het playbook)
//   met een "Schrijf 'm op dag X" call-to-action zodat ze niet
//   verdwijnen in de tijd
// ============================================================

export const dynamic = "force-dynamic";

type EigenZin = {
  slug: string;
  label: string;
  waarde: string;
  bron_dag: number | null;
  bron_taak: string | null;
  updated_at: string;
};

export default async function MijnZinnenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: zinnen } = await supabase
    .from("eigen_zinnen")
    .select("slug, label, waarde, bron_dag, bron_taak, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const lijst = (zinnen as EigenZin[]) || [];
  const slugContextMap = buildSlugContextMap();

  // Slugs die in het playbook bestaan maar nog niet opgeslagen zijn —
  // tonen we als "Nog niet ingevuld" zodat de member ziet wat er nog
  // aan zit te komen.
  const opgeslagenSet = new Set(lijst.map((z) => z.slug));
  const niveauNogTeSchrijven: SlugContext[] = Array.from(
    slugContextMap.values(),
  )
    .filter((ctx) => !opgeslagenSet.has(ctx.slug))
    .sort((a, b) => a.dagNummer - b.dagNummer);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            📝 Mijn zinnen
          </h1>
          <p className="text-cm-white opacity-60 mt-1">
            Alles wat je vanuit het 21-daagse playbook hebt geschreven —
            edification, pitches, intro's. Eén plek waar je ze terugvindt en
            bewerkt.
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary text-sm">
          ← Dashboard
        </Link>
      </div>

      {lijst.length === 0 && niveauNogTeSchrijven.length === 0 && (
        <div className="card border-dashed">
          <p className="text-cm-white opacity-70 text-sm">
            Nog niets opgeslagen. Zodra je in het playbook een eigen zin
            schrijft (bijvoorbeeld op dag 18 een edification-zin), verschijnt
            'ie hier automatisch.
          </p>
        </div>
      )}

      {/* Opgeslagen zinnen — bewerkbaar */}
      {lijst.length > 0 && (
        <div className="space-y-3">
          {lijst.map((zin) => {
            const ctx = slugContextMap.get(zin.slug);
            return (
              <ZinKaart
                key={zin.slug}
                zin={zin}
                instructie={ctx?.instructie}
                placeholder={ctx?.placeholder}
                maxTekens={ctx?.maxTekens ?? 500}
                voorbeeld={ctx?.voorbeeld}
              />
            );
          })}
        </div>
      )}

      {/* Slugs in playbook waar nog niets staat */}
      {niveauNogTeSchrijven.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            Nog niet ingevuld in het playbook
          </h2>
          <div className="space-y-2">
            {niveauNogTeSchrijven.map((ctx) => (
              <div
                key={ctx.slug}
                className="card flex items-center justify-between gap-3 flex-wrap border-dashed opacity-80"
              >
                <div>
                  <p className="text-cm-white text-sm font-semibold">
                    {ctx.label}
                  </p>
                  <p className="text-cm-white opacity-50 text-xs">
                    Hoort bij dag {ctx.dagNummer}
                  </p>
                </div>
                <Link
                  href={`/playbook?dag=${ctx.dagNummer}`}
                  className="text-cm-gold text-xs hover:underline"
                >
                  Naar dag {ctx.dagNummer} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
