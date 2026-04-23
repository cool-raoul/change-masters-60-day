import { createClient } from "@/lib/supabase/server";
import { Herinnering } from "@/lib/supabase/types";
import { HerinneringItem } from "@/components/herinneringen/HerinneringItem";
import Link from "next/link";
import { getServerTaal, v } from "@/lib/i18n/server";

export default async function HerinneringenPagina() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const taal = await getServerTaal();
  const vandaag = new Date().toISOString().split("T")[0];
  const over7Dagen = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: herinneringen } = await supabase
    .from("herinneringen")
    .select("*, prospect:prospects(id, volledige_naam)")
    .eq("user_id", user.id)
    .eq("voltooid", false)
    .order("vervaldatum", { ascending: true });

  type HerinneringMetProspect = Herinnering & {
    prospect: { id: string; volledige_naam: string } | null;
  };
  const lijst = (herinneringen as HerinneringMetProspect[]) || [];
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
        <p className="text-cm-white text-xs opacity-60 mt-1">
          💡 Klik op een herinnering om de volledige tekst te lezen of te bewerken.
        </p>
      </div>

      {lijst.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-cm-white font-semibold mb-2">{v("herinneringen.bijgewerkt", taal)}</p>
          <p className="text-cm-white">{v("herinneringen.geen", taal)}</p>
        </div>
      )}

      {verlopen.length > 0 && (
        <HerinneringenGroep
          titel={v("herinneringen.verlopen", taal)}
          herinneringen={verlopen}
          icoonKleur="text-red-400"
        />
      )}
      {vandaagLijst.length > 0 && (
        <HerinneringenGroep
          titel={v("herinneringen.vandaag", taal)}
          herinneringen={vandaagLijst}
          icoonKleur="text-cm-gold"
        />
      )}
      {komendeLijst.length > 0 && (
        <HerinneringenGroep
          titel={v("herinneringen.komende_7", taal)}
          herinneringen={komendeLijst}
          icoonKleur="text-blue-400"
        />
      )}
      {laterLijst.length > 0 && (
        <HerinneringenGroep
          titel={v("herinneringen.later", taal)}
          herinneringen={laterLijst}
          icoonKleur="text-cm-white"
        />
      )}
    </div>
  );
}

function HerinneringenGroep({
  titel, herinneringen, icoonKleur,
}: {
  titel: string;
  herinneringen: (import("@/lib/supabase/types").Herinnering & {
    prospect: { id: string; volledige_naam: string } | null;
  })[];
  icoonKleur: string;
}) {
  return (
    <div>
      <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${icoonKleur}`}>
        {titel} ({herinneringen.length})
      </h2>
      <div className="space-y-2">
        {herinneringen.map((her) => (
          <HerinneringItem
            key={her.id}
            herinnering={her}
            toonProspectLink={true}
          />
        ))}
      </div>
    </div>
  );
}
