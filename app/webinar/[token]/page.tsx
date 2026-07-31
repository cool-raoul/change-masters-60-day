import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { bouwSlots } from "@/lib/webinar/slots";
import { haalWebinar } from "@/lib/webinar/data";
import { InschrijfFormulier } from "./inschrijf-formulier";

// ============================================================
// /webinar/[token] — de publieke aanmeldpagina van één webinar.
//
// Token = de persoonlijke link van een teamlid voor dát webinar.
// Wie zich hier aanmeldt, komt in de namenlijst van díe persoon.
//
// Bewust eerlijk: we zeggen dat het een opname is en dat de bezoeker
// zelf zijn moment kiest. Geen nep-live, geen valse aftelklok.
// ============================================================

export const dynamic = "force-dynamic";

/**
 * Link-preview: als iemand de link deelt in WhatsApp of op socials,
 * moet daar de titel én de voorproef-afbeelding van dít webinar
 * verschijnen. Vandaar per token opgebouwd in plaats van vast.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const admin = createAdminClient();
  const { data: linkRij } = await admin
    .from("webinar_member_links")
    .select("webinar_id")
    .eq("token", token)
    .maybeSingle();
  const webinar = linkRij
    ? await haalWebinar((linkRij as { webinar_id: string }).webinar_id)
    : null;

  const titel = webinar?.titel ?? "Webinar aanmelden";
  const omschrijving =
    webinar?.ondertitel ??
    "Een opgenomen webinar. Kies zelf het moment dat jou uitkomt.";

  return {
    title: titel,
    description: omschrijving,
    openGraph: {
      title: titel,
      description: omschrijving,
      type: "website",
      ...(webinar?.thumbnail_url
        ? { images: [{ url: webinar.thumbnail_url }] }
        : {}),
    },
    twitter: {
      card: webinar?.thumbnail_url ? "summary_large_image" : "summary",
      title: titel,
      description: omschrijving,
      ...(webinar?.thumbnail_url ? { images: [webinar.thumbnail_url] } : {}),
    },
  };
}

export default async function WebinarInschrijfPagina({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: linkRij } = await admin
    .from("webinar_member_links")
    .select("member_id, webinar_id")
    .eq("token", token)
    .maybeSingle();
  if (!linkRij) notFound();
  const link = linkRij as { member_id: string; webinar_id: string };

  const webinar = await haalWebinar(link.webinar_id);
  if (!webinar || !webinar.actief) notFound();

  const { data: member } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", link.member_id)
    .maybeSingle();
  const memberNaam =
    (member as { full_name?: string | null } | null)?.full_name ?? "";
  const memberVoornaam = memberNaam.split(" ")[0] || "je contactpersoon";

  const slots = bouwSlots();

  return (
    <div className="min-h-screen bg-cm-black text-cm-white">
      <div className="max-w-2xl mx-auto px-5 py-10 space-y-7">
        {/* Voorproef-afbeelding: zonder plaatje is dit een muur tekst.
            Het speel-driehoekje maakt meteen duidelijk dat er een video
            achter zit, zonder te doen alsof je 'm hier al kunt starten. */}
        {webinar.thumbnail_url && (
          <div className="relative rounded-xl overflow-hidden border border-cm-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={webinar.thumbnail_url}
              alt={webinar.titel}
              className="w-full block"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <span className="w-14 h-14 rounded-full bg-black/60 border-2 border-white/70 flex items-center justify-center text-white text-xl">
                ▶
              </span>
            </div>
          </div>
        )}

        <div className="text-center space-y-3">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Opgenomen webinar
          </p>
          <h1 className="text-3xl font-display font-bold leading-tight">
            {webinar.titel}
          </h1>
          <p className="text-cm-white/80 leading-relaxed">
            {webinar.ondertitel}
          </p>
        </div>

        {webinar.intro_tekst && (
          <div className="card">
            <p className="text-cm-white/85 text-sm leading-relaxed whitespace-pre-line">
              {webinar.intro_tekst}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-cm-border bg-cm-surface/60 px-4 py-3">
          <p className="text-cm-white/70 text-sm leading-relaxed">
            Even open kaart: dit is een <strong>opname</strong>, geen
            live-uitzending. Je mist dus nooit iets en er zit niemand op je te
            wachten. Waarom je dan toch een moment kiest? Omdat een gepland
            moment nu eenmaal veel vaker echt gekeken wordt dan een link die je
            &quot;later wel eens&quot; opent.
          </p>
        </div>

        <InschrijfFormulier
          token={token}
          slots={slots}
          memberVoornaam={memberVoornaam}
          duurMinuten={webinar.duur_minuten}
          webinarTitel={webinar.titel}
        />

        <p className="text-center text-cm-white/45 text-xs leading-relaxed">
          Je gegevens komen alleen bij {memberVoornaam} terecht, om je de
          kijklink te sturen en er eventueel persoonlijk op terug te komen. We
          delen niets met derden.
        </p>
      </div>
    </div>
  );
}
