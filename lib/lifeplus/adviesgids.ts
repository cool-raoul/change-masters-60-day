// ============================================================
// LIFEPLUS ADVIESGIDS — kennisbasis voor ELEVA productadvies
// Filosofie: altijd beginnen bij de BASIS (1-3 basisproducten),
// daarna aanvullen met producten voor specifieke klacht/doel.
// ============================================================

export const LIFEPLUS_BASIS_FILOSOFIE = `
LIFEPLUS BASIS-FILOSOFIE (altijd toepassen):
Elk advies vertrekt vanuit de BASIS. De basis = 1 tot 3 multivitamine-basisproducten.
De drie basisproducten zijn:
- Daily Light (meest complete: vitamines, mineralen, pre & probiotica, superfoods — smaak beetje grapefruit-achtig)
- Proanthenols (OPC, krachtige antioxidant / bloedcirculatie)
- OmeGold (omega-3, hersenen / hart)

Combi-pakket bestaat: "Maintain & Protect 100" = Daily Light + Proanthenols + OmeGold samen (ASAP €172 los, 122,75 IP).
Alternatief wanneer Daily Light niet past: Women's Gold of Men's Gold (lichtere multivitamine, minder compleet).

Na de basis komt 1 (of meer) ondersteunend product voor de specifieke klacht/doel/wens.
Startervarianten voor een schone basis zijn de darmprogramma's: "Darmen in Balans" (basis) en "Darmen in Balans +" (uitgebreider). Deze worden vaak als startpunt aangeraden.
`.trim();

export type Pakket = {
  niveau: "Essential" | "Plus" | "Complete";
  producten: string[];
  asap_prijs: string;
  waarom: string;
};

export type AdviesCategorie = {
  naam: string;
  doelen: string[];
  pakketten: Pakket[];
  extra?: string;
};

export const LIFEPLUS_ADVIES_CATEGORIEEN: AdviesCategorie[] = [
  {
    naam: "Metabolisme / Afvallen / Intermittent Fasting",
    doelen: ["afvallen", "gewicht", "metabolisme", "intermittent fasting", "vasten", "bloedsuiker"],
    pakketten: [
      {
        niveau: "Essential",
        producten: ["Key Tonic"],
        asap_prijs: "€75,25",
        waarom: "ondersteunt metabolisme en bloedsuiker",
      },
      {
        niveau: "Plus",
        producten: ["Key Tonic", "Women's Gold (of Men's Gold)"],
        asap_prijs: "€107,50",
        waarom: "metabolisme + micronutriënten",
      },
      {
        niveau: "Complete",
        producten: ["Daily Light", "Key Tonic", "Triple Protein"],
        asap_prijs: "€221,00",
        waarom: "Daily Light → micronutriënten + darmflora; Key Tonic → metabolisme; Triple Protein → verzadiging en spierbehoud. Inhoudelijk het sterkste afvalpakket.",
      },
    ],
  },
  {
    naam: "Energie & Focus",
    doelen: ["energie", "focus", "concentratie", "moe", "vermoeidheid", "hersenen", "brain fog"],
    pakketten: [
      {
        niveau: "Essential",
        producten: ["Daily Light"],
        asap_prijs: "€64,75",
        waarom: "energieproblemen beginnen vaak bij micronutriënten",
      },
      {
        niveau: "Plus",
        producten: ["Daily Light", "Be Focused"],
        asap_prijs: "€142,25",
        waarom: "voeding + cognitieve ondersteuning",
      },
      {
        niveau: "Complete",
        producten: ["Maintain & Protect 100 (Daily Light + Proanthenols + OmeGold)", "Be Focused"],
        asap_prijs: "€244,50",
        waarom: "omega-3 voor hersenfunctie, OPC voor bloedcirculatie en antioxidanten, Daily Light voor basis. Biologisch zeer sterk pakket.",
      },
    ],
  },
  {
    naam: "Stress / Burn-out herstel & Slaap",
    doelen: ["stress", "burn-out", "burnout", "overspannen", "slaap", "slecht slapen", "ontspannen", "prikkelbaar", "angstig"],
    pakketten: [
      {
        niveau: "Essential",
        producten: ["Cacao Boost", "Golden Milk"],
        asap_prijs: "€94,50",
        waarom: "adaptogenen + ontstekingsbalans",
      },
      {
        niveau: "Plus",
        producten: ["Cacao Boost", "Golden Milk", "Women's Gold of Men's Gold", "Support Tabs"],
        asap_prijs: "€188,00",
        waarom: "stress + micronutriënten + zenuwstelsel",
      },
      {
        niveau: "Complete",
        producten: ["Maintain & Protect 100 (Daily Light + Proanthenols + OmeGold)", "Cacao Boost", "Golden Milk", "Support Tabs"],
        asap_prijs: "€323,25",
        waarom: "volledig herstelpakket voor stress, ontsteking, hersenen, energie. Premium herstelpakket.",
      },
    ],
  },
  {
    naam: "Hormonale Balans",
    doelen: ["hormoon", "hormonen", "menstruatie", "overgang", "menopauze", "pms", "stemmingswisselingen", "pms klachten", "vrouwenkwalen"],
    extra: "Mena Plus is het kernproduct in deze categorie.",
    pakketten: [
      {
        niveau: "Essential",
        producten: ["Women's Gold", "Mena Plus"],
        asap_prijs: "€115,25 (+€8,75 verzending onder 80 IP)",
        waarom: "basis micronutriënten + hormoonondersteuning",
      },
      {
        niveau: "Plus",
        producten: ["Daily Light", "Mena Plus"],
        asap_prijs: "€147,75",
        waarom: "completere basis + hormoonondersteuning",
      },
      {
        niveau: "Complete",
        producten: ["Daily Light", "Mena Plus", "Evening Primrose Oil", "Vitamine D & K"],
        asap_prijs: "€182,50",
        waarom: "vetzuren + hormoonreceptoren + micronutriënten",
      },
    ],
  },
  {
    naam: "Sport & Herstel",
    doelen: ["sport", "sporten", "training", "performance", "herstel", "spieren", "workout", "fitness", "cardio"],
    extra: "Be-producten zijn verkrijgbaar in smaken berry of citrus. Triple Protein in vanille (voorkeur), chocola of unsweetened.",
    pakketten: [
      {
        niveau: "Essential",
        producten: ["Be Recharged"],
        asap_prijs: "€80,50 (+€8,75 verzending onder 80 IP)",
        waarom: "basis herstelondersteuning rondom training",
      },
      {
        niveau: "Plus",
        producten: ["Be Recharged", "Triple Protein"],
        asap_prijs: "€161,50",
        waarom: "herstel + eiwitten voor spieropbouw",
      },
      {
        niveau: "Complete",
        producten: ["Be Focused", "Be Sustained", "Be Recharged", "Triple Protein"],
        asap_prijs: "€316,75",
        waarom: "compleet performance-pakket voor focus vóór, doorzetten tijdens en herstel ná training",
      },
    ],
  },
  {
    naam: "Gewricht & Beweging",
    doelen: ["gewricht", "gewrichten", "stijfheid", "pijn", "bewegen", "ouder worden", "artrose", "ontsteking"],
    pakketten: [
      {
        niveau: "Essential",
        producten: ["Proanthenols"],
        asap_prijs: "€71,25",
        waarom: "OPC voor ontstekingsbalans en bindweefsel",
      },
      {
        niveau: "Plus",
        producten: ["Proanthenols", "OmeGold"],
        asap_prijs: "±€116",
        waarom: "OPC + omega-3 werken samen voor soepele gewrichten",
      },
      {
        niveau: "Complete",
        producten: ["Maintain & Protect 100 (Daily Light + Proanthenols + OmeGold)", "Golden Milk"],
        asap_prijs: "±€219",
        waarom: "complete basis + kurkuma/gember voor ontstekingsremming",
      },
    ],
  },
];

export const LIFEPLUS_DETOX_SAPPENKUUR: AdviesCategorie = {
  naam: "Detox / Sappenkuur ondersteuning",
  doelen: ["detox", "sappenkuur", "ontgiften", "darmreiniging", "vasten met sappen", "reset"],
  extra: "Tijdens sappenkuur: bij voorkeur Purple Flash, anders Green Medley.",
  pakketten: [
    {
      niveau: "Essential",
      producten: ["Green Medley"],
      asap_prijs: "€65,75 (+€8,75 verzending onder 80 IP)",
      waarom: "superfoods voor darmflora, ontgifting zware metalen, schildklierondersteuning",
    },
    {
      niveau: "Plus",
      producten: ["Purple Flash"],
      asap_prijs: "€75,00 (+€8,75 verzending onder 80 IP)",
      waarom: "hoge concentratie antioxidanten (bessen, baobab) tegen vrije radicalen",
    },
    {
      niveau: "Complete",
      producten: ["Purple Flash", "Green Medley"],
      asap_prijs: "€140,75 (gratis verzending)",
      waarom: "combinatie van antioxidanten + groene superfoods voor complete ondersteuning",
    },
  ],
};

// Losse producten met prijs en IP-waarde (voor referentie bij maatwerk). Productcodes uit Prijzen-PDF 01-02-2025.
export const LIFEPLUS_LOSSE_PRODUCTEN: Array<{ naam: string; prijs: string; ip?: number; categorie: string; code?: string }> = [
  { naam: "Daily BioBasics Light", code: "3168", prijs: "€64,75", ip: 44.5, categorie: "Basis" },
  { naam: "Daily BioBasics", code: "3166", prijs: "€75,50", ip: 48.75, categorie: "Basis" },
  { naam: "Daily BioBasics Plus", code: "3167", prijs: "€75,50", ip: 48.75, categorie: "Basis" },
  { naam: "Women's Gold Formula", code: "3156", prijs: "€32,00", ip: 15.75, categorie: "Basis" },
  { naam: "Men's Gold Formula", code: "3159", prijs: "€32,00", ip: 15.75, categorie: "Basis" },
  { naam: "Proanthenols 100", code: "3101", prijs: "€71,25", ip: 48.75, categorie: "Antioxidanten" },
  { naam: "Omegold", code: "3102", prijs: "€45,00", ip: 29.5, categorie: "Vetzuren" },
  { naam: "Vegan OmeGold", code: "3110", prijs: "€48,75", ip: 28.25, categorie: "Vetzuren" },
  { naam: "Maintain & Protect 100 Gold (combi DBB + Proanthenols + OmeGold)", code: "3184", prijs: "€182,25", ip: 127, categorie: "Basis combi" },
  { naam: "Women's special (Women's Gold + Proanthenols + OmeGold)", code: "3219", prijs: "€140,75", ip: 94, categorie: "Basis combi" },
  { naam: "Men's special (Men's Gold + Proanthenols + OmeGold)", code: "3218", prijs: "€140,75", ip: 94, categorie: "Basis combi" },
  { naam: "Combipakket Program C (DBB + Proanthenols + proteïne)", code: "3195", prijs: "€235,00", ip: 135.5, categorie: "Basis combi" },
  { naam: "Key-Tonic", code: "3222", prijs: "€74,50", ip: 46, categorie: "Metabolisme" },
  { naam: "Enerxan", code: "3148", prijs: "€27,00", ip: 13, categorie: "Metabolisme" },
  { naam: "Phase'oMine", code: "3152", prijs: "€58,00", ip: 34.5, categorie: "Metabolisme" },
  { naam: "Triple Protein Shake (chocolademaak)", code: "3246", prijs: "€81,00", ip: 38, categorie: "Eiwitten" },
  { naam: "Triple Protein Shake (vanillemaak)", code: "3247", prijs: "€81,00", ip: 38, categorie: "Eiwitten" },
  { naam: "Triple Protein Shake (vanille ongezoet)", code: "3248", prijs: "€81,00", ip: 38, categorie: "Eiwitten" },
  { naam: "Vegan Protein Shake (chocolademaak)", code: "3175", prijs: "€88,00", ip: 44.75, categorie: "Eiwitten" },
  { naam: "Vegan Protein Shake (vanillemaak)", code: "3176", prijs: "€88,00", ip: 44.75, categorie: "Eiwitten" },
  { naam: "Mena Plus", prijs: "€83,00", ip: 50, categorie: "Hormonen" },
  { naam: "Evening Primrose Oil", prijs: "€14,50", ip: 7, categorie: "Hormonen" },
  { naam: "Vitamine D & K", prijs: "€20,25", ip: 11.5, categorie: "Hormonen" },
  { naam: "Support tabs", code: "3125", prijs: "€60,50", ip: 40, categorie: "Stress" },
  { naam: "Cacao Boost", code: "3226", prijs: "€46,50", ip: 26.5, categorie: "Stress / Superfood" },
  { naam: "Golden Milk", code: "3241", prijs: "€47,00", ip: 29, categorie: "Stress / Superfood" },
  { naam: "Somazyme", code: "3126", prijs: "€49,00", ip: 26.5, categorie: "Algemeen" },
  { naam: "FY Skin formula", code: "3105", prijs: "€66,25", ip: 50, categorie: "Huid" },
  { naam: "Collodial Silver", code: "3142", prijs: "€48,00", ip: 28.25, categorie: "Immuun" },
  { naam: "Wondergel", code: "6134", prijs: "€36,00", ip: 21.75, categorie: "Uitwendig" },
  { naam: "MSM plus tabletten", code: "3103", prijs: "€41,50", ip: 26, categorie: "Gewricht" },
  { naam: "MSM Plus lotion", code: "1021", prijs: "€25,25", ip: 9.75, categorie: "Uitwendig" },
  { naam: "Cogelin", code: "3177", prijs: "€49,75", ip: 30.25, categorie: "Darm" },
  { naam: "Aloë Vera Caps", code: "3129", prijs: "€54,25", ip: 40, categorie: "Darm" },
  { naam: "Biotic Blast", code: "3165", prijs: "€41,00", ip: 25.75, categorie: "Darm / Probiotica" },
  { naam: "Digestive Formula", code: "3153", prijs: "€45,50", ip: 21, categorie: "Darm / Enzymen" },
  { naam: "PH Plus tabletten", code: "3160", prijs: "€38,75", ip: 23, categorie: "Darm / Basenbalans" },
  { naam: "Parabalance", code: "3254", prijs: "€49,75", ip: 27, categorie: "Darm" },
  { naam: "Be Focused (bessen)", code: "3178", prijs: "€77,50", ip: 47.5, categorie: "Performance" },
  { naam: "Be Focused (citrus)", code: "3179", prijs: "€77,50", ip: 47.5, categorie: "Performance" },
  { naam: "Be Focused Sachets (bessen)", code: "3107", prijs: "€57,00", ip: 32.25, categorie: "Performance" },
  { naam: "Be Focused Sachets (citrus)", code: "3106", prijs: "€57,00", ip: 32.25, categorie: "Performance" },
  { naam: "Be Sustained (bessen)", code: "3180", prijs: "€78,50", ip: 43.75, categorie: "Performance" },
  { naam: "Be Sustained (citrus)", code: "3181", prijs: "€78,50", ip: 43.75, categorie: "Performance" },
  { naam: "Be Sustained Sachets (bessen)", code: "3121", prijs: "€62,75", ip: 31, categorie: "Performance" },
  { naam: "Be Sustained Sachets (citrus)", code: "3118", prijs: "€62,75", ip: 31, categorie: "Performance" },
  { naam: "Be Recharged (bessen)", code: "3182", prijs: "€79,75", ip: 43, categorie: "Performance" },
  { naam: "Be Recharged (citrus)", code: "3183", prijs: "€79,75", ip: 43, categorie: "Performance" },
  { naam: "Be Recharged Sachets (bessen)", code: "3122", prijs: "€59,25", ip: 30.75, categorie: "Performance" },
  { naam: "Be Recharged Sachets (citrus)", code: "3117", prijs: "€59,25", ip: 30.75, categorie: "Performance" },
  { naam: "Be Refueled (chocolade)", code: "4083", prijs: "€76,75", ip: 36, categorie: "Eiwitten / Sport" },
  { naam: "Be Refueled (neutraal)", code: "4086", prijs: "€76,75", ip: 36, categorie: "Eiwitten / Sport" },
  { naam: "Be Refueled (rode bessen)", code: "4085", prijs: "€76,75", ip: 36, categorie: "Eiwitten / Sport" },
  { naam: "Be Refueled (vanille)", code: "4084", prijs: "€76,75", ip: 36, categorie: "Eiwitten / Sport" },
  { naam: "Purple Flash", prijs: "€75,00", ip: 45.75, categorie: "Superfoods" },
  { naam: "Green Medley", prijs: "€65,75", ip: 38.5, categorie: "Superfoods" },
  { naam: "Cacao Mushroom (Reishi/Ganoderma)", prijs: "±€47", categorie: "Superfoods" },
];

// Vaste programma-pakketten (prijzen per 01-02-2025). Deze bestaan als vaste bundels in de Lifeplus-shop.
export type ProgrammaPakket = {
  naam: string;
  categorie: "Darm" | "Reset" | "Basis" | "Antistress";
  doelgroep?: string;
  producten: string[];
  prijs: string;
  ip: number;
  toelichting: string;
};

export const LIFEPLUS_PROGRAMMA_PAKKETTEN: ProgrammaPakket[] = [
  {
    naam: "Darmreiniging (Darmen in Balans)",
    categorie: "Darm",
    producten: ["Cogelin", "Aloë Vera Caps", "Biotic Blast", "MSM plus tabletten", "Parabalance"],
    prijs: "€236,25",
    ip: 149,
    toelichting: "Basis-darmprogramma. Goed startpunt voor wie wil schoonmaken en darmflora wil herstellen.",
  },
  {
    naam: "Darmsanering (Darmen in Balans +)",
    categorie: "Darm",
    producten: [
      "Cogelin",
      "Aloë Vera Caps",
      "Biotic Blast",
      "MSM plus tabletten",
      "Be Recharged Sachets (bessen of citrus)",
      "Digestive Formula",
      "PH Plus tabletten",
      "Parabalance",
    ],
    prijs: "€379,75",
    ip: 223.75,
    toelichting: "Uitgebreider darmprogramma met enzym-, pH- en energieondersteuning. Voor wie dieper wil gaan.",
  },
  {
    naam: "Basis (het huis) shakevariant",
    categorie: "Basis",
    producten: ["Maintain & Protect 100 Gold (DBB + Proanthenols + OmeGold)"],
    prijs: "€182,25",
    ip: 127,
    toelichting: "De basis ('het huis') in shakevariant. Voor wie houdt van de Daily BioBasics-shake.",
  },
  {
    naam: "Basis — Women's special (pil variant)",
    categorie: "Basis",
    doelgroep: "vrouw",
    producten: ["Women's special (Women's Gold + Proanthenols + OmeGold)", "Biotic Blast"],
    prijs: "€181,75",
    ip: 119.75,
    toelichting: "Basis in pilvorm voor vrouwen, met extra darmflora-ondersteuning.",
  },
  {
    naam: "Basis — Men's special (pil variant)",
    categorie: "Basis",
    doelgroep: "man",
    producten: ["Men's special (Men's Gold + Proanthenols + OmeGold)", "Biotic Blast"],
    prijs: "€181,75",
    ip: 119.75,
    toelichting: "Basis in pilvorm voor mannen, met extra darmflora-ondersteuning.",
  },
  {
    naam: "Reset (shakevariant)",
    categorie: "Reset",
    producten: ["Maintain & Protect 100 Gold", "Enerxan", "MSM plus tabletten", "MSM Plus lotion"],
    prijs: "€276,00 (zonder lotion €250,75)",
    ip: 175.75,
    toelichting: "Volledige reset met shake als basis. Voor wie zijn systeem echt wil resetten.",
  },
  {
    naam: "Reset — Women's special (pil variant)",
    categorie: "Reset",
    doelgroep: "vrouw",
    producten: [
      "Women's special (Women's Gold + Proanthenols + OmeGold)",
      "Enerxan",
      "MSM plus tabletten",
      "Biotic Blast",
      "MSM Plus lotion",
    ],
    prijs: "€275,50 (zonder lotion €250,25 / zonder Biotic Blast €234,50 / zonder beide €209,25)",
    ip: 168.5,
    toelichting: "Reset in pilvorm voor vrouwen. Varianten zonder lotion of Biotic Blast voor kleinere budgetten.",
  },
  {
    naam: "Reset — Men's special (pil variant)",
    categorie: "Reset",
    doelgroep: "man",
    producten: [
      "Men's special (Men's Gold + Proanthenols + OmeGold)",
      "Enerxan",
      "MSM plus tabletten",
      "Biotic Blast",
      "MSM Plus lotion",
    ],
    prijs: "€275,50 (zonder lotion €250,25 / zonder Biotic Blast €234,50 / zonder beide €209,25)",
    ip: 168.5,
    toelichting: "Reset in pilvorm voor mannen. Varianten zonder lotion of Biotic Blast voor kleinere budgetten.",
  },
  {
    naam: "Reset Vega",
    categorie: "Reset",
    doelgroep: "vegan / plantaardig",
    producten: [
      "Combipakket Program C (DBB + Proanthenols + proteïne)",
      "Vegan OmeGold",
      "Enerxan",
      "MSM plus tabletten",
      "MSM Plus lotion",
    ],
    prijs: "€377,50 (zonder lotion €352,25)",
    ip: 212.5,
    toelichting: "Volledig plantaardige reset voor veganistische/vegetarische klanten.",
  },
  {
    naam: "Anti-stress Get Zen",
    categorie: "Antistress",
    producten: ["Golden Milk", "Cacao Boost"],
    prijs: "€93,50",
    ip: 55.5,
    toelichting: "Instap anti-stress. Twee superfood-dranken voor ontspanning en feel-good. Ideaal voor wie wil proeven.",
  },
  {
    naam: "Anti-stress Stress Less — Women",
    categorie: "Antistress",
    doelgroep: "vrouw",
    producten: ["Support tabs", "Women's Gold Formula", "Golden Milk", "Cacao Boost"],
    prijs: "€186,00",
    ip: 111.25,
    toelichting: "Uitgebreide anti-stress voor vrouwen: Get Zen + multivitamine + Support tabs voor zenuwstelsel.",
  },
  {
    naam: "Anti-stress Stress Less — Men",
    categorie: "Antistress",
    doelgroep: "man",
    producten: ["Support tabs", "Men's Gold Formula", "Golden Milk", "Cacao Boost"],
    prijs: "€186,00",
    ip: 111.25,
    toelichting: "Uitgebreide anti-stress voor mannen: Get Zen + multivitamine + Support tabs voor zenuwstelsel.",
  },
];

// Veelvoorkomende contra-indicaties bij specifieke producten.
export const LIFEPLUS_CONTRA_INDICATIES = [
  {
    trigger: "schildkliermedicatie",
    product: "Green Medley",
    advies:
      "Green Medley bevat jodium. Bij schildkliermedicatie eerst arts raadplegen of extra jodium/kelp mag. Alternatief tijdens een darmkuur: Aloë Vera Caps (code 3129) in plaats van Green Medley.",
  },
  {
    trigger: "zwangerschap of borstvoeding",
    product: "algemeen",
    advies:
      "Bij zwangerschap of borstvoeding altijd eerst arts of verloskundige raadplegen voor supplementgebruik.",
  },
  {
    trigger: "bloedverdunners / chemotherapie / antidepressiva",
    product: "algemeen (m.n. hoge dosis antioxidanten en adaptogenen)",
    advies:
      "Bij bloedverdunners, chemo of antidepressiva eerst met de behandelend arts overleggen voor er supplementen worden gestart.",
  },
];

// Superfood-achtergrond (SOLIS-lijn) — beknopte uitleg per product voor inspiratie in het advies.
export const LIFEPLUS_SUPERFOOD_ACHTERGROND = [
  {
    product: "Cacao Mushroom (Reishi / Ganoderma)",
    werking:
      "Reishi-paddenstoel. Ondersteunt hart & bloedvaten, helpt cholesterolbalans, ondersteunt immuunsysteem. Staat bekend als 'paddenstoel van onsterfelijkheid'. Ook lekker over aardbeien.",
  },
  {
    product: "Solis Green Medley",
    werking:
      "Antioxidanten, vitamines, mineralen, fytonutriënten, eiwitten, omega-3. Ondersteunt darmflora en schildklier (jodium), helpt bij ontgiften van zware metalen. Wordt ingezet tijdens darmkuren. LET OP bij schildkliermedicatie — zie contra-indicaties.",
  },
  {
    product: "Purple Flash",
    werking:
      "Mix van appelbes, açaí, bosbes, maquibes, granaatappel, braam, zwarte bessen, vlierbes, druivensap en baobab. Hoge concentratie antioxidanten tegen vrije radicalen. Heerlijk door yoghurt.",
  },
  {
    product: "Golden Milk",
    werking:
      "Kurkuma + ashwagandha + nootmuskaat + gember + kardemom + kaneel. Ondersteunt serotonine-aanmaak (feel-good), werkt ontstekingsremmend, bevordert diepe slaap, helpt bij PMS/stemmingswisselingen. Drink voor het slapen; werkt na 3–6 maanden optimaal.",
  },
  {
    product: "Cacao Boost",
    werking:
      "Cacao-superfoodpoeder rijk aan antioxidanten. Stimuleert endorfine-productie (natuurlijke 'feel-good'), helpt stress verminderen en stemming verbeteren. Basis van Get Zen.",
  },
];

export const LIFEPLUS_VERZENDREGEL = "Boven 80 IP: gratis verzending. Onder 80 IP: €8,75 verzendkosten.";

// Compacte tekstversie voor in de AI-prompt (zonder tokens te verbranden)
export function bouwAdviesgidsPromptSectie(): string {
  const pakketBlok = (cat: AdviesCategorie) => {
    const regels = cat.pakketten.map(
      (p) => `  • ${p.niveau}: ${p.producten.join(" + ")} — ${p.asap_prijs} (${p.waarom})`
    );
    const extra = cat.extra ? `\n  ℹ ${cat.extra}` : "";
    return `**${cat.naam}** (trefwoorden: ${cat.doelen.join(", ")})\n${regels.join("\n")}${extra}`;
  };

  const catBlokken = [
    ...LIFEPLUS_ADVIES_CATEGORIEEN.map(pakketBlok),
    pakketBlok(LIFEPLUS_DETOX_SAPPENKUUR),
  ].join("\n\n");

  const programmaBlokken = LIFEPLUS_PROGRAMMA_PAKKETTEN.map(
    (p) =>
      `  • **${p.naam}** (${p.categorie}${p.doelgroep ? `, ${p.doelgroep}` : ""}) — ${p.prijs} / ${p.ip} IP\n    Producten: ${p.producten.join(", ")}\n    ${p.toelichting}`
  ).join("\n");

  const contraBlokken = LIFEPLUS_CONTRA_INDICATIES.map(
    (c) => `  • Bij **${c.trigger}** (${c.product}): ${c.advies}`
  ).join("\n");

  const superfoodBlokken = LIFEPLUS_SUPERFOOD_ACHTERGROND.map(
    (s) => `  • **${s.product}** — ${s.werking}`
  ).join("\n");

  return `
## LIFEPLUS PRODUCTADVIES-GIDS

${LIFEPLUS_BASIS_FILOSOFIE}

### VASTE PAKKETTEN PER HOOFDCATEGORIE
Elke categorie heeft 3 niveaus: Essential (minimaal), Plus (aangevuld), Complete (premium).

${catBlokken}

### VASTE PROGRAMMA-PAKKETTEN (darm, reset, basis, anti-stress) — prijzen per 01-02-2025
Dit zijn de officiële bundels die als geheel besteld kunnen worden.
${programmaBlokken}

### CONTRA-INDICATIES (altijd checken)
${contraBlokken}

### SUPERFOOD-ACHTERGROND (SOLIS-lijn)
${superfoodBlokken}

### VERZENDING
${LIFEPLUS_VERZENDREGEL}

### HOE ADVISEREN (VERPLICHTE STIJL)
1. Luister naar het doel of de klacht. Bepaal welke hoofdcategorie past (soms meerdere).
2. Start ALTIJD met de basis: 1 tot 3 basisproducten (Daily Light / Proanthenols / OmeGold of de combi Maintain & Protect 100), tenzij die al eerder besteld zijn (check prospect-notities).
3. Voeg 1-3 ondersteunende producten toe voor de specifieke klacht. Kies bij voorkeur het bestaande Essential/Plus/Complete pakket.
4. Als iemand net start en nog geen basis heeft gehad: overweeg "Darmen in Balans" of het uitgebreidere "Darmen in Balans +" als fundament.
5. Noem ASAP-prijs en eventuele verzendkosten als relevant.

### VERPLICHTE FORMULERING (ALTIJD)
Begin elke productsuggestie met: **"Er zijn goede ervaringen met"** (letterlijk). Nooit stellig "dit lost jouw probleem op" of "jij moet X nemen". Altijd ervarings-taal, bescheiden toon.

### VERPLICHTE DISCLAIMER (onder élk productadvies plakken)
> *Kleine notitie: wij zijn geen artsen. Als je onder behandeling of medicatie van een arts staat, overleg dan altijd eerst met je arts voor je iets nieuws start. Voedingssupplementen zijn geen vervanging voor een gevarieerd dieet of een medische behandeling, en zijn niet bedoeld om ziekten te diagnosticeren, behandelen, genezen of voorkomen.*

Bij expliciete medische signalen in het verhaal (medicatie, schildklier, zwangerschap, borstvoeding, chemo, bloedverdunner, antidepressiva): benoem EXTRA dat de persoon éérst terug moet naar de behandelend arts vóór supplementgebruik.
`.trim();
}
