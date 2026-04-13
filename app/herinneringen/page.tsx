import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { nl, enUS, fr, es, de, pt } from "date-fns/locale";
import { Herinnering } from "@/lib/supabase/types";
import { HerinneringActies } from "@/components/herinneringen/HerinneringActies";
import Link from "next/link";
import { getServerTaal, v } from "@/lib/i18n/server";
import { Locale } from "date-fns";

const DATE_LOCALES: Record<string, Locale> = { nl, en: enUS, fr, es, de, pt };

export default async function HerinneringenPagina() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const taal = await getServerTaal();
  const datumLocale = DATE_LOCALES[taal] || nl;
  const vandaag = new Date().toISOString().split("T")[0];
  const over7Dagen = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: herinneringen } = await supabase
    .from("herinneringen")
    .select("*, prospect:prospects(id, volledige_naam)")
    .eq("user_id", user.id)
    .eq("voltooid", false)
    .order("vervaldatum", { ascending: true });

  const lijst = (herinneringen as (Herinnering & { prospect: { id: string; volledige_naam: string } | null })[]) || [];
  const verlopen = lijst.filter((h) => h.vervaldatum < vandaag);
  const vandaagLijst = lijst.filter((h) => h.vervaldatum === vandaag);
  const komendeLijst = lijst.filter((h) => h.vervaldatum > vandaag && h.vervaldatum <= over7Dagen);
  const laterLijst = lijst.filter((h) => h.vervaldatum > over7Dagen);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard" className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4">
        {v("algemeen.terug", taal)}
      </Link>
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">{v("herinneringen.titel", taal)}</h1>
        <p className="text-cm-white mt-1">{lijst.length} {v("herinneringen.openstaand", taal)}</p>
      </div>

      {lijst.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-cm-white font-semibold mb-2">{v("herinneringen.bijgewerkt", taal)}</p>
          <p className="text-cm-white">{v("herinneringen.geen", taal)}</p>
        </div>
      )}

      {verlopen.length > 0 && (
        <HerinneringenGroep titel={v("herinneringen.verlopen", taal)} herinneringen={verlopen} kleur="border-l-red-500" icoonKleur="text-red-400" datumLocale={datumLocale} />
      )}
      {vandaagLijst.length > 0 && (
        <HerinneringenGroep titel={v("herinneringen.vandaag", taal)} herinneringen={vandaagLijst} kleur="border-l-cm-gold" icoonKleur="text-cm-gold" datumLocale={datumLocale} />
      )}
      {komendeLijst.length > 0 && (
        <HerinneringenGroep titel={v("herinneringen.komende_7", taal)} herinneringen={komendeLijst} kleur="border-l-blue-500" icoonKleur="text-blue-400" datumLocale={datumLocale} />
      )}
      {laterLijst.length > 0 && (
        <HerinneringenGroep titel={v("herinneringen.later", taal)} herinneringen={laterLijst} kleur="border-l-cm-border" icoonKleur="text-cm-white" datumLocale={datumLocale} />
      )}
    </div>
  );
}

function HerinneringenGroep({
  titel, herinneringen, kleur, icoonKleur, datumLocale,
}: {
  titel: string;
  herinneringen: (Herinnering & { prospect: { id: string; volledige_naam: string } | null })[];
  kleur: string;
  icoonKleur: string;
  datumLocale: Locale;
}) {
  const TYPE_ICOON: Record<string, string> = {
    followup: "🔄", product_herbestelling: "📦", custom: "📌",
  };

  return (
    <div>
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${icoonKleur}`}>
        {titel} ({herinneringen.length})
      </h2>
      <div className="space-y-2">
        {herinneringen.map((her) => (
          <div key={her.id} className={`card border-l-4 ${kleur} flex items-center justify-between gap-4`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{TYPE_ICOON[her.herinnering_type] || "📌"}</span>
                <p className="text-cm-white font-semibold text-sm">{her.titel}</p>
              </div>
              {her.beschrijving && (
                <p className="text-cm-white text-xs mt-1 ml-7">{her.beschrijving}</p>
              )}
              {her.prospect && (
                <Link href={`/namenlijst/${her.prospect.id}`} className="text-cm-gold text-xs mt-0.5 ml-7 hover:text-cm-gold-light transition-colors flex items-center gap-1 w-fit">
                  👤 {her.prospect.volledige_naam} →
                </Link>
              )}
              <p className="text-cm-white text-xs mt-1 ml-7">
                {format(new Date(her.vervaldatum), "EEEE d MMMM yyyy", { locale: datumLocale })}
              </p>
            </div>
            <HerinneringActies herinneringId={her.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
