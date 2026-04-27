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
  { bestelNr: "3188", naam: "Maintain & Protect 50", categorie: "aanbevolen", inhoud: "1 set", normalePrijs: 122.0, ip: 75.0, asapPrijs: 110.75, beschrijving: "Daily BioBasics, Proanthenols 50 mg" },
  { bestelNr: "3185", naam: "Maintain & Protect 100", categorie: "aanbevolen", inhoud: "1 set", normalePrijs: 152.25, ip: 97.5, asapPrijs: 139.5, beschrijving: "Daily BioBasics, Proanthenols 100 mg" },
  { bestelNr: "3184", naam: "Maintain & Protect 100 Gold", categorie: "aanbevolen", inhoud: "1 set", normalePrijs: 197.25, ip: 127.0, asapPrijs: 182.25, beschrijving: "Daily BioBasics, Proanthenols 100 mg, OmeGold" },
  // 3191 staat NIET op de PDF prijslijst, alleen op de Lifeplus webshop.
  // Bevat Daily BioBasics LIGHT (i.p.v. regulier) + Proanthenols 100 + OmeGold.
  { bestelNr: "3191", naam: "Maintain & Protect 100 Gold Light", categorie: "aanbevolen", inhoud: "1 set", normalePrijs: 186.0, ip: 122.75, asapPrijs: 172.0, beschrijving: "Daily BioBasics Light, Proanthenols 100 mg, OmeGold (alleen webshop)" },
  { bestelNr: "3187", naam: "Everyday Wellbeing", categorie: "aanbevolen", inhoud: "1 set", normalePrijs: 99.25, ip: 65.5, asapPrijs: 94.25, beschrijving: "TVM-Plus, Proanthenols 100 mg" },
  { bestelNr: "3186", naam: "Everyday Wellbeing Gold", categorie: "aanbevolen", inhoud: "1 set", normalePrijs: 144.5, ip: 95.0, asapPrijs: 137.0, beschrijving: "TVM-Plus, Proanthenols 100 mg, OmeGold" },

  // ---------- VOEDINGSSUPPLEMENTEN ----------
  { bestelNr: "3129", naam: "Aloë Vera Caps", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 60.0, ip: 40.0, asapPrijs: 54.25 },
  { bestelNr: "3165", naam: "Biotic Blast", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 43.25, ip: 25.75, asapPrijs: 41.0 },
  { bestelNr: "3115", naam: "Brain Formula", categorie: "voedingssupplementen", inhoud: "180", normalePrijs: 86.0, ip: 47.5, asapPrijs: 81.75 },
  { bestelNr: "3133", naam: "CalMag Plus", categorie: "voedingssupplementen", inhoud: "300", normalePrijs: 43.5, ip: 21.5, asapPrijs: 41.5 },
  { bestelNr: "3149", naam: "Circulation Formula", categorie: "voedingssupplementen", inhoud: "180", normalePrijs: 54.5, ip: 25.0, asapPrijs: 51.75 },
  { bestelNr: "3177", naam: "Cogelin", categorie: "voedingssupplementen", inhoud: "762 g", normalePrijs: 52.25, ip: 30.25, asapPrijs: 49.75 },
  { bestelNr: "3157", naam: "Co-Q-10 Plus", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 77.25, ip: 49.0, asapPrijs: 73.5 },
  { bestelNr: "3166", naam: "Daily BioBasics", categorie: "voedingssupplementen", inhoud: "786 g", normalePrijs: 85.25, ip: 48.75, asapPrijs: 75.5 },
  { bestelNr: "3168", naam: "Daily BioBasics Light", categorie: "voedingssupplementen", inhoud: "378 g", normalePrijs: 73.25, ip: 44.5, asapPrijs: 64.75 },
  { bestelNr: "3113", naam: "Daily BioBasics Veggie Caps", categorie: "voedingssupplementen", inhoud: "480", normalePrijs: 114.5, ip: 57.75, asapPrijs: 107.0 },
  { bestelNr: "3167", naam: "Daily Plus Zonder Jodium", categorie: "voedingssupplementen", inhoud: "799 g", normalePrijs: 85.25, ip: 48.75, asapPrijs: 75.5 },
  { bestelNr: "3153", naam: "Digestive Formula", categorie: "voedingssupplementen", inhoud: "90", normalePrijs: 48.0, ip: 21.0, asapPrijs: 45.5 },
  { bestelNr: "3112", naam: "Lifeplus Discovery", categorie: "voedingssupplementen", inhoud: "30", normalePrijs: 146.0, ip: 100.5, asapPrijs: 138.75 },
  { bestelNr: "3151", naam: "D-Mannose Plus", categorie: "voedingssupplementen", inhoud: "120", normalePrijs: 60.5, ip: 32.5, asapPrijs: 57.5 },
  { bestelNr: "3154", naam: "EPA Plus", categorie: "voedingssupplementen", inhoud: "90", normalePrijs: 27.25, ip: 14.5, asapPrijs: 26.0 },
  { bestelNr: "3138", naam: "Evening Primrose Oil", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 15.25, ip: 7.0, asapPrijs: 14.5 },
  { bestelNr: "3139", naam: "Eye Formula", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 31.0, ip: 15.0, asapPrijs: 29.5 },
  { bestelNr: "3136", naam: "Fusions Red", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 43.25, ip: 27.0, asapPrijs: 41.0 },
  { bestelNr: "3105", naam: "FY Skin Formula", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 73.0, ip: 50.0, asapPrijs: 66.25 },
  { bestelNr: "3161", naam: "Heart Formula", categorie: "voedingssupplementen", inhoud: "300", normalePrijs: 103.0, ip: 59.25, asapPrijs: 97.75 },
  { bestelNr: "3143", naam: "Immune Formula", categorie: "voedingssupplementen", inhoud: "120", normalePrijs: 68.25, ip: 37.5, asapPrijs: 64.75 },
  { bestelNr: "3147", naam: "Iron Plus", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 37.0, ip: 22.0, asapPrijs: 35.25 },
  { bestelNr: "3119", naam: "Joint Formula", categorie: "voedingssupplementen", inhoud: "120", normalePrijs: 36.5, ip: 22.5, asapPrijs: 34.75 },
  { bestelNr: "3222", naam: "Key-Tonic", categorie: "voedingssupplementen", inhoud: "150 g", normalePrijs: 78.5, ip: 46.0, asapPrijs: 74.5 },
  { bestelNr: "3246", naam: "Lifeplus Triple Protein Shake: chocoladesmaak", categorie: "voedingssupplementen", inhoud: "867 g", normalePrijs: 87.0, ip: 38.0, asapPrijs: 81.0 },
  { bestelNr: "3261", naam: "Lifeplus Triple Protein Shake: chocoladesmaak (ongezoet)", categorie: "voedingssupplementen", inhoud: "864 g", normalePrijs: 87.0, ip: 38.0, asapPrijs: 81.0 },
  { bestelNr: "3247", naam: "Lifeplus Triple Protein Shake: vanillesmaak", categorie: "voedingssupplementen", inhoud: "813 g", normalePrijs: 87.0, ip: 38.0, asapPrijs: 81.0 },
  { bestelNr: "3248", naam: "Lifeplus Triple Protein Shake: vanillesmaak (ongezoet)", categorie: "voedingssupplementen", inhoud: "810 g", normalePrijs: 87.0, ip: 38.0, asapPrijs: 81.0 },
  { bestelNr: "3175", naam: "Lifeplus Vegan Protein Shake: chocoladesmaak", categorie: "voedingssupplementen", inhoud: "1235 g", normalePrijs: 92.75, ip: 44.75, asapPrijs: 88.0 },
  { bestelNr: "3176", naam: "Lifeplus Vegan Protein Shake: vanillesmaak", categorie: "voedingssupplementen", inhoud: "1232 g", normalePrijs: 92.75, ip: 44.75, asapPrijs: 88.0 },
  { bestelNr: "3159", naam: "Men's Gold Formula", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 33.5, ip: 15.75, asapPrijs: 32.0 },
  { bestelNr: "3156", naam: "Women's Gold Formula", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 33.5, ip: 15.75, asapPrijs: 32.0 },
  { bestelNr: "3148", naam: "Lifeplus Enerxan", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 28.25, ip: 13.0, asapPrijs: 27.0 },
  { bestelNr: "3127", naam: "Lyprinex (60ct)", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 51.75, ip: 26.75, asapPrijs: 49.25 },
  { bestelNr: "3229", naam: "Lyprinex (180ct)", categorie: "voedingssupplementen", inhoud: "180", normalePrijs: 120.0, ip: 55.0, asapPrijs: 114.0 },
  { bestelNr: "3233", naam: "mangOmega", categorie: "voedingssupplementen", inhoud: "355 ml", normalePrijs: 46.75, ip: 27.5, asapPrijs: 44.5 },
  { bestelNr: "3260", naam: "OmegAhi Peach Mango", categorie: "voedingssupplementen", inhoud: "450 ml", normalePrijs: 53.5, ip: 18.5, asapPrijs: 50.75 },
  { bestelNr: "3134", naam: "Lifeplus Mena Plus", categorie: "voedingssupplementen", inhoud: "240", normalePrijs: 86.75, ip: 50.0, asapPrijs: 82.25 },
  { bestelNr: "3145", naam: "Men's Formula", categorie: "voedingssupplementen", inhoud: "120", normalePrijs: 64.25, ip: 26.0, asapPrijs: 61.0 },
  { bestelNr: "3141", naam: "Micro-Mins Plus", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 51.0, ip: 31.0, asapPrijs: 48.5 },
  { bestelNr: "3103", naam: "MSM Plus", categorie: "voedingssupplementen", inhoud: "240", normalePrijs: 43.5, ip: 26.0, asapPrijs: 41.5 },
  { bestelNr: "3102", naam: "OmeGold", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 47.5, ip: 29.5, asapPrijs: 45.0 },
  { bestelNr: "3254", naam: "Parabalance", categorie: "voedingssupplementen", inhoud: "180", normalePrijs: 52.25, ip: 27.0, asapPrijs: 49.75 },
  { bestelNr: "3152", naam: "Phase'oMine", categorie: "voedingssupplementen", inhoud: "180", normalePrijs: 61.0, ip: 34.5, asapPrijs: 58.0 },
  { bestelNr: "3160", naam: "PH Plus", categorie: "voedingssupplementen", inhoud: "270", normalePrijs: 41.0, ip: 23.0, asapPrijs: 38.75, beschrijving: "PH Plus test strips: eenmaal gratis bij eerste aankoop" },
  { bestelNr: "4619", naam: "PH Plus test strips", categorie: "voedingssupplementen", inhoud: "1", normalePrijs: 9.75, ip: 0.0, asapPrijs: 9.75 },
  { bestelNr: "3101", naam: "Proanthenols 100", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 75.0, ip: 48.75, asapPrijs: 71.25 },
  { bestelNr: "3111", naam: "Proanthenols 50 (sm)", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 43.25, ip: 26.25, asapPrijs: 41.0 },
  { bestelNr: "3150", naam: "Proanthenols 50 (lg)", categorie: "voedingssupplementen", inhoud: "240", normalePrijs: 159.5, ip: 91.25, asapPrijs: 151.5 },
  { bestelNr: "3258", naam: "Proanthenols 200 SV", categorie: "voedingssupplementen", inhoud: "30", normalePrijs: 76.75, ip: 48.5, asapPrijs: 73.0 },
  { bestelNr: "3249", naam: "Real NRG", categorie: "voedingssupplementen", inhoud: "817 g", normalePrijs: 48.0, ip: 25.0, asapPrijs: 45.5 },
  { bestelNr: "3144", naam: "RYR Plus", categorie: "voedingssupplementen", inhoud: "180", normalePrijs: 38.25, ip: 22.25, asapPrijs: 36.25 },
  { bestelNr: "3126", naam: "Somazyme", categorie: "voedingssupplementen", inhoud: "120", normalePrijs: 51.5, ip: 26.5, asapPrijs: 49.0 },
  { bestelNr: "3125", naam: "Support Tabs Plus", categorie: "voedingssupplementen", inhoud: "240", normalePrijs: 63.75, ip: 40.0, asapPrijs: 60.5 },
  { bestelNr: "3104", naam: "TVM-Plus", categorie: "voedingssupplementen", inhoud: "180", normalePrijs: 29.5, ip: 16.75, asapPrijs: 28.0 },
  { bestelNr: "3132", naam: "Ubiquinol 100 (30ct)", categorie: "voedingssupplementen", inhoud: "30", normalePrijs: 76.25, ip: 48.0, asapPrijs: 72.5 },
  { bestelNr: "3228", naam: "Ubiquinol 100 (60ct)", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 124.25, ip: 74.0, asapPrijs: 118.0 },
  { bestelNr: "3110", naam: "Vegan OmeGold", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 51.25, ip: 28.25, asapPrijs: 48.75 },
  { bestelNr: "3128", naam: "Vitamin-C-Plus", categorie: "voedingssupplementen", inhoud: "300", normalePrijs: 34.5, ip: 16.75, asapPrijs: 32.75 },
  { bestelNr: "3120", naam: "Vitamins D & K", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 21.25, ip: 11.5, asapPrijs: 20.25 },
  { bestelNr: "3162", naam: "Vitamin-E-Complex", categorie: "voedingssupplementen", inhoud: "60", normalePrijs: 43.0, ip: 21.75, asapPrijs: 41.0 },
  { bestelNr: "3146", naam: "Vita-Saurus", categorie: "voedingssupplementen", inhoud: "180", normalePrijs: 54.5, ip: 20.5, asapPrijs: 51.75 },
  { bestelNr: "3169", naam: "X-Cell", categorie: "voedingssupplementen", inhoud: "274 g", normalePrijs: 78.0, ip: 40.5, asapPrijs: 72.75 },
  { bestelNr: "3170", naam: "X-Cell+", categorie: "voedingssupplementen", inhoud: "336 g", normalePrijs: 79.0, ip: 37.5, asapPrijs: 72.75 },
  { bestelNr: "3124", naam: "Yummies", categorie: "voedingssupplementen", inhoud: "200", normalePrijs: 42.0, ip: 18.25, asapPrijs: 39.75 },
  { bestelNr: "3227", naam: "Zinc Boost", categorie: "voedingssupplementen", inhoud: "120", normalePrijs: 49.5, ip: 24.0, asapPrijs: 47.0 },

  // ---------- SOLIS SUPERFOODS BY LIFEPLUS ----------
  { bestelNr: "3224", naam: "SOLIS Green Medley", categorie: "solis", inhoud: "171 g", normalePrijs: 69.25, ip: 38.5, asapPrijs: 65.75 },
  { bestelNr: "3225", naam: "SOLIS Purple Flash", categorie: "solis", inhoud: "183 g", normalePrijs: 79.0, ip: 45.75, asapPrijs: 75.0 },
  { bestelNr: "3226", naam: "SOLIS Cacao Boost", categorie: "solis", inhoud: "210 g", normalePrijs: 49.0, ip: 26.5, asapPrijs: 46.5 },
  { bestelNr: "3241", naam: "SOLIS Golden Milk", categorie: "solis", inhoud: "182 g", normalePrijs: 49.5, ip: 29.0, asapPrijs: 47.0 },

  // ---------- SPORTVOEDING ----------
  { bestelNr: "3178", naam: "Be Focused bessen", categorie: "sportvoeding", inhoud: "384 g", normalePrijs: 81.5, ip: 47.5, asapPrijs: 77.5 },
  { bestelNr: "3179", naam: "Be Focused citrus", categorie: "sportvoeding", inhoud: "384 g", normalePrijs: 81.5, ip: 47.5, asapPrijs: 77.5 },
  { bestelNr: "3180", naam: "Be Sustained bessen", categorie: "sportvoeding", inhoud: "663 g", normalePrijs: 82.75, ip: 43.75, asapPrijs: 78.5 },
  { bestelNr: "3181", naam: "Be Sustained citrus", categorie: "sportvoeding", inhoud: "663 g", normalePrijs: 82.75, ip: 43.75, asapPrijs: 78.5 },
  { bestelNr: "3182", naam: "Be Recharged bessen", categorie: "sportvoeding", inhoud: "624 g", normalePrijs: 84.0, ip: 43.0, asapPrijs: 79.75 },
  { bestelNr: "3183", naam: "Be Recharged citrus", categorie: "sportvoeding", inhoud: "624 g", normalePrijs: 84.0, ip: 43.0, asapPrijs: 79.75 },
  { bestelNr: "4145", naam: "Be Focused Sachets bessen", categorie: "sportvoeding", inhoud: "30 x 13,4 g", normalePrijs: 94.75, ip: 53.5, asapPrijs: 90.5 },
  { bestelNr: "4146", naam: "Be Focused Sachets citrus", categorie: "sportvoeding", inhoud: "30 x 13,4 g", normalePrijs: 94.75, ip: 53.5, asapPrijs: 90.5 },
  { bestelNr: "4147", naam: "Be Sustained Sachets bessen", categorie: "sportvoeding", inhoud: "30 x 22,3 g", normalePrijs: 101.25, ip: 50.25, asapPrijs: 96.25 },
  { bestelNr: "4148", naam: "Be Sustained Sachets citrus", categorie: "sportvoeding", inhoud: "30 x 22,3 g", normalePrijs: 101.25, ip: 50.25, asapPrijs: 96.25 },
  { bestelNr: "4149", naam: "Be Recharged Sachets bessen", categorie: "sportvoeding", inhoud: "30 x 20,8 g", normalePrijs: 98.0, ip: 49.5, asapPrijs: 93.25 },
  { bestelNr: "4150", naam: "Be Recharged Sachets citrus", categorie: "sportvoeding", inhoud: "30 x 20,8 g", normalePrijs: 98.0, ip: 49.5, asapPrijs: 93.25 },
  { bestelNr: "4158", naam: "Be Refueled Chocoladesmaak", categorie: "sportvoeding", inhoud: "804 g", normalePrijs: 80.75, ip: 36.0, asapPrijs: 76.75 },
  { bestelNr: "4156", naam: "Be Refueled Vanillesmaak", categorie: "sportvoeding", inhoud: "804 g", normalePrijs: 80.75, ip: 36.0, asapPrijs: 76.75 },

  // ---------- FOREVER YOUNG (huidverzorging) ----------
  { bestelNr: "4144", naam: "Forever Young Day Crème SPF 25", categorie: "forever-young", inhoud: "50 ml", normalePrijs: 73.25, ip: 41.25, asapPrijs: 69.5 },
  { bestelNr: "4129", naam: "Forever Young Gentle Cream Cleanser", categorie: "forever-young", inhoud: "150 ml", normalePrijs: 32.0, ip: 16.25, asapPrijs: 30.25 },
  { bestelNr: "4130", naam: "Forever Young Rejuvenating Eye Crème", categorie: "forever-young", inhoud: "15 ml", normalePrijs: 29.25, ip: 16.25, asapPrijs: 27.75 },
  { bestelNr: "4131", naam: "Forever Young Radiance Serum", categorie: "forever-young", inhoud: "30 ml", normalePrijs: 71.5, ip: 41.25, asapPrijs: 67.75 },
  { bestelNr: "4132", naam: "Forever Young Rich Moisturizing Crème", categorie: "forever-young", inhoud: "50 ml", normalePrijs: 64.5, ip: 38.25, asapPrijs: 61.25 },
  { bestelNr: "4133", naam: "Forever Young Strengthen and Restore Shampoo", categorie: "forever-young", inhoud: "250 ml", normalePrijs: 18.75, ip: 9.25, asapPrijs: 17.75 },
  { bestelNr: "4134", naam: "Forever Young Repair and Protect Conditioner", categorie: "forever-young", inhoud: "250 ml", normalePrijs: 35.75, ip: 15.0, asapPrijs: 34.0 },

  // ---------- PERSOONLIJKE VERZORGING ----------
  { bestelNr: "6695", naam: "Theeboomolietandpasta (zonder fluor)", categorie: "persoonlijke-verzorging", inhoud: "170 g", normalePrijs: 20.25, ip: 7.75, asapPrijs: 19.25 },
  { bestelNr: "1021", naam: "MSM Plus Vital Care Lotion", categorie: "persoonlijke-verzorging", inhoud: "242 ml", normalePrijs: 26.5, ip: 9.75, asapPrijs: 25.25 },
  { bestelNr: "6134", naam: "Lifeplus Wonder Gel", categorie: "persoonlijke-verzorging", inhoud: "114 ml", normalePrijs: 38.0, ip: 21.75, asapPrijs: 36.0 },
  { bestelNr: "6654", naam: "Natural Gold Hand & Body Bar", categorie: "persoonlijke-verzorging", inhoud: "113 g", normalePrijs: 7.75, ip: 3.5, asapPrijs: 7.5 },
  { bestelNr: "2632", naam: "Natural Hand Cream", categorie: "persoonlijke-verzorging", inhoud: "100 ml", normalePrijs: 24.25, ip: 13.5, asapPrijs: 23.0 },
  { bestelNr: "2631", naam: "Natural Body Wash", categorie: "persoonlijke-verzorging", inhoud: "500 ml", normalePrijs: 17.0, ip: 7.0, asapPrijs: 16.0 },
  { bestelNr: "2630", naam: "Natural Hand & Body Lotion", categorie: "persoonlijke-verzorging", inhoud: "300 ml", normalePrijs: 21.75, ip: 9.0, asapPrijs: 20.75 },
  { bestelNr: "2629", naam: "Natural Hand Wash", categorie: "persoonlijke-verzorging", inhoud: "500 ml", normalePrijs: 18.25, ip: 7.0, asapPrijs: 17.25 },

  // ---------- ACCESSOIRES ----------
  { bestelNr: "6074", naam: "Mixbeker", categorie: "accessoires", inhoud: "1", normalePrijs: 4.0, ip: 0.0, asapPrijs: 4.0 },
  { bestelNr: "2178", naam: "Set met houten maatschepjes", categorie: "accessoires", inhoud: "1 set", normalePrijs: 23.0, ip: 1.75, asapPrijs: 23.0 },

  // ---------- DRINKWATERFILTERSYSTEMEN ----------
  { bestelNr: "0465", naam: "Boven aanrecht (waterfilter)", categorie: "drinkwaterfilter", inhoud: "1", normalePrijs: 585.75, ip: 183.0, asapPrijs: 585.75 },
  { bestelNr: "0466", naam: "Onder aanrecht (waterfilter)", categorie: "drinkwaterfilter", inhoud: "1", normalePrijs: 765.25, ip: 239.25, asapPrijs: 765.25 },
  { bestelNr: "0467", naam: "Replacement filter model 750", categorie: "drinkwaterfilter", inhoud: "1", normalePrijs: 122.5, ip: 33.5, asapPrijs: 122.5 },
  { bestelNr: "1496", naam: "Boven aanrecht klein (waterfilter)", categorie: "drinkwaterfilter", inhoud: "1", normalePrijs: 439.25, ip: 137.25, asapPrijs: 439.25 },
  { bestelNr: "1497", naam: "Onder aanrecht klein (waterfilter)", categorie: "drinkwaterfilter", inhoud: "1", normalePrijs: 576.25, ip: 180.25, asapPrijs: 576.25 },
  { bestelNr: "1498", naam: "Replacement filter model 400", categorie: "drinkwaterfilter", inhoud: "1", normalePrijs: 103.75, ip: 28.5, asapPrijs: 103.75 },
  { bestelNr: "1499", naam: "SENSEH keramische plaat", categorie: "drinkwaterfilter", inhoud: "1", normalePrijs: 86.5, ip: 23.75, asapPrijs: 86.5 },

  // ---------- LIFEPLUS PETS ----------
  { bestelNr: "3250", naam: "Lifeplus Pets Calm", categorie: "pets", inhoud: "90", normalePrijs: 36.25, ip: 18.0, asapPrijs: 34.5 },
  { bestelNr: "3251", naam: "Lifeplus Pets Move", categorie: "pets", inhoud: "90", normalePrijs: 34.0, ip: 16.75, asapPrijs: 32.25 },
  { bestelNr: "3252", naam: "Lifeplus Pets Digest", categorie: "pets", inhoud: "90", normalePrijs: 38.75, ip: 19.25, asapPrijs: 36.75 },
  { bestelNr: "3257", naam: "Lifeplus Pets Care & Comfort", categorie: "pets", inhoud: "177 ml", normalePrijs: 23.5, ip: 11.75, asapPrijs: 22.5 },
  { bestelNr: "3259", naam: "Lifeplus Pets Ahiflower Oil", categorie: "pets", inhoud: "164 g", normalePrijs: 32.75, ip: 16.25, asapPrijs: 31.0 },
  { bestelNr: "5390", naam: "Lifeplus Pets Peanut Butter Biscuits", categorie: "pets", inhoud: "210 g", normalePrijs: 14.5, ip: 5.0, asapPrijs: 13.75 },
  { bestelNr: "4166", naam: "Lifeplus Pets Mobile App Abonnement maandelijks", categorie: "pets", inhoud: "1", normalePrijs: 14.99, ip: 2.0, asapPrijs: 14.99 },
  { bestelNr: "4165", naam: "Lifeplus Pets Mobile App Abonnement jaarlijks", categorie: "pets", inhoud: "1", normalePrijs: 69.99, ip: 12.0, asapPrijs: 69.99 },
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
