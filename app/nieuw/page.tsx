// Het nieuwe thuis-scherm: één dag-kaart + maximaal drie aandachtspunten.
// Echte data (dag, herinneringen), CTA opent de bestaande /vandaag-flow.

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { startdatumVoorModus } from "@/lib/playbook/dag-teller";
import { CORE_V9_STAPPEN } from "@/lib/playbook/core-dagen-v9";
import { DAGEN } from "@/lib/playbook/dagen";

export const dynamic = "force-dynamic";

export default async function NieuwThuis() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, modus, sprint_startdatum, core_startdatum, run_startdatum, created_at",
    )
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as {
    full_name?: string | null;
    modus?: string | null;
    sprint_startdatum?: string | null;
    core_startdatum?: string | null;
    run_startdatum?: string | null;
    created_at?: string | null;
  } | null;

  const voornaam = (p?.full_name || "").split(" ")[0] || "daar";
  const modus =
    p?.modus === "core" ? "core" : p?.modus === "pro" ? "pro" : "sprint";
  const start = startdatumVoorModus(
    {
      sprint_startdatum: p?.sprint_startdatum ?? null,
      core_startdatum: p?.core_startdatum ?? null,
      run_startdatum: p?.run_startdatum ?? null,
      created_at: p?.created_at ?? null,
    },
    modus,
  );
  const dag = start
    ? Math.max(
        1,
        Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      )
    : 1;
  const dagenSet = modus === "core" ? CORE_V9_STAPPEN : DAGEN;
  const dagInfo =
    modus === "pro" ? null : dagenSet.find((d) => d.nummer === Math.min(dag, 21));

  // Vandaag vraagt aandacht: max 3 herinneringen (vandaag of verlopen).
  const vandaagStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const { data: herinneringen } = await supabase
    .from("herinneringen")
    .select("id, titel, vervaldatum, prospect:prospects(id, volledige_naam)")
    .eq("user_id", user.id)
    .eq("voltooid", false)
    .lte("vervaldatum", vandaagStr)
    .order("vervaldatum", { ascending: true })
    .limit(3);
  const aandacht = (herinneringen || []) as unknown as Array<{
    id: string;
    titel: string;
    vervaldatum: string;
    prospect: { id: string; volledige_naam: string } | null;
  }>;

  const datumLabel = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-3 border-b border-cm-gold/20 pb-4">
        <h1 className="font-serif-warm text-2xl text-cm-white">
          Goedemorgen, {voornaam}
        </h1>
        <span className="ml-auto text-xs text-cm-white/50">
          {datumLabel} · dag {dag}
        </span>
      </div>

      {/* De dag-kaart: één gouden actie. */}
      <div className="rounded-2xl border border-cm-gold/40 bg-gradient-to-br from-cm-gold/10 to-cm-surface p-6">
        <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-cm-gold mb-2">
          Vandaag · dag {dag}
          {modus === "pro" ? " · jouw leerpad" : ""}
        </p>
        <h2 className="font-serif-warm text-xl text-cm-white mb-2">
          {dagInfo ? dagInfo.titel : "Jouw volgende stap staat klaar"}
        </h2>
        <p className="text-sm text-cm-white/60 mb-5">
          {dagInfo
            ? "Je stappen van vandaag staan klaar, de Mentor helpt waar nodig."
            : "Open je pad en pak de volgende stap."}
        </p>
        <Link
          href={modus === "pro" ? "/welkom-pro" : "/vandaag"}
          className="btn-gold inline-block text-sm font-bold px-7 py-2.5"
        >
          Start je dag →
        </Link>
      </div>

      {/* Max drie aandachtspunten. Meer laat dit scherm bewust niet zien. */}
      <div className="card">
        <p className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-cm-white/50 mb-2">
          Vraagt vandaag je aandacht
        </p>
        {aandacht.length === 0 ? (
          <p className="text-sm text-cm-white/50 py-2">
            Niets dat niet kan wachten. Mooi zo 🥰
          </p>
        ) : (
          aandacht.map((h) => (
            <Link
              key={h.id}
              href={h.prospect ? `/namenlijst/${h.prospect.id}` : "/herinneringen"}
              className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-b-0 text-sm text-cm-white hover:text-cm-gold transition-colors"
            >
              <span>🔔</span>
              <span className="min-w-0 truncate">
                {h.titel}
                {h.prospect ? ` · ${h.prospect.volledige_naam}` : ""}
              </span>
              <span className="ml-auto text-xs text-cm-gold whitespace-nowrap">
                {h.vervaldatum < vandaagStr ? "verlopen" : "vandaag"} →
              </span>
            </Link>
          ))
        )}
      </div>

      <p className="text-center text-xs text-cm-white/35">
        Meer is er nu niet. Je cijfers, WHY en instellingen vind je onder{" "}
        <Link href="/nieuw/meer" className="text-cm-gold/70 hover:text-cm-gold">
          Meer
        </Link>
        .
      </p>
    </div>
  );
}
