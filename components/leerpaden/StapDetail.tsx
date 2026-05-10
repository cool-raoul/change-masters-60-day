"use client";

import Link from "next/link";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import type { Leerpad, LeerpadStap } from "@/lib/leerpaden/types";
import {
  EditModeProvider,
  useEditModus,
} from "@/components/cms/EditModeContext";
import { EditModeToggle } from "@/components/cms/EditModeToggle";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";
import { MediaBlokken } from "@/components/cms/MediaBlokken";
import type { Blok } from "@/lib/cms/pagina-blokken";

// ============================================================
// StapDetail, herbruikbaar component voor stap-detail-pagina's.
//
// Werkt voor Core (welkom-core/stap/[N]) én Pro (welkom-pro/stap/[N]).
// Caller geeft tekstNamespace ('core' of 'pro') + paginaNamespace
// ('core-stap' of 'pro-stap') zodat dezelfde component beide modi
// dekt zonder code-duplicatie.
//
// Founders zien:
//   - <EditModeToggle/> bovenaan
//   - ✍️-pencils op alle teksten in edit-modus
//   - + media hier-knoppen op 5 posities (boven-titel, boven-les,
//     tussen-les-taken, bij-taak.<id>, op-klaar-stap)
// Members zien gewoon de inhoud zonder pencils/knoppen.
// ============================================================

type Props = {
  leerpad: Leerpad;
  stap: LeerpadStap;
  /** Basis-URL voor terug naar dashboard, bijv. "/welkom-pro" of "/welkom-core". */
  dashboardRoute: string;
  /** Slug-prefix voor de stap-films, bijv. "core-stap" of "pro-stap". */
  stapFilmSlugPrefix: string;
  /** Founder krijgt edit-toggle + pencils + media-knoppen. */
  isFounder?: boolean;
  /** Gedeelde UI-overrides (namespace 'core-ui' of 'pro-ui'). */
  uiOverrides?: Record<string, string>;
  /** Media-blokken per positie (boven-titel, boven-les, etc.). */
  paginaBlokken?: Record<string, Blok[]>;
  /** Namespace-prefix voor pagina_blokken: 'core-stap' of 'pro-stap'. */
  paginaNamespace: string;
  /** Namespace voor tekst-overrides: 'core' of 'pro' (gebruikt voor
   *  sleutels als 'core-stap' / 'core-ui'). */
  tekstNamespace: "core" | "pro";
};

export function StapDetail(props: Props) {
  return (
    <EditModeProvider>
      <StapDetailInner {...props} />
    </EditModeProvider>
  );
}

function StapDetailInner({
  leerpad,
  stap,
  dashboardRoute,
  stapFilmSlugPrefix,
  isFounder = false,
  uiOverrides = {},
  paginaBlokken = {},
  paginaNamespace,
  tekstNamespace,
}: Props) {
  const { editModusAan } = useEditModus();
  const blokkenOpPositie = (positie: string): Blok[] =>
    paginaBlokken[positie] ?? [];

  const stapNs = `${tekstNamespace}-stap`; // 'core-stap' of 'pro-stap'
  const uiNs = `${tekstNamespace}-ui`; // 'core-ui' of 'pro-ui'
  const vorige = leerpad.stappen.find((s) => s.nummer === stap.nummer - 1);
  const volgende = leerpad.stappen.find((s) => s.nummer === stap.nummer + 1);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Edit-modus toggle voor founder (boven alle content) */}
      {isFounder && <EditModeToggle isFounder={isFounder} />}

      {/* Terug-knop, subtiel */}
      <Link
        href={dashboardRoute}
        className="text-cm-white/50 hover:text-cm-white text-sm flex items-center gap-1 transition-colors"
      >
        ← Terug naar overzicht
      </Link>

      {/* Media-blok positie 1: bovenaan */}
      <MediaBlokken
        paginaNamespace={paginaNamespace}
        paginaId={String(stap.nummer)}
        positie="boven-titel"
        blokken={blokkenOpPositie("boven-titel")}
        isFounder={isFounder}
      />

      {/* Welkomstfilm voor deze stap (alleen als founder 'm heeft gezet) */}
      <FilmInBlok
        slug={`${stapFilmSlugPrefix}-${stap.nummer}`}
        verbergZonderFilm
      />

      {/* Header */}
      <div>
        <div className="text-cm-gold text-[11px] font-semibold uppercase tracking-wider mb-2">
          {leerpad.naam}, stap {stap.nummer} van {leerpad.totaal}
        </div>
        <EditableTekst
          namespace={stapNs}
          sleutel={`stap${stap.nummer}.titel`}
          standaard={stap.titel}
          overrides={{}}
          isFounder={isFounder}
          editModusAan={editModusAan}
          as="h1"
          className="font-serif-warm text-2xl sm:text-3xl text-cm-white leading-tight"
          hint={`Titel van stap ${stap.nummer}`}
        />
        <EditableBlok
          namespace={stapNs}
          sleutel={`stap${stap.nummer}.doel`}
          standaard={stap.doel}
          overrides={{}}
          isFounder={isFounder}
          editModusAan={editModusAan}
          as="div"
          className="text-cm-white/60 text-sm mt-3 italic leading-relaxed"
          rows={2}
          hint={`Doel-zin van stap ${stap.nummer}`}
        />
      </div>

      {/* Media-blok positie 2: tussen header en les */}
      <MediaBlokken
        paginaNamespace={paginaNamespace}
        paginaId={String(stap.nummer)}
        positie="boven-les"
        blokken={blokkenOpPositie("boven-les")}
        isFounder={isFounder}
      />

      {/* Wat je leert, met subtiele goud-glow */}
      <div className="card glow-gold-soft">
        <EditableTekst
          namespace={uiNs}
          sleutel="header.les"
          standaard="📖 Wat je vandaag leert"
          overrides={uiOverrides}
          isFounder={isFounder}
          editModusAan={editModusAan}
          as="h2"
          className="text-cm-gold font-semibold text-xs uppercase tracking-wider mb-3"
          hint={`Header boven les, gedeeld over alle ${tekstNamespace}-stappen`}
        />
        <EditableBlok
          namespace={stapNs}
          sleutel={`stap${stap.nummer}.watJeLeert`}
          standaard={stap.watJeLeert}
          overrides={{}}
          isFounder={isFounder}
          editModusAan={editModusAan}
          as="div"
          className="text-cm-white/85 text-sm leading-relaxed whitespace-pre-line"
          rows={10}
          hint={`Les voor stap ${stap.nummer}`}
        />
      </div>

      {/* Media-blok positie 3: tussen les en taken */}
      <MediaBlokken
        paginaNamespace={paginaNamespace}
        paginaId={String(stap.nummer)}
        positie="tussen-les-taken"
        blokken={blokkenOpPositie("tussen-les-taken")}
        isFounder={isFounder}
      />

      {/* Wat je doet, taken met checkbox-cirkels */}
      <div className="card">
        <EditableTekst
          namespace={uiNs}
          sleutel="header.taken"
          standaard={`✅ Wat je vandaag doet (${stap.vandaagDoen.length} stap${stap.vandaagDoen.length === 1 ? "" : "pen"})`}
          overrides={uiOverrides}
          isFounder={isFounder}
          editModusAan={editModusAan}
          as="h2"
          className="text-cm-gold font-semibold text-xs uppercase tracking-wider mb-3"
          hint="Header boven takenlijst, gedeeld over alle stappen"
        />
        <ul className="space-y-2.5">
          {stap.vandaagDoen.map((taak) => (
            <li
              key={taak.id}
              className="flex items-start gap-3 p-3 bg-cm-surface-2 border border-cm-border rounded-lg hover:border-cm-gold-dim transition-colors"
            >
              {/* Checkbox-cirkel, mockup-stijl */}
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 rounded-full border-2 border-cm-gold-dim" />
              </div>
              <div className="flex-1">
                <div className="text-cm-white text-sm font-medium leading-relaxed">
                  <EditableTekst
                    namespace={stapNs}
                    sleutel={`stap${stap.nummer}.taak.${taak.id}.label`}
                    standaard={taak.label}
                    overrides={{}}
                    isFounder={isFounder}
                    editModusAan={editModusAan}
                    as="span"
                    hint={`Taak-label, stap ${stap.nummer}, taak ${taak.id}`}
                  />
                  {taak.verplicht && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cm-gold/15 text-cm-gold font-bold align-middle border border-cm-gold/30">
                      <EditableTekst
                        namespace={uiNs}
                        sleutel="taak.verplicht-badge"
                        standaard="Verplicht"
                        overrides={uiOverrides}
                        isFounder={isFounder}
                        editModusAan={editModusAan}
                        as="span"
                      />
                    </span>
                  )}
                </div>
                {taak.uitleg && (
                  <EditableBlok
                    namespace={stapNs}
                    sleutel={`stap${stap.nummer}.taak.${taak.id}.uitleg`}
                    standaard={taak.uitleg}
                    overrides={{}}
                    isFounder={isFounder}
                    editModusAan={editModusAan}
                    as="div"
                    className="text-cm-white/65 text-xs mt-1 leading-relaxed"
                    rows={3}
                    hint={`Taak-uitleg, stap ${stap.nummer}, taak ${taak.id}`}
                  />
                )}
                {/* Per-taak media-blok positie */}
                <MediaBlokken
                  paginaNamespace={paginaNamespace}
                  paginaId={String(stap.nummer)}
                  positie={`bij-taak.${taak.id}`}
                  blokken={blokkenOpPositie(`bij-taak.${taak.id}`)}
                  isFounder={isFounder}
                />
                {taak.actieRoute && (
                  <Link
                    href={taak.actieRoute}
                    className="text-cm-gold text-xs mt-2 inline-block hover:underline"
                  >
                    Open →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Waar in ELEVA */}
      {stap.waarInEleva && stap.waarInEleva.length > 0 && (
        <div className="card">
          <EditableTekst
            namespace={uiNs}
            sleutel="header.waar-in-eleva"
            standaard="📍 Waar vind je dit in ELEVA"
            overrides={uiOverrides}
            isFounder={isFounder}
            editModusAan={editModusAan}
            as="h2"
            className="text-cm-gold font-semibold text-xs uppercase tracking-wider mb-3"
            hint="Header voor 'Waar in ELEVA'-blok, gedeeld over alle stappen"
          />
          <div className="flex flex-wrap gap-2">
            {stap.waarInEleva.map((w, i) => (
              <Link
                key={i}
                href={w.route}
                className="text-xs bg-cm-surface-2 text-cm-white px-3 py-2 rounded-full border border-cm-border hover:border-cm-gold transition-colors"
              >
                {w.actie} →
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mentor-help-strip, mens-eerst gevoel */}
      <Link
        href="/coach"
        className="flex items-center gap-3 p-4 bg-cm-surface-2/60 border border-dashed border-cm-border rounded-xl hover:border-cm-gold-dim transition-colors"
      >
        <span className="text-2xl">🤖</span>
        <div className="flex-1 text-cm-white/75 text-sm">
          <EditableTekst
            namespace={uiNs}
            sleutel="mentor-strip.tekst"
            standaard="Niet zeker hoe? De Mentor legt het uit in mensentaal."
            overrides={uiOverrides}
            isFounder={isFounder}
            editModusAan={editModusAan}
            as="span"
            hint="Tekst in mentor-strip onderaan, gedeeld over alle stappen"
          />
        </div>
        <span className="text-xs px-3 py-1.5 rounded-lg bg-cm-gold text-cm-black font-semibold">
          Vraag
        </span>
      </Link>

      {/* Media-blok positie 5: laatste positie, vóór navigatie */}
      <MediaBlokken
        paginaNamespace={paginaNamespace}
        paginaId={String(stap.nummer)}
        positie="op-klaar-stap"
        blokken={blokkenOpPositie("op-klaar-stap")}
        isFounder={isFounder}
      />

      {/* Vorige / volgende navigatie */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {vorige ? (
          <Link
            href={`${dashboardRoute}/stap/${vorige.nummer}`}
            className="btn-secondary text-sm flex-1 text-center"
          >
            ← Stap {vorige.nummer}
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        <Link
          href={dashboardRoute}
          className="text-cm-white/60 hover:text-cm-white text-xs transition-colors"
        >
          Overzicht
        </Link>
        {volgende ? (
          <Link
            href={`${dashboardRoute}/stap/${volgende.nummer}`}
            className="btn-gold text-sm flex-1 text-center"
          >
            Stap {volgende.nummer} →
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
