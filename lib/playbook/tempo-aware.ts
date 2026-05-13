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
 *
 * Aantallen komen DIRECT uit berekenDagdoelen() uit lib/dagdoelen.ts.
 * Dat is de bron-of-truth waar de tempo-keuze in /instellingen en
 * /onboarding ook uit leest. Zo blijft alles consistent: kiest een
 * member 'Bouwen' (4u), dan ziet 'ie overal 10 contacten / 4
 * uitnodigingen / 6 follow-ups / 1-3 stories.
 *
 * Voor dag 3 geldt specifiek:
 *   - 'nieuwe namen' is een EXTRA dagelijks ritme (lijst groeien),
 *     niet uit berekenDagdoelen. Lager dan 'aanspreken' want niet
 *     elke nieuwe naam wordt direct aangesproken. Schaalt mee:
 *     2u -> 3, 4u -> 5, 6u -> 8.
 *   - 'aanspreken' = dd.contacten (5/10/15) — start gesprek
 *     waardoor prospect -> in_gesprek promoveert.
 *   - 'uitnodigingen' = dd.uitnodigingen (2/4/6).
 *   - 'stories' = 1-3 momenten uit je dag delen (geen verkoop).
 */
function bouwDag3VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  // Nieuwe-namen-ritme: lager dan de aanspreek-getallen omdat het een
  // achtergrond-discipline is (je lijst aanvullen), niet een
  // hoofdactiviteit.
  const namenAantal = uren === 2 ? 3 : uren === 4 ? 5 : 8;

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
      label: `💬 ${dd.contacten} mensen aanspreken (start een gesprek)`,
      uitleg: `Open WhatsApp, Instagram, Facebook of LinkedIn. Pak ${dd.contacten} mensen die je een tijd niet hebt gesproken maar wel volgt of door wie je gevolgd wordt. Per persoon: reageer op hun laatste post of story, of stuur een DM met een gewone vraag ('hé, hoe is het met jou?'). Niets verkopen, geen uitnodiging vandaag voor deze mensen. Gewoon contact leggen, gesprek starten.\n\nZodra je het bericht hebt verzonden, gebruik de Spraak-FAB om dat te vertellen ('Ik heb een gesprek gestart met [naam]'). De prospect gaat dan automatisch van 'prospect' naar 'in gesprek' in je pijplijn. Zo zie je later precies met wie het loopt en wie je kunt vervolgen.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag3-uitnodigingen",
      label: `📨 ${dd.uitnodigingen} uitnodigingen voor een presentatie`,
      uitleg: `Bouw door op gisteren. Vandaag mag je dit zelfstandig doen. Loop je vast? Vraag de Mentor: 'Schrijf een uitnodiging voor [naam] die [context]'. Mensen die je hierbij uitnodigt zet je in je pijplijn op 'uitgenodigd' (gebeurt automatisch als je de spraak-FAB gebruikt: 'Ik heb [naam] uitgenodigd voor de presentatie van [datum]').`,
      verplicht: true,
      actieRoute: "/namenlijst",
      uitnodigHelpKnoppen: true,
    },
    {
      id: "dag3-stories",
      label: "📱 1 tot 3 stories plaatsen + reageren op anderen",
      uitleg: `Deel 1 tot 3 momenten uit je dag op Instagram of Facebook (stories, niet feed). Een ontbijt, een wandeling, een rustig moment, een blije gedachte. Geen verkoop, geen 'kom in m'n business'. Gewoon laten zien dat je leeft. Mensen worden door wat ze zien aangetrokken, niet door wat ze lezen.\n\nDaarnaast: reageer ECHT op een paar stories van anderen. Geen '👏👏👏' maar 2-3 zinnen die laten zien dat je hun moment hebt gezien. Zo blijf je in beeld zonder iets te pushen.\n\nDit kost je 5-10 minuten en bouwt zichtbaarheid op een rustige, respectvolle manier.`,
      verplicht: true,
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
