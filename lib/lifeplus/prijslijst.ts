// ============================================================
// LIFEPLUS PRIJSLIJST — bestelnummers, IP-waarden en prijzen
// Bron: officiële Lifeplus prijslijst NL, datum 03/2026, ITEM #3018
// © 2026 Lifeplus Europe Ltd.
//
// Gebruik: prospect-product-aanbevelingen, IP-rekenmodule,
// ASAP-vs-normaal-prijs vergelijking, leadmagnet-content.
//
// LET OP: prijzen wijzigen periodiek. Bij update van de prijslijst
// (verschijnt meestal jaarlijks) deze file bijwerken én de datum in
// PRIJSLIJST_METADATA aanpassen.
//
// IP = Incentive Points. Bij 80+ IP per bestelling: gratis verzending.
// ASAP = Auto-Ship Advantage Program (abonnement, lagere prijs).
// ============================================================

export type LifeplusCategorie =
  | "aanbevolen"
  | "voedingssupplementen"
  | "solis"
  | "sportvoeding"
  | "forever-young"
  | "persoonlijke-verzorging"
  | "accessoires"
  | "drinkwaterfilter"
  | "pets";

export type LifeplusPrijsItem = {
  /** Bestelnummer in Lifeplus systeem (4-cijferig). Stabiele key. */
  bestelNr: string;
  /** Volledige productnaam zoals op de prijslijst. */
  naam: string;
  /** Categorie waarin het product valt op de prijslijst. */
  categorie: LifeplusCategorie;
  /** Inhoud (bijv. "60", "180", "300 g", "150 ml"). Optioneel als niet duidelijk. */
  inhoud?: string;
  /** Normale prijs in euro (los kopen, geen abonnement). */
  normalePrijs?: number;
  /** Incentive Points per bestelling van dit product. */
  ip?: number;
  /** ASAP-prijs in euro (auto-ship abonnement, doorlopend). */
  asapPrijs?: number;
  /** Korte uitleg / samenstelling. Vooral bij combi-pakketten. */
  beschrijving?: string;
};

// ============================================================
// METADATA — algemene info uit prijslijst
// ============================================================

export const PRIJSLIJST_METADATA = {
  /** Maand van uitgifte van deze prijslijst (bron-PDF). */
  bronDatum: "2026-03",
  /** ITEM-nummer onderaan de PDF voor traceerbaarheid. */
  bronItem: "#3018",
  /** Standaard verzendtarief in euro voor bestellingen tot 31,5 kg, incl. BTW. */
  verzendkostenEuro: 8.47,
  /** Vanaf dit aantal IP is verzending gratis. */
  gratisVerzendVanafIP: 80,
  /** Aantal dagen geld-terug-garantie. */
  garantieDagen: 30,
  /** Maximaal gewicht voor standaard verzending in kg. */
  maxGewichtKg: 31.5,
  /** Levertijd in werkdagen (streven). */
  levertijdWerkdagen: { min: 2, max: 5 },
  /** Klantenservice telefoonnummer (gratis vanaf vaste lijn). */
  klantenserviceNL: "08000 203639",
  /** E-mail Lifeplus Europe. */
  email: "info.eu@lifeplus.com",
  /** Website. */
  website: "Lifeplus.com",
  /** Kantoortijden. */
  kantoortijden: "ma t/m vr 8.00-19.00",
  /** Bestellen kan 24/7 via e-mail. */
  bestellenAltijd: true,
} as const;

// ============================================================
// PRIJSLIJST — alle producten
// Volgorde volgt de officiële PDF (sectie per sectie).
//
// Waar prijs/IP-waarden nog ontbreken (?): de PDF-layout had op die
// regel verschoven kolommen, dus liever leeg dan een verkeerde waarde.
// Aanvullen vanaf de officiële Lifeplus-bestelpagina indien nodig.
// ============================================================

export const LIFEPLUS_PRIJSLIJST: LifeplusPrijsItem[] = [
  // ---------- LIFEPLUS BEVEELT AAN (combi-pakketten) ----------
  {
    bestelNr: "3188",
    naam: "Maintain & Protect 50",
    categorie: "aanbevolen",
    inhoud: "1 set",
    normalePrijs: 122.0,
    ip: 75.0,
    asapPrijs: 110.75,
    beschrijving: "Daily BioBasics, Proanthenols 50 mg",
  },
  {
    bestelNr: "3185",
    naam: "Maintain & Protect 100",
    categorie: "aanbevolen",
    inhoud: "1 set",
    normalePrijs: 152.25,
    ip: 97.5,
    asapPrijs: 139.5,
    beschrijving: "Daily BioBasics, Proanthenols 100 mg",
  },
  {
    bestelNr: "3184",
    naam: "Maintain & Protect 100 Gold",
    categorie: "aanbevolen",
    inhoud: "1 set",
    normalePrijs: 197.25,
    ip: 127.0,
    asapPrijs: 182.25,
    beschrijving: "Daily BioBasics, Proanthenols 100 mg, OmeGold",
  },
  {
    bestelNr: "3187",
    naam: "Everyday Wellbeing",
    categorie: "aanbevolen",
    inhoud: "1 set",
    normalePrijs: 99.25,
    ip: 65.5,
    asapPrijs: 94.25,
    beschrijving: "TVM-Plus, Proanthenols 100 mg",
  },
  {
    bestelNr: "3186",
    naam: "Everyday Wellbeing Gold",
    categorie: "aanbevolen",
    inhoud: "1 set",
    normalePrijs: 144.5,
    ip: 95.0,
    asapPrijs: 137.0,
    beschrijving: "TVM-Plus, Proanthenols 100 mg, OmeGold",
  },

  // ---------- VOEDINGSSUPPLEMENTEN ----------
  { bestelNr: "3129", naam: "Aloe Vera Caps", categorie: "voedingssupplementen", inhoud: "180" },
  { bestelNr: "3165", naam: "Biotic Blast", categorie: "voedingssupplementen", inhoud: "300" },
  { bestelNr: "3115", naam: "Brain Formula", categorie: "voedingssupplementen", inhoud: "180" },
  { bestelNr: "3133", naam: "CalMag Plus", categorie: "voedingssupplementen", inhoud: "762 g" },
  { bestelNr: "3149", naam: "Circulation Formula", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3177", naam: "Cogelin", categorie: "voedingssupplementen", inhoud: "786 g" },
  { bestelNr: "3157", naam: "Co-Q-10 Plus", categorie: "voedingssupplementen", inhoud: "378 g" },
  { bestelNr: "3166", naam: "Daily BioBasics", categorie: "voedingssupplementen", inhoud: "480" },
  { bestelNr: "3168", naam: "Daily BioBasics Light", categorie: "voedingssupplementen", inhoud: "799 g" },
  { bestelNr: "3113", naam: "Daily BioBasics Veggie Caps", categorie: "voedingssupplementen", inhoud: "90" },
  { bestelNr: "3167", naam: "Daily Plus Zonder Jodium", categorie: "voedingssupplementen", inhoud: "30" },
  { bestelNr: "3153", naam: "Digestive Formula", categorie: "voedingssupplementen", inhoud: "120" },
  { bestelNr: "3112", naam: "Lifeplus Discovery", categorie: "voedingssupplementen", inhoud: "90" },
  { bestelNr: "3151", naam: "D-Mannose Plus", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3154", naam: "EPA Plus", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3138", naam: "Evening Primrose Oil", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3139", naam: "Eye Formula", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3136", naam: "Fusions Red", categorie: "voedingssupplementen", inhoud: "300" },
  { bestelNr: "3105", naam: "FY Skin Formula", categorie: "voedingssupplementen", inhoud: "120" },
  { bestelNr: "3161", naam: "Heart Formula", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3143", naam: "Immune Formula", categorie: "voedingssupplementen", inhoud: "120" },
  { bestelNr: "3147", naam: "Iron Plus", categorie: "voedingssupplementen", inhoud: "150 g" },
  { bestelNr: "3119", naam: "Joint Formula", categorie: "voedingssupplementen", inhoud: "867 g" },
  { bestelNr: "3222", naam: "Key-Tonic", categorie: "voedingssupplementen", inhoud: "864 g" },
  { bestelNr: "3246", naam: "Lifeplus Triple Protein Shake: chocoladesmaak", categorie: "voedingssupplementen", inhoud: "813 g" },
  { bestelNr: "3261", naam: "Lifeplus Triple Protein Shake: chocoladesmaak (ongezoet)", categorie: "voedingssupplementen", inhoud: "810 g" },
  { bestelNr: "3247", naam: "Lifeplus Triple Protein Shake: vanillesmaak", categorie: "voedingssupplementen", inhoud: "813 g" },
  { bestelNr: "3248", naam: "Lifeplus Triple Protein Shake: vanillesmaak (ongezoet)", categorie: "voedingssupplementen", inhoud: "810 g" },
  { bestelNr: "3175", naam: "Lifeplus Vegan Protein Shake: chocoladesmaak", categorie: "voedingssupplementen", inhoud: "1235 g" },
  { bestelNr: "3176", naam: "Lifeplus Vegan Protein Shake: vanillesmaak", categorie: "voedingssupplementen", inhoud: "1232 g" },
  { bestelNr: "3159", naam: "Men's Gold Formula", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3156", naam: "Women's Gold Formula", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3148", naam: "Lifeplus Enerxan", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3127", naam: "Lyprinex (60ct)", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3229", naam: "Lyprinex (180ct)", categorie: "voedingssupplementen", inhoud: "180" },
  { bestelNr: "3233", naam: "mangOmega", categorie: "voedingssupplementen", inhoud: "355 ml" },
  { bestelNr: "3260", naam: "OmegAhi Peach Mango", categorie: "voedingssupplementen", inhoud: "450 ml" },
  { bestelNr: "3134", naam: "Lifeplus Menaplus", categorie: "voedingssupplementen", inhoud: "240" },
  { bestelNr: "3145", naam: "Men's Formula", categorie: "voedingssupplementen", inhoud: "120" },
  { bestelNr: "3141", naam: "Micro-Mins Plus", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3103", naam: "MSM Plus", categorie: "voedingssupplementen", inhoud: "240" },
  { bestelNr: "3102", naam: "OmeGold", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3254", naam: "Parabalance", categorie: "voedingssupplementen", inhoud: "180" },
  { bestelNr: "3152", naam: "Phase'oMine", categorie: "voedingssupplementen", inhoud: "180" },
  { bestelNr: "3160", naam: "PH Plus", categorie: "voedingssupplementen", inhoud: "270", beschrijving: "PH Plus test strips: eenmaal gratis bij eerste aankoop" },
  { bestelNr: "4619", naam: "PH Plus test strips", categorie: "voedingssupplementen", inhoud: "1" },
  { bestelNr: "3101", naam: "Proanthenols 100", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3111", naam: "Proanthenols 50 (sm)", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3150", naam: "Proanthenols 50 (lg)", categorie: "voedingssupplementen", inhoud: "240" },
  { bestelNr: "3258", naam: "Proanthenols 200 SV", categorie: "voedingssupplementen", inhoud: "30" },
  { bestelNr: "3249", naam: "Real NRG", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3144", naam: "RYR Plus", categorie: "voedingssupplementen", inhoud: "120" },
  { bestelNr: "3126", naam: "Somazyme", categorie: "voedingssupplementen", inhoud: "240" },
  { bestelNr: "3125", naam: "Support Tabs Plus", categorie: "voedingssupplementen", inhoud: "180" },
  { bestelNr: "3104", naam: "TVM-Plus", categorie: "voedingssupplementen", inhoud: "300" },
  { bestelNr: "3132", naam: "Ubiquinol 100 (30ct)", categorie: "voedingssupplementen", inhoud: "30" },
  { bestelNr: "3228", naam: "Ubiquinol 100 (60ct)", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3110", naam: "Vegan OmeGold", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3128", naam: "Vitamin-C-Plus", categorie: "voedingssupplementen", inhoud: "274 g" },
  { bestelNr: "3120", naam: "Vitamins D&K", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3162", naam: "Vitamin-E-Complex", categorie: "voedingssupplementen", inhoud: "60" },
  { bestelNr: "3146", naam: "Vita-Saurus", categorie: "voedingssupplementen", inhoud: "200" },
  { bestelNr: "3169", naam: "X-Cell", categorie: "voedingssupplementen", inhoud: "336 g" },
  { bestelNr: "3170", naam: "X-Cell+", categorie: "voedingssupplementen", inhoud: "336 g" },
  { bestelNr: "3124", naam: "Yummies", categorie: "voedingssupplementen", inhoud: "120" },
  { bestelNr: "3227", naam: "Zinc Boost", categorie: "voedingssupplementen", inhoud: "60" },

  // ---------- SOLIS SUPERFOODS BY LIFEPLUS ----------
  { bestelNr: "3224", naam: "SOLIS Green Medley", categorie: "solis", inhoud: "171 g" },
  { bestelNr: "3225", naam: "SOLIS Purple Flash", categorie: "solis", inhoud: "183 g" },
  { bestelNr: "3226", naam: "SOLIS Cacao Boost", categorie: "solis", inhoud: "210 g" },
  { bestelNr: "3241", naam: "SOLIS Golden Milk", categorie: "solis", inhoud: "182 g" },

  // ---------- SPORTVOEDING ----------
  { bestelNr: "3178", naam: "Be Focused bessen", categorie: "sportvoeding", inhoud: "384 g" },
  { bestelNr: "3179", naam: "Be Focused citrus", categorie: "sportvoeding", inhoud: "384 g" },
  { bestelNr: "3180", naam: "Be Sustained bessen", categorie: "sportvoeding", inhoud: "663 g" },
  { bestelNr: "3181", naam: "Be Sustained citrus", categorie: "sportvoeding", inhoud: "663 g" },
  { bestelNr: "3182", naam: "Be Recharged bessen", categorie: "sportvoeding", inhoud: "624 g" },
  { bestelNr: "3183", naam: "Be Recharged citrus", categorie: "sportvoeding", inhoud: "624 g" },
  { bestelNr: "4145", naam: "Be Focused Sachets bessen", categorie: "sportvoeding", inhoud: "30 x 13,4 g" },
  { bestelNr: "4146", naam: "Be Focused Sachets citrus", categorie: "sportvoeding", inhoud: "30 x 13,4 g" },
  { bestelNr: "4147", naam: "Be Sustained Sachets bessen", categorie: "sportvoeding", inhoud: "30 x 22,3 g" },
  { bestelNr: "4148", naam: "Be Sustained Sachets citrus", categorie: "sportvoeding", inhoud: "30 x 22,3 g" },
  { bestelNr: "4149", naam: "Be Recharged Sachets bessen", categorie: "sportvoeding", inhoud: "30 x 20,8 g" },
  { bestelNr: "4150", naam: "Be Recharged Sachets citrus", categorie: "sportvoeding", inhoud: "30 x 20,8 g" },
  { bestelNr: "4158", naam: "Be Refueled Chocoladesmaak", categorie: "sportvoeding", inhoud: "804 g" },
  { bestelNr: "4156", naam: "Be Refueled Vanillesmaak", categorie: "sportvoeding", inhoud: "804 g" },

  // ---------- FOREVER YOUNG (huidverzorging) ----------
  { bestelNr: "4144", naam: "Forever Young Day Crème SPF 25", categorie: "forever-young", inhoud: "50 ml" },
  { bestelNr: "4129", naam: "Forever Young Gentle Cream Cleanser", categorie: "forever-young", inhoud: "150 ml" },
  { bestelNr: "4130", naam: "Forever Young Rejuvenating Eye Crème", categorie: "forever-young", inhoud: "15 ml" },
  { bestelNr: "4131", naam: "Forever Young Radiance Serum", categorie: "forever-young", inhoud: "30 ml" },
  { bestelNr: "4132", naam: "Forever Young Rich Moisturizing Crème", categorie: "forever-young", inhoud: "50 ml" },
  { bestelNr: "4133", naam: "Forever Young Strengthen and Restore Shampoo", categorie: "forever-young", inhoud: "250 ml" },
  { bestelNr: "4134", naam: "Forever Young Repair and Protect Conditioner", categorie: "forever-young", inhoud: "250 ml" },

  // ---------- PERSOONLIJKE VERZORGING ----------
  { bestelNr: "6695", naam: "Theeboomolietandpasta (zonder fluor)", categorie: "persoonlijke-verzorging", inhoud: "114 ml" },
  { bestelNr: "1021", naam: "MSM Plus Vital Care Lotion", categorie: "persoonlijke-verzorging", inhoud: "113 g" },
  { bestelNr: "6134", naam: "Lifeplus Wonder Gel", categorie: "persoonlijke-verzorging", inhoud: "100 ml" },
  { bestelNr: "6654", naam: "Natural Gold Hand & Body Bar", categorie: "persoonlijke-verzorging", inhoud: "170 g" },
  { bestelNr: "2632", naam: "Natural Hand Cream", categorie: "persoonlijke-verzorging", inhoud: "242 ml" },
  { bestelNr: "2631", naam: "Natural Body Wash", categorie: "persoonlijke-verzorging", inhoud: "500 ml" },
  { bestelNr: "2630", naam: "Natural Hand & Body Lotion", categorie: "persoonlijke-verzorging", inhoud: "300 ml" },
  { bestelNr: "2629", naam: "Natural Hand Wash", categorie: "persoonlijke-verzorging", inhoud: "500 ml" },

  // ---------- ACCESSOIRES ----------
  { bestelNr: "6074", naam: "Mixbeker", categorie: "accessoires", inhoud: "1" },
  { bestelNr: "2178", naam: "Set met houten maatschepjes", categorie: "accessoires", inhoud: "1 set" },

  // ---------- DRINKWATERFILTERSYSTEMEN ----------
  { bestelNr: "0465", naam: "Boven aanrecht (waterfilter)", categorie: "drinkwaterfilter", inhoud: "1" },
  { bestelNr: "0466", naam: "Onder aanrecht (waterfilter)", categorie: "drinkwaterfilter", inhoud: "1" },
  { bestelNr: "0467", naam: "Replacement filter model 750", categorie: "drinkwaterfilter", inhoud: "1" },
  { bestelNr: "1496", naam: "Boven aanrecht klein (waterfilter)", categorie: "drinkwaterfilter", inhoud: "1" },
  { bestelNr: "1497", naam: "Onder aanrecht klein (waterfilter)", categorie: "drinkwaterfilter", inhoud: "1" },
  { bestelNr: "1498", naam: "Replacement filter model 400", categorie: "drinkwaterfilter", inhoud: "1" },
  { bestelNr: "1499", naam: "SENSEH keramische plaat", categorie: "drinkwaterfilter", inhoud: "1" },

  // ---------- LIFEPLUS PETS ----------
  { bestelNr: "3250", naam: "Lifeplus Pets Calm", categorie: "pets", inhoud: "90" },
  { bestelNr: "3251", naam: "Lifeplus Pets Move", categorie: "pets", inhoud: "90" },
  { bestelNr: "3252", naam: "Lifeplus Pets Digest", categorie: "pets", inhoud: "90" },
  { bestelNr: "3257", naam: "Lifeplus Pets Care & Comfort", categorie: "pets", inhoud: "177 ml" },
  { bestelNr: "3259", naam: "Lifeplus Pets Ahiflower Oil", categorie: "pets", inhoud: "164 g" },
  { bestelNr: "5390", naam: "Lifeplus Pets Peanut Butter Biscuits", categorie: "pets", inhoud: "210 g" },
  { bestelNr: "4166", naam: "Lifeplus Pets Mobile App Abonnement maandelijks", categorie: "pets", inhoud: "1" },
  { bestelNr: "4165", naam: "Lifeplus Pets Mobile App Abonnement jaarlijks", categorie: "pets", inhoud: "1" },
];

// ============================================================
// HELPERS — lookup functies voor gebruik in features
// ============================================================

/**
 * Zoek een product op bestelnummer.
 * Returns undefined als bestelnummer niet bestaat.
 */
export function getProductByBestelNr(bestelNr: string): LifeplusPrijsItem | undefined {
  return LIFEPLUS_PRIJSLIJST.find((p) => p.bestelNr === bestelNr);
}

/**
 * Zoek alle producten in een specifieke categorie.
 */
export function getProductenInCategorie(categorie: LifeplusCategorie): LifeplusPrijsItem[] {
  return LIFEPLUS_PRIJSLIJST.filter((p) => p.categorie === categorie);
}

/**
 * Fuzzy zoek op naam (case-insensitive substring match).
 */
export function zoekProductenOpNaam(zoekterm: string): LifeplusPrijsItem[] {
  const term = zoekterm.toLowerCase().trim();
  if (!term) return [];
  return LIFEPLUS_PRIJSLIJST.filter((p) => p.naam.toLowerCase().includes(term));
}

/**
 * Bereken totale IP voor een lijst van bestellingen.
 * Returns 0 voor producten waarvan IP onbekend is.
 */
export function berekenTotaalIP(
  bestellingen: { bestelNr: string; aantal: number }[],
): number {
  return bestellingen.reduce((totaal, b) => {
    const product = getProductByBestelNr(b.bestelNr);
    if (!product?.ip) return totaal;
    return totaal + product.ip * b.aantal;
  }, 0);
}

/**
 * Check of een bestelling kwalificeert voor gratis verzending.
 */
export function heeftGratisVerzending(totaalIP: number): boolean {
  return totaalIP >= PRIJSLIJST_METADATA.gratisVerzendVanafIP;
}

/**
 * Bereken besparing tussen normale en ASAP-prijs voor een product.
 * Returns null als één van beide prijzen ontbreekt.
 */
export function berekenAsapBesparing(item: LifeplusPrijsItem): number | null {
  if (item.normalePrijs == null || item.asapPrijs == null) return null;
  return Math.round((item.normalePrijs - item.asapPrijs) * 100) / 100;
}

/**
 * Bouwt een compacte prompt-sectie van de prijslijst voor de ELEVA Mentor
 * en Product Adviser. Toont per categorie alleen producten met IP-waarde.
 * Producten zonder IP-waarde worden onderaan kort genoemd (bestelnummers).
 *
 * Gebruik:
 *   import { bouwPrijslijstPromptSectie } from "@/lib/lifeplus/prijslijst";
 *   const sectie = bouwPrijslijstPromptSectie();
 */
export function bouwPrijslijstPromptSectie(): string {
  const categorieLabels: Record<LifeplusCategorie, string> = {
    aanbevolen: "LIFEPLUS BEVEELT AAN (combi-pakketten)",
    voedingssupplementen: "VOEDINGSSUPPLEMENTEN",
    solis: "SOLIS SUPERFOODS",
    sportvoeding: "SPORTVOEDING",
    "forever-young": "FOREVER YOUNG (huidverzorging)",
    "persoonlijke-verzorging": "PERSOONLIJKE VERZORGING",
    accessoires: "ACCESSOIRES",
    drinkwaterfilter: "DRINKWATERFILTERS",
    pets: "LIFEPLUS PETS",
  };

  const volgorde: LifeplusCategorie[] = [
    "aanbevolen",
    "voedingssupplementen",
    "solis",
    "sportvoeding",
    "forever-young",
    "persoonlijke-verzorging",
    "drinkwaterfilter",
    "accessoires",
    "pets",
  ];

  const formatProduct = (p: LifeplusPrijsItem): string => {
    const stukjes: string[] = [`#${p.bestelNr} ${p.naam}`];
    if (p.inhoud) stukjes.push(`(${p.inhoud})`);
    const prijsStuk: string[] = [];
    if (p.asapPrijs != null) prijsStuk.push(`ASAP €${p.asapPrijs.toFixed(2)}`);
    if (p.normalePrijs != null && p.asapPrijs == null) {
      prijsStuk.push(`€${p.normalePrijs.toFixed(2)}`);
    }
    if (p.ip != null) prijsStuk.push(`${p.ip} IP`);
    const prijsStr = prijsStuk.length > 0 ? ` — ${prijsStuk.join(" · ")}` : "";
    const beschr = p.beschrijving ? ` (${p.beschrijving})` : "";
    return `${stukjes.join(" ")}${prijsStr}${beschr}`;
  };

  const blokken: string[] = [];
  for (const cat of volgorde) {
    const items = getProductenInCategorie(cat);
    if (items.length === 0) continue;
    const metPrijs = items.filter((p) => p.asapPrijs != null || p.ip != null);
    const zonderPrijs = items.filter((p) => p.asapPrijs == null && p.ip == null);

    let blok = `**${categorieLabels[cat]}**`;
    if (metPrijs.length > 0) {
      blok += "\n" + metPrijs.map((p) => `  • ${formatProduct(p)}`).join("\n");
    }
    if (zonderPrijs.length > 0) {
      const lijst = zonderPrijs
        .map((p) => `#${p.bestelNr} ${p.naam}${p.inhoud ? ` (${p.inhoud})` : ""}`)
        .join(", ");
      blok += `\n  ▫ Overig (prijs op aanvraag / nog niet vastgelegd): ${lijst}`;
    }
    blokken.push(blok);
  }

  return `## LIFEPLUS PRIJSLIJST — bestelnummers, IP-waarden en ASAP-prijzen
Bron: officiële Lifeplus prijslijst NL ${PRIJSLIJST_METADATA.bronDatum} (${PRIJSLIJST_METADATA.bronItem}).
Verzending: gratis vanaf ${PRIJSLIJST_METADATA.gratisVerzendVanafIP} IP, anders €${PRIJSLIJST_METADATA.verzendkostenEuro.toFixed(2)}. Garantie: ${PRIJSLIJST_METADATA.garantieDagen} dagen geld-terug.

Gebruik deze prijzen en IP's als JE een concreet productadvies geeft. Vermeld bij ELK product de exacte ASAP-prijs én de IP-waarde, zodat de prospect direct kan zien (a) wat het kost en (b) of de bestelling boven 80 IP komt voor gratis verzending. Tip de prospect bij bestellingen vlak onder 80 IP om er een klein product bij te bestellen — vaak goedkoper dan €${PRIJSLIJST_METADATA.verzendkostenEuro.toFixed(2)} verzending.

${blokken.join("\n\n")}`;
}
