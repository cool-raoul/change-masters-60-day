import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DAGEN } from "@/lib/playbook/dagen";
import { PlaybookDagTile } from "@/components/playbook/PlaybookDagTile";

// ============================================================
// /playbook — gerichte inzage van één playbook-dag.
//
// Gebruikt vanuit dashboard-reminders en deeplinks. Toont:
// - één dag uit DAGEN (?dag=N)
// - met checklist + film-embed + voltooi-tracking
//
// Preview-modus (?preview=true): checkboxes werken visueel maar
// slaan niets op — handig voor founder/leider om dag te bekijken
// zonder voortgang te beïnvloeden. Geen testaccount nodig.
// ============================================================

export const dynamic = "force-dynamic";

export default async function PlaybookDagPagina({
  searchParams,
}: {
  searchParams: Promise<{ dag?: string; preview?: string }>;
}) {
  const sp = await searchParams;
  const dagParam = Number(sp.dag);
  const isPreview = sp.preview === "true";

  // Zonder dag → terug naar dashboard
  if (!Number.isFinite(dagParam) || dagParam < 1 || dagParam > 21) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const dagData = DAGEN.find((d) => d.nummer === dagParam);
  if (!dagData) {
    redirect("/dashboard");
  }

  // In preview-modus: voltooidIds altijd leeg (zien hoe het er voor
  // een nieuwe member uitziet). Anders haal echte voltooiingen op.
  let voltooidIds: string[] = [];
  if (!isPreview) {
    const { data: voltooiingen } = await supabase
      .from("dag_voltooiingen")
      .select("taak_id")
      .eq("user_id", user.id)
      .eq("dag_nummer", dagParam);
    voltooidIds = ((voltooiingen as Array<{ taak_id: string }>) || []).map(
      (v) => v.taak_id,
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/dashboard"
          className="text-cm-white opacity-60 hover:opacity-100 text-sm flex items-center gap-1"
        >
          ← Terug naar dashboard
        </Link>
        {isPreview && (
          <span className="text-xs px-3 py-1 rounded-full bg-amber-900/30 border border-amber-500/40 text-amber-300">
            Preview-modus — afvinken slaat niets op
          </span>
        )}
      </div>

      <PlaybookDagTile
        dag={dagData}
        initialVoltooidIds={voltooidIds}
        preview={isPreview}
      />

      {/* Navigatie tussen dagen */}
      <div className="flex items-center justify-between gap-3">
        {dagParam > 1 ? (
          <Link
            href={`/playbook?dag=${dagParam - 1}${isPreview ? "&preview=true" : ""}`}
            className="btn-secondary text-sm"
          >
            ← Dag {dagParam - 1}
          </Link>
        ) : (
          <span />
        )}
        {dagParam < 21 ? (
          <Link
            href={`/playbook?dag=${dagParam + 1}${isPreview ? "&preview=true" : ""}`}
            className="btn-secondary text-sm"
          >
            Dag {dagParam + 1} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
