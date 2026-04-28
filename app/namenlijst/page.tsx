import { createClient } from "@/lib/supabase/server";
import { Prospect } from "@/lib/supabase/types";
import { NamenlijstToggle } from "@/components/namenlijst/NamenlijstToggle";
import { OpenTestlinkKnop } from "@/components/namenlijst/OpenTestlinkKnop";
import { getServerTaal, v } from "@/lib/i18n/server";
import Link from "next/link";

export default async function NamenlijstPagina({
  searchParams,
}: {
  searchParams: { setup?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const taal = await getServerTaal();
  const vanuitSetup = searchParams.setup === "true";

  const [{ data: prospects }, { data: eigenProfiel }] = await Promise.all([
    supabase
      .from("prospects")
      .select("*")
      .eq("user_id", user.id)
      .eq("gearchiveerd", false)
      .order("updated_at", { ascending: false }),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  const alleProspects = (prospects as Prospect[]) || [];
  const memberNaam = (eigenProfiel as any)?.full_name ?? "je member";

  return (
    <div className="space-y-6">
      {/* Banner: terug naar setup */}
      {vanuitSetup && (
        <Link
          href="/onboarding"
          className="flex items-center gap-3 bg-[#D4AF37]/15 border-2 border-[#D4AF37]/50 rounded-xl p-4 hover:bg-[#D4AF37]/20 transition-colors"
        >
          <span className="text-2xl">←</span>
          <div>
            <p className="text-[#D4AF37] font-bold text-sm">Terug naar de setup</p>
            <p className="text-cm-white text-xs opacity-70">Namen toegevoegd? Tik hier om verder te gaan met stap 4 →</p>
          </div>
        </Link>
      )}

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            {v("namenlijst.titel", taal)}
          </h1>
          <p className="text-cm-white mt-1">
            {alleProspects.length} {v("namenlijst.contacten_in_pipeline", taal)}
          </p>
        </div>
        <OpenTestlinkKnop memberNaam={memberNaam} />
      </div>

      <NamenlijstToggle prospects={alleProspects} />
    </div>
  );
}
