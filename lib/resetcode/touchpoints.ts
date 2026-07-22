// ============================================================
// Business-touchpoints: de momenten waarop de Mentor de klant
// vanzelfsprekend meeneemt in het webshop-verhaal (teksten
// goedgekeurd door Raoul, 12 juli 2026). Elke touchpoint heeft
// een vaste sleutel die per klant onthouden wordt (over
// programma's heen), zodat niemand twee keer hetzelfde verhaal
// krijgt. Bouwers (is_bouwer) krijgen ze helemaal niet.
// ============================================================

export type TouchpointSleutel =
  | "kern-verhaal"
  | "darm-einde"
  | "reset-complimenten"
  | "reset-afronding"
  | "basis-week3"
  | "basis-groeien"
  | "dag10-video"
  | "programma-einde"
  | "samen-starten"
  // Reset-fase-regie: klant koos bewust "ik blijf nog even in fase 2";
  // het keuzemoment zwijgt dan tot het 40-dagen-maximum.
  | "fase2-verlengd"
  // Week-terugblik: elke 7 dagen één keer (week-terugblik-1, -2, ...).
  // De inhoud wordt client-side uit het dagboek gebouwd; dit is alleen
  // de eenmaligheids-markering.
  | `week-terugblik-${number}`
  // Einde-markering per programma (doorgroei-route).
  | `programma-einde-${string}`;

/** Het volledige kern-verhaal (dag ~7 darm, ~week 1 fase 2, of groeien-stap). */
export function kernVerhaal(naam: string): string[] {
  return [
    "Wist je trouwens dat deze producten verspreid worden via aanbevelingsmarketing? Dat is gebaseerd op natuurlijk gedrag: als iets ons bevalt, praten we erover. Een goed restaurant, een goeie film, iets wat je moeder je aanraadde. Zo gaat dit al ruim 35 jaar, van mens tot mens, over de hele wereld, en grote kans dat jij er zelf ook zo aan gekomen bent.",
    "Daarom kan iedereen die de producten gebruikt een gratis eigen webshop krijgen. Super laagdrempelig: je hoeft niks te verkopen en niks in te kopen, je deelt gewoon wat je zelf al gebruikt. Daarmee verdien je om te beginnen je eigen producten terug, en pak je het serieuzer aan, dan bouw je er een echte extra inkomstenstroom mee op, in jouw tempo.",
    `En je staat er nooit alleen voor. Er is een AI-gedreven online systeem plus een heel team dat je stap voor stap meeneemt: het helpt je met wat je zegt, met het schrijven van je posts, en met alle kennis en vaardigheden die erbij horen. Sterker nog: deze Mentor waar je nu mee praat is daar een klein maar belangrijk onderdeel van. Je ervaart dus nu al precies hoe dat voelt. Meer weten? Vraag het gerust aan ${naam}.`,
  ];
}

/** Korte opvolgers per moment, nadat het kern-verhaal (ooit) verteld is. */
export function touchpointTekst(
  sleutel: TouchpointSleutel,
  naam: string,
  kernAlVerteld: boolean,
): string[] {
  switch (sleutel) {
    case "darm-einde":
      return [
        `Je hebt je eigen ervaring nu, en die is meer waard dan welke reclame ook. Denk maar eens aan wie er als eerste in je opkomt: die vriendin die altijd moe is, je collega met dat opgeblazen gevoel na de lunch, je moeder. ${kernAlVerteld ? "Weet je nog, die gratis webshop? Dit is het moment waarop veel mensen 'm aanzetten." : "Goed om te weten: er staat een gratis eigen webshop voor je klaar waarmee je je producten terugverdient door anderen op weg te helpen."} ${naam} zet 'm samen met je aan.`,
      ];
    case "reset-complimenten":
      return [
        "En? Krijg je al complimenten? Dit is voor de meeste mensen het fijnste moment van de hele reset: je ziet het verschil, je voelt het verschil, en de mensen om je heen zien het ook. Een collega die vraagt wat je toch doet, je zus die zegt dat je straalt, iemand op een verjaardag die naast je komt zitten.",
        `Goed om te weten: precies hier begint voor veel mensen hun webshop-verhaal. Met jouw resultaten kun je heel veel mensen nieuwsgierig maken, offline én online. En je hoeft daar niks voor te kunnen: er is een stappenplan dat je precies laat zien hoe je het vertelt en deelt, zodat je de juiste geïnteresseerden op de goede manier helpt, net zoals jij geholpen bent. Nieuwsgierig hoe dat eruitziet? Vraag het aan ${naam}.`,
      ];
    case "reset-afronding":
      return [
        `Jouw verhaal is nu compleet: hoe je begon, wat er onderweg gebeurde en waar je nu staat. Met je gratis webshop, het stappenplan en het team erachter maak je daar iets blijvends van, van producten terugverdienen tot een serieuze extra inkomstenstroom. Vraag ${naam} naar de eerste stap. Die is kleiner dan je denkt.`,
      ];
    case "basis-week3":
      return [
        "Jij gebruikt de producten nu elke dag. Wist je dat je ze kunt terugverdienen met een gratis eigen webshop? Alles wordt geregeld, jij deelt alleen wat je toch al doet. Handig om te weten, meer niet.",
      ];
    case "basis-groeien":
      return kernAlVerteld
        ? [
            `Die gratis webshop ligt er nog steeds. Geen haast, hij loopt niet weg. Maar als je de afgelopen weken weleens een compliment kreeg of iemand nieuwsgierig zag worden: dat was 'm al. Stuur ${naam} gerust een appje als je er meer over wilt weten, of zeg het hier, dan weet je precies waar je aan toe bent.`,
          ]
        : kernVerhaal(naam);
    case "samen-starten":
      // Rond het startmoment: samen doen + de support-groep. Geen
      // webshop-verhaal, puur warm en praktisch.
      return [
        "Nog iets moois om over na te denken nu je gaat starten: dit soort programma's zijn samen een stuk leuker én makkelijker vol te houden. Grote kans dat jij iemand kent die hier ook mee bezig is. Iemand die vaak praat over een opgeblazen gevoel, brainfog, of gewoon niet lekker in z'n vel zitten. Denk maar even, er komt vast iemand in je op. 😊",
        `Komt er iemand in je op? Breng die persoon dan gerust alvast in contact met ${naam}. Die zorgt dat diegene de juiste informatie krijgt, zonder verplichtingen, en dan kunnen jullie het misschien wel samen doen. Samen starten is samen volhouden.`,
        `En je staat er sowieso niet alleen voor: er is een support-groep op Facebook voor de Holistic Reset en het darmprogramma, met ruim 10.000 mensen die deze programma's volgen of gevolgd hebben. Vol ervaringen, recepten en aanmoediging. Vraag ${naam} even om je toe te voegen. En voor al je vragen blijf ik er natuurlijk gewoon, dag en nacht. 💚`,
      ];
    case "programma-einde":
      return []; // markering; de einde-flow doet zelf het woord
    case "dag10-video":
      return []; // geen tekst: de video-kaart doet het werk
    case "kern-verhaal":
      return kernVerhaal(naam);
    default:
      // week-terugblik-N en andere pure markeringen: geen vaste tekst.
      return [];
  }
}
