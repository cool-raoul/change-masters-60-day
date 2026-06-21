import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { berekenHuidigeDag } from "@/lib/playbook/bereken-dag";
import { startdatumVoorModus } from "@/lib/playbook/dag-teller";
import { CORE_V9_STAPPEN } from "@/lib/playbook/core-dagen-v9";
import { DAGEN } from "@/lib/playbook/dagen";
import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// /lessen/[dag], één eerdere les terug-lezen (read-only).
//
// Achteruit-only: je mag alleen lessen openen die al aan de beurt
// zijn geweest (dag <= je huidige dag). Future days redirecten terug
// naar /lessen. De LES (watJeLeert) staat voorop; de taken staan er
// als terugblik bij (read-only, afvinken doe je op je dag zelf).
// ============================================================

export const dynamic = "force-dynamic";

export default async function LesDetailPagina({
  params,
}: {
  params: Promise<{ dag: string }>;
}) {
  const { dag: dagStr } = await params;
  const dagNr = Number.parseInt(dagStr, 10);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!Number.isFinite(dagNr) || dagNr < 1 || dagNr > 21) {
    redirect("/lessen");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "role, is_tester, modus, sprint_startdatum, core_startdatum, run_startdatum, created_at",
    )
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as Record<string, unknown> | null;

  const modusRaw = (p?.modus as string | null) ?? null;
  const modus: Modus =
    modusRaw === "core" ? "core" : modusRaw === "pro" ? "pro" : "sprint";
  if (modus === "pro") redirect("/lessen");

  const { data: voltooiingen } = await supabase
    .from("dag_voltooiingen")
    .select("dag_nummer, taak_id")
    .eq("user_id", user.id);

  const isTester = p?.role === "founder" || p?.is_tester === true;
  const startD = startdatumVoorModus(
    {
      sprint_startdatum: (p?.sprint_startdatum as string | null) ?? null,
      core_startdatum: (p?.core_startdatum as string | null) ?? null,
      run_startdatum: (p?.run_startdatum as string | null) ?? null,
      created_at: (p?.created_at as string | null) ?? null,
    },
    modus,
  );
  const startIso = startD ? startD.toISOString().slice(0, 10) : null;
  const huidigeDag = berekenHuidigeDag(
    (voltooiingen as Array<{ dag_nummer: number; taak_id: string }>) || [],
    startIso,
    { isTester, modus },
  );

  // Achteruit-only: alleen lessen die al aan de beurt zijn geweest.
  if (dagNr > huidigeDag) {
    redirect("/lessen");
  }

  const dagenArray = modus === "core" ? CORE_V9_STAPPEN : DAGEN;
  const dagData = dagenArray.find((d) => d.nummer === dagNr);
  if (!dagData) redirect("/lessen");

  const voltooidIds = new Set(
    ((voltooiingen as Array<{ dag_nummer: number; taak_id: string }>) || [])
      .filter((v) => v.dag_nummer === dagNr)
      .map((v) => v.taak_id),
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link
        href="/lessen"
        className="text-cm-white opacity-60 hover:opacity-100 text-sm inline-flex items-center gap-1"
      >
        ← Alle lessen
      </Link>

      <div>
        <p className="text-cm-gold text-xs uppercase tracking-wider">
          Dag {dagData.nummer}
        </p>
        <h1 className="text-2xl font-display font-bold text-cm-white mt-1">
          {dagData.titel}
        </h1>
      </div>

      {/* De les */}
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-cm-gold uppercase tracking-wider">
          De les
        </h2>
        <p className="text-cm-white/90 text-sm leading-relaxed whitespace-pre-line">
          {dagData.watJeLeert}
        </p>
      </div>

      {/* Waarom dit werkt */}
      {dagData.waaromWerktDit?.tekst && (
        <div className="card bg-cm-surface-2/40 space-y-2">
          <p className="text-cm-white/90 text-sm italic whitespace-pre-line">
            &ldquo;{dagData.waaromWerktDit.tekst}&rdquo;
          </p>
          {dagData.waaromWerktDit.bron && (
            <p className="text-cm-white/50 text-xs">
              {dagData.waaromWerktDit.bron}
            </p>
          )}
        </div>
      )}

      {/* Wat je die dag deed, ter herinnering (read-only) */}
      {dagData.vandaagDoen.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-cm-white/70 uppercase tracking-wider">
            Wat je die dag deed
          </h2>
          <div className="space-y-2">
            {dagData.vandaagDoen.map((t) => (
              <div key={t.id} className="card flex items-start gap-3">
                <span className="text-base mt-0.5">
                  {voltooidIds.has(t.id) ? "✅" : "⬜️"}
                </span>
                <div className="min-w-0">
                  <p className="text-cm-white text-sm">{t.label}</p>
                  {t.uitleg && (
                    <p className="text-cm-white/50 text-xs mt-0.5 whitespace-pre-line">
                      {t.uitleg}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-cm-white/40 text-xs italic">
            Dit is een terugblik. Afvinken doe je op je dag van vandaag.
          </p>
        </div>
      )}
    </div>
  );
}
