import { createClient } from "@/lib/supabase/server";
import { InstellingenForm } from "@/components/InstellingenForm";
import Link from "next/link";
import { getServerTaal, v } from "@/lib/i18n/server";

export default async function InstellingenPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const taal = await getServerTaal();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const rol = (profile as { role?: string | null } | null)?.role ?? "";
  const magFilmsBeheren = rol === "leider" || rol === "founder";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/dashboard" className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1 mb-4">
        {v("algemeen.terug", taal)}
      </Link>
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          {v("instellingen.titel", taal)}
        </h1>
        <p className="text-cm-white mt-1">{v("instellingen.subtitel", taal)}</p>
      </div>

      <InstellingenForm profile={profile} email={user.email || ""} />

      {/* Onboarding preview */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">🎓 Onboarding</h2>
        <p className="text-cm-white text-sm opacity-60">
          Bekijk de volledige onboarding-wizard zoals een nieuw member die ziet. Handig als sponsor om nieuwe members te begeleiden.
        </p>
        <Link href="/onboarding?preview=true" className="btn-secondary text-sm inline-block">
          Bekijk onboarding (preview) →
        </Link>
      </div>

      {/* Bestellinks (per pakket) */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">🛒 Bestellinks</h2>
        <p className="text-cm-white text-sm opacity-60">
          Koppel je Lifeplus-webshop URL aan elk pakket. ELEVA gebruikt die links automatisch in productadvies-flows.
        </p>
        <Link href="/instellingen/bestellinks" className="btn-secondary text-sm inline-block">
          Beheer bestellinks →
        </Link>
      </div>

      {/* Film-CMS — alleen voor leiders/founders */}
      {magFilmsBeheren && (
        <div className="card space-y-3 border-gold-subtle">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">🎬 Films-CMS</h2>
          <p className="text-cm-white text-sm opacity-60">
            Beheer de films die in onboarding en op andere plekken worden getoond. Plak een YouTube/Vimeo URL — de embed gebeurt automatisch.
          </p>
          <Link href="/instellingen/films" className="btn-secondary text-sm inline-block">
            Beheer films →
          </Link>
        </div>
      )}
    </div>
  );
}
