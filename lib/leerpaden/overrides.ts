import type { LeerpadStap } from "./types";

// ============================================================
// leerpaden/overrides.ts, server-side helper voor Core/Pro stap-
// content overrides via de tekst_overrides-tabel.
//
// Werkt voor zowel Core (namespace 'core-stap') als Pro (namespace
// 'pro-stap'). Lege/missende sleutel = vallen terug op standaard.
//
// Sleutels:
//   stap{N}.titel
//   stap{N}.doel
//   stap{N}.watJeLeert
//   stap{N}.taak.{taakId}.label
//   stap{N}.taak.{taakId}.uitleg
//   stap{N}.waarInEleva.{idx}.actie
// ============================================================

/**
 * Pas overrides uit tekst_overrides toe op een LeerpadStap-object.
 * Werkt onafhankelijk van Core/Pro: caller geeft de juiste namespace-
 * Map mee (bv. tekstOverrides.get('core-stap') of 'pro-stap').
 */
export function pasStapOverridesToe(
  stap: LeerpadStap,
  stapOverrides: Map<string, string> | undefined,
): LeerpadStap {
  if (!stapOverrides || stapOverrides.size === 0) return stap;
  const N = stap.nummer;
  const get = (suffix: string) => {
    const v = stapOverrides.get(`stap${N}.${suffix}`);
    return v && v.trim() ? v.trim() : null;
  };

  return {
    ...stap,
    titel: get("titel") ?? stap.titel,
    doel: get("doel") ?? stap.doel,
    watJeLeert: get("watJeLeert") ?? stap.watJeLeert,
    vandaagDoen: stap.vandaagDoen.map((taak) => ({
      ...taak,
      label: get(`taak.${taak.id}.label`) ?? taak.label,
      uitleg: get(`taak.${taak.id}.uitleg`) ?? taak.uitleg,
    })),
    waarInEleva: stap.waarInEleva
      ? stap.waarInEleva.map((pad, idx) => ({
          ...pad,
          actie: get(`waarInEleva.${idx}.actie`) ?? pad.actie,
        }))
      : stap.waarInEleva,
  };
}
