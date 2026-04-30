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
  // Voor nu alleen founder. In fase 2 kunnen we dit verbreden naar 'leider'.
  const magFilmsBeheren = rol === "founder";

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

      {/* 21-daagse playbook preview */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">📅 21-daagse playbook</h2>
        <p className="text-cm-white text-sm opacity-60">
          Alle 21 dagen + 3 fasen + weekritme dag 22-60. Read-only inkijk in wat een member dag voor dag ziet — handig als content-review zonder een testaccount.
        </p>
        <Link href="/playbook-preview" className="btn-secondary text-sm inline-block">
          Bekijk 21-daagse playbook (preview) →
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

      {/* Playbook-editor — uitleg waar te bewerken (founder-only) */}
      {magFilmsBeheren && (
        <div className="card space-y-2 border-gold-subtle">
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            ✍️ Playbook-teksten bewerken
          </h2>
          <p className="text-cm-white text-sm opacity-70 leading-relaxed">
            Open <strong>elke playbook-dag</strong> (via je dashboard of via{" "}
            <code className="bg-cm-surface-2 px-1 rounded text-xs">
              /playbook?dag=N
            </code>
            ) en je ziet naast elke tekst een{" "}
            <span className="text-cm-gold">✏️</span>-knop. Klik, pas aan,
            bewaar — direct live voor alle members. Geen aparte editor-pagina
            meer nodig.
          </p>
        </div>
      )}
    </div>
  );
}
