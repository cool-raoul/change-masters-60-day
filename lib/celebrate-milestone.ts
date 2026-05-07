// ============================================================
// celebrateMilestone(), helper voor 'eerste-keer'-celebrations.
//
// Voor mijlpalen die maar ÉÉN keer per gebruiker gevierd moeten
// worden (week 1 voltooid, eerste prospect, eerste klant, etc.).
// Markeert in localStorage dat een mijlpaal al gevierd is, zodat
// een refresh of opnieuw bezoek niet opnieuw confetti afvuurt.
//
// LocalStorage-key: "eleva-milestone-<key>"
// Werkt per browser/apparaat van de gebruiker. Niet supabase-gesynced
// (dat zou ook kunnen, maar voor celebrations is per-device prima:
// als je op een ander apparaat opnieuw inlogt, zie je 'm één keer
// extra. Geen kwaad bloed).
//
// Gebruik:
//   import { celebrateMilestone } from "@/lib/celebrate-milestone";
//   celebrateMilestone("first-prospect");           // groot, default
//   celebrateMilestone("streak-7", "klein");        // mini-flicker
// ============================================================

import { celebrate } from "./celebrate";

const STORAGE_PREFIX = "eleva-milestone-";

export function celebrateMilestone(
  key: string,
  intensiteit: "klein" | "groot" = "groot",
): boolean {
  if (typeof window === "undefined") return false;
  const storageKey = `${STORAGE_PREFIX}${key}`;
  try {
    if (localStorage.getItem(storageKey)) return false; // al gevierd
    localStorage.setItem(storageKey, new Date().toISOString());
  } catch {
    // localStorage geblokkeerd (private mode, etc.) -> vier toch maar,
    // beter een dubbele celebration dan helemaal geen.
  }
  celebrate(intensiteit);
  return true;
}

/**
 * Reset alle gevierde mijlpalen, alleen voor founder-test/reset doeleinden.
 * Niet voor productie-gebruik door members. Bewust geen UI-knop.
 */
export function resetAlleMijlpalen() {
  if (typeof window === "undefined") return;
  const teVerwijderen: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) teVerwijderen.push(k);
  }
  teVerwijderen.forEach((k) => localStorage.removeItem(k));
}
