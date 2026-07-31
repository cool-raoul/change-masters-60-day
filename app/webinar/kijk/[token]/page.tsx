import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { normaliseerNaarEmbed } from "@/lib/films/embed";
import { slotIsBegonnen, slotTekst } from "@/lib/webinar/slots";
import { haalWebinar, haalBestellinks } from "@/lib/webinar/data";
import { SITE_URL } from "@/lib/site";
import { KijkScherm } from "./kijk-scherm";

// ============================================================
// /webinar/kijk/[token] — de kijkpagina.
//
// Vóór het gekozen moment: rustige wachtpagina met de datum en een
// "toch nu beginnen"-knop. Tegenhouden zou raar zijn bij een opname.
// Vanaf het moment: de video, de bestellinks van dit teamlid bij dít
// webinar, en de actie-knop.
// ============================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Het webinar",
  description: "Jouw persoonlijke kijklink.",
  robots: { index: false, follow: false },
};

export default async function WebinarKijkPagina({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: rij } = await admin
    .from("webinar_inschrijvingen")
    .select("id, naam, slot_start, status, member_id, webinar_id")
    .eq("token", token)
    .maybeSingle();
  if (!rij) notFound();
  const inschrijving = rij as {
    id: string;
    naam: string;
    slot_start: string;
    status: string;
    member_id: string;
    webinar_id: string | null;
  };

  const webinar = inschrijving.webinar_id
    ? await haalWebinar(inschrijving.webinar_id)
    : null;
  if (!webinar) notFound();

  const { data: memberRij } = await admin
    .from("profiles")
    .select("full_name, telefoon")
    .eq("id", inschrijving.member_id)
    .maybeSingle();
  const member = (memberRij ?? {}) as {
    full_name?: string | null;
    telefoon?: string | null;
  };

  const bestellinks = await haalBestellinks(
    webinar.id,
    inschrijving.member_id,
  );

  const begonnen = slotIsBegonnen(inschrijving.slot_start);
  const embed = normaliseerNaarEmbed(webinar.video_url ?? "");
  const voornaam = inschrijving.naam.split(" ")[0];

  return (
    <div className="min-h-screen bg-cm-black text-cm-white">
      <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Opgenomen webinar
          </p>
          <h1 className="text-2xl font-display font-bold">{webinar.titel}</h1>
          <p className="text-cm-white/70 text-sm">
            Welkom {voornaam}. Jouw gekozen moment:{" "}
            {slotTekst(inschrijving.slot_start)}.
          </p>
        </div>

        <KijkScherm
          token={token}
          begonnen={begonnen}
          embed={embed}
          duurMinuten={webinar.duur_minuten}
          actieLabel={webinar.actie_label}
          actieUitleg={
            webinar.actie_uitleg ??
            "Klik hierop en je hoort snel van me. Geen verplichting, gewoon even samen kijken of dit bij je past."
          }
          alGedaan={inschrijving.status === "actie"}
          memberVoornaam={
            (member.full_name ?? "").split(" ")[0] || "je contactpersoon"
          }
          memberTelefoon={member.telefoon ?? null}
          bestellinks={bestellinks}
          bestellinkUitleg={
            webinar.bestellink_uitleg ??
            "Wil je meteen bestellen wat je net gezien hebt? Dat kan hieronder."
          }
          webinarTitel={webinar.titel}
          slotStart={inschrijving.slot_start}
          kijkUrl={`${SITE_URL}/webinar/kijk/${token}`}
          thumbnail={webinar.thumbnail_url}
        />
      </div>
    </div>
  );
}
