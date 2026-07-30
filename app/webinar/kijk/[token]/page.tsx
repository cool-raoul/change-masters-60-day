import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { normaliseerNaarEmbed } from "@/lib/films/embed";
import { slotIsBegonnen, slotTekst } from "@/lib/webinar/slots";
import { KijkScherm } from "./kijk-scherm";

// ============================================================
// /webinar/kijk/[token] — de kijkpagina.
//
// Vóór het gekozen moment: rustige wachtpagina met de datum en de
// mogelijkheid om alsnog meteen te beginnen. Wij houden niemand
// tegen, het is tenslotte een opname, en doen alsof zou oneerlijk
// zijn. Vanaf het moment: de video plus de actie-knop.
// ============================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "De masterclass",
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
    .select("id, naam, slot_start, status, member_id")
    .eq("token", token)
    .maybeSingle();
  if (!rij) notFound();
  const inschrijving = rij as {
    id: string;
    naam: string;
    slot_start: string;
    status: string;
    member_id: string;
  };

  const { data: configRij } = await admin
    .from("webinar_config")
    .select("titel, video_url, duur_minuten, actie_label, actie_uitleg")
    .eq("id", "standaard")
    .maybeSingle();
  const config = (configRij ?? {}) as {
    titel?: string;
    video_url?: string | null;
    duur_minuten?: number;
    actie_label?: string;
    actie_uitleg?: string | null;
  };

  const { data: memberRij } = await admin
    .from("profiles")
    .select("full_name, telefoon")
    .eq("id", inschrijving.member_id)
    .maybeSingle();
  const member = (memberRij ?? {}) as {
    full_name?: string | null;
    telefoon?: string | null;
  };

  const begonnen = slotIsBegonnen(inschrijving.slot_start);
  const embed = normaliseerNaarEmbed(config.video_url ?? "");
  const voornaam = inschrijving.naam.split(" ")[0];

  return (
    <div className="min-h-screen bg-cm-black text-cm-white">
      <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Opgenomen masterclass
          </p>
          <h1 className="text-2xl font-display font-bold">
            {config.titel ?? "De masterclass"}
          </h1>
          <p className="text-cm-white/70 text-sm">
            Welkom {voornaam}. Jouw gekozen moment:{" "}
            {slotTekst(inschrijving.slot_start)}.
          </p>
        </div>

        <KijkScherm
          token={token}
          begonnen={begonnen}
          embed={embed}
          duurMinuten={config.duur_minuten ?? 45}
          actieLabel={config.actie_label ?? "Ik wil hier meer over weten"}
          actieUitleg={
            config.actie_uitleg ??
            "Klik hierop en je hoort snel van me. Geen verplichting, gewoon even samen kijken of dit bij je past."
          }
          alGedaan={inschrijving.status === "actie"}
          memberVoornaam={(member.full_name ?? "").split(" ")[0] || "je contactpersoon"}
          memberTelefoon={member.telefoon ?? null}
        />
      </div>
    </div>
  );
}
