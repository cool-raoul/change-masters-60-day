import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  pakResetKlantContext,
  bewaarResetChats,
} from "@/lib/resetcode/klant-links";
import { vandaagNL, pakCheckins, type CheckinRij } from "@/lib/resetcode/checkin";

// ============================================================
// POST /api/resetcode/checkin
//
// Slaat de dagelijkse check-in op (upsert per dag) en geeft een
// warm antwoord + de bijgewerkte reeks terug. De Mentor gebruikt
// dat voor de streak en de voortgangs-kaart.
//
// Body: { token, stemming?, gewicht?, taille?, heup?, borst?, notitie? }
// ============================================================

const STEMMING_WOORD: Record<string, string> = {
  top: "top",
  gaatwel: "gaat wel",
  zwaar: "zwaar",
};

function getal(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n < 1000 ? Math.round(n * 10) / 10 : null;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token as string | undefined) ?? "";
  const ctx = await pakResetKlantContext(token);
  if (!ctx || ctx.status !== "actief") {
    return Response.json({ error: "Ongeldige link" }, { status: 401 });
  }

  const keuze = (veld: unknown, opties: string[]) =>
    typeof veld === "string" && opties.includes(veld) ? veld : null;
  const stemming = keuze(body.stemming, ["top", "gaatwel", "zwaar"]);
  const energie = keuze(body.energie, ["weinig", "oke", "veel"]);
  const slaap = keuze(body.slaap, ["slecht", "oke", "goed"]);
  const buik = keuze(body.buik, ["onrustig", "oke", "rustig"]);
  const gewicht = getal(body.gewicht);
  const notitie =
    typeof body.notitie === "string" ? body.notitie.trim().slice(0, 500) : null;

  const admin = createAdminClient();
  const datum = vandaagNL();
  await admin.from("resetcode_checkin").upsert(
    {
      link_id: ctx.linkId,
      datum,
      stemming,
      energie,
      slaap,
      buik,
      gewicht,
      taille: getal(body.taille),
      heup: getal(body.heup),
      borst: getal(body.borst),
      notitie,
    },
    { onConflict: "link_id,datum" },
  );

  const reeks = await pakCheckins(ctx.linkId);

  // Streak: opeenvolgende dagen met een check-in, tot en met vandaag.
  const datums = new Set(reeks.map((r) => r.datum));
  let streak = 0;
  const d = new Date(`${datum}T12:00:00`);
  while (datums.has(new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam" }).format(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  // Gewichtsverschil t.o.v. de allereerste meting.
  const metGewicht = reeks.filter((r) => r.gewicht != null);
  let verschilTekst = "";
  if (gewicht != null && metGewicht.length >= 2) {
    const eerste = metGewicht[0].gewicht as number;
    const delta = Math.round((gewicht - eerste) * 10) / 10;
    if (delta < 0) verschilTekst = ` Je bent al ${Math.abs(delta)} kilo lichter dan bij je start 💪`;
    else if (delta > 0)
      // Fase-bewust (feedback Raoul 25 juli): op de laaddagen is aankomen
      // juist de bedoeling; daarbuiten geen onverklaard "woosh"-jargon.
      verschilTekst =
        ctx.stationSlug === "laaddagen"
          ? ` En ${delta} kilo erbij sinds je start: helemaal normaal, dat hoort bij je laaddagen (sommigen komen er wel 2 of 3 kilo bij). Zodra fase 2 begint gaat dat er snel weer af, dus maak je geen zorgen.`
          : ` (${delta} kilo t.o.v. je start; schommelen hoort erbij, vaak is het vocht. Kijk naar de lijn over meerdere dagen, niet naar één ochtend.)`;
  }

  // Patroon-conclusies uit het dagboek (feedback Raoul 27 juli): de
  // Mentor ziet zelf wat er gebeurt en reageert erop, niet alleen
  // registreren. Maximaal ÉÉN conclusie per check-in (eerste treffer
  // wint), alles rechtstreeks uit het boekje. De "netBereikt"-check
  // zorgt dat een reeks-melding één keer komt en zich niet elke dag
  // herhaalt zolang de reeks doorloopt.
  let patroonTekst = "";
  const metGewichtReeks = reeks.filter((r) => r.gewicht != null);
  const gewichten = metGewichtReeks.map((r) => r.gewicht as number);
  const spreiding = (lijst: number[]) =>
    Math.max(...lijst) - Math.min(...lijst);
  const komma = (n: number) => String(n).replace(".", ",");
  const begeleider = ctx.memberVoornaam || "je begeleider";
  const laatsteOpRij = (n: number, test: (r: CheckinRij) => boolean) =>
    reeks.length >= n && reeks.slice(-n).every(test);
  const netBereikt = (n: number, test: (r: CheckinRij) => boolean) =>
    laatsteOpRij(n, test) &&
    (reeks.length === n || !test(reeks[reeks.length - n - 1]));

  // 1. Fase 3-anker: meer dan een kilo boven het startgewicht van fase 3
  //    -> de correctie-dag uit het boekje (eenmalig bij het overschrijden).
  if (
    !patroonTekst &&
    gewicht != null &&
    ctx.stationSlug === "stabilisatie" &&
    ctx.stationSinds
  ) {
    const faseStart = String(ctx.stationSinds).slice(0, 10);
    const inFase3 = metGewichtReeks.filter((r) => r.datum >= faseStart);
    if (inFase3.length >= 2) {
      const anker = inFase3[0].gewicht as number;
      const vorige = inFase3[inFase3.length - 2].gewicht as number;
      const boven = Math.round((gewicht - anker) * 10) / 10;
      if (boven > 1 && vorige - anker <= 1) {
        patroonTekst = ` En hier moeten we even samen naar kijken: je zit nu ${komma(boven)} kilo boven je ankerpunt (je gewicht aan de start van fase 3), en de grens uit je boekje is één kilo. Daar is de correctie-dag voor, het liefst binnen 48 uur. De kern: één dag vrijwel alleen eiwit en veel drinken. Dat kan klassiek (overdag alleen drinken, 's avonds één grote eiwit-maaltijd met een appel of tomaat erbij) of verdeeld over de dag, en de eiwit-bron kies je zelf: biefstuk, kip of vis, een eiwit-omelet, of tempeh of seitan. Vraag me gerust, dan help ik je er doorheen.`;
      }
    }
  }

  // 2. Centimeters eraf terwijl de weegschaal stilstaat -> juist vieren.
  //    Bewust VÓÓR de plateau-check: lopen de centimeters, dan is dát de
  //    verklaring van de stilstand en is vieren beter dan een appeldag.
  if (!patroonTekst) {
    const metTaille = reeks.filter((r) => r.taille != null);
    if (metTaille.length >= 2 && metTaille[metTaille.length - 1].datum === datum) {
      const tVorig = metTaille[metTaille.length - 2];
      const cmEraf =
        Math.round(
          ((tVorig.taille as number) -
            (metTaille[metTaille.length - 1].taille as number)) * 10,
        ) / 10;
      const gVorig = metGewichtReeks
        .filter((r) => r.datum <= tVorig.datum)
        .slice(-1)[0]?.gewicht;
      if (
        cmEraf >= 1 &&
        gewicht != null &&
        gVorig != null &&
        gVorig - gewicht < 0.5
      ) {
        patroonTekst = ` En kijk hier eens: je weegschaal zegt deze periode weinig, maar je taille is ${komma(cmEraf)} centimeter smaller dan bij je vorige meting. Dit is precies waarom we meten: je lichaam verandert óók als de weegschaal even zwijgt.`;
      }
    }
  }

  // 3 + 4. Fase 2-plateau (4 dagen vrijwel gelijk -> appeldag-route) en
  //        plotse sprong omhoog (-> geruststellen: vocht).
  if (
    !patroonTekst &&
    gewicht != null &&
    metGewichtReeks.length >= 2 &&
    ctx.stationSlug !== "laaddagen"
  ) {
    const laatste4 = gewichten.slice(-4);
    const laatste5 = gewichten.slice(-5);
    const plateauNu = laatste4.length === 4 && spreiding(laatste4) <= 0.2;
    const plateauAlGemeld = laatste5.length === 5 && spreiding(laatste5) <= 0.2;
    const dagDelta =
      Math.round((gewicht - gewichten[gewichten.length - 2]) * 10) / 10;
    if (ctx.stationSlug === "omschakeling" && plateauNu && !plateauAlGemeld) {
      patroonTekst =
        " Mij valt trouwens iets op: je gewicht staat nu vier dagen zo goed als stil. Dat heet een plateau en het hoort erbij: je lichaam slaat tijdelijk vocht op terwijl de verbranding gewoon doorloopt, en daarna kan er ineens een halve tot ruim een kilo af zijn. Vanaf nu mag je wel bijsturen met een appeldag uit je boekje. Maar eerst even checken: doe je je voetenbadjes met Keltisch zeezout nog (2 tot 3 keer per week), en haal je je 2 liter water? Vraag me gerust hoe de appeldag precies werkt, dan leg ik het je stap voor stap uit.";
    } else if (dagDelta >= 0.8) {
      patroonTekst = ` En schrik niet van die ${komma(dagDelta)} kilo erbij sinds je vorige weging: zo'n sprong is bijna altijd vocht, niet ineens vet. Was er gisteren iets anders dan anders (zouter gegeten, korter geslapen, menstruatie op komst)? Vertel het me gerust, dan kijk ik met je mee.`;
    }
  }

  // 4. Tweede zware dag op rij -> erkennen, eigen winst terughalen,
  //    basis checken en de begeleider dichtbij halen.
  if (
    !patroonTekst &&
    stemming === "zwaar" &&
    netBereikt(2, (r) => r.stemming === "zwaar")
  ) {
    const eerdereWinst = [...reeks.slice(0, -1)]
      .reverse()
      .find((r) => r.notitie)?.notitie;
    // Op de laaddagen betekent "zwaar" meestal: vol zitten van al het
    // eten. Dan geen fase 2-checks ("eet je genoeg?"), maar laad-taal.
    patroonTekst =
      ctx.stationSlug === "laaddagen"
        ? ` Ik zie dat dit je tweede zware dag op rij is, en dat op je laaddagen: heel begrijpelijk, zoveel eten is voor veel mensen echt even doorbijten. Wat helpt: verdeel het over heel veel kleine momenten, de hele dag door tot je gaat slapen, in plaats van jezelf vol te proppen. En onthoud: dit duurt maar twee dagen, daarna begint fase 2 en valt dit weg. Stuur ook gerust een berichtje naar ${begeleider}, zo'n dag hoef je niet alleen te dragen.`
        : ` Ik zie dat dit je tweede zware dag op rij is, en die mag er gewoon zijn: je lichaam is hard aan het werk.${eerdereWinst ? ` Maar weet je nog wat je zelf opschreef: "${eerdereWinst.slice(0, 100)}"? Dat was jij ook, en dat komt terug.` : ""} Check voor vandaag even de basis: eet je genoeg (je mag geen honger hebben) en haal je je 2 liter water? En stuur gerust een berichtje naar ${begeleider}, zo'n dag hoef je niet alleen te dragen.`;
  }

  // 5. Drie dagen weinig energie in fase 2 -> omschakel-dip + basis-check.
  if (
    !patroonTekst &&
    ctx.stationSlug === "omschakeling" &&
    energie === "weinig" &&
    netBereikt(3, (r) => r.energie === "weinig")
  ) {
    patroonTekst =
      " Je energie staat nu drie dagen op weinig, en dat wil ik niet zomaar voorbij laten gaan. Zeker in de eerste week van fase 2 hoort zo'n dip er vaak bij: je lichaam is aan het omschakelen. Maar check ook even de basis, want daar zit meestal de sleutel: eet je écht genoeg van je lijst, neem je je extra Keltisch zeezout, en haal je je 2 liter water? Blijft het hangen, zeg het me, dan kijken we er samen naar.";
  }

  // 6. Drie nachten slecht geslapen -> de slaap-tips uit het materiaal.
  if (
    !patroonTekst &&
    slaap === "slecht" &&
    netBereikt(3, (r) => r.slaap === "slecht")
  ) {
    patroonTekst =
      " Drie nachten op rij slecht geslapen, dat telt aan. Twee dingen uit je materiaal die vaak verschil maken: eet minimaal 3 uur voor het slapen niets meer (bijvoorbeeld vanaf 19.00 uur niets), en gun jezelf overdag een paar echte rustmomenten, want je lichaam is hard aan het werk. En je zult zien: zodra de nachten beter worden, trekt je energie meestal vanzelf mee omhoog.";
  }

  // 7. Drie dagen onrustige buik (darmprogramma) -> bijstuur-tips,
  //    daarna de begeleider.
  if (
    !patroonTekst &&
    ctx.programmaSlug === "darm" &&
    buik === "onrustig" &&
    netBereikt(3, (r) => r.buik === "onrustig")
  ) {
    patroonTekst = ` Je buik is nu drie dagen onrustig, dus laten we bijsturen: je mag je MSM Plus verhogen, neem extra Keltisch zeezout en drink genoeg water. Doe dat vandaag en morgen, en blijft het daarna nog zo, overleg dan even met ${begeleider}, die kent dit soort dagen goed.`;
  }

  // 9. Een paar dagen geen gewicht ingevuld -> vriendelijk herinneren
  //    (dagelijks wegen is het bijstuur-instrument uit het boekje).
  if (
    !patroonTekst &&
    gewicht == null &&
    metGewichtReeks.length > 0 &&
    netBereikt(3, (r) => r.gewicht == null)
  ) {
    patroonTekst =
      " Kleine tip tussendoor: je hebt een paar dagen geen gewicht ingevuld. Geen enkel verwijt, maar dagelijks even wegen ('s ochtends, lege maag, na het plassen) is juist je bijstuur-instrument: zo zien we samen op tijd of er iets nodig is, bijvoorbeeld voor een appeldag. Doe je morgen weer mee?";
  }

  // Eén boodschap over hetzelfde thema: de specifieke patroon-tekst
  // vervangt de algemene schommel-zin (het lichter-compliment blijft).
  if (patroonTekst && !verschilTekst.startsWith(" Je bent al")) {
    verschilTekst = "";
  }

  const stemDeel = stemming
    ? `Fijn dat je het deelt dat het vandaag ${STEMMING_WOORD[stemming]} gaat.`
    : "Genoteerd voor vandaag.";
  // Streak-mijlpalen echt vieren (feedback Raoul 27 juli), daarbuiten
  // het gewone vlammetje.
  const MIJLPAAL_TEKST: Record<number, string> = {
    7: " En vandaag iets om te vieren: een héle week elke dag ingecheckt! 🎉 Dat ritme is precies wat dit sterk maakt.",
    14: " Twee volle weken elke dag ingecheckt, wat een trouw aan jezelf! 🎉",
    21: " Eenentwintig dagen op rij ingecheckt! 🎉 Drie weken lang elke dag voor jezelf kiezen: dat is geen toeval meer, dat ben jij.",
    30: " Dertig dagen op rij ingecheckt! 🎉 Dit ritme is nu gewoon van jou.",
  };
  const streakDeel =
    MIJLPAAL_TEKST[streak] ??
    (streak >= 3 ? ` En knap: ${streak} dagen op rij ingecheckt! 🔥` : "");
  // De kleine winst van de dag terugspiegelen: kijken naar wat wél
  // werkt (journal-principe), niet naar wat nog niet perfect is. De
  // afsluiter wisselt per dag, anders wordt het eentonig (feedback
  // Raoul 24 juli: elke dag "vasthouden die" ging vervelen).
  const WINST_AFSLUITERS = [
    "Mooi om te lezen, en genoteerd. 💚",
    "Die schrijf ik met een glimlach op. 💚",
    "Kijk, dit zijn de dingen die tellen. 💚",
    "Weer een streepje aan de goede kant. 💚",
    "Dit soort dingen ga je er straks steeds meer zien, let maar op. 💚",
    "Precies hiervoor doe je het. 💚",
    "Genoteerd in je dagboek, daar ga je nog blij mee terugkijken. 💚",
  ];
  const dagIndex = Math.floor(Date.parse(datum) / 86_400_000);
  const winstDeel = notitie
    ? ` En wat je opschreef ("${notitie.slice(0, 120)}"): ${WINST_AFSLUITERS[dagIndex % WINST_AFSLUITERS.length]}`
    : "";
  const zwaarDeel =
    stemming === "zwaar" && buik === "onrustig" && !patroonTekst
      ? " Zware dag én een onrustige buik: dat mag er zijn, je lichaam is aan het werk. Vertel me gerust wat je merkt, dan kijk ik met je mee."
      : "";
  const antwoord = `${stemDeel}${gewicht != null ? ` Gewicht van vandaag opgeslagen.${verschilTekst}` : ""}${patroonTekst}${streakDeel}${winstDeel}${zwaarDeel} Ik houd alles voor je bij, vraag me gerust "mijn voortgang".`;

  // In het gesprek bewaren zodat het meereist.
  await bewaarResetChats(ctx.linkId, [
    {
      van: "klant",
      soort: "tekst",
      stationSlug: ctx.stationSlug,
      tekst: `Check-in: ${stemming ? STEMMING_WOORD[stemming] : "gedaan"}${energie ? `, energie ${energie}` : ""}${slaap ? `, slaap ${slaap}` : ""}${buik ? `, buik ${buik}` : ""}${gewicht != null ? `, ${gewicht} kg` : ""}${notitie ? `. Winst van vandaag: ${notitie}` : ""}`,
    },
    { van: "mentor", soort: "tekst", stationSlug: ctx.stationSlug, tekst: antwoord },
  ]);

  return Response.json({
    ok: true,
    antwoord,
    streak,
    reeks: reeks.map((r) => ({
      datum: r.datum,
      stemming: r.stemming,
      gewicht: r.gewicht,
      notitie: r.notitie,
    })),
  });
}
