import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PIPELINE_FASEN, Prospect } from "@/lib/supabase/types";
import { PipelineKanban } from "@/components/namenlijst/PipelineKanban";

export default async function NamenlijstPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

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
            Namenlijst
          </h1>
          <p className="text-cm-muted mt-1">
            {alleProspects.length} contacten in jouw pipeline
          </p>
        </div>
        <Link href="/namenlijst/nieuw" className="btn-gold">
          + Prospect toevoegen
        </Link>
      </div>

      <PipelineKanban prospects={alleProspects} />
    </div>
  );
}
