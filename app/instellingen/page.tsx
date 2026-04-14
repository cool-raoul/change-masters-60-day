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
    </div>
  );
}
