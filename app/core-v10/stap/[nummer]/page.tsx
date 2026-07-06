// File: app/core-v10/stap/[nummer]/page.tsx
//
// Founder-preview van een specifieke Core 2.0 (V10)-dag. Read-only:
// titel, mini-les, waarom-werkt-dit, de taken als niet-afvinkbare
// checklist, het fase-doel en de waar-in-ELEVA-items. Onderaan
// vorige/volgende-dag-navigatie. Toegang: alleen founders en testers.

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CORE_V10_STAPPEN, vindV10Dag } from "@/lib/playbook/core-dagen-v10";

export const dynamic = "force-dynamic";

const FASE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Fase 1 · Lanceerweek + oogst",
  2: "Fase 2 · Business-boog + eerste skills",
  3: "Fase 3 · Gesprekken + finale",
  4: "Fase 4 · Verdieping + verdiende top-20",
};

type Params = Promise<{ nummer: string }>;

export default async function CoreV10DagDetailPagina({
  params,
}: {
  params: Params;
}) {
  const { nummer: nummerStr } = await params;
  const nummer = Number(nummerStr);
  if (
    !Number.isInteger(nummer) ||
    nummer < 1 ||
    nummer > CORE_V10_STAPPEN.length
  ) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_tester")
    .eq("id", user.id)
    .maybeSingle();

  const p = profile as { role?: string | null; is_tester?: boolean | null } | null;
  const magKijken = p?.role === "founder" || p?.is_tester === true;
  if (!magKijken) redirect("/dashboard");

  const dag = vindV10Dag(nummer);
  if (!dag) notFound();

  const vorige = vindV10Dag(nummer - 1);
  const volgende = vindV10Dag(nummer + 1);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-cm-white">
      {/* Preview-banner */}
      <div className="mb-6 rounded-lg border border-amber-400/50 bg-amber-400/10 px-4 py-2.5">
        <p className="text-amber-300 text-xs font-semibold">
          🔭 Core 2.0 preview, nog niet live. De huidige Core (V9) blijft
          ongewijzigd.
        </p>
      </div>

      {/* Kop */}
      <header className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <Link
            href="/core-v10"
            className="text-xs text-cm-gold/70 hover:text-cm-gold underline"
          >
            ← Alle 30 dagen
          </Link>
          <span className="text-xs text-cm-muted">
            Dag {dag.nummer} van {CORE_V10_STAPPEN.length}
          </span>
        </div>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          {FASE_LABELS[dag.fase]}
        </p>
        <h1 className="font-serif-warm text-2xl sm:text-3xl text-cm-white mt-2">
          {dag.titel}
        </h1>
      </header>

      {/* Wat je leert */}
      <section className="card mb-4">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-2">
          📖 Wat je vandaag leert
        </h2>
        <p className="text-cm-white/90 text-sm leading-relaxed whitespace-pre-line">
          {dag.watJeLeert}
        </p>
      </section>

      {/* Waarom werkt dit */}
      <section className="card mb-4 border-cm-gold/30">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-2">
          💡 Waarom dit werkt
        </h2>
        <blockquote className="text-cm-white/90 text-sm italic leading-relaxed">
          &ldquo;{dag.waaromWerktDit.tekst}&rdquo;
        </blockquote>
        {dag.waaromWerktDit.bron ? (
          <p className="text-cm-muted text-xs mt-2">
            {dag.waaromWerktDit.bron}
          </p>
        ) : null}
      </section>

      {/* Vandaag doen */}
      <section className="card mb-4">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
          ✅ Vandaag doen ({dag.vandaagDoen.length})
        </h2>
        <ol className="space-y-4">
          {dag.vandaagDoen.map((taak, i) => (
            <li
              key={taak.id}
              className="border-l-2 border-cm-gold/30 pl-3 space-y-1.5"
            >
              <div className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border border-cm-border"
                />
                <div className="flex-1">
                  <p className="text-cm-white text-sm font-medium">
                    {i + 1}. {taak.label}
                    {taak.verplicht ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-cm-gold/80 border border-cm-gold/40 rounded px-1.5 py-0.5">
                        verplicht
                      </span>
                    ) : (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-cm-muted border border-cm-border rounded px-1.5 py-0.5">
                        optioneel
                      </span>
                    )}
                  </p>
                  {taak.uitleg ? (
                    <p className="text-cm-muted text-xs leading-relaxed mt-1 whitespace-pre-line">
                      {taak.uitleg}
                    </p>
                  ) : null}
                  {taak.actieRoute ? (
                    <Link
                      href={taak.actieRoute}
                      className="inline-block mt-1.5 text-xs text-cm-gold hover:text-cm-gold-light underline"
                    >
                      {taak.actieRouteLabel ?? "Open deze plek →"}
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-cm-muted/70 text-xs mt-4 italic">
          Preview: de checklist is hier niet afvinkbaar.
        </p>
      </section>

      {/* Fase-doel */}
      <section className="card mb-4">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-2">
          🎯 Fase-doel
        </h2>
        <p className="text-cm-white/90 text-sm italic leading-relaxed">
          {dag.faseDoel}
        </p>
      </section>

      {/* Waar in ELEVA */}
      {dag.waarInEleva.length > 0 ? (
        <section className="card mb-4">
          <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider mb-3">
            🧭 Waar in ELEVA
          </h2>
          <ul className="space-y-3">
            {dag.waarInEleva.map((pad, i) => (
              <li key={i} className="text-sm">
                <p className="text-cm-white font-medium">{pad.actie}</p>
                {pad.menupad ? (
                  <p className="text-cm-muted text-xs mt-0.5">{pad.menupad}</p>
                ) : null}
                {pad.spraak ? (
                  <p className="text-cm-muted text-xs mt-0.5">
                    🎙️ Zeg: &ldquo;{pad.spraak}&rdquo;
                  </p>
                ) : null}
                {pad.route ? (
                  <Link
                    href={pad.route}
                    className="inline-block mt-1 text-xs text-cm-gold hover:text-cm-gold-light underline"
                  >
                    Open direct →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Vorige / volgende navigatie */}
      <nav className="mt-8 flex items-center justify-between gap-3 border-t border-cm-border pt-5">
        {vorige ? (
          <Link
            href={`/core-v10/stap/${vorige.nummer}`}
            className="text-sm text-cm-gold/80 hover:text-cm-gold"
          >
            ← Dag {vorige.nummer}
          </Link>
        ) : (
          <span />
        )}
        <Link
          href="/core-v10"
          className="text-xs text-cm-muted hover:text-cm-white underline"
        >
          Overzicht
        </Link>
        {volgende ? (
          <Link
            href={`/core-v10/stap/${volgende.nummer}`}
            className="text-sm text-cm-gold/80 hover:text-cm-gold"
          >
            Dag {volgende.nummer} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
