// File: app/k/[token]/page.tsx
//
// DE ECHTE KLANT-LINK: de Mentor-wereld voor een klant, zonder
// account. Token in de URL is de sleutel (server-side gevalideerd
// via de admin-client). Het gesprek en de plek in het programma
// komen van de server, zodat het geheugen op elk apparaat meereist.
//
// Link-preview bewust neutraal en claim-vrij (standing rule):
// geen programma-namen of gezondheids-termen in de metadata.

import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { haalPaginaBlokken, type Blok } from "@/lib/cms/pagina-blokken";
import {
  pakResetKlantContext,
  pakResetChats,
  seintjeNaarMember,
} from "@/lib/resetcode/klant-links";
import { pakCheckins, heeftVandaagIngecheckt } from "@/lib/resetcode/checkin";
import MentorWereld from "@/components/resetcode/MentorWereld";

export const dynamic = "force-dynamic";

// Metadata per token: neutraal en claim-vrij, plus een EIGEN manifest
// zodat "zet op beginscherm" een app oplevert die op /k/<token> opent
// (het globale manifest start op /dashboard en dat is voor members).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  return {
    title: "Jouw persoonlijke omgeving",
    description: "Alles voor jouw programma op één plek, met je eigen Mentor.",
    robots: { index: false, follow: false },
    manifest: `/k/${token}/manifest`,
    openGraph: {
      title: "Jouw persoonlijke omgeving",
      description:
        "Alles voor jouw programma op één plek, met je eigen Mentor.",
    },
  };
}

export default async function KlantLinkPagina({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const ctx = await pakResetKlantContext(token);

  // PRIVACY-SCHILD: opent het member (of een andere ingelogde gebruiker)
  // de klant-link zelf, dan tonen we NIET het gesprek (dat is privé
  // tussen klant en Mentor, zelfde lijn als mini-ELEVA / AVG Keuze A)
  // en vuren we ook geen "klant is gestart"-triggers af.
  if (ctx) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // Uitzondering: een member die zijn EIGEN programma doet (Mijn
    // programma) is hier de klant zelf; het schild geldt alleen voor
    // de begeleider.
    if (user && user.id === ctx.memberId && ctx.klantUserId !== user.id) {
      return (
        <main
          className="flex min-h-screen items-center justify-center px-6 text-center"
          style={{ backgroundColor: "#0F1B17" }}
        >
          <div className="max-w-sm">
            <p className="text-4xl mb-3">🔒</p>
            <h1 className="text-white font-bold text-lg">
              Dit is de omgeving van {ctx.klantVoornaam}
            </h1>
            <p className="text-white/60 text-sm mt-2 leading-relaxed">
              Het gesprek met de Mentor is privé tussen {ctx.klantVoornaam}{" "}
              en de Mentor. Jij krijgt automatisch een seintje bij de
              start, bij elke volgende stap en op de contactmomenten. De
              voortgang zie je op de klantenkaart en bij Mijn klanten.
            </p>
            <p className="text-white/40 text-xs mt-3 leading-relaxed">
              Wil je zelf voelen hoe de omgeving werkt? Gebruik de preview
              op /resetcode-preview, die staat los van echte klanten.
            </p>
            <a
              href="/resetcode-links"
              className="inline-block mt-4 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white"
            >
              Naar Mijn klanten
            </a>
          </div>
        </main>
      );
    }
  }

  if (!ctx || ctx.status === "gesloten") {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ backgroundColor: "#0F1B17" }}
      >
        <div>
          <p className="text-4xl mb-3">🌿</p>
          <h1 className="text-white font-bold text-lg">
            Deze link werkt niet (meer)
          </h1>
          <p className="text-white/60 text-sm mt-2 leading-relaxed max-w-sm">
            Vraag degene die jou begeleidt even om een nieuwe persoonlijke
            link, dan staat alles weer voor je klaar.
          </p>
        </div>
      </main>
    );
  }

  if (ctx.status === "gepauzeerd") {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ backgroundColor: "#0F1B17" }}
      >
        <div>
          <p className="text-4xl mb-3">⏸️</p>
          <h1 className="text-white font-bold text-lg">Even gepauzeerd</h1>
          <p className="text-white/60 text-sm mt-2 leading-relaxed max-w-sm">
            Je omgeving staat even stil. {ctx.memberVoornaam} kan &apos;m
            weer voor je aanzetten.
          </p>
        </div>
      </main>
    );
  }

  // Gesprek ophalen en vertalen naar chat-items voor de Mentor-wereld.
  const chats = await pakResetChats(ctx.linkId);
  const KAARTEN = [
    "regels",
    "welniet",
    "tips",
    "video",
    "documenten",
    "contact",
    "logi",
    "vervolg",
    "faq",
    "suikers",
    "wctips",
    "videotips",
    "videodag10",
  ] as const;
  type KaartNaam = (typeof KAARTEN)[number];
  const beginItems = chats
    .map((c) => {
      if (c.soort === "kaart") {
        if (
          c.kaart &&
          (KAARTEN as readonly string[]).includes(c.kaart) &&
          c.station_slug
        ) {
          return {
            van: "mentor" as const,
            soort: "kaart" as const,
            kaart: c.kaart as KaartNaam,
            stationSlug: c.station_slug,
          };
        }
        return null;
      }
      // foto's zijn niet opgeslagen, alleen het tekst-spoor
      return {
        van: c.van === "klant" ? ("ik" as const) : ("mentor" as const),
        soort: "tekst" as const,
        tekst: c.tekst ?? "",
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null && (i.soort === "kaart" || i.tekst.length > 0));

  // Door Raoul gevulde media (video's, documenten) voor dit programma.
  const admin = createAdminClient();
  const blokkenMap = await haalPaginaBlokken(
    admin,
    "resetcode-klant",
    ctx.programmaSlug,
  );
  const mediaBlokken: Record<string, Blok[]> = {};
  blokkenMap.forEach((blokken, positie) => {
    mediaBlokken[`${ctx.programmaSlug}/${positie}`] = blokken;
  });

  // Laaddagen-teller: dagtotaal van vandaag (Nederlandse datum) voor de
  // teller-pill, zodat het meereist over apparaten.
  let kcalStart = 0;
  if (ctx.stationSlug === "laaddagen") {
    const vandaag = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Amsterdam",
    }).format(new Date());
    const { data: kcalRijen } = await admin
      .from("resetcode_kcal_log")
      .select("kcal")
      .eq("link_id", ctx.linkId)
      .eq("datum", vandaag);
    kcalStart = ((kcalRijen ?? []) as { kcal: number }[]).reduce(
      (som, r) => som + r.kcal,
      0,
    );
  }

  // Dag-nummer binnen de huidige fase. Op de vraag-fase (voorbereiding)
  // en de eerste "echte" fase telt de ZELFGEKOZEN startdatum (feedback
  // Raoul 19 juli): de klant kan dagen vóór de start al alles lezen
  // zonder dat de teller loopt.
  const START_STATION: Record<string, string> = {
    darm: "zestien-dagen",
    reset: "laaddagen",
  };
  const VRAAG_STATION: Record<string, string> = {
    darm: "start",
    reset: "voorbereiding",
  };
  const opStartStation = ctx.stationSlug === START_STATION[ctx.programmaSlug];
  const opVraagStation = ctx.stationSlug === VRAAG_STATION[ctx.programmaSlug];
  const vandaagStr = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Amsterdam",
  }).format(new Date());
  let dagNummerRuw: number | null = null;
  if ((opStartStation || opVraagStation) && ctx.startDatum) {
    dagNummerRuw =
      Math.round(
        (Date.parse(vandaagStr) - Date.parse(ctx.startDatum)) / 86_400_000,
      ) + 1;
  } else if (ctx.stationSinds) {
    dagNummerRuw =
      Math.floor(
        (Date.now() - new Date(ctx.stationSinds).getTime()) / 86_400_000,
      ) + 1;
  }
  // Startdatum in de toekomst: teller staat op 0, aftellen tot de start.
  const startOverDagen =
    dagNummerRuw != null && dagNummerRuw < 1 ? 1 - dagNummerRuw : 0;
  const dagNummer = dagNummerRuw != null && dagNummerRuw >= 1 ? dagNummerRuw : null;
  // Startmoment-vraag alleen rond het echte begin: wie al dagen bezig is
  // (dag 2+) krijgt 'm niet meer voorgeschoteld (feedback Raoul 22 juli:
  // de vraag dook op dag 3, 15 en zelfs 17 nog op).
  const startGekozen =
    Boolean(ctx.startDatum) ||
    !(opStartStation || opVraagStation) ||
    (dagNummer != null && dagNummer > 1);

  // Tijd-gebonden touchpoint: het kern-verhaal (aanbevelingsmarketing)
  // komt bij darm rond dag 5-7; bij de reset op dag 22 van fase 2, ná de
  // fase-keuze van dag 20/21 (feedback Raoul 22 juli: dag 22 = het
  // aanbevelen-moment). Wie vóór dag 22 al doorging naar fase 3 of 4,
  // krijgt het daar alsnog bij het eerstvolgende bezoek.
  let dueTouchpoint:
    | "kern-verhaal"
    | "reset-complimenten"
    | "darm-einde"
    | null = null;
  if (!ctx.isBouwer && dagNummer != null) {
    if (!ctx.touchpoints.includes("kern-verhaal")) {
      const kernNu =
        ctx.programmaSlug === "darm"
          ? ctx.stationSlug === "zestien-dagen" && dagNummer >= 5
          : ctx.programmaSlug === "reset" &&
            (ctx.stationSlug === "omschakeling"
              ? dagNummer >= 22
              : ctx.stationSlug === "stabilisatie" ||
                ctx.stationSlug === "logisch-leven");
      if (kernNu) dueTouchpoint = "kern-verhaal";
    }
    // Complimenten-opvolger: niet meer bij de fase 3-intro (stapelde op
    // het dag 22-aanbevelen-moment), maar rustig rond dag 5 van fase 3.
    if (
      !dueTouchpoint &&
      ctx.programmaSlug === "reset" &&
      ctx.stationSlug === "stabilisatie" &&
      dagNummer >= 5 &&
      !ctx.touchpoints.includes("reset-complimenten")
    ) {
      dueTouchpoint = "reset-complimenten";
    }
    // Darm eigen-ervaring/webshop-opvolger: niet meer in het einde-feest
    // (dag 17 stapelde te veel), maar op een rustige opmaak-dag.
    if (
      !dueTouchpoint &&
      ctx.programmaSlug === "darm" &&
      ctx.stationSlug === "zestien-dagen" &&
      dagNummer >= 19 &&
      !ctx.touchpoints.includes("darm-einde")
    ) {
      dueTouchpoint = "darm-einde";
    }
  }

  // Dag 10-video (darm): pas vanaf dag 10 in de fase, eenmalig.
  let dueDag10: number | null = null;
  if (
    ctx.programmaSlug === "darm" &&
    ctx.stationSlug === "zestien-dagen" &&
    dagNummer != null &&
    !ctx.touchpoints.includes("dag10-video")
  ) {
    if (dagNummer >= 10) dueDag10 = Math.min(dagNummer, 16);
  }

  // Dagelijkse check-in + dagboek-reeks.
  const [checkinVandaagGedaan, checkinRuw] = await Promise.all([
    heeftVandaagIngecheckt(ctx.linkId),
    pakCheckins(ctx.linkId),
  ]);
  const checkinReeks = checkinRuw.map((c) => ({
    datum: c.datum,
    stemming: c.stemming,
    gewicht: c.gewicht,
    notitie: c.notitie,
  }));

  // Week-terugblik: elke 7 dagen in de fase één keer een mini-overzicht
  // (kompas-principe: bewijs voor jezelf). Alleen als er check-ins zijn.
  const weekNummer = dagNummer != null ? Math.floor(dagNummer / 7) : 0;
  const dueWeekTerugblik =
    weekNummer >= 1 &&
    checkinReeks.length >= 3 &&
    !ctx.touchpoints.includes(`week-terugblik-${weekNummer}`)
      ? weekNummer
      : null;

  // Programma-einde: pas als de dagen van de laatste fase er écht op
  // zitten (info doorklikken op dag 1 is geen einde). Dan komt het
  // einde-moment (webshop-verhaal + vervolg) bij het volgende bezoek.
  const EINDE_NA: Record<string, { station: string; dagen: number }> = {
    darm: { station: "zestien-dagen", dagen: 16 },
    reset: { station: "logisch-leven", dagen: 21 },
  };
  // Einde-markering per programma, zodat op de doorgroei-route (zelfde
  // link, volgend programma) het volgende einde gewoon wél speelt.
  const eindeKey = `programma-einde-${ctx.programmaSlug}`;
  const einde = EINDE_NA[ctx.programmaSlug];
  const dueEinde = Boolean(
    einde &&
      ctx.stationSlug === einde.station &&
      dagNummer != null &&
      dagNummer > einde.dagen &&
      !ctx.touchpoints.includes(eindeKey) &&
      !ctx.touchpoints.includes("programma-einde"),
  );

  // Reset-fase-regie: fase-dagen zitten erop → keuze-moment (verlengen
  // tot max 40 in fase 2, fase 3 exact 21, daarna kiezen).
  let dueFaseKeuze: { fase: string; dag: number; max?: boolean } | null = null;
  // Darm: vooruitblik rond dag 14-16 (vervolg-momentje plannen) en de
  // eenmalige opmaak-uitleg zodra de 16 dagen erop zitten. Loopt via
  // hetzelfde fase-momenten-kanaal, één moment per dag.
  if (
    ctx.programmaSlug === "darm" &&
    ctx.stationSlug === "zestien-dagen" &&
    dagNummer != null
  ) {
    if (
      dagNummer >= 14 &&
      dagNummer <= 16 &&
      !ctx.touchpoints.includes("darm-vooruitblik")
    ) {
      dueFaseKeuze = { fase: "darm-vooruitblik", dag: dagNummer };
    } else if (
      dagNummer > 16 &&
      !ctx.touchpoints.includes("darm-opmaak-uitleg")
    ) {
      dueFaseKeuze = { fase: "darm-opmaak", dag: dagNummer };
    }
  }
  if (ctx.programmaSlug === "reset" && dagNummer != null) {
    // Fase 2: keuze-moment vanaf dag 20 (vooruitkijkend, feedback Raoul
    // 22 juli). Wie "ik blijf in fase 2" koos, krijgt de vraag niet
    // dagelijks opnieuw; alleen het 40-dagen-maximum komt dan nog.
    if (
      ctx.stationSlug === "omschakeling" &&
      dagNummer >= 20 &&
      (dagNummer >= 40 || !ctx.touchpoints.includes("fase2-verlengd"))
    ) {
      dueFaseKeuze = { fase: "omschakeling", dag: dagNummer, max: dagNummer >= 40 };
    } else if (ctx.stationSlug === "stabilisatie" && dagNummer >= 20) {
      // Dag 20 = vooruitkijken (alvast lezen over fase 4); de echte
      // keuze-knoppen komen vanaf dag 21, de fase duurt de volle 21 dagen.
      dueFaseKeuze = { fase: "stabilisatie", dag: dagNummer };
    }
  }

  // Terugkom-berichten uit de kennis-lus: vragen die deze klant stelde,
  // inmiddels door het team beantwoord, nog niet teruggekoppeld.
  const { data: kennisRuw } = await admin
    .from("resetcode_kennis")
    .select("id, vraag, antwoord")
    .eq("link_id", ctx.linkId)
    .eq("status", "beantwoord")
    .eq("terugkoppeling_gedaan", false)
    .order("beantwoord_op", { ascending: true })
    .limit(2);
  const dueKennis = ((kennisRuw ?? []) as {
    id: string;
    vraag: string;
    antwoord: string | null;
  }[]).filter((k) => k.antwoord);

  // Eerste bezoek (geen stap, geen gesprek): seintje naar de begeleider.
  if (!ctx.stationSlug && chats.length === 0) {
    await seintjeNaarMember(
      ctx,
      `${ctx.klantVoornaam} heeft de klantomgeving geopend 🎉`,
      `${ctx.klantNaam} is gestart. De Mentor vangt het eerste stuk op; jouw persoonlijke berichtje maakt het af.`,
    );
  }

  return (
    <div
      className="mx-auto"
      style={{ maxWidth: 560, height: "100dvh", backgroundColor: "#0F1B17" }}
    >
      <MentorWereld
        begeleiderNaam={ctx.memberVoornaam}
        token={ctx.token}
        klantVoornaam={ctx.klantVoornaam}
        programmaSlugVast={ctx.programmaSlug}
        stationSlugStart={ctx.stationSlug}
        beginItems={beginItems}
        memberTelefoon={ctx.memberTelefoon}
        mediaBlokken={mediaBlokken}
        touchpointsAlVerteld={ctx.touchpoints}
        isBouwer={ctx.isBouwer}
        dueTouchpoint={dueTouchpoint}
        kcalStart={kcalStart}
        dueDag10={dueDag10}
        dueEinde={dueEinde}
        checkinVandaagGedaan={checkinVandaagGedaan}
        checkinReeks={checkinReeks}
        dagNummer={dagNummer}
        startGekozen={startGekozen}
        startOverDagen={startOverDagen}
        pakket={ctx.pakket}
        dueWeekTerugblik={dueWeekTerugblik}
        dueKennis={dueKennis}
        vrijgegeven={ctx.vrijgegeven}
        dueFaseKeuze={dueFaseKeuze}
      />
    </div>
  );
}
