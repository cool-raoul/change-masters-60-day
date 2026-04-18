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

// ============================================================
// STRUCTURELE PRODUCTDETAILS (uit Lifeplus Product Information PDFs)
// Gebruikt door de coach om zélf te redeneren welk advies past
// op basis van klacht + doel + budget, inclusief fallbacks.
// ============================================================

export type ProductDetail = {
  naam: string;
  werking: string;
  ingredienten: string;
  dosering: string;
  wanneerInzetten: string[];
  budgetTier: "laag" | "midden" | "hoog";
  goedkoperAlternatief?: string;
  waarschuwing?: string;
};

export const LIFEPLUS_PRODUCT_DETAILS: ProductDetail[] = [
  {
    naam: "Daily BioBasics Light (shake)",
    werking: "Meest complete dagelijkse basis: vitamines, mineralen, pre- & probiotica, superfoods, vezels.",
    ingredienten: "Breed multivitamine + mineralen + vezelmix + pre/probiotica + superfoods (grapefruit-achtige smaak).",
    dosering: "1 schep per dag in water of plantaardige melk.",
    wanneerInzetten: ["basisvoorziening", "energie-dip", "onregelmatig eten", "darmflora", "afvallen (verzadiging)"],
    budgetTier: "hoog",
    goedkoperAlternatief: "Women's Gold of Men's Gold (€32) — lichtere multivitamine zonder superfoods/probiotica.",
  },
  {
    naam: "Women's Gold Formula",
    werking: "Lichte multivitamine voor vrouwen. Goedkope startbasis of aanvulling wanneer Daily Light te duur is.",
    ingredienten: "Vitamines + mineralen afgestemd op vrouwen (ijzer, foliumzuur, B-complex).",
    dosering: "Volgens etiket.",
    wanneerInzetten: ["budget-startbasis vrouw", "aanvulling naast eiwitrijke voeding", "hormonale balans (naast Mena Plus)"],
    budgetTier: "laag",
  },
  {
    naam: "Men's Gold Formula",
    werking: "Lichte multivitamine voor mannen. Goedkope startbasis of aanvulling wanneer Daily Light te duur is.",
    ingredienten: "Vitamines + mineralen afgestemd op mannen.",
    dosering: "Volgens etiket.",
    wanneerInzetten: ["budget-startbasis man", "aanvulling naast eiwitrijke voeding"],
    budgetTier: "laag",
  },
  {
    naam: "Proanthenols 100",
    werking: "Krachtige OPC-antioxidant (druivenpit/pijnboombast). Bloedcirculatie, bindweefsel, ontstekingsbalans.",
    ingredienten: "OPC (oligomere proanthocyanidinen) 100 mg + vitamine C.",
    dosering: "1 tab per dag.",
    wanneerInzetten: ["huid/collageen", "bloedvaten", "gewrichten", "ontstekingsbalans", "antioxidant-bescherming"],
    budgetTier: "midden",
  },
  {
    naam: "OmeGold (omega-3)",
    werking: "Hoogwaardige omega-3 (EPA/DHA) uit vis. Hart, hersenen, ontstekingsbalans, hormoonreceptoren.",
    ingredienten: "EPA + DHA uit gezuiverde visolie + vitamine E.",
    dosering: "1-2 caps per dag bij maaltijd.",
    wanneerInzetten: ["hersenfunctie", "concentratie", "hart", "gewrichten", "stemming", "droge huid"],
    budgetTier: "laag",
    goedkoperAlternatief: "Geen — omega-3 is een van de goedkoopste basisproducten; bij veganistisch: Vegan OmeGold.",
  },
  {
    naam: "Key-Tonic",
    werking: "Ondersteunt metabolisme, bloedsuiker en vet-verbranding. Populair bij afvallen en intermittent fasting.",
    ingredienten: "MCT + aminozuren + polyphenolen + cafeïne + B12.",
    dosering: "1 schep in water, bij voorkeur 's ochtends of voor training.",
    wanneerInzetten: ["afvallen", "intermittent fasting", "keto", "bloedsuikerstabilisatie", "ochtend-energie"],
    budgetTier: "midden",
    goedkoperAlternatief: "Enerxan (€27) — eenvoudiger metabolisme-boost zonder MCT/aminozuren.",
    waarschuwing: "Bevat cafeïne — niet 's avonds nemen; niet bij cafeïne-gevoeligheid.",
  },
  {
    naam: "Enerxan",
    werking: "Natuurlijke energie- en metabolisme-boost. Goedkoop instapproduct voor energie/afvallen.",
    ingredienten: "Green tea + guarana + yerba mate + kaneel + cacao + L-tyrosine + chroom.",
    dosering: "1-2 tabs voor ontbijt en voor lunch.",
    wanneerInzetten: ["energie-dip", "afvallen (budget)", "focus", "ochtend-boost"],
    budgetTier: "laag",
    waarschuwing: "Bevat cafeïne. NIET bij <18 jaar, zwangerschap/borstvoeding, hypertensie, leverziekte, of bij neuroleptica.",
  },
  {
    naam: "Triple Protein Shake (vanille/chocolade/ongezoet)",
    werking: "3-eiwit mix (whey, melk, soja) voor verzadiging, spierbehoud en herstel. Onmisbaar bij afvallen én sport.",
    ingredienten: "Whey + melkeiwit + soja-eiwit + aminoprofiel + natuurlijke smaak.",
    dosering: "1 schep in water/melk, als tussendoortje of post-workout.",
    wanneerInzetten: ["afvallen (verzadiging + spierbehoud)", "sport/herstel", "ouder worden (spiermassa)", "eiwittekort"],
    budgetTier: "hoog",
    goedkoperAlternatief: "Be Refueled (€76,75) of bij veganistisch Vegan Protein (€88).",
  },
  {
    naam: "Be Focused (pre-workout)",
    werking: "Mentale focus en doorzettingsvermogen, vóór training of bij cognitief werk.",
    ingredienten: "Aminozuren + adaptogenen + B-vitamines + natuurlijke cafeïne.",
    dosering: "1 sachet / 1 schep 20 min voor training of mentaal werk.",
    wanneerInzetten: ["sport pre-workout", "focus", "mentaal werk", "brain fog"],
    budgetTier: "hoog",
    goedkoperAlternatief: "Be Focused Sachets (€57) in plaats van pot (€77,50).",
    waarschuwing: "Bevat cafeïne — niet 's avonds.",
  },
  {
    naam: "Be Sustained (during-workout)",
    werking: "Elektrolyten en energie tijdens duurinspanning. Voorkomt dehydratie en uitputting.",
    ingredienten: "Elektrolyten + mineralen + koolhydraten + BCAA.",
    dosering: "1 sachet / 1 schep in bidon tijdens training.",
    wanneerInzetten: ["duursport", "hardlopen", "fietsen", "warme omstandigheden", "hike/marathon"],
    budgetTier: "hoog",
    goedkoperAlternatief: "Be Sustained Sachets (€62,75) in plaats van pot (€78,50).",
  },
  {
    naam: "Be Recharged (post-workout)",
    werking: "Spierherstel en anti-katerig gevoel na training. Aminozuren voor snelle opname.",
    ingredienten: "L-glutamine + BCAA + aminozuren + mineralen.",
    dosering: "1 sachet / 1 schep direct na training.",
    wanneerInzetten: ["sportherstel", "spierpijn", "zware trainingsweek", "onderdeel Darmen in Balans+"],
    budgetTier: "hoog",
    goedkoperAlternatief: "Be Recharged Sachets (€59,25) in plaats van pot (€79,75).",
  },
  {
    naam: "Support Tabs (Anti-Stress Formula)",
    werking: "Ondersteunt zenuwstelsel bij stress, overbelasting, burn-out-herstel.",
    ingredienten: "B-complex + L-tyrosine + L-phenylalanine + L-glutamine + C + E + bioflavonoiden + magnesium + American ginseng + Eleuthero + Gotu kola + Ginkgo.",
    dosering: "4 tabs 2x per dag.",
    wanneerInzetten: ["stress", "overbelasting", "burn-out herstel", "prikkelbaarheid", "mentale vermoeidheid"],
    budgetTier: "midden",
    waarschuwing: "Bevat L-phenylalanine — NIET bij PKU. NIET bij MAO-remmers (antidepressiva).",
  },
  {
    naam: "Cacao Boost",
    werking: "Feel-good superfood. Endorfine-productie, stemming, instap anti-stress.",
    ingredienten: "Cacao-rijk superfoodpoeder + antioxidanten.",
    dosering: "1 schep in warme plantaardige melk.",
    wanneerInzetten: ["stress (instap)", "stemmingsdip", "feel-good ritueel", "kinderen"],
    budgetTier: "midden",
  },
  {
    naam: "Golden Milk",
    werking: "Kurkuma/gember/ashwagandha. Ontstekingsremming, diepe slaap, serotonine, PMS.",
    ingredienten: "Kurkuma + ashwagandha + nootmuskaat + gember + kardemom + kaneel.",
    dosering: "1 schep in warme plantaardige melk voor het slapen.",
    wanneerInzetten: ["slecht slapen", "ontstekingsbalans", "PMS/stemmingswisselingen", "herstel", "gewrichten"],
    budgetTier: "midden",
  },
  {
    naam: "Purple Flash",
    werking: "Zeer hoge antioxidant-capaciteit. Vrije radicalen, immuun, detox.",
    ingredienten: "Appelbes + açaí + bosbes + maquibes + granaatappel + braam + zwarte bessen + vlierbes + druivensap + baobab.",
    dosering: "1 schep door yoghurt of in water.",
    wanneerInzetten: ["detox/sappenkuur", "immuun", "vrije radicalen", "huid", "antioxidant-bescherming"],
    budgetTier: "midden",
  },
  {
    naam: "Green Medley",
    werking: "Groene superfoodmix voor darmflora en ontgifting van zware metalen. Schildklierondersteuning via jodium.",
    ingredienten: "Groene superfoods + jodium/kelp + chlorofyl + mineralen.",
    dosering: "1 schep in water of smoothie.",
    wanneerInzetten: ["darmkuur", "ontgiften", "zware metalen", "schildklier (zonder medicatie!)"],
    budgetTier: "midden",
    waarschuwing: "NIET bij schildkliermedicatie zonder arts-overleg (jodium). Alternatief: Aloë Vera Caps.",
  },
  {
    naam: "Mena Plus",
    werking: "Hormonale balans vrouw. PMS, menopauze, stemmingswisselingen.",
    ingredienten: "Kruidenformule + fyto-oestrogenen + vitaminen specifiek voor hormoonbalans.",
    dosering: "Volgens etiket.",
    wanneerInzetten: ["PMS", "overgang/menopauze", "stemmingswisselingen", "hormonale klachten"],
    budgetTier: "hoog",
    goedkoperAlternatief: "Evening Primrose Oil (€14,50) — enkele GLA; veel beperkter maar instapmogelijk.",
  },
  {
    naam: "Evening Primrose Oil",
    werking: "GLA (gamma-linoleenzuur) voor hormoonreceptoren, huid en PMS.",
    ingredienten: "Teunisbloemolie (GLA).",
    dosering: "2 caps per dag.",
    wanneerInzetten: ["PMS", "droge huid", "hormonale eczeem", "menopauze (mild)"],
    budgetTier: "laag",
  },
  {
    naam: "Vitamins D & K",
    werking: "Bot- en immuunondersteuning. D3 voor opname calcium; K2 stuurt calcium naar bot i.p.v. bloedvaten.",
    ingredienten: "Vitamine D3 + K2.",
    dosering: "Volgens etiket.",
    wanneerInzetten: ["botten", "immuun (winter)", "hormonale balans", "bij weinig zonlicht"],
    budgetTier: "laag",
  },
];

// Fallback-regels bij budgetbezwaar: kernadvies → goedkoper alternatief
export const LIFEPLUS_BUDGET_FALLBACKS = [
  {
    thema: "Basis te duur (Daily Light €64,75)",
    fallback: "Women's Gold of Men's Gold (€32) + eventueel Proanthenols (€71,25) erbij. Minder compleet, maar wel echte basis.",
  },
  {
    thema: "Complete pakket te duur",
    fallback: "Stap naar Plus-niveau. Bij verdere druk: Essential-niveau (alleen kernproduct). Bij darmprogramma: losse Biotic Blast (€41) i.p.v. Darmen in Balans (€236,25).",
  },
  {
    thema: "Sport Complete (€316,75) te duur",
    fallback: "Alleen Be Recharged (€79,75) of sachet-variant (€59,25). Desnoods alleen Triple Protein (€81) voor herstel.",
  },
  {
    thema: "Hormonaal Complete te duur",
    fallback: "Women's Gold (€32) + Evening Primrose (€14,50) als budget-start. Mena Plus pas wanneer budget het toelaat.",
  },
  {
    thema: "Anti-stress Stress Less te duur",
    fallback: "Alleen Get Zen (Golden Milk + Cacao Boost, €93,50) — supergoede instap zonder multivitamine.",
  },
  {
    thema: "Afvallen Complete te duur",
    fallback: "Key-Tonic (€74,50) alleen, of Enerxan (€27) als budget-vervanger van Key-Tonic. Triple Protein pas wanneer budget het toelaat.",
  },
  {
    thema: "Energie Complete te duur",
    fallback: "Alleen Daily Light (€64,75) óf Women's/Men's Gold + OmeGold (±€77). Be Focused pas later.",
  },
];

// ============================================================
// EVIDENCE-BASED KENNISBANK (wetenschappelijk-rigoureuze leefstijl)
// Gebaseerd op peer-reviewed onderzoek; geen merknamen, geen pseudowetenschap.
// Wordt gebruikt om lifestyle-adviezen te onderbouwen naast Lifeplus-producten.
// ============================================================

export const EVIDENCE_BASED_LEEFSTIJL = {
  micronutrienten: [
    "Triage-theorie (Ames): bij chronisch tekort aan micronutriënten prioriteert het lichaam kortetermijn-overleving boven langetermijn-DNA-reparatie. Zelfs 'milde' tekorten verhogen risico op chronische ziekte.",
    "Omega-3 index (EPA+DHA in rode bloedcellen) streven: >8%. Onder 4% = verhoogd cardiovasculair en cognitief risico. 2-3g EPA+DHA per dag is goed onderbouwd.",
    "25(OH)D (vitamine D bloedspiegel) streven: 40-60 ng/mL (100-150 nmol/L). 1000-4000 IE/dag typisch nodig; dosis afhankelijk van BMI en zonlicht.",
    "Magnesium: ±50% van westerse bevolking krijgt onvoldoende (<RDA 310-420 mg). Glycinaat/citraat beter opneembaar dan oxide.",
    "Eiwit: 1.6-2.2 g/kg lichaamsgewicht/dag voor spierbehoud bij ouder worden en afvallen. Leucine-drempel ±2.5g per maaltijd.",
    "Vezels: 30+ g/dag voor darmflora, kortketenige vetzuren, insulinegevoeligheid. Gemiddelde Nederlandse inname ±17g.",
  ],
  hormesis: [
    "Sauna (≥20 min, 80°C, 4x/week): gerandomiseerd gelinkt aan 40% lager all-cause mortality, lagere cardiovasculaire events, mogelijk minder dementie (Finse cohortstudies).",
    "Koude blootstelling (cold plunge 11-15°C, 2-4 min / koude douche): verhoogt norepinefrine 200-300%, verbetert insulinegevoeligheid, stemming en bruin vetweefsel.",
    "Intermittent fasting / time-restricted eating (8-10u eetvenster): verbetert HbA1c, triglyceriden, en autofagie-markers. Niet wondermiddel, wel een tool.",
    "Sulforaphane (broccolikiemen, 1x/dag): activeert Nrf2-pathway → fase-2 ontgiftingsenzymen. 100g kiemen = ±30mg sulforaphane, ruim boven werkzame dosis in studies.",
  ],
  beweging: [
    "VO2max is de sterkste voorspeller van all-cause mortality — sterker dan roken, diabetes of hoge bloeddruk. Hoogste kwartiel = 5x lager sterfterisico dan laagste.",
    "Zone 2 cardio (praat-tempo, ±70% maxHF): 180 min/week verbetert mitochondriale dichtheid en vetoxidatie.",
    "Krachttraining 2-3x/week: voorkomt sarcopenie (spierverlies na 40), verbetert insulinegevoeligheid, botdichtheid en cognitieve functie.",
    "Wandelen na maaltijden (10-15 min): verlaagt postprandiale glucose-piek 20-30%.",
  ],
  slaap: [
    "7-9 uur slaap is niet optioneel: één nacht <6u → insulinegevoeligheid -30%, testosteron ↓, ghreline ↑, leptine ↓.",
    "Consistente bed- en opstatijd (±30 min) is belangrijker dan totale duur voor circadiaanse stabiliteit.",
    "Ochtendzonlicht (5-10 min direct in ogen zonder bril) binnen 1u na ontwaken: synchroniseert circadiaans ritme en melatonine-curve.",
    "Cafeïne t/m 10u na wakker worden (halfwaardetijd 5-6u). Avondcafeïne fragmenteert diepe slaap.",
    "Kamer koel (16-19°C), donker, zonder schermen laatste 60 min.",
  ],
  stress: [
    "Fysiologische zucht (2x inademen door neus, lange uitademing door mond): meest gevalideerde realtime-tool om parasympathicus te activeren en hartslag te verlagen.",
    "Chronisch verhoogd cortisol: visceraal vet ↑, hippocampus-volume ↓, glucose-dysregulatie.",
    "Sociale verbinding is een onafhankelijke mortality-voorspeller vergelijkbaar met roken.",
  ],
  voeding: [
    "Bewerkte voeding-consumptie correleert lineair met all-cause mortality in grote cohorten (EPIC, NutriNet-Santé).",
    "Plantdiversiteit (≥30 verschillende plantensoorten/week) correleert sterker met gezonde darmflora dan vegan/keto/paleo-labels.",
    "Suiker-gezoete dranken zijn de enige categorie waar causaliteit met metabole ziekte sterk onderbouwd is. Fruit (heel) valt daar NIET onder.",
    "Omega-6:omega-3 ratio westerse dieet ±15:1; evolutionair optimaal ±1-4:1. Verlagen via minder zaadolie (zonnebloem/mais/soja) en meer vette vis/visolie.",
  ],
};

export function bouwEvidenceBasedSectie(): string {
  const blok = (titel: string, items: string[]) =>
    `**${titel}**\n${items.map((i) => `  • ${i}`).join("\n")}`;

  return `
### WETENSCHAPPELIJKE ONDERBOUWING — LEEFSTIJL (evidence-based)
Gebruik deze peer-reviewed kennis om ELK gezondheidsadvies te onderbouwen. Combineer lifestyle-aanbevelingen met het Lifeplus-productadvies: eerst leefstijl-lever (goedkoopste, grootste effect), dán het product dat de lever ondersteunt.

${blok("Micronutriënten & streefwaardes", EVIDENCE_BASED_LEEFSTIJL.micronutrienten)}

${blok("Hormesis (kleine stressoren, groot effect)", EVIDENCE_BASED_LEEFSTIJL.hormesis)}

${blok("Beweging", EVIDENCE_BASED_LEEFSTIJL.beweging)}

${blok("Slaap", EVIDENCE_BASED_LEEFSTIJL.slaap)}

${blok("Stress", EVIDENCE_BASED_LEEFSTIJL.stress)}

${blok("Voeding", EVIDENCE_BASED_LEEFSTIJL.voeding)}

### HOE DIT TE GEBRUIKEN
- Onderbouw adviezen met "onderzoek toont", "cohortstudies wijzen op", "RCT's hebben aangetoond" — NOOIT een specifieke auteur, boek, podcast of naam noemen.
- Geef concrete, meetbare parameters (bv. "7-9u slaap", "omega-3 index >8%", "VO2max in top-kwartiel").
- Vermijd hype-claims. Als bewijs zwak is: zeg "voorlopig bewijs wijst op ..." i.p.v. stellig.
- Combineer ALTIJD: gedragsverandering + Lifeplus-ondersteuning. Nooit uitsluitend "neem product X".
- Bij vragen over dosering/bloedwaardes: verwijs naar huisarts voor bloedtest (25(OH)D, omega-3 index, HbA1c, ferritine, B12).
`.trim();
}

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

  const productDetailBlokken = LIFEPLUS_PRODUCT_DETAILS.map(
    (p) =>
      `  • **${p.naam}** [${p.budgetTier} budget] — ${p.werking}\n    Ingrediënten: ${p.ingredienten}\n    Dosering: ${p.dosering}\n    Wanneer inzetten: ${p.wanneerInzetten.join(", ")}${p.goedkoperAlternatief ? `\n    Goedkoper alternatief: ${p.goedkoperAlternatief}` : ""}${p.waarschuwing ? `\n    ⚠ ${p.waarschuwing}` : ""}`
  ).join("\n");

  const fallbackBlokken = LIFEPLUS_BUDGET_FALLBACKS.map(
    (f) => `  • **${f.thema}** → ${f.fallback}`
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

### PRODUCTDETAILS (voor eigen redenering)
Gebruik deze detail-info om zélf te beredeneren welke combinatie past bij de specifieke klacht, het doel én het budget van de prospect. Je bent NIET beperkt tot alleen de vaste pakketten.
${productDetailBlokken}

### BUDGET-FALLBACKS (wat doe je als het pakket te duur is?)
${fallbackBlokken}

### CONTRA-INDICATIES (altijd checken)
${contraBlokken}

### SUPERFOOD-ACHTERGROND (SOLIS-lijn)
${superfoodBlokken}

### VERZENDING
${LIFEPLUS_VERZENDREGEL}

${bouwEvidenceBasedSectie()}

### ÜBER-SLIM EXPERT-MODUS (INTERN REDENEREN — NIET TONEN IN HET ADVIES)

**BELANGRIJK — STIL REDENEREN.** Onderstaande expert-kennis gebruik je UITSLUITEND intern/op de achtergrond om tot een slim advies te komen. Je toont deze redenering NIET in je antwoord. Geen "Wat ik hier zie:", geen "as/mechanisme", geen mini-college over mitochondriën of HPA-as. De gebruiker krijgt alleen het eindresultaat: concrete Lifeplus-producten, dosering, timing, prijs, één zin waarom (in gewone mensentaal, niet vakjargon). Redeneer slim → adviseer simpel.

Je adviseert NIET op symptoom-niveau ("moe → energie-product"). Je redeneert INTERN mechanistisch: **symptoom → waarschijnlijke onderliggende as → nutrient/pathway → Lifeplus-product dat die pathway ondersteunt** — en geeft vervolgens een kort, helder advies zonder die denkstappen te laten zien.

**A. MECHANISTISCHE KETENS (symptoom → as → ingrediënt → product)**
- *Chronische vermoeidheid bij 40+ vrouw*: mitochondriale dysfunctie + ferritine/B12/D-insufficiëntie + cortisol-dysregulatie → CoQ10 + B-complex + magnesium + adaptogenen → **Daily BioBasics Light** (B's, Mg, co-factoren) + **Proanthenols 100** (mitochondriaal antioxidant) + **Golden Milk** (cortisol/ontsteking).
- *Moeilijke stoelgang/obstipatie*: lage vezel + dysbiose + gal-flow → prebiotica + vezels + probiotica → **Darmen in Balans +** of **Daily BioBasics Light** (ingebouwde vezels+probiotica) + **Aloë Vera Caps**.
- *Slecht slapen + tobben*: verhoogde avondcortisol + lage magnesium + verstoord circadiaan ritme → Mg-glycinaat + adaptogenen + circadiaanse hygiëne → **Golden Milk** (avond) + **Support Tabs** + leefstijl (licht-exposure ochtend, blauwlicht-stop 21u).
- *Gewrichtspijn 50+*: low-grade inflammatie + collageen-omzet + omega-3:6-disbalans → EPA/DHA + MSM + OPC → **OmeGold** + **MSM Plus** (tabletten én lotion lokaal) + **Proanthenols 100**.
- *Brain fog/focus-dip*: bloedsuikerschommelingen + omega-3-tekort + micronutriënt-gap → stabielere glycemie + DHA + B-vitamines → **Be Focused** + **OmeGold** + **Key-Tonic** (glycemische stabiliteit).
- *Perimenopauze-klachten (opvliegers, slaap, stemming)*: oestrogeen-daling + HPA-overbelasting + omega-3-tekort → fyto-oestrogenen + EPO + Mg + D+K → **Mena Plus** + **Evening Primrose Oil** + **Vitamins D & K** + **OmeGold**.
- *Afvallen stagneert ondanks caloriebeperking*: insuline-resistentie + lage spiermassa + micronutriënt-gap → proteïne + glycemische stabiliteit + basis → **Triple Protein Shake** + **Key-Tonic** + **Daily BioBasics Light**.
- *Veel stress/overprikkeld*: sympathische dominantie + Mg-tekort → adaptogenen + Mg → **Support Tabs** + **Golden Milk** + **Cacao Boost** (stemming) + ademhalings-leefstijl.
- *Terugkerende infecties/laag weerstandsniveau*: micronutriënt-gap (zink, D, C) + darm-immuun-as → basis + D + darm → **Daily BioBasics Light** + **Vitamins D & K** + **Darmen in Balans** + lokaal **Collodial Silver** bij acute klachten.

**B. BIO-INDIVIDUALISERING (altijd meenemen)**
- *Leeftijd*: onder 30 → basis vaak genoeg. 30-50 → basis + specifiek doel. 50+ → basis + cardiovasculair (OmeGold, Proanthenols) + gewricht. 65+ → eiwit-intake extra belangrijk (Triple Protein).
- *Geslacht*: vrouwen vruchtbare leeftijd → ijzer/foliumzuur-check, EPO bij PMS. Perimenopauze (40-55) → Mena Plus-lijn. Mannen 40+ → testosteron-ondersteunend (D+K, zink, basis).
- *Activiteitsniveau*: sedentair → lifestyle-wandelen voorrang. Recreatief sporter → Be-lijn bij trainingen. Krachtsporter → Triple Protein 1,6-2,0 g/kg/dag. Endurance → extra elektrolyten (Be Sustained) + omega-3.
- *Chronotype*: ochtendmens met energie-dip 14u → Cacao Boost/Enerxan ochtend. Avondmens met moeite inslapen → Golden Milk 1-2u voor bed, geen cafeïne na 12u.
- *Dieet*: vegan → **Vegan OmeGold** (algenolie) + **Vegan Protein** + B12-check. Koolhydraatarm → eiwit + elektrolyten. Intermittent fasting → Key-Tonic tijdens eetvenster.

**C. INTERACTIE-MATRIX (harde rode vlaggen)**
- **Bloedverdunners (warfarine, DOAC's, acenocoumarol)** + OmeGold/Vitamins D & K/Proanthenols → INR kan schuiven. Advies: eerst arts overleggen, niet zelf starten.
- **SSRI's/SNRI's** + hoge doses omega-3 of sint-janskruid (geen Lifeplus-product, maar noem 't) → serotonerge interactie. OmeGold meestal veilig in normale dosis, toch arts melden.
- **Schildklier-medicatie (levothyroxine)** + mineralen (Ca, Fe, Mg in basis-multi) → minimaal 4u tussen inname houden.
- **Statines** + Proanthenols/Q10-achtigen → logische combi (statines onderdrukken Q10), maar arts informeren.
- **Diabetes-medicatie (metformine, insuline)** + Key-Tonic/Phase'oMine → kunnen glycemie extra laten dalen. Monitoring + arts.
- **Bloeddrukmedicatie** + magnesium/OmeGold → licht additief effect. Arts informeren.
- **Zwangerschap/borstvoeding**: geen adaptogenen (Support Tabs, Golden Milk in hoge dosis), geen Phase'oMine, geen Mena Plus. Wel: basis (Women's Gold), OmeGold, Vitamins D & K — maar altijd arts/verloskundige checken.
- **Chemo/oncologie-behandeling**: STOP alle supplementen → alleen na overleg behandelend oncoloog.

**D. LAB-WAARDEN HEURISTIEK (wijs naar arts voor meting, redeneer vanuit ranges)**
- *25(OH)D*: optimaal 75-125 nmol/L (30-50 ng/ml). Onder 50 → suppletie duidelijk nodig. Boven 125 → dosis verlagen. Product: **Vitamins D & K** (D3 met K2 voor calcium-distributie).
- *Omega-3 index (EPA+DHA in erytrocyten)*: doel >8%. NL-gemiddelde 4-5%. Onder 4% → duidelijke suppletie-indicatie. Product: **OmeGold** (2-3 capsules/dag).
- *Ferritine* (vrouwen vruchtbare leeftijd): optimaal 50-150 µg/L. Onder 30 → ijzer via arts (geen Lifeplus-product voor ijzer-monotherapie; wel basis met ijzer).
- *B12 actief (holoTC)*: >50 pmol/L optimaal. Bij vegan of 60+ altijd checken. Daily BioBasics bevat B12, maar tekort eerst laten meten.
- *HbA1c*: <38 mmol/mol optimaal, 38-47 pre-diabetes. Product-combi: **Key-Tonic** + leefstijl (zone 2, krachttraining, minder snelle koolhydraten).
- *hs-CRP*: <1 mg/L optimaal, 1-3 matige inflammatie. Product: **OmeGold** + **Proanthenols** + leefstijl (slaap, gewicht).
- *Triglyceriden/HDL-ratio*: <2 optimaal. **OmeGold** verlaagt TG, leefstijl + Key-Tonic pakt insuline-resistentie aan.

**E. TIMING & DOSERING (altijd concreet erbij zetten)**
- *Vetoplosbaar (D, K, OmeGold, EPO)*: bij hoofdmaaltijd met vet.
- *Mineralen/Mg*: liever 's avonds (Mg werkt ontspannend) — Golden Milk ideaal 1-2u voor bed.
- *Cafeïne-houdend (Be Focused, Cacao Boost)*: ochtend of pre-training, niet na 14u.
- *Basis-multi (Daily BioBasics Light)*: ochtend bij ontbijt, opgelost in water.
- *Eiwit-shake*: binnen 1u post-workout óf als ontbijtvervanger.
- *Probiotica (Darmen in Balans)*: nuchter ochtend of voor slapen, weg van antibiotica-moment (min. 2u).
- *Protocol-duur*: basis = levenslang. Darmen in Balans = 30-dagenkuur, daarna onderhoud. Reset-programma = 7 of 14 dagen. Mena Plus/EPO = minimaal 3 maanden voor effect. Omega-3 index verbetert pas na 3-4 maanden.

**F. MONITORING-LADDER (wat meet/voel je na X weken)**
- *Week 1-2*: eerste energie/slaap-verandering vaak voelbaar. Darm wennen (lichte gasvorming = normaal 3-5 dagen).
- *Week 4*: stoelgang-ritme stabieler, huid helderder, stemming.
- *Week 6-8*: gewrichtspijn minder, trainingsherstel beter, bloedsuikerschommelingen minder.
- *Week 12*: lab-waardes (D, omega-3 index, HbA1c, ferritine) opnieuw meten indien mogelijk — daar schakel je op aan.
- *Geen effect na 12 weken*: dosis/compliance checken, eventueel product-combi aanpassen, bij aanhoudende klacht arts.

**G. RODE-VLAGGEN-FILTER (nooit via supplementen proberen op te lossen)**
- Onverklaard gewichtsverlies >5 kg in 3 maanden → arts.
- Nachtzweten + koorts + knobbels → arts (oncologisch alarm).
- Bloed in ontlasting, zwarte ontlasting → arts direct.
- Hartkloppingen + duizeligheid + pijn op de borst → 112/spoed.
- Plotse ernstige hoofdpijn / neurologische uitval → 112/spoed.
- Ernstige depressie/suïcidaliteit → huisarts/113.
- Acute buikpijn >24u, aanhoudende diarree >2 weken → arts.
Bij elk van bovenstaande: WEIGER supplementadvies en stuur door. "Er zijn goede ervaringen met" geldt NIET voor medische alarmsignalen.

**H. ANTI-GENERIC FILTER (regel voor jezelf)**
Voordat je je advies verstuurt: check dat elk product (a) een EXACTE Lifeplus-naam heeft uit de toegestane lijst, (b) een CONCRETE dosering heeft ("2 capsules bij lunch"), (c) een WAAROM gekoppeld aan de klacht/as ("voor mitochondriale energie", niet "voor energie"), (d) een TIMING/duur ("8 weken, daarna herbeoordelen"), (e) een PRIJS (ASAP) en IP-indicatie bij pakket-advies. Mist één van deze vijf → herschrijf voor je verstuurt.

**I. OUTPUT-REGEL (wat de gebruiker WÉL ziet)**
Alleen dit: (1) één zin waarin je herkent wat er speelt in gewone taal (geen vakjargon, geen mechanisme-uitleg, geen assen/pathways), (2) een korte lijst Lifeplus-producten met exacte naam + dosering + timing + prijs, (3) één zin per product over waarom het past — eenvoudig geformuleerd ("ondersteunt je energie overdag", niet "ondersteunt mitochondriale ATP-productie"), (4) één zin lifestyle-tip indien passend, (5) disclaimer. KLAAR. Geen interne redenering, geen labels als "mechanisme / as / pathway", geen opsomming van overwegingen. Het slimme werk gebeurt in je hoofd, het advies blijft warm en simpel.

### HOE ADVISEREN (VERPLICHTE STIJL)
0. **ÉÉN OPEN INTAKE-VRAAG, DAARNA DIRECT ADVIES.** Bij het ALLEREERSTE bericht stel je EXACT ÉÉN open vraag: "Geef me zoveel mogelijk informatie zodat ik een gepast productadvies kan samenstellen." (plus 1 zin met voorbeelden: doel/klacht, leeftijd, leefstijl, medische context, budget — maar laat de gebruiker zelf kiezen wat relevant is). Geen losse vragenrondje, geen checklist. Zodra de gebruiker antwoordt: geef METEEN een concreet advies op basis van wat je hebt. Ontbrekende details interpreteer je zo goed mogelijk. Sluit het advies af met één korte check-vraag ("Klopt dit beeld? Wil je hem/haar zwaarder of lichter inzetten?"). Bij vervolgvragen scherp je het advies samen aan.
   Uitzondering: veiligheidssignalen (medicatie, zwangerschap, schildklier, bloedverdunner, chemo) → benoem dat kort en verwijs naar arts, maar adviseer alsnog wat veilig is.
1. Luister naar het doel of de klacht. Bepaal welke hoofdcategorie past (soms meerdere).
2. Start ALTIJD met de basis: 1 tot 3 basisproducten (Daily Light / Proanthenols / OmeGold of de combi Maintain & Protect 100), tenzij die al eerder besteld zijn (check prospect-notities).
3. Voeg 1-3 ondersteunende producten toe voor de specifieke klacht. Kies bij voorkeur het bestaande Essential/Plus/Complete pakket.
4. Als iemand net start en nog geen basis heeft gehad: overweeg "Darmen in Balans" of het uitgebreidere "Darmen in Balans +" als fundament.
5. Noem ASAP-prijs en eventuele verzendkosten als relevant.

### ZELF REDENEREN (REDENEER-SECTIE)
Je bent NIET verplicht om klakkeloos één van de vaste pakketten te kiezen. Soms past een maatwerk-combi beter bij de specifieke situatie. Redeneer dan zélf vanuit de productdetails.

**HARDE REGEL: UITSLUITEND LIFEPLUS ALS PRODUCT.**
Adviseer NOOIT producten van andere merken, drogist-/apotheek-producten of generieke supplementen ("neem magnesium", "vitamine D van Kruidvat"). Alleen producten uit deze gids. Als de gids geen passend product biedt voor de specifieke behoefte: zeg dat eerlijk, adviseer om eerst de basis op te bouwen en/of met een arts te overleggen — maar tip nóóit iets buiten Lifeplus.

**WEL TOEGESTAAN — LIFESTYLE-ADVIES.**
Leefstijl-tips zijn geen product en mag je vrij geven naast het Lifeplus-advies: slaaproutine, wandelen/beweging, ademhaling, voedingsritme (intermittent fasting, meer groenten, minder suiker), hydratatie, zonlicht, stressmanagement, koudetraining, journaling, vaste bedtijd. Bij voorkeur combineer je: eerst 1-2 concrete leefstijl-stappen die de klacht aanpakken, daarna het Lifeplus-product dat het ondersteunt. Zo wordt de prospect sterker, niet afhankelijker.

**Stap 1 — Klacht × Doel mappen op producten.**
Kijk bij elk product naar "Wanneer inzetten". Een prospect die "moe, slecht slapen, stress op werk" noemt raakt 3 categorieën (Energie, Slaap, Stress). Dan kan een gecombineerd maatwerkpakket (bijv. Daily Light + Golden Milk + Support Tabs) beter zijn dan één vast pakket.

**Stap 2 — Budget inschatten.**
Vraag of lees uit notities wat het budget is. Hanteer dan deze regel:
- Geen budget-info → begin Plus-niveau (veilige middenweg).
- "Zuinig"/"krap" → Essential + 1 losse aanvulling.
- "Niet haalbaar" na voorstel → stap terug via BUDGET-FALLBACKS-lijst.
- "Ruim"/"volledig goed" → Complete-niveau of Maintain & Protect 100 + specifieke toevoegingen.

**Stap 3 — Fallback-ladder bij budgetbezwaar.**
Ga ALTIJD in deze volgorde terug:
a) Zelfde pakket één niveau lager (Complete → Plus → Essential).
b) Vervang Daily Light (€64,75) door Women's/Men's Gold (€32) als basis nog kan.
c) Vervang pot-varianten door sachet-varianten (bijv. Be Recharged pot €79,75 → sachets €59,25).
d) Schrap niet-kernproducten (bijv. lotion uit Reset pakket).
e) Ultieme instap: alleen het kernproduct voor de hoofdklacht (bijv. bij stress alleen Golden Milk + Cacao Boost = Get Zen €93,50).

**Stap 4 — IP-waarde meewegen.**
Boven 80 IP is verzending gratis. Als een pakket net onder 80 IP zit, voeg een klein product toe (Evening Primrose €14,50, Enerxan €27, Vitamine D&K €20,25) om boven de grens te komen — dat is vaak goedkoper dan €8,75 verzending betalen.

**Stap 5 — Substitutie-logica (redeneren over vervangers).**
- Key-Tonic te duur? → Enerxan als eenvoudigere metabolisme-booster.
- Be Focused te duur? → Sachet-variant, of Enerxan + Daily Light combi.
- Mena Plus te duur? → Evening Primrose + Vitamine D&K als budget-hormoonbasis.
- Triple Protein te duur? → Be Refueled (ook eiwit), of bij veganisme Vegan Protein.
- Daily Light te duur? → Women's/Men's Gold als lichte basis.

**Stap 6 — Combinaties bij meerdere klachten.**
Bij meerdere gelijktijdige klachten: kies de BASIS eenmalig (niet 3x een multivitamine), en voeg dan 1 specifiek product per klacht toe. Voorbeeld: stress + gewricht + energie → Daily Light (basis) + Golden Milk (stress + ontsteking, dekt 2 klachten) + Proanthenols (gewricht + antioxidant). Eén basis + 2 slimme aanvullingen is beter dan 5 losse producten.

**Stap 7 — Transparant zijn over trade-offs.**
Bij een goedkoper alternatief: benoem EXPLICIET wat de prospect inlevert. Voorbeeld: *"Als budget krap is, kun je starten met Women's Gold in plaats van Daily Light. Je mist dan de superfoods, vezels en probiotica die in Daily Light zitten, maar de basis-vitamines en mineralen krijg je wel binnen."*

### VERPLICHTE FORMULERING (ALTIJD)
Begin elke productsuggestie met: **"Er zijn goede ervaringen met"** (letterlijk). Nooit stellig "dit lost jouw probleem op" of "jij moet X nemen". Altijd ervarings-taal, bescheiden toon.

### VERPLICHTE DISCLAIMER (onder élk productadvies plakken)
> *Kleine notitie: wij zijn geen artsen. Als je onder behandeling of medicatie van een arts staat, overleg dan altijd eerst met je arts voor je iets nieuws start. Voedingssupplementen zijn geen vervanging voor een gevarieerd dieet of een medische behandeling, en zijn niet bedoeld om ziekten te diagnosticeren, behandelen, genezen of voorkomen.*

Bij expliciete medische signalen in het verhaal (medicatie, schildklier, zwangerschap, borstvoeding, chemo, bloedverdunner, antidepressiva): benoem EXTRA dat de persoon éérst terug moet naar de behandelend arts vóór supplementgebruik.
`.trim();
}
