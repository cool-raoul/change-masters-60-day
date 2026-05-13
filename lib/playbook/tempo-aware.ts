// ============================================================
// lib/playbook/tempo-aware.ts
//
// Maakt de playbook-dagen reagerend op het gekozen tempo
// (commitment_uren: 2 / 4 / 6). Concept:
//
//   - Dag 1 = NIET tempo-aware (Raoul: 'gaat erom dat mensen
//             gewoon hun eerste stappen hebben gedaan').
//   - Dag 2 = niet tempo-aware in deze ronde (de '20 namen'-stap
//             heeft al de drie opties: geheugen / vcard / handmatig).
//   - Dag 3 = EERSTE tempo-aware dag (proof-of-concept).
//             Aantallen schalen mee: nieuwe namen, mensen aanspreken
//             op socials (-> in_gesprek), uitnodigingen.
//   - Dag 4-21 = nog niet tempo-aware (volgende ronde uitrollen
//                op basis van Raouls review van dag 3).
//
// De helper neemt een Dag-object + commitment_uren en retourneert
// een nieuwe Dag waarin de tempo-afhankelijke taken zijn
// vervangen door de juiste varianten. Voor dagen zonder tempo-
// specifieke logica gewoon passthrough.
//
// ARCHITECTUUR: deze functie wordt aangeroepen in app/vandaag/page.tsx
// NA de DAGEN.find() en VOOR de override-passes, zodat:
//   - founder-overrides (playbook_overrides / tekst-overrides) nog
//     steeds bovenop tempo-varianten kunnen worden gelegd
//   - aanpassingen aan de tempo-tabel via berekenDagdoelen() direct
//     doorwerken zonder DB-migratie
// ============================================================

import { berekenDagdoelen, type CommitmentUren } from "@/lib/dagdoelen";
import type { Dag, ControllableTaak } from "@/lib/playbook/types";

/**
 * Tempo-specifieke vervangings-data voor dag 3.
 * Wordt aangeroepen vanuit pasTempoToeOpDag().
 */
function bouwDag3VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  // We kiezen voor dag 3 de getallen IETS lager dan de full daily
  // minimums uit berekenDagdoelen(), omdat dag 3 nog in de
  // fundament-fase zit en de member moet wennen aan het ritme. Het
  // is een opvoer-dag, niet een full-tempo-dag.
  //
  // Mapping:
  //   2u -> 3 nieuwe namen, 3 aanspreken, 2 uitnodigingen
  //   4u -> 5 nieuwe namen, 5 aanspreken, 4 uitnodigingen (= full minimum)
  //   6u -> 8 nieuwe namen, 8 aanspreken, 6 uitnodigingen
  // De 'uitnodigingen' getallen matchen dd.uitnodigingen exact.
  const namenAantal = uren === 2 ? 3 : uren === 4 ? 5 : 8;
  const aansprekenAantal = uren === 2 ? 3 : uren === 4 ? 5 : 8;
  const uitnodigingenAantal = dd.uitnodigingen;

  return [
    {
      id: "dag3-social-namen",
      label: `📱 ${namenAantal} nieuwe namen vanuit socials toevoegen`,
      uitleg: `Scroll 5 minuten door Instagram, Facebook of LinkedIn. Wie reageert op je posts? Wie stuurt DM's? Wie post dingen over energie, doelen, gezondheid, ondernemen? Voeg ${namenAantal} nieuwe namen toe aan je lijst met één woord context per persoon ('fitness', 'oud-collega', 'LinkedIn-coach'). Niet meer, geen biografie. Het label is genoeg om te onthouden waar je zat toen je 'm noteerde.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag3-aanspreken",
      label: `💬 ${aansprekenAantal} mensen aanspreken (start een gesprek)`,
      uitleg: `Open WhatsApp, Instagram, Facebook of LinkedIn. Pak ${aansprekenAantal} mensen die je een tijd niet hebt gesproken maar wel volgt of door wie je gevolgd wordt. Per persoon: reageer op hun laatste post of story, of stuur een DM met een gewone vraag ('hé, hoe is het met jou?'). Niets verkopen, geen uitnodiging vandaag voor deze mensen. Gewoon contact leggen, gesprek starten.\n\nZodra je het bericht hebt verzonden, gebruik de Spraak-FAB om dat te vertellen ('Ik heb een gesprek gestart met [naam]'). De prospect gaat dan automatisch van 'prospect' naar 'in gesprek' in je pijplijn. Zo zie je later precies met wie het loopt en wie je kunt vervolgen.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag3-uitnodigingen",
      label: `📨 ${uitnodigingenAantal} uitnodigingen voor een presentatie`,
      uitleg: `Bouw door op gisteren. Vandaag mag je dit zelfstandig doen. Loop je vast? Vraag de Mentor: 'Schrijf een uitnodiging voor [naam] die [context]'. Mensen die je hierbij uitnodigt zet je in je pijplijn op 'uitgenodigd' (gebeurt automatisch als je de spraak-FAB gebruikt: 'Ik heb [naam] uitgenodigd voor de presentatie van [datum]').`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },
    {
      id: "dag3-sponsor-checkin",
      label: "💬 Korte sponsor-checkin",
      uitleg:
        "30 seconden. Stuur je sponsor 1 bericht: hoeveel mensen je vandaag hebt aangesproken en uitgenodigd. Sponsor weet dat je beweegt, jij voelt de lijn naar boven open. Niets uitgebreids, gewoon even een update.",
      verplicht: false,
      inlineEmbed: "sponsor-melding",
    },
    {
      id: "dag3-teams-admin",
      label: "📋 Teams-administratiesysteem aanmaken",
      uitleg:
        "Lifeplus Partner-aanmelding, eenmalige administratieve registratie. Bekijk de korte film in deze taak voor de exacte stappen.",
      verplicht: true,
      filmSlug: "onboarding-stap-7-teams-admin",
    },
  ];
}

/**
 * Past tempo-specifieke vervangingen toe op een dag.
 *
 * Voor dagen met tempo-aware logica (momenteel alleen dag 3):
 * vervangt vandaagDoen + eventueel titel. Voor andere dagen
 * passthrough.
 *
 * @param dag             Basis-dag uit DAGEN[].
 * @param commitmentUren  Het tempo dat de user heeft gekozen. Null
 *                        = nog geen keuze gemaakt; in dat geval
 *                        passthrough (geen vervanging).
 */
export function pasTempoToeOpDag(
  dag: Dag,
  commitmentUren: CommitmentUren | null,
): Dag {
  // Geen tempo gekozen of dag is niet tempo-aware -> ongewijzigd terug.
  if (commitmentUren === null) return dag;

  if (dag.nummer === 3) {
    return {
      ...dag,
      vandaagDoen: bouwDag3VandaagDoen(commitmentUren),
    };
  }

  // Andere dagen: voorlopig nog niet tempo-aware. Hier komen na
  // Raouls review van dag 3 de varianten voor dag 4-21 te zien.
  return dag;
}
