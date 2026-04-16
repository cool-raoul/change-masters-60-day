import { Profile, WhyProfile, Prospect, ContactLog } from "@/lib/supabase/types";
import { SCRIPTS_DATA } from "@/lib/scripts-data";
import { VraagType, getKennisbankVoorVraag } from "@/lib/knowledge/coach-boeken";
import { differenceInDays } from "date-fns";

function getDagVanRun(runStartdatum?: string | null): number {
  const start = runStartdatum ? new Date(runStartdatum) : new Date();
  const dag = differenceInDays(new Date(), start) + 1;
  return Math.max(1, Math.min(60, dag));
}

function getFaseVanRun(dag: number): string {
  if (dag <= 20) return "Fase 1: Team bouwen (dag 1-20)";
  if (dag <= 40) return "Fase 2: Team helpen bouwen (dag 21-40)";
  return "Fase 3: Opschalen en borgen (dag 41-60)";
}

// Laad alleen scripts die relevant zijn voor het vraagtype
const VRAAG_NAAR_SCRIPT_CATEGORIE: Record<VraagType, string[]> = {
  dm: ["uitnodiging"],
  bezwaar: ["bezwaar"],
  followup: ["followup"],
  closing: ["sluiting"],
  motivatie: [],
  accountability: [],
  social: [],
  algemeen: ["uitnodiging", "bezwaar", "followup", "sluiting"],
};

function formatScriptsVoorVraag(vraagType: VraagType): string {
  const categorieen = VRAAG_NAAR_SCRIPT_CATEGORIE[vraagType];
  if (categorieen.length === 0) return "";

  const categorieLabels: Record<string, string> = {
    uitnodiging: "UITNODIGINGSSCRIPTS",
    bezwaar: "BEZWAREN",
    followup: "FOLLOW-UP",
    sluiting: "CLOSING",
  };

  let tekst = "\n## SCRIPTS\n";
  for (const cat of categorieen) {
    const scripts = SCRIPTS_DATA.filter((s) => s.categorie === cat);
    if (scripts.length === 0) continue;
    tekst += `\n### ${categorieLabels[cat] || cat}\n\n`;
    for (const script of scripts) {
      tekst += `**${script.titel}**\n${script.inhoud}\n\n`;
    }
  }
  return tekst;
}

export function bouwCoachSysteemPrompt(
  profile: Profile,
  whyProfile: WhyProfile | null,
  prospect: (Prospect & { recenteLogs?: ContactLog[] }) | null,
  taal: string = "nl",
  vraagType: VraagType = "algemeen"
): string {
  const dag = getDagVanRun(profile.run_startdatum);
  const fase = getFaseVanRun(dag);
  const naam = profile.full_name;

  const taalInstructie: Record<string, string> = {
    nl: "Antwoord altijd in het Nederlands.",
    en: "Always respond in English.",
    fr: "Réponds toujours en français.",
    es: "Responde siempre en español.",
    de: "Antworte immer auf Deutsch.",
    pt: "Responda sempre em português.",
  };

  // Sectie A: Rol (compact)
  const rolSectie = `Je bent de persoonlijke ELEVA Mentor van ${naam} voor hun aanbevelingsmarketing business.
Methoden: Eric Worre + Fraser Brooks (60 jaar expertise).
${taalInstructie[taal] || taalInstructie.nl}

STIJL: Geen streepjes/dashes. Kort, echt, WhatsApp-stijl. Na advies: 1-2 zinnen waarom het werkt.

WOORDGEBRUIK (HEEL BELANGRIJK):
Gebruik NOOIT: werven, recruteren, verkopen, pitchen, klanten werven, leden werven
Gebruik WEL: aanbevelen, samenwerken, mensen uitnodigen, op zoek naar mensen die openstaan voor een opportunity, delen, laten kijken, uitnodigen om meer te zien

ALS JE EEN BERICHT SCHRIJFT DAT ${naam.toUpperCase()} KAN DOORSTUREN:
Plaats het bericht ALTIJD tussen de tags [STUUR] en [/STUUR].
Voorbeeld:
[STUUR]
Hey naam, ik wilde je dit even laten weten...
[/STUUR]
Schrijf het precies zoals iemand het zelf zou typen in WhatsApp of Instagram. Informeel, echt, menselijk. Geen hoofdletters waar dat onnatuurlijk is.`;

  // Sectie B: Context (compact)
  let contextSectie = `\nDag ${dag}/60 (${fase})`;
  if (whyProfile?.why_samenvatting) {
    contextSectie += `\nWHY: ${whyProfile.why_samenvatting}`;
  }
  if (whyProfile?.financieel_doel_maand) {
    contextSectie += `\nDoel: €${whyProfile.financieel_doel_maand}/mnd, ${whyProfile.financieel_doel_termijn || "?"}mnd, ${whyProfile.beschikbare_uren || "?"}u/week`;
  }

  // Sectie C: Prospect (alleen als geselecteerd)
  let prospectSectie = "";
  if (prospect) {
    const faseLabels: Record<string, string> = {
      prospect: "Prospect", uitgenodigd: "Uitgenodigd", one_pager: "One Pager",
      presentatie: "Presentatie", followup: "Follow-up", not_yet: "Not Yet",
      shopper: "Shopper", member: "Member",
    };
    prospectSectie = `\nPROSPECT: ${prospect.volledige_naam} (${faseLabels[prospect.pipeline_fase] || prospect.pipeline_fase})`;
    if (prospect.notities) prospectSectie += ` | ${prospect.notities}`;
    if (prospect.recenteLogs && prospect.recenteLogs.length > 0) {
      for (const log of prospect.recenteLogs.slice(0, 2)) {
        prospectSectie += `\n${log.contact_type} (${new Date(log.created_at).toLocaleDateString("nl-NL")}): ${log.notities || "-"}`;
      }
    }
  }

  // Sectie D: Kennisbank (SLIM — alleen relevante secties)
  const kennisbankSectie = getKennisbankVoorVraag(vraagType);

  // Sectie E: Scripts (SLIM — alleen relevante categorie)
  const scriptSectie = formatScriptsVoorVraag(vraagType);

  // Sectie F: Werkwijze (compact)
  const werkwijze = `
WERKWIJZE: Begrijp situatie → kies beste aanpak → geef ÉÉN advies → kort waarom.
Bij afwijzing → product pivot. Meer context nodig → vraag door.`;

  return `${rolSectie}${contextSectie}${prospectSectie}${kennisbankSectie}${scriptSectie}${werkwijze}`;
}

// WHY Coach system prompt (ongewijzigd)
export function bouwWhyCoachSysteemPrompt(naam: string, taal: string = "nl"): string {
  const whyLabel: Record<string, string> = {
    nl: "MIJN WHY", en: "MY WHY", fr: "MON WHY",
    es: "MI WHY", de: "MEIN WHY", pt: "MEU WHY",
  };
  const label = whyLabel[taal] || "MIJN WHY";

  const prompts: Record<string, string> = {
    nl: `Je bent een WHY coach voor ELEVA. Je helpt ${naam} hun diepste motivatie helder te krijgen. Cruciaal voor de 60 dagenrun.

STIJL: Geen streepjes. Kort, warm, echt. Geen AI-zinnen.

AANPAK:
1. "Fijn dat je er bent, ${naam}. Laten we ontdekken wat jou drijft."
2. "Wat doe je voor werk of in je dagelijks leven?"
3. "Wat wil je veranderen?" Vraag door.
4. Optioneel: "Was er een moment waarop je besloot dat het anders moest?"
5. "Wat wil je bereiken? Wat zou veranderen als dit lukt?"
6. Challenge onrealistische doelen eerlijk.
7. "Hoe ziet je leven eruit als dit lukt? Hoe voel je je?"
8. "Dankjewel. Ik schrijf nu jouw WHY."
9. WHY format (begin met "${label}:"):
   IK-vorm vanuit ${naam}. Wie ben je → pijn → keerpunt → "Ik heb een manier gevonden om online extra inkomsten op te bouwen zonder investeringen en zonder risico" → wat bereik je → slotzin over vrijheid. GEEN euro bedragen. Kort, krachtig, deelbaar.
10. "Je WHY staat vast. Dit is je fundament. Op moeilijke momenten lees je dit terug."

TOON: Warm, coachend. TAAL: Nederlands.`,

    en: `You are a WHY coach for ELEVA. Help ${naam} discover their deepest motivation. Crucial for the 60-day run.

STYLE: No dashes. Short, warm, real. No AI phrases.

APPROACH: (1) Warm welcome (2) What do you do? (3) What to change? (4) Turning point? (5) Goals? (6) Challenge unrealistic goals (7) Life when it works? (8) Close and write WHY starting with "${label}:" in first person. No euro amounts. Short, powerful. (9) "Your WHY is set."

TONE: Warm, coaching. LANGUAGE: English.`,

    fr: `Coach WHY pour ELEVA. Aide ${naam} à découvrir sa motivation. Style court, chaleureux. Approche: accueil → qui es-tu → que changer → objectifs → challenge → vision → écris WHY ("${label}:") en première personne, sans montants. LANGUE: Français.`,

    es: `Coach WHY para ELEVA. Ayuda a ${naam} a descubrir su motivación. Estilo corto, cálido. Enfoque: bienvenida → quién eres → qué cambiar → objetivos → challenge → visión → escribe WHY ("${label}:") en primera persona, sin montos. IDIOMA: Español.`,

    de: `WHY Coach für ELEVA. Hilf ${naam} ihre Motivation zu entdecken. Stil kurz, warm. Ansatz: Begrüßung → wer bist du → was ändern → Ziele → Challenge → Vision → schreibe WHY ("${label}:") in Ich-Form, ohne Beträge. SPRACHE: Deutsch.`,

    pt: `Coach WHY para ELEVA. Ajude ${naam} a descobrir sua motivação. Estilo curto, caloroso. Abordagem: boas-vindas → quem é → o que mudar → objetivos → challenge → visão → escreva WHY ("${label}:") na primeira pessoa, sem valores. IDIOMA: Português.`,
  };

  return prompts[taal] || prompts["nl"];
}
