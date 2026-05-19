"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DTTOnboardingEmbed } from "@/components/onboarding/DTTOnboardingEmbed";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";
import {
  type CommitmentUren,
  berekenDagdoelen,
  bouwblokkenVoorTempo,
  tempoNaam,
} from "@/lib/dagdoelen";
import type { Modus } from "@/lib/onboarding/voltooiingen";

// ============================================================
// Pre-day-1 stap 4: modus-bewuste keuze + uitleg.
//
// Sprint: uitleg "60-dagen-run in 3 blokken" + tempo-cards 2/4/6 uur
// Core:   uitleg "40-dagen-opstart + lifetime DMO" + DTT-form embed
//
// Beide schrijven bij voltooiing naar profiles (commitment_uren of
// core_dtt) en navigeren naar /vandaag.
// ============================================================

type Props = {
  modus: Modus;
  isPreview: boolean;
  isFounder: boolean;
  overrides: Record<string, string>;
  dttAlIngevuld: boolean;
};

export function Stap4ModusKeuze({
  modus,
  isPreview,
  isFounder,
  overrides,
  dttAlIngevuld,
}: Props) {
  if (modus === "core") {
    return (
      <CoreBlock
        isPreview={isPreview}
        isFounder={isFounder}
        overrides={overrides}
        dttAlIngevuld={dttAlIngevuld}
      />
    );
  }
  return (
    <SprintTempoBlock
      isPreview={isPreview}
      isFounder={isFounder}
      overrides={overrides}
    />
  );
}

function CoreBlock({
  isPreview,
  isFounder,
  overrides,
  dttAlIngevuld,
}: {
  isPreview: boolean;
  isFounder: boolean;
  overrides: Record<string, string>;
  dttAlIngevuld: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [voltooid, setVoltooid] = useState(dttAlIngevuld);

  async function naDTT() {
    setVoltooid(true);
    if (!isPreview) {
      await supabase.auth.updateUser({ data: { onboarding_stap: 99 } });
      await fetch("/api/onboarding/markeer-voltooid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: "modus-keuze-dtt", modus: "core" }),
      }).catch(() => {});
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-3">🎯</div>
        <EditableTekst
          namespace="onboarding"
          sleutel="stap4.core.titel"
          standaard="Jouw Doel-Tijd-Termijn"
          overrides={overrides}
          isFounder={isFounder}
          as="h2"
          className="text-2xl font-display font-bold text-cm-white mb-2"
        />
        <EditableBlok
          namespace="onboarding"
          sleutel="stap4.core.uitleg"
          standaard={
            "Drie korte vragen. Hoeveel inkomen wil je over een jaar, hoeveel tijd kan je realistisch investeren, en in hoeveel maanden moet het er staan om de moeite waard te zijn. Op basis hiervan krijg je je dagelijkse aantallen op maat en zie je welke rank je nastreeft. Geen vast schema, wel een richtlijn die past bij jouw leven."
          }
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm opacity-80 leading-relaxed"
          rows={4}
        />
      </div>

      <DTTOnboardingEmbed alVoltooid={voltooid} opVoltooid={naDTT} />

      {voltooid && (
        <button
          onClick={() => router.push("/vandaag?via=onboarding")}
          className="btn-gold w-full py-4 text-lg font-bold"
        >
          Te gek, door naar dag 1 →
        </button>
      )}

      <EditableBlok
        namespace="onboarding"
        sleutel="stap4.core.aanpasbaar"
        standaard="Aanpassen kan altijd via Instellingen. Je begint rustig, schroef op zodra je merkt dat er ruimte is."
        overrides={overrides}
        isFounder={isFounder}
        as="p"
        className="text-cm-white text-xs opacity-60 italic text-center"
        rows={2}
      />
    </div>
  );
}

function SprintTempoBlock({
  isPreview,
  isFounder,
  overrides,
}: {
  isPreview: boolean;
  isFounder: boolean;
  overrides: Record<string, string>;
}) {
  const [commitmentUren, setCommitmentUren] = useState<CommitmentUren | null>(null);
  const [bezig, setBezig] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function opslaan() {
    if (!commitmentUren) return;
    setBezig(true);
    if (!isPreview) {
      const dd = berekenDagdoelen(commitmentUren);
      const today = new Date().toISOString().slice(0, 10);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Atomaire profile-update: modus + sprint_startdatum, alleen als
        // ze nog NULL zijn. Lost K1 op (startdatum komt nu pas wanneer
        // tempo daadwerkelijk is gekozen).
        const { data: prof } = await supabase
          .from("profiles")
          .select("modus, sprint_startdatum")
          .eq("id", user.id)
          .maybeSingle();
        const profielUpdates: Record<string, unknown> = {};
        if (!(prof as { modus?: string | null } | null)?.modus) {
          profielUpdates.modus = "sprint";
        }
        if (
          !(prof as { sprint_startdatum?: string | null } | null)
            ?.sprint_startdatum
        ) {
          profielUpdates.sprint_startdatum = today;
        }
        if (Object.keys(profielUpdates).length > 0) {
          await supabase
            .from("profiles")
            .update(profielUpdates)
            .eq("id", user.id);
        }

        // Tempo + dagdoelen in user_metadata.
        await supabase.auth.updateUser({
          data: {
            onboarding_stap: 99,
            commitment_uren: commitmentUren,
            dagdoel_contacten: dd.contacten,
            dagdoel_uitnodigingen: dd.uitnodigingen,
            dagdoel_followups: dd.followups,
          },
        });

        // Cross-modus markering.
        await fetch("/api/onboarding/markeer-voltooid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: "modus-keuze-tempo", modus: "sprint" }),
        }).catch(() => {});

        // Sessie-refresh: voorkomt K3 (banner blijft staan na opslag
        // doordat de JWT user_metadata-cache de nieuwe commitment_uren
        // nog niet kende).
        await supabase.auth.refreshSession();
      }
    }
    setBezig(false);
    router.push("/vandaag?via=onboarding");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-3">🎯</div>
        <EditableTekst
          namespace="onboarding"
          sleutel="stap4.sprint.titel"
          standaard="Kies jouw tempo voor 60 dagen"
          overrides={overrides}
          isFounder={isFounder}
          as="h2"
          className="text-2xl font-display font-bold text-cm-white mb-2"
        />
        <EditableBlok
          namespace="onboarding"
          sleutel="stap4.sprint.uitleg"
          standaard="Wees eerlijk met jezelf. Liever 2 uur volhouden dan 6 beloven en stoppen na tien dagen. Aanpassen kan altijd via Instellingen."
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm opacity-80 leading-relaxed"
          rows={2}
        />
      </div>

      <div className="space-y-4">
        {([2, 4, 6] as const).map((uren) => {
          const dd = berekenDagdoelen(uren);
          const blokken = bouwblokkenVoorTempo(uren);
          const isGekozen = commitmentUren === uren;
          const emoji = uren === 2 ? "🌱" : uren === 4 ? "🔥" : "⚡";
          return (
            <button
              key={uren}
              type="button"
              onClick={() => setCommitmentUren(uren)}
              className={`w-full text-left rounded-xl border-2 transition-all p-5 ${
                isGekozen
                  ? "border-cm-gold bg-cm-gold/10"
                  : "border-cm-border bg-cm-surface hover:border-cm-gold/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-cm-white/50">
                    ± {uren} uur per dag
                  </p>
                  <h3 className="text-xl font-display font-bold text-cm-white flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    {tempoNaam(uren)}
                  </h3>
                </div>
                {isGekozen && (
                  <span className="text-xs bg-cm-gold text-cm-on-gold font-bold px-3 py-1 rounded-full">
                    ✓ Gekozen
                  </span>
                )}
              </div>
              <EditableBlok
                namespace="onboarding"
                sleutel={`stap4.sprint.tempo${uren}.past_bij`}
                standaard={
                  uren === 2
                    ? "Je hebt een drukke baan, een gezin, of bouwt dit naast alles wat je al hebt. Liever rustig en consistent dan groot beginnen en stoppen."
                    : uren === 4
                      ? "Je hebt ruimte gemaakt. Je gezin weet dat dit jouw 60 dagen worden. Je wilt er serieus voor gaan zonder jezelf op te branden."
                      : "Je hebt geen ander werk, of je hebt deze 60 dagen echt vrijgemaakt. Je wilt er alles uithalen."
                }
                overrides={overrides}
                isFounder={isFounder}
                as="p"
                className="text-sm text-cm-white/85 leading-relaxed mb-3"
                rows={3}
              />
              <div className="bg-cm-surface-2 rounded-lg p-3 text-sm text-cm-white space-y-1">
                <span className="block">📲 {dd.contacten} nieuwe namen per dag</span>
                <span className="block">📨 {dd.uitnodigingen} uitnodigingen per dag</span>
              </div>
              {isGekozen && (
                <ul className="mt-3 space-y-1.5 text-xs text-cm-white/75">
                  {blokken.map((b) => (
                    <li key={b.naam} className="flex gap-2">
                      <span>{b.emoji}</span>
                      <span>
                        <strong>{b.naam}.</strong> {b.beschrijving}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={opslaan}
        disabled={bezig || !commitmentUren}
        className="btn-gold w-full py-4 text-lg font-bold disabled:opacity-40"
      >
        {bezig
          ? "Laden..."
          : commitmentUren
            ? "Te gek, door naar dag 1 →"
            : "Kies eerst je tempo hierboven"}
      </button>
    </div>
  );
}
