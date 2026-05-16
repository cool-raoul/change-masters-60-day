import type { ControllableTaak } from "@/lib/playbook/types";
import { BRACKETS, type Bracket } from "./brackets";

// ============================================================
// DMO-stappen-generator voor Core.
//
// Genereert dagelijkse-ritme-stappen die als afvinkbare taken aan
// elke Core-dag worden toegevoegd. Aantallen zijn op basis van
// DTT-bracket (Minimaal/Rustig/Gestaag/Serieus/Doorpakken).
//
// Wordt aangeroepen in app/vandaag/page.tsx, NA het laden van de
// dag-content en VOOR doorgeven aan VandaagFlow. DMO-stappen worden
// ingevoegd TUSSEN de skill-stappen en de afsluit-stappen.
//
// Onderdelen activeren op basis van dag-nummer + context:
//   - Webshop-actie: vanaf dag 4 (bestellinks gekoppeld)
//   - Actief contact: altijd
//   - Reactief social: vanaf dag 7 (na eerste post)
//   - Follow-up: vanaf dag 12 (na eerste klanten-stap)
//   - Social-post: vanaf dag 7
//   - Pijplijn-update: altijd
// ============================================================

export type DMOContext = {
  bestellinksGekoppeld: boolean;
  eersteKlantenStapVoorbij: boolean;
};

export function genereerDMOStappen(
  dagNummer: number,
  bracket: Bracket,
  ctx: DMOContext,
): ControllableTaak[] {
  const def = BRACKETS[bracket];
  const stappen: ControllableTaak[] = [];

  // 1. Webshop-actie (vanaf dag 4, na bestellinks)
  if (dagNummer >= 4 && ctx.bestellinksGekoppeld) {
    stappen.push({
      id: `core-dag${dagNummer}-dmo-webshop`,
      label: "🛒 Doe 1 webshop-actie (winkelmandje, freebie, of test)",
      verplicht: false,
      actieRoute: "/namenlijst",
      uitleg:
        "Stuur iemand een deelbaar winkelmandje vanuit je Lifeplus-shop, deel je freebie-link op socials, of laat een prospect de productadvies-test doen. Eén actie per dag is genoeg om je shop in beweging te houden. Klik op de knop om naar je namenlijst te gaan en kies wie vandaag past.",
    });
  }

  // 2. Actief contact (altijd, aantallen op bracket)
  if (def.dmoMinimums.contactenPerDag === 0) {
    stappen.push({
      id: `core-dag${dagNummer}-dmo-actief-contact`,
      label: "💬 Stuur deze week 1 of 2 mensen een opener-bericht",
      verplicht: false,
      actieRoute: "/namenlijst",
      uitleg:
        "Met jouw rustige tempo is dagelijks geen verplichting. Een paar contacten per week houdt je netwerk warm. Open je namenlijst, kies iemand die je een tijd niet gesproken hebt, stuur een persoonlijk berichtje.",
    });
  } else {
    stappen.push({
      id: `core-dag${dagNummer}-dmo-actief-contact`,
      label: `💬 Stuur ${def.dmoMinimums.contactenPerDag} mensen een opener-bericht vandaag`,
      verplicht: false,
      actieRoute: "/namenlijst",
      uitleg: `Minimum ${def.dmoMinimums.contactenPerDag} per dag voor jouw tempo (${def.label}, ${def.urenPerWeekRange}/week). Meer mag altijd. Warme markt (mensen die je kent) of lauwe markt (telefoon-contacten waar je een tijd niet mee gesproken hebt). Open je namenlijst, kies wie vandaag past, stuur een persoonlijke opener.`,
    });
  }

  // 3. Reactief social-contact (vanaf dag 7, na eerste post)
  if (dagNummer >= 7) {
    stappen.push({
      id: `core-dag${dagNummer}-dmo-reactief-social`,
      label: "💎 Reageer op alle nieuwe likes en comments op je posts",
      verplicht: false,
      uitleg:
        "Open Instagram of Facebook, check je notificaties, reageer op iedereen die op je gepost heeft. Eerlijke reactie van 2-3 zinnen, vraag door als ze iets specifieks aanstippen. Zo komen DM-gesprekken op gang. Tien minuten werk per dag, hoogste rendement op je social-tijd.",
    });
  }

  // 4. Follow-up (vanaf dag 12 of als eerste klanten-stap voorbij is)
  if (dagNummer >= 12 || ctx.eersteKlantenStapVoorbij) {
    stappen.push({
      id: `core-dag${dagNummer}-dmo-follow-up`,
      label: `🔄 Volg ${def.dmoMinimums.followUpsPerDag} bestaande prospect of klant op`,
      verplicht: false,
      actieRoute: "/namenlijst",
      uitleg: `Iemand die de productadvies-test heeft gedaan, een prospect die nog niet heeft besloten, een klant die een hercontact-moment heeft. Open je namenlijst en filter op 'follow-up' of 'one-pager'. Voor jouw tempo (${def.label}) is ${def.dmoMinimums.followUpsPerDag} per dag het minimum.`,
    });
  }

  // 5. Social-post (vanaf dag 7)
  if (dagNummer >= 7) {
    stappen.push({
      id: `core-dag${dagNummer}-dmo-social-post`,
      label: `📱 Plaats een lifestyle, waarde, of testimonial-post`,
      verplicht: false,
      uitleg: `Minimum voor jouw tempo (${def.label}): ${def.dmoMinimums.socialPostsPerWeek} posts per week. Vandaag niet, dan deze week. Open Instagram of Facebook. Lifestyle (iets uit je dag), waarde (een tip of inzicht), of een testimonial (jouw productervaring, claim-vrij). Drie posts wisselen elkaar af.`,
    });
  }

  // 6. Pijplijn-update (altijd)
  stappen.push({
    id: `core-dag${dagNummer}-dmo-pijplijn`,
    label: "🎯 Werk je pijplijn bij na elke prospect-interactie",
    verplicht: false,
    actieRoute: "/namenlijst",
    uitleg:
      "Via de spraak-functie ('gesprek gestart met X', 'X heeft besteld') of door op de prospect-kaart de fase bij te werken. Een actuele pijplijn is je beste werkinstrument: je ziet wat openstaat, wie aandacht nodig heeft, en waar de momentum-radar je naartoe stuurt.",
  });

  return stappen;
}
