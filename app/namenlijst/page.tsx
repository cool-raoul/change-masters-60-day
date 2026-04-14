import { createClient } from "@/lib/supabase/server";
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
      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          {v("namenlijst.titel", taal)}
        </h1>
        <p className="text-cm-white mt-1">
          {alleProspects.length} {v("namenlijst.contacten_in_pipeline", taal)}
        </p>
      </div>

      <NamenlijstToggle prospects={alleProspects} />
    </div>
  );
}
