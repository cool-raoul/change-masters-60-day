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
    if (user && user.id === ctx.memberId) {
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

  // Tijd-gebonden touchpoint: het kern-verhaal komt rond dag 5-7 van de
  // 16 dagen (darm) of van fase 2 (reset), niet meteen bij de start.
  const KERN_STATION: Record<string, string> = {
    darm: "zestien-dagen",
    reset: "omschakeling",
  };
  let dueTouchpoint: "kern-verhaal" | null = null;
  if (
    !ctx.isBouwer &&
    !ctx.touchpoints.includes("kern-verhaal") &&
    ctx.stationSlug === KERN_STATION[ctx.programmaSlug] &&
    ctx.stationSinds
  ) {
    const dagen =
      (Date.now() - new Date(ctx.stationSinds).getTime()) / 86_400_000;
    if (dagen >= 5) dueTouchpoint = "kern-verhaal";
  }

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

  // Dag 10-video (darm): pas vanaf dag 10 in de fase, eenmalig.
  let dueDag10: number | null = null;
  if (
    ctx.programmaSlug === "darm" &&
    ctx.stationSlug === "zestien-dagen" &&
    ctx.stationSinds &&
    !ctx.touchpoints.includes("dag10-video")
  ) {
    const dag =
      Math.floor(
        (Date.now() - new Date(ctx.stationSinds).getTime()) / 86_400_000,
      ) + 1;
    if (dag >= 10) dueDag10 = Math.min(dag, 16);
  }

  // Dagelijkse check-in + dagboek-reeks + dag-nummer binnen de fase.
  const [checkinVandaagGedaan, checkinRuw] = await Promise.all([
    heeftVandaagIngecheckt(ctx.linkId),
    pakCheckins(ctx.linkId),
  ]);
  const checkinReeks = checkinRuw.map((c) => ({
    datum: c.datum,
    stemming: c.stemming,
    gewicht: c.gewicht,
  }));
  const dagNummer = ctx.stationSinds
    ? Math.floor(
        (Date.now() - new Date(ctx.stationSinds).getTime()) / 86_400_000,
      ) + 1
    : null;

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
        checkinVandaagGedaan={checkinVandaagGedaan}
        checkinReeks={checkinReeks}
        dagNummer={dagNummer}
      />
    </div>
  );
}
