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
import { haalPaginaBlokken, type Blok } from "@/lib/cms/pagina-blokken";
import {
  pakResetKlantContext,
  pakResetChats,
  seintjeNaarMember,
} from "@/lib/resetcode/klant-links";
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
      />
    </div>
  );
}
