import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  pakResetKlantContext,
  bewaarResetChats,
} from "@/lib/resetcode/klant-links";
import { vandaagNL, pakCheckins } from "@/lib/resetcode/checkin";

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
  // Mentor moet zelf zien wat er gebeurt en erop reageren, niet alleen
  // registreren. Twee patronen, deterministisch uit het boekje:
  // (1) fase 2-plateau: 4 metingen vrijwel gelijk -> appeldag-route
  //     aanreiken + voetenbadjes/water checken (eenmalig, niet elke dag
  //     herhalen zolang het plateau duurt);
  // (2) plotse sprong omhoog t.o.v. de vorige weging -> geruststellen
  //     (vocht) en uitvragen wat er anders was.
  let patroonTekst = "";
  const metGewichtReeks = reeks.filter((r) => r.gewicht != null);
  if (
    gewicht != null &&
    metGewichtReeks.length >= 2 &&
    ctx.stationSlug !== "laaddagen"
  ) {
    const gewichten = metGewichtReeks.map((r) => r.gewicht as number);
    const spreiding = (lijst: number[]) =>
      Math.max(...lijst) - Math.min(...lijst);
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
      patroonTekst = ` En schrik niet van die ${String(dagDelta).replace(".", ",")} kilo erbij sinds je vorige weging: zo'n sprong is bijna altijd vocht, niet ineens vet. Was er gisteren iets anders dan anders (zouter gegeten, korter geslapen, menstruatie op komst)? Vertel het me gerust, dan kijk ik met je mee.`;
    }
    // Eén boodschap over hetzelfde thema: de specifieke patroon-tekst
    // vervangt de algemene schommel-zin (het lichter-compliment blijft).
    if (patroonTekst && !verschilTekst.startsWith(" Je bent al")) {
      verschilTekst = "";
    }
  }

  const stemDeel = stemming
    ? `Fijn dat je het deelt dat het vandaag ${STEMMING_WOORD[stemming]} gaat.`
    : "Genoteerd voor vandaag.";
  const streakDeel =
    streak >= 3 ? ` En knap: ${streak} dagen op rij ingecheckt! 🔥` : "";
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
    stemming === "zwaar" && buik === "onrustig"
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
