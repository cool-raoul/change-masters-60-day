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
    else if (delta > 0) verschilTekst = ` (${delta} kilo t.o.v. je start; schommelen hoort erbij, wacht rustig op de woosh)`;
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
  const antwoord = `${stemDeel}${gewicht != null ? ` Gewicht van vandaag opgeslagen.${verschilTekst}` : ""}${streakDeel}${winstDeel}${zwaarDeel} Ik houd alles voor je bij, vraag me gerust "mijn voortgang".`;

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
