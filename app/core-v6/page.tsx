// File: app/core-v6/page.tsx
//
// Core V6 vandaag-pagina, rijk uitgewerkt naar dezelfde rijkheid als Sprint
// (film boven, les, taken, quote/principe), maar met eigen Core-flow:
// "ankerstap" in plaats van "dag", grote "Ik heb deze ankerstap klaar"-knop
// onderaan in plaats van per-taak afvinkjes, en de drie anti-overwhelm-
// componenten (DMO compact, Klanten-tegel, Pulse-signaal) onder de stap.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isCoreV6Actief } from "@/lib/feature-flags/core-v6";
import { coreV6Stap, CORE_V6_AANTAL_STAPPEN } from "@/lib/playbook/core-dagen-v6";
import { haalPaginaBlokken, blokkenOpPositie } from "@/lib/cms/pagina-blokken";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";
import {
  CompactDMOBlok,
  type DMOTaak,
} from "@/components/anti-overwhelm/CompactDMOBlok";
import { KlantenTegel } from "@/components/anti-overwhelm/KlantenTegel";
import { PulseSignaalBox } from "@/components/anti-overwhelm/PulseSignaalBox";

export const dynamic = "force-dynamic";

const FASE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Fundament",
  2: "In beweging",
  3: "Business-ritme",
  4: "Doorgaande fase",
};

export default async function CoreV6VandaagPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Schakelaar-check, anders terug naar huidige Core.
  const v6Actief = await isCoreV6Actief(user.id);
  if (!v6Actief) redirect("/vandaag");

  // Rol + ankerstap-positie. Default ankerstap 1.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, core_v6_ankerstap, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder =
    (profile as { role?: string } | null)?.role === "founder";

  let ankerstap = 1;
  const rawStap = (profile as { core_v6_ankerstap?: number } | null)
    ?.core_v6_ankerstap;
  if (typeof rawStap === "number" && rawStap >= 1 && rawStap <= 21) {
    ankerstap = rawStap;
  }

  const stap = coreV6Stap(ankerstap);
  if (!stap) redirect("/dashboard");

  const fase = stap.fase as 1 | 2 | 3;
  const faseLabel = FASE_LABELS[fase];

  // MediaBlokken voor deze ankerstap (namespace: core-v6-stap, paginaId: nummer).
  const mediaBlokken = await haalPaginaBlokken(
    supabase,
    "core-v6-stap",
    String(stap.nummer),
  );

  // Aantal klanten + nieuwe signalen voor de KlantenTegel (geaggregeerd, K2).
  let aantalKlanten = 0;
  let aantalNieuweSignalen = 0;
  try {
    const { count } = await supabase
      .from("klantomgeving_klanten")
      .select("id", { count: "exact", head: true })
      .eq("member_id", user.id);
    aantalKlanten = count ?? 0;
  } catch {
    aantalKlanten = 0;
  }

  // DMO-taken voor pilot-skelet. Echte progressie/DB-koppeling komt in
  // Fase B (core_v6_dmo_voortgang-tabel + member-acties).
  const dmoTaken: DMOTaak[] = [
    { id: "dmo-namen", label: "Voeg een nieuwe naam toe aan je lijst", voltooid: false },
    { id: "dmo-contact", label: "Stuur een warm bericht (uit je top-20)", voltooid: false },
    { id: "dmo-story", label: "Plaats minimaal een Story", voltooid: false },
    { id: "dmo-followup", label: "Volg een prospect op die nog open staat", voltooid: false },
    { id: "dmo-radar", label: "Check je momentum-radar", voltooid: false },
  ];

  const voornaam =
    ((profile as { full_name?: string } | null)?.full_name ?? "").split(" ")[0] ||
    "";

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 text-cm-white">
      {/* Bovenste rij: pilot-marker + ankerstap-teller */}
      <div className="mb-4 flex items-center justify-between text-xs text-cm-white/55">
        <span className="text-cm-gold/70">Core V6 (pilot)</span>
        <span>
          Ankerstap {ankerstap} van {CORE_V6_AANTAL_STAPPEN}
        </span>
      </div>

      {/* Media-blok positie 1: helemaal bovenaan, vóór titel */}
      <MediaBlokken
        paginaNamespace="core-v6-stap"
        paginaId={String(stap.nummer)}
        positie="boven-titel"
        blokken={blokkenOpPositie(mediaBlokken, "boven-titel")}
        isFounder={isFounder}
      />

      {/* Titel-blok */}
      <div className="text-center space-y-2 pt-2">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Ankerstap {stap.nummer} · {faseLabel}
        </p>
        {voornaam && (
          <h1 className="font-serif-warm text-2xl text-cm-white/90 leading-tight">
            Goed dat je er bent, {voornaam} 💟
          </h1>
        )}
        <EditableTekst
          namespace="core-v6-stap"
          sleutel={`stap${stap.nummer}.titel`}
          standaard={stap.titel}
          overrides={{}}
          isFounder={isFounder}
          editModusAan={false}
          as="h2"
          className="font-serif-warm text-cm-gold text-xl"
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
          hint={`Doel-zin onder de titel voor ankerstap ${stap.nummer}`}
        />
      </div>

      {/* Media-blok positie 2: tussen titel en les */}
      <div className="mt-4">
        <MediaBlokken
          paginaNamespace="core-v6-stap"
          paginaId={String(stap.nummer)}
          positie="boven-les"
          blokken={blokkenOpPositie(mediaBlokken, "boven-les")}
          isFounder={isFounder}
        />
      </div>

      {/* Les-card */}
      <section className="mt-4 card border-l-4 border-cm-gold/60 space-y-2">
        <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
          📖 Wat je vandaag leert
        </h3>
        <EditableBlok
          namespace="core-v6-stap"
          sleutel={`stap${stap.nummer}.watJeLeert`}
          standaard={stap.watJeLeert}
          overrides={{}}
          isFounder={isFounder}
          editModusAan={false}
          as="div"
          className="text-cm-white text-sm leading-relaxed whitespace-pre-line"
          rows={12}
          hint={`Les voor ankerstap ${stap.nummer}`}
        />
      </section>

      {/* Media-blok positie 3: tussen les en taken */}
      <div className="mt-4">
        <MediaBlokken
          paginaNamespace="core-v6-stap"
          paginaId={String(stap.nummer)}
          positie="tussen-les-taken"
          blokken={blokkenOpPositie(mediaBlokken, "tussen-les-taken")}
          isFounder={isFounder}
        />
      </div>

      {/* Taken-overzicht */}
      <section className="mt-4 card space-y-2">
        <h3 className="text-cm-gold font-semibold text-sm uppercase tracking-wider">
          ✅ Wat je vandaag doet
        </h3>
        <ul className="space-y-2 text-sm text-cm-white">
          {stap.vandaagDoen.map((t, i) => (
            <li key={t.id} className="flex items-start gap-2">
              <span className="text-cm-gold flex-shrink-0">{i + 1}.</span>
              <div className="flex-1">
                <div>{t.label}</div>
                {t.uitleg && (
                  <div className="mt-0.5 text-xs text-cm-white/60">
                    {t.uitleg}
                  </div>
                )}
                {t.actieRoute && (
                  <Link
                    href={t.actieRoute}
                    className="mt-1 inline-block text-xs text-cm-gold/80 hover:text-cm-gold underline"
                  >
                    → Open {t.actieRoute}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Waarom werkt dit-blok (quote/principe) */}
      {stap.waaromWerktDit?.tekst && (
        <section className="mt-4 card bg-cm-gold/5 border-cm-gold/30">
          <h3 className="text-cm-gold font-semibold text-xs uppercase tracking-wider">
            💡 Waarom dit werkt
          </h3>
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
            hint={`Waarom-werkt-dit quote voor ankerstap ${stap.nummer}`}
          />
          {stap.waaromWerktDit.bron && (
            <p className="mt-1 text-cm-white/50 text-xs">
              — {stap.waaromWerktDit.bron}
            </p>
          )}
        </section>
      )}

      {/* Grote "Verken deze ankerstap"-knop, naar detail-pagina */}
      <div className="mt-6">
        <Link
          href={`/core-v6/stap/${stap.nummer}`}
          className="btn-gold w-full py-4 text-base font-bold flex items-center justify-center"
        >
          Verken deze ankerstap in detail →
        </Link>
      </div>

      {/* K1: DMO compact ingeklapt onder ankerstap */}
      <section className="mt-6">
        <h3 className="text-cm-white/55 text-xs uppercase tracking-wider mb-2">
          Daarnaast, je dagelijkse ritme
        </h3>
        <CompactDMOBlok taken={dmoTaken} standaardIngeklapt={true} />
      </section>

      {/* K2: KlantenTegel */}
      <section className="mt-4">
        <KlantenTegel
          aantalKlanten={aantalKlanten}
          aantalNieuweSignalen={aantalNieuweSignalen}
          signaalSamenvatting={
            aantalKlanten === 0 ? "Nog geen klanten in beeld" : undefined
          }
        />
      </section>

      {/* K4: PulseSignaalBox (leeg in skelet) */}
      <section className="mt-4">
        <PulseSignaalBox signalen={[]} />
      </section>

      <div className="mt-10 text-center text-xs text-cm-white/40">
        Core V6 pilot, alleen voor jouw account zichtbaar. Klik op de titel
        boven om de ankerstap volledig te openen.
      </div>
    </main>
  );
}
