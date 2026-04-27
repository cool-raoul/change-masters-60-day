// ============================================================
// BEWUSTWORDINGSTEKSTEN per categorie-uitkomst
//
// Deze teksten verschijnen op de resultaatpagina BOVEN het pakket-advies.
// Doel: zelfreflectie en herkenning, niet diagnose.
//
// Format per categorie:
//   - watWeZien: korte spiegeling van de signalen (2-3 zinnen)
//   - watDatKanBetekenen: uitleg in mensentaal (geen jargon, geen ziekten)
//   - leefstijlTips: 2-3 concrete dingen die de prospect zelf kan doen
//
// LET OP:
//   - Geen klacht-namen ("burn-out", "depressie", "schildklier")
//   - Geen "wij raden aan voor..." (= medische claim)
//   - Wel "kan helpen ondersteunen", "veel mensen ervaren"
//   - Voor de coach/therapeut-doelgroep: deze teksten zijn ook waardevol
//     als gespreksvertrekpunt in een sessie.
// ============================================================

import type { PakketCategorie } from "@/lib/lifeplus/pakketten";

export type Bewustwording = {
  watWeZien: string;
  watDatKanBetekenen: string;
  leefstijlTips: string[];
};

export const BEWUSTWORDING: Record<PakketCategorie, Bewustwording> = {
  "energie-focus": {
    watWeZien:
      "Je herkent jezelf in signalen rond energie en focus. Veel mensen voelen dit, maar onderschatten het effect ervan op hun dag.",
    watDatKanBetekenen:
      "Vaak is dit een teken dat je lichaam meer brandstof of betere brandstof nodig heeft dan het krijgt. Het hoofd voelt mistig, de middag-energie kalft af, en die heldere flow waarmee je vroeger door je dag ging is wat verder weg dan je zou willen. Goede energie begint bij de bouwstoffen die je dagelijks binnenkrijgt en bij hersencellen die genoeg omega-3 hebben om scherp te blijven.",
    leefstijlTips: [
      "Begin je dag met daglicht in je ogen, vóór koffie. Dat zet je biologische klok strakker.",
      "Eet eiwitten bij je ontbijt. Geeft stabielere energie dan een koolhydraat-rijk ontbijt.",
      "Beweeg kort tussendoor. Tien minuten wandelen herstelt je focus voor het volgende blok werk.",
    ],
  },

  "stress-slaap": {
    watWeZien:
      "Je herkent jezelf in signalen rond stress en slaap. Veel mensen voelen dit, maar onderschatten hoe hard het ze raakt.",
    watDatKanBetekenen:
      "Vaak is dit een teken dat je zenuwstelsel langer aan staat dan je in de gaten hebt. Het brein blijft 's avonds doordraaien, slaap herstelt minder, en overdag voelt veerkracht minder vanzelfsprekend. Goede slaap is geen luxe maar een fundament. Zonder herstel werkt alles wat je daarna probeert minder goed.",
    leefstijlTips: [
      "Geef je brein een vaste afsluittijd 1 uur voor je bedtijd: geen schermen, geen werk-gedachten.",
      "Beweeg overdag minimaal 30 minuten buiten. Daglicht herstelt je dag- en nachtritme.",
      "Schrijf 's avonds 3 dingen op waar je dankbaar voor bent. Werkt sterker dan je denkt.",
    ],
  },

  "afvallen-metabolisme": {
    watWeZien:
      "Je herkent jezelf in signalen rond gewicht en metabolisme. Voor veel mensen is dit ingewikkelder geworden dan vroeger.",
    watDatKanBetekenen:
      "Vaak heeft dit te maken met hoe je lichaam met bloedsuiker omgaat en hoe verzadigd je je voelt na een maaltijd. Te veel snelle koolhydraten houden je in een schommeling van honger en trek, waardoor je meer eet dan je nodig hebt. Stabielere bloedsuiker en voldoende eiwit per maaltijd zijn vaak de twee grootste hefbomen, naast bewegen.",
    leefstijlTips: [
      "Begin elke maaltijd met groente of eiwit, niet met brood of pasta. Stabieler verloop.",
      "Drink een glas water voor elke maaltijd. Helpt verzadiging vóór je begint.",
      "Probeer een eet-vrij venster van 12-14 uur tussen avondeten en ontbijt. Geeft je spijsvertering rust.",
    ],
  },

  hormoonbalans: {
    watWeZien:
      "Je herkent jezelf in signalen die je hormoonhuishouding raken. Veel vrouwen voelen dit op verschillende momenten in hun leven.",
    watDatKanBetekenen:
      "Hormonale schommelingen zijn er altijd, maar wanneer je lichaam onvoldoende bouwstoffen krijgt of onvoldoende rust pakt, voel je deze schommelingen sterker. Stemming, slaap en energie kunnen dan parallel lopen met je cyclus of overgang. Een rustig zenuwstelsel, voldoende vetzuren en specifieke ondersteuning voor deze fase kunnen het verschil maken.",
    leefstijlTips: [
      "Eet voldoende gezonde vetten (avocado, vette vis, noten). Hormonen worden uit vet gemaakt.",
      "Houd een vaste slaaproutine aan. Hormonen herstellen vooral 's nachts.",
      "Beweeg matig en regelmatig. Te veel hoge intensiteit kan hormonen juist meer uit balans halen.",
    ],
  },

  "mannen-hormoonbalans": {
    watWeZien:
      "Je herkent jezelf in signalen die je vitaliteit en mannelijke veerkracht raken. Voor veel mannen verandert er iets in deze richting tussen 35 en 55.",
    watDatKanBetekenen:
      "Vaak is dit een combinatie van veranderde hormoonhuishouding (testosteron, prostaat) en cumulatieve invloed van stress, slaap en voeding. Het herstelvermogen, de kracht en het 'vuur' wat je vroeger had vragen nu meer onderhoud. Goede ondersteuning kan dat verschil maken.",
    leefstijlTips: [
      "Krachttraining 2-3x per week werkt beter voor testosteron dan eindeloos cardio.",
      "Eet voldoende eiwit (1,5-2 g/kg lichaamsgewicht) en gezonde vetten.",
      "Daglicht in de ochtend + voldoende slaap zijn cruciaal voor hormonale balans.",
    ],
  },

  "sport-performance": {
    watWeZien:
      "Je traint regelmatig en wilt meer uit je lichaam halen. Of je herstelt na inspanning langzamer dan je zou willen.",
    watDatKanBetekenen:
      "Trainen vraagt brandstof én herstel. Veel sporters onderschatten hoeveel eiwit ze dagelijks nodig hebben en hoe belangrijk de eerste minuten ná de training zijn. Goede aminozuren post-workout en voldoende basis-bouwstoffen zorgen dat je sneller herstelt en de volgende sessie scherper begint.",
    leefstijlTips: [
      "Eet binnen 1 uur na je training 25-40 g eiwit. Cruciaal voor herstel.",
      "Slaap minimaal 7,5 uur. Dáár vindt het meeste spierherstel plaats.",
      "Wissel intensiteit af: niet elke sessie hoeft maximaal te zijn.",
    ],
  },

  "high-performance": {
    watWeZien:
      "Je voelt je oké tot goed, maar je weet dat er meer in zit dan wat je nu uithaalt. Of je wilt je vitaliteit op peil houden voor de lange termijn.",
    watDatKanBetekenen:
      "Dit is de mindset van mensen die hun lichaam zien als instrument voor het leven dat ze willen leiden. Niet wachten tot er klachten zijn, maar nu al investeren in fundament en veerkracht. Een dagelijkse basis aan bouwstoffen, voldoende eiwit, en producten die het cellulaire fundament beschermen maken het verschil over jaren heen.",
    leefstijlTips: [
      "Eet dagelijks gevarieerd. Geen wonder-dieet, wel veel groente, eiwit, gezonde vetten.",
      "Beweeg dagelijks: kracht én cardio in afwisseling.",
      "Investeer in slaap en stress-management. Hier wint je lichaam de lange termijn.",
    ],
  },
};
