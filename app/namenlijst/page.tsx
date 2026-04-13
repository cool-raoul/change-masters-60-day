import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Prospect } from "@/lib/supabase/types";
import { NamenlijstToggle } from "@/components/namenlijst/NamenlijstToggle";
import { getServerTaal, v } from "@/lib/i18n/server";

export default async function NamenlijstPagina() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const taal = await getServerTaal();

  const { data: prospects } = await supabase
    .from("prospects")
    .select("*")
    .eq("user_id", user.id)
    .eq("gearchiveerd", false)
    .order("updated_at", { ascending: false });

  const alleProspects = (prospects as Prospect[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            {v("namenlijst.titel", taal)}
          </h1>
          <p className="text-cm-white mt-1">
            {alleProspects.length} {taal === "nl" ? "contacten in jouw pipeline" : taal === "en" ? "contacts in your pipeline" : taal === "fr" ? "contacts dans votre pipeline" : taal === "es" ? "contactos en tu pipeline" : taal === "de" ? "Kontakte in deiner Pipeline" : "contatos no seu pipeline"}
          </p>
        </div>
        <Link href="/namenlijst/nieuw" className="btn-gold">
          {v("namenlijst.nieuw", taal)}
        </Link>
      </div>

      <NamenlijstToggle prospects={alleProspects} />
    </div>
  );
}
