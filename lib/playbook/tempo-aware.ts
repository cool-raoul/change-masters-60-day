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
 * /onboarding ook uit leest. Zo blijft alles consistent.
 *
 * Filosofie van dag 3 (afspraak Raoul, 2026-05-13):
 *   ÉÉN actie per persoon: naam toevoegen + meteen gesprek starten.
 *   Geen aparte 'toevoegen' en 'aanspreken' taken meer, want dat
 *   schept een rekenpuzzel ('hoeveel toevoegen vs hoeveel aanspreken?').
 *   In plaats daarvan: het AANTAL 'nieuwe contacten leggen' is
 *   gelijk aan dd.contacten (5/10/15). Per persoon: lijst-entry +
 *   eerste bericht = 1 actie.
 *
 * Bronnen voor de nieuwe contacten mogen mixen:
 *   - Bestaande telefoonlijst (vrienden je al kent maar nog niet
 *     hebt benaderd over dit)
 *   - Social media-vrienden waar je al volgens bent
 *   - Mensen die je dagelijks tegenkomt (sport, koffietent, werk)
 *   - Nieuwe vrienden op social media via hashtags/comments/stories
 *     (de NLB-aanpak: New, Like, Begin)
 *
 * Spraak-FAB ondersteunt automatisch de pipeline-promotie naar
 * 'in_gesprek' zodra de member zegt 'gesprek gestart met X'.
 */
function bouwDag3VandaagDoen(uren: CommitmentUren): ControllableTaak[] {
  const dd = berekenDagdoelen(uren);

  return [
    {
      id: "dag3-nieuwe-contacten",
      label: `💬 ${dd.contacten} nieuwe contacten leggen vandaag`,
      uitleg: `Vandaag bouw je je netwerk uit met ${dd.contacten} nieuwe mensen. Per persoon doe je 1 ding: naam aan je lijst toevoegen én meteen een eerste bericht sturen. Niet apart, in één beweging.\n\nWAAR HAAL JE DEZE ${dd.contacten} MENSEN VANDAAN?\n\n1. Je telefoonlijst: mensen die je al kent maar nog niet hebt benaderd. Familie, oud-collega's, sportmaatjes, buren, oude vrienden.\n\n2. Je social media-vrienden: mensen die jou al volgen of die jij volgt, maar waar je al een tijd niet mee hebt gesproken. Open Instagram of Facebook, scroll door je vrienden, kies wie er nu spontaan opvalt.\n\n3. Mensen die je dagelijks tegenkomt: bij de koffietent, sportschool, school, werk. Iemand met wie je een gewone kleine babbel had, kun je later vandaag in een DM/WhatsApp ook vervolgen.\n\n4. Nieuwe mensen op social media (advanced): via hashtags die jouw doelgroep gebruikt, mensen in jouw stad, accounts die je volgt en waarvan de volgers passen. Eerst even reageren op hun content (1-3 oprechte comments over een paar dagen), daarna pas een DM-bericht.\n\nWAT SCHRIJF JE IN HET BERICHT?\n\nGeen pitch. Geen 'ik heb een geweldige kans'. Gewoon een menselijke vraag waar je oprecht nieuwsgierig naar bent. Een specifieke verwijzing naar iets dat zij hebben gedeeld, gepost of meegemaakt. Of een herinnering aan iets uit jullie gezamenlijke verleden.\n\nVoorbeelden:\n• 'Hé Linda, ik moest aan je denken na onze koffie laatst. Hoe is het nu met die nieuwe rol?'\n• 'Hé Pieter, ik zag je verhaal over je wandeling in Limburg. Welke route was dat?'\n• 'Hé Anne, hoe lang is het ook alweer geleden dat we elkaar hebben gesproken? Hoe is het bij jou?'\n\nZodra je het bericht hebt verstuurd, vertel het aan de Spraak-FAB: 'Ik heb een gesprek gestart met [naam]'. Dan staat de persoon in je namenlijst, automatisch op fase 'in gesprek', en weet je later precies met wie het loopt.`,
      verplicht: true,
      actieRoute: "/namenlijst",
    },
    {
      id: "dag3-uitnodigingen",
      label: `📨 ${dd.uitnodigingen} uitnodigingen voor een presentatie`,
      uitleg: `Naast de nieuwe contacten van vandaag: nodig ${dd.uitnodigingen} mensen uit voor een one-pager of presentatie. Dit zijn mensen waarvan je al weet wat ze belangrijk vinden, mensen die eerder in een gesprek zaten waar het natuurlijk past, of mensen waar je sponsor je kan ondersteunen.\n\nLoop je vast bij het bericht? Vraag de Mentor: 'Schrijf een uitnodiging voor [naam] die [context]'. Of bel je sponsor voor een 3-weg-momentje.\n\nZodra de uitnodiging is verstuurd, vertel het aan de Spraak-FAB: 'Ik heb [naam] uitgenodigd voor de presentatie van [datum]'. De pijplijn-fase wordt automatisch bijgewerkt.`,
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
        "30 seconden. Stuur je sponsor 1 bericht: hoeveel nieuwe contacten je vandaag hebt gelegd en hoeveel uitnodigingen je hebt verstuurd. Sponsor weet dat je beweegt, jij voelt de lijn naar boven open. Niets uitgebreids, gewoon even een update.",
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
