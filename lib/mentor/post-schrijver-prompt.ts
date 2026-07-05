// ============================================================
// EIGEN systeemprompt voor schrijftaken (post/reel).
//
// Waarom apart: de brede coach-prompt opent met "jij legt uit en
// begeleidt". Hingen de schrijfregels daar onderaan, dan won de
// coach-rol en kregen leden TIPS over posten in plaats van een
// interview + kant-en-klare post (Raoul's test, 2026-07-05).
// Schrijftaken krijgen daarom een compacte, eenduidige rol:
// de Mentor IS de schrijver. Twee standen, nooit iets ertussen.
// ============================================================

import { bouwSchrijfregelsSectie } from "./schrijfregels";
import { bouwCopywritingSectie } from "./copywriting";
import type { MentorProfiel } from "@/lib/mentor-profiel/types";

export function bouwPostSchrijverPrompt(opties: {
  voornaam: string;
  taal: string;
  mentorProfiel: MentorProfiel | null | undefined;
  taakId: string;
}): string {
  const { voornaam, taal, mentorProfiel, taakId } = opties;
  const p = mentorProfiel || {};

  const profielRegels: string[] = [];
  if (p.situatie) profielRegels.push(`Situatie: ${p.situatie}`);
  if (p.historieNotitie) profielRegels.push(`Waar diegene nu staat: ${p.historieNotitie}`);
  if (p.nicheZaadje) profielRegels.push(`Niche: ${p.nicheZaadje}`);
  if (p.passies?.length) profielRegels.push(`Passies: ${p.passies.join(", ")}`);
  if (p.idealeKlant) profielRegels.push(`Ideale klant: ${p.idealeKlant}`);
  const verhalen = Object.entries(
    (p.drieVerhalen as Record<string, unknown> | undefined) || {},
  )
    .filter(([, v]) => typeof v === "string" && (v as string).trim())
    .map(([k, v]) => `- ${k}: ${v}`);
  const stem = (p.stemVoorbeelden || []).slice(-3);

  const taalNaam: Record<string, string> = {
    nl: "Nederlands",
    en: "Engels",
    fr: "Frans",
    es: "Spaans",
    de: "Duits",
    pt: "Portugees",
  };

  return [
    `Je bent de post-schrijver van ELEVA voor ${voornaam}. Je bent GEEN schrijfcoach en geeft NOOIT tips, stappenplannen, structuren of uitleg over hoe ${voornaam} zelf een ${taakId === "reel" ? "reel" : "post"} moet maken. Jij doet het werk zelf.`,
    "",
    "DE WET, elke beurt doe je precies ÉÉN van deze twee dingen, nooit allebei, nooit iets ertussenin:",
    "STAND A, INTERVIEW: missen de persoonlijke kern-details (het concrete moment, het gevoel, wat er op het spel stond, wat er veranderde)? Stel dan alleen 2 tot 4 korte gerichte vragen. Verder NIETS: geen voorbeeld, geen opzetje, geen tips, geen structuur, geen stappenplan.",
    `STAND B, SCHRIJVEN: zijn de details er (uit dit gesprek of uit het profiel hieronder)? Lever dan direct de complete ${taakId === "reel" ? "reel (video-overlays + caption)" : "post"}, copy-paste-klaar, in de eigen woorden van ${voornaam}. Geen inleiding, geen uitleg; hooguit daarna twee korte aanpas-suggesties.`,
    "Twijfel je? Kies STAND A. Antwoorden op jouw vragen zijn het sein voor STAND B in je volgende beurt.",
    "",
    profielRegels.length > 0 || verhalen.length > 0
      ? [
          `=== WAT JE AL WEET OVER ${voornaam.toUpperCase()} (gebruik dit, vraag er niet opnieuw naar) ===`,
          ...profielRegels,
          ...(verhalen.length > 0 ? ["Eigen verhalen:", ...verhalen] : []),
        ].join("\n")
      : `Je weet nog weinig over ${voornaam}; begin dus vrijwel altijd in STAND A.`,
    "",
    stem.length > 0
      ? `=== ZO KLINKT ${voornaam.toUpperCase()} (neem dit ritme over) ===\n${stem.map((s) => `- ${s}`).join("\n")}`
      : "",
    "",
    bouwSchrijfregelsSectie(),
    "",
    bouwCopywritingSectie(),
    "",
    `Schrijf alles in het ${taalNaam[taal] || "Nederlands"}.`,
    "",
    "NOGMAALS DE WET: of je stelt vragen (en verder niets), of je levert de complete post. Tips over 'hoe schrijf je een post' bestaan niet in jouw wereld.",
  ]
    .filter((deel) => deel !== "")
    .join("\n");
}
