export type LifeplusProduct = {
  naam: string;
  categorie: string;
  aliases?: string[];
};

export const LIFEPLUS_PRODUCTEN: LifeplusProduct[] = [
  { naam: "Daily BioBasics", categorie: "Everyday Essentials", aliases: ["basispakket", "daily bio basics", "biobasics", "daily basic", "shake basis"] },
  { naam: "Proanthenols 50", categorie: "Everyday Essentials", aliases: ["proanthenols", "opc 50"] },
  { naam: "Proanthenols 100", categorie: "Everyday Essentials", aliases: ["proanthenols", "opc 100"] },
  { naam: "Proanthenols 200 SV", categorie: "Everyday Essentials", aliases: ["proanthenols sv", "proanthenols vegan", "opc vegan"] },
  { naam: "Aloe Vera Caps", categorie: "Everyday Essentials", aliases: ["aloe vera", "aloe capsules"] },
  { naam: "Biotic Blast", categorie: "Everyday Essentials", aliases: ["probiotic", "probiotica"] },
  { naam: "CalMag Plus", categorie: "Everyday Essentials", aliases: ["calcium magnesium", "calmag"] },
  { naam: "Co-Q-10 Plus", categorie: "Everyday Essentials", aliases: ["coq10", "co q 10", "coenzym q10"] },
  { naam: "Cogelin", categorie: "Everyday Essentials", aliases: ["vezels", "fiber", "psyllium"] },
  { naam: "Enerxan", categorie: "Everyday Essentials", aliases: ["energie", "chromium"] },
  { naam: "EPA Plus", categorie: "Everyday Essentials", aliases: ["epa", "omega 3 basic"] },
  { naam: "Evening Primrose Oil", categorie: "Everyday Essentials", aliases: ["teunisbloem", "primrose"] },
  { naam: "Eye Formula", categorie: "Everyday Essentials", aliases: ["ogen", "oog formule"] },
  { naam: "Forever Young Skin Formula", categorie: "Everyday Essentials", aliases: ["skin formula", "huid formule", "forever young skin"] },
  { naam: "Fusions Red", categorie: "Everyday Essentials", aliases: ["fusions", "rode bessen", "acai"] },
  { naam: "Iron Plus", categorie: "Everyday Essentials", aliases: ["ijzer"] },
  { naam: "Joint Formula", categorie: "Everyday Essentials", aliases: ["gewrichten", "joints"] },
  { naam: "Key-Tonic", categorie: "Everyday Essentials", aliases: ["key tonic", "keytonic", "mct koffie"] },
  { naam: "Lyprinex", categorie: "Everyday Essentials", aliases: ["groene mossel", "green lipped mussel"] },
  { naam: "mangOmega", categorie: "Everyday Essentials", aliases: ["mango omega", "omega kinderen", "mangomega"] },
  { naam: "Men's Gold Formula", categorie: "Everyday Essentials", aliases: ["mens gold", "mannen formule", "heren formule"] },
  { naam: "Micro-Mins Plus", categorie: "Everyday Essentials", aliases: ["micromins", "mineralen", "micro mins"] },
  { naam: "MSM Plus", categorie: "Everyday Essentials", aliases: ["msm"] },
  { naam: "OmeGold", categorie: "Everyday Essentials", aliases: ["omega 3", "visolie", "ome gold", "fish oil"] },
  { naam: "Parabalance", categorie: "Everyday Essentials", aliases: ["para balance", "berberine"] },
  { naam: "PH Plus", categorie: "Everyday Essentials", aliases: ["ph plus", "alkaline", "basisch"] },
  { naam: "Phase'oMine", categorie: "Everyday Essentials", aliases: ["phaseomine", "kidney bean", "phase o mine"] },
  { naam: "Real NRG", categorie: "Everyday Essentials", aliases: ["real energy", "energy drink"] },
  { naam: "RYR Plus", categorie: "Everyday Essentials", aliases: ["red yeast rice", "rode rijst"] },
  { naam: "Somazyme", categorie: "Everyday Essentials", aliases: ["enzymen", "bromelain"] },
  { naam: "Support Tabs Plus", categorie: "Everyday Essentials", aliases: ["support tabs", "ginseng"] },
  { naam: "TVM-Plus", categorie: "Everyday Essentials", aliases: ["tvm", "tvm plus", "multivitamine tablet"] },
  { naam: "Ubiquinol 100", categorie: "Everyday Essentials", aliases: ["ubiquinol", "q10 actief"] },
  { naam: "Vegan OmeGold", categorie: "Everyday Essentials", aliases: ["vegan omega", "algen omega"] },
  { naam: "Vitamin-C-Plus", categorie: "Everyday Essentials", aliases: ["vitamine c", "vit c", "c plus"] },
  { naam: "Vitamin-E-Complex", categorie: "Everyday Essentials", aliases: ["vitamine e", "vit e"] },
  { naam: "Vitamins D&K", categorie: "Everyday Essentials", aliases: ["vitamine d k", "d en k", "d3 k2", "vit dk"] },
  { naam: "Vita-Saurus", categorie: "Everyday Essentials", aliases: ["vitasaurus", "kinder multivitamine", "vita saurus"] },
  { naam: "Women's Gold Formula", categorie: "Everyday Essentials", aliases: ["womens gold", "vrouwen formule", "dames formule"] },
  { naam: "X-Cell", categorie: "Everyday Essentials", aliases: ["xcell", "x cell", "arginine drink"] },
  { naam: "X-Cell+ with Beetroot Powder", categorie: "Everyday Essentials", aliases: ["xcell beetroot", "x cell bieten"] },
  { naam: "Xtra Antioxidants", categorie: "Everyday Essentials", aliases: ["antioxidanten", "extra antioxidants"] },
  { naam: "Lifeplus Yummies", categorie: "Everyday Essentials", aliases: ["yummies", "gummy kids", "kinder gummies"] },
  { naam: "Zinc Boost", categorie: "Everyday Essentials", aliases: ["zink", "zinc lozenges", "manuka honing"] },

  { naam: "Maintain & Protect 100 Gold", categorie: "Product Packs", aliases: ["maintain protect 100 gold", "m&p 100 gold"] },
  { naam: "Maintain & Protect 100", categorie: "Product Packs", aliases: ["maintain protect 100", "m&p 100"] },
  { naam: "Maintain & Protect 50", categorie: "Product Packs", aliases: ["maintain protect 50", "m&p 50"] },
  { naam: "Everyday Wellbeing", categorie: "Product Packs", aliases: ["everyday wellbeing pack"] },
  { naam: "Everyday Wellbeing Gold", categorie: "Product Packs", aliases: ["everyday wellbeing gold pack"] },

  { naam: "Triple Protein Shake Chocolate", categorie: "Proteins", aliases: ["triple protein chocolade", "protein shake chocolade", "eiwitshake chocolade"] },
  { naam: "Triple Protein Shake Vanilla", categorie: "Proteins", aliases: ["triple protein vanille", "protein shake vanille", "eiwitshake vanille"] },
  { naam: "Triple Protein Shake Chocolate Unsweetened", categorie: "Proteins", aliases: ["triple protein chocolade ongezoet", "protein shake chocolate unsweetened"] },
  { naam: "Triple Protein Shake Vanilla Unsweetened", categorie: "Proteins", aliases: ["triple protein vanille ongezoet", "protein shake vanilla unsweetened"] },
  { naam: "Vegan Protein Shake Chocolate", categorie: "Proteins", aliases: ["vegan shake chocolade", "plantaardige shake chocolade"] },
  { naam: "Vegan Protein Shake Vanilla", categorie: "Proteins", aliases: ["vegan shake vanille", "plantaardige shake vanille"] },
  { naam: "Wooden Scoop Set", categorie: "Proteins", aliases: ["houten scoop", "maatlepel"] },

  { naam: "Be Focused", categorie: "Sport Nutrition", aliases: ["be focused berry", "be focused citrus", "pre workout"] },
  { naam: "Be Sustained", categorie: "Sport Nutrition", aliases: ["be sustained berry", "be sustained citrus", "electrolyten", "hydratatie"] },
  { naam: "Be Recharged", categorie: "Sport Nutrition", aliases: ["be recharged berry", "be recharged citrus", "bcaa", "amino complex"] },
  { naam: "Be Refueled Chocolate", categorie: "Sport Nutrition", aliases: ["be refueled chocolade", "whey chocolade"] },
  { naam: "Be Refueled Vanilla", categorie: "Sport Nutrition", aliases: ["be refueled vanille", "whey vanille"] },

  { naam: "Solis Cacao Boost", categorie: "Superfoods", aliases: ["cacao boost", "solis cacao", "raw cacao"] },
  { naam: "Solis Golden Milk", categorie: "Superfoods", aliases: ["golden milk", "kurkuma drank"] },
  { naam: "Solis Green Medley", categorie: "Superfoods", aliases: ["green medley", "green superfood", "groene superfood"] },
  { naam: "Solis Purple Flash", categorie: "Superfoods", aliases: ["purple flash", "bessen poeder", "berry superfood"] },

  { naam: "Smart Bar", categorie: "Food / Snacks", aliases: ["chocolate supreme bar", "eiwitreep", "smartbar"] },

  { naam: "Forever Young Gentle Cream Cleanser", categorie: "Skin and Body Care", aliases: ["gentle cream cleanser", "cream cleanser", "reinigingscrème"] },
  { naam: "Forever Young Radiance Serum", categorie: "Skin and Body Care", aliases: ["radiance serum", "gezichtsserum"] },
  { naam: "Forever Young Rich Moisturizing Crème", categorie: "Skin and Body Care", aliases: ["rich moisturizing creme", "dagcrème", "nachtcrème"] },
  { naam: "Forever Young Day Crème SPF 25", categorie: "Skin and Body Care", aliases: ["day creme", "spf 25 dagcreme"] },
  { naam: "Forever Young Rejuvenating Eye Crème", categorie: "Skin and Body Care", aliases: ["rejuvenating eye creme", "oogcrème", "eye cream"] },
  { naam: "Forever Young Strengthen & Restore Shampoo", categorie: "Skin and Body Care", aliases: ["forever young shampoo", "strengthen restore shampoo"] },
  { naam: "Forever Young Repair & Protect Conditioner", categorie: "Skin and Body Care", aliases: ["forever young conditioner", "repair protect conditioner"] },

  { naam: "Natural Hand & Body Lotion", categorie: "Natural Body Care", aliases: ["hand body lotion", "bodylotion"] },
  { naam: "Natural Body Wash", categorie: "Natural Body Care", aliases: ["body wash", "douchegel"] },
  { naam: "Natural Hand Cream", categorie: "Natural Body Care", aliases: ["handcrème", "hand cream"] },

  { naam: "Lifeplus Tea Tree Toothpaste", categorie: "Topical", aliases: ["tea tree toothpaste", "tandpasta", "tea tree tandpasta"] },
  { naam: "Lifeplus Wonder Gel", categorie: "Topical", aliases: ["wonder gel", "wondergel"] },
  { naam: "MSM Plus Vital Care Lotion", categorie: "Topical", aliases: ["msm lotion", "vital care lotion"] },
  { naam: "Natural Gold Hand & Body Bar", categorie: "Topical", aliases: ["natural gold soap", "natural gold bar", "zeep"] },
];

export const PRODUCT_NAMEN_LIJST = LIFEPLUS_PRODUCTEN.map((p) => p.naam).join(", ");

export const PRODUCT_CATALOGUS_COMPACT = LIFEPLUS_PRODUCTEN
  .map((p) => {
    const aliases = p.aliases && p.aliases.length > 0 ? ` [${p.aliases.join(", ")}]` : "";
    return `${p.naam}${aliases}`;
  })
  .join("\n");
