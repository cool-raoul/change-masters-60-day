// File: app/core-v6/stap/[nummer]/page.tsx
//
// Detail-pagina per ankerstap. Bedoeld voor verdieping: alle uitleg
// uitgeklapt, alle taken in detail, navigatie naar vorige/volgende stap,
// en een grote 'Ik heb deze ankerstap klaar'-knop onderaan.
//
// Beschermd door feature-flag core_v6_actief. Founders kunnen elke stap
// bekijken; gewone members alleen hun eigen ankerstap (anders zien ze
// inhoud die ze nog niet hebben bereikt).

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { isCoreV6Actief } from "@/lib/feature-flags/core-v6";
import {
  coreV6Stap,
  CORE_V6_AANTAL_STAPPEN,
} from "@/lib/playbook/core-dagen-v6";
import { haalPaginaBlokken, blokkenOpPositie } from "@/lib/cms/pagina-blokken";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import {
  EditableTekst,
  EditableBlok,
} from "@/components/cms/EditableTekst";

export const dynamic = "force-dynamic";

const FASE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Fundament",
  2: "In beweging",
  3: "Business-ritme",
  4: "Doorgaande fase",
};

type Params = Promise<{ nummer: string }>;

export default async function CoreV6StapDetailPagina({
  params,
}: {
  params: Params;
}) {
  const { nummer: nummerStr } = await params;
  const nummer = Number(nummerStr);
  if (!Number.isInteger(nummer) || nummer < 1 || nummer > CORE_V6_AANTAL_STAPPEN) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v6Actief = await isCoreV6Actief(user.id);
  if (!v6Actief) redirect("/vandaag");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, core_v6_ankerstap")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder =
    (profile as { role?: string } | null)?.role === "founder";

  // Member mag alleen z'n huidige ankerstap zien (of eerdere). Founder
  // mag alles. Niet-founders die voorbij hun positie willen, krijgen
  // vriendelijke redirect naar hun huidige stap.
  const huidigeStap = Math.max(
    1,
    Math.min(
      CORE_V6_AANTAL_STAPPEN,
      (profile as { core_v6_ankerstap?: number } | null)?.core_v6_ankerstap ?? 1,
    ),
  );
  if (!isFounder && nummer > huidigeStap) {
    redirect(`/core-v6/stap/${huidigeStap}`);
  }

  const stap = coreV6Stap(nummer);
  if (!stap) notFound();

  const fase = stap.fase as 1 | 2 | 3;
  const faseLabel = FASE_LABELS[fase];

  const mediaBlokken = await haalPaginaBlokken(
    supabase,
    "core-v6-stap",
    String(stap.nummer),
  );

  const heeftVorige = nummer > 1;
  const heeftVolgende = nummer < CORE_V6_AANTAL_STAPPEN;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 text-cm-white">
      {/* Terug-navigatie */}
      <div className="mb-3">
        <Link
          href="/core-v6"
          className="inline-flex items-center text-xs text-cm-white/60 hover:text-cm-white/90"
        >
          ← Terug naar je vandaag-overzicht
        </Link>
      </div>

      {/* Media-blok positie 1 */}
      <MediaBlokken
        paginaNamespace="core-v6-stap"
        paginaId={String(stap.nummer)}
        positie="boven-titel"
        blokken={blokkenOpPositie(mediaBlokken, "boven-titel")}
        isFounder={isFounder}
      />

      {/* Header */}
      <header className="text-center space-y-2 pt-2">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Ankerstap {stap.nummer} van {CORE_V6_AANTAL_STAPPEN} · {faseLabel}
        </p>
        <EditableTekst
          namespace="core-v6-stap"
          sleutel={`stap${stap.nummer}.titel`}
          standaard={stap.titel}
          overrides={{}}
          isFounder={isFounder}
          editModusAan={false}
          as="h1"
          className="font-serif-warm text-cm-gold text-2xl leading-tight"
          hint={`Titel voor ankerstap ${stap.nummer}`}
        />
        <EditableTekst
          namespace="core-v6-stap"
          sleutel={`stap${stap.nummer}.faseDoel`}
          standaard={stap.faseDoel}
          overrides={{}}
          isFounder={isFounder}
          editModusAan={false}
          as="p"
          className="text-cm-white/75 text-sm italic leading-relaxed max-w-xl mx-auto"
          hint={`Doel-zin voor ankerstap ${stap.nummer}`}
        />
      </header>

      {/* Media-blok positie 2 */}
      <div className="mt-4">
        <MediaBlokken
          paginaNamespace="core-v6-stap"
          paginaId={String(stap.nummer)}
          positie="boven-les"
          blokken={blokkenOpPositie(mediaBlokken, "boven-les")}
          isFounder={isFounder}
        />
      </div>

      {/* Les uitgebreid */}
      <section className="mt-4 card border-l-4 border-cm-gold/60 space-y-2">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
          📖 Wat je leert in deze ankerstap
        </h2>
        <EditableBlok
          namespace="core-v6-stap"
          sleutel={`stap${stap.nummer}.watJeLeert`}
          standaard={stap.watJeLeert}
          overrides={{}}
          isFounder={isFounder}
          editModusAan={false}
          as="div"
          className="text-cm-white text-sm leading-relaxed whitespace-pre-line"
          rows={14}
          hint={`Les voor ankerstap ${stap.nummer}`}
        />
      </section>

      {/* Media-blok positie 3 */}
      <div className="mt-4">
        <MediaBlokken
          paginaNamespace="core-v6-stap"
          paginaId={String(stap.nummer)}
          positie="tussen-les-taken"
          blokken={blokkenOpPositie(mediaBlokken, "tussen-les-taken")}
          isFounder={isFounder}
        />
      </div>

      {/* Taken in detail */}
      <section className="mt-4 card space-y-3">
        <h2 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
          ✅ Wat je in deze ankerstap doet
        </h2>
        <ol className="space-y-3 text-sm text-cm-white">
          {stap.vandaagDoen.map((t, i) => (
            <li key={t.id} className="flex items-start gap-3">
              <span className="text-cm-gold font-bold flex-shrink-0 w-6">
                {i + 1}.
              </span>
              <div className="flex-1 space-y-1">
                <div className="font-medium">{t.label}</div>
                {t.uitleg && (
                  <div className="text-xs text-cm-white/70 leading-relaxed">
                    {t.uitleg}
                  </div>
                )}
                {t.actieRoute && (
                  <Link
                    href={t.actieRoute}
                    className="inline-block text-xs text-cm-gold/90 hover:text-cm-gold underline mt-1"
                  >
                    → Open {t.actieRoute}
                  </Link>
                )}
                {/* MediaBlokken bij specifieke taak */}
                <MediaBlokken
                  paginaNamespace="core-v6-stap"
                  paginaId={String(stap.nummer)}
                  positie={`bij-taak.${t.id}`}
                  blokken={blokkenOpPositie(mediaBlokken, `bij-taak.${t.id}`)}
                  isFounder={isFounder}
                />
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Waarom werkt dit */}
      {stap.waaromWerktDit?.tekst && (
        <section className="mt-4 card bg-cm-gold/5 border-cm-gold/30">
          <h2 className="text-cm-gold font-semibold text-xs uppercase tracking-wider">
            💡 Waarom dit werkt
          </h2>
          <EditableBlok
            namespace="core-v6-stap"
            sleutel={`stap${stap.nummer}.waaromWerktDit`}
            standaard={stap.waaromWerktDit.tekst}
            overrides={{}}
            isFounder={isFounder}
            editModusAan={false}
            as="div"
            className="mt-2 text-cm-white/85 text-sm italic leading-relaxed"
            rows={4}
            hint={`Waarom-werkt-dit voor ankerstap ${stap.nummer}`}
          />
          {stap.waaromWerktDit.bron && (
            <p className="mt-1 text-cm-white/50 text-xs">
              — {stap.waaromWerktDit.bron}
            </p>
          )}
        </section>
      )}

      {/* Waar in ELEVA */}
      {stap.waarInEleva && stap.waarInEleva.length > 0 && (
        <section className="mt-4 card">
          <h2 className="text-cm-gold font-semibold text-xs uppercase tracking-wider">
            🧭 Waar je dit doet in ELEVA
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {stap.waarInEleva.map((p, i) => (
              <li key={i}>
                {p.route ? (
                  <Link
                    href={p.route}
                    className="text-cm-gold/90 hover:text-cm-gold underline"
                  >
                    {p.actie}
                  </Link>
                ) : (
                  <span className="text-cm-white/80">{p.actie}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Klaar-knop, eigen Core V6-smaak: één grote bevestiging */}
      {nummer === huidigeStap && (
        <div className="mt-8">
          <form
            action={`/api/core-v6/voltooi-ankerstap`}
            method="post"
            className="w-full"
          >
            <input type="hidden" name="ankerstap" value={String(nummer)} />
            <button
              type="submit"
              className="btn-gold w-full py-4 text-base font-bold"
            >
              Ik heb deze ankerstap klaar →
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-cm-white/50">
            Geen druk. Je kunt deze ankerstap ook nog open laten en morgen
            terugkomen.
          </p>
        </div>
      )}

      {/* Vorige/volgende navigatie */}
      <nav className="mt-8 flex items-center justify-between gap-4">
        {heeftVorige ? (
          <Link
            href={`/core-v6/stap/${nummer - 1}`}
            className="text-sm text-cm-white/70 hover:text-cm-white underline"
          >
            ← Ankerstap {nummer - 1}
          </Link>
        ) : (
          <span />
        )}
        {heeftVolgende && (isFounder || nummer < huidigeStap) ? (
          <Link
            href={`/core-v6/stap/${nummer + 1}`}
            className="text-sm text-cm-white/70 hover:text-cm-white underline ml-auto"
          >
            Ankerstap {nummer + 1} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
