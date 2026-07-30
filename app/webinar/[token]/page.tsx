import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { bouwSlots } from "@/lib/webinar/slots";
import { InschrijfFormulier } from "./inschrijf-formulier";

// ============================================================
// /webinar/[token] — de publieke inschrijfpagina.
//
// Token = de persoonlijke link van een member. Wie zich hier
// aanmeldt, komt in de namenlijst van díe member terecht.
//
// Bewust eerlijk: we zeggen dat het een opgenomen masterclass is
// en dat de bezoeker zelf zijn moment kiest. Geen nep-live, geen
// aftelklok die iets suggereert wat niet waar is.
// ============================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masterclass aanmelden",
  description:
    "Een opgenomen masterclass. Kies zelf het moment dat jou uitkomt.",
  openGraph: {
    title: "Masterclass aanmelden",
    description:
      "Een opgenomen masterclass. Kies zelf het moment dat jou uitkomt.",
  },
};

export default async function WebinarInschrijfPagina({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: tokenRij } = await admin
    .from("freebie_bot_member_tokens")
    .select("member_id")
    .eq("token", token)
    .eq("bot_slug", "webinar")
    .maybeSingle();
  if (!tokenRij) notFound();

  const { data: member } = await admin
    .from("profiles")
    .select("full_name, foto_url")
    .eq("id", (tokenRij as { member_id: string }).member_id)
    .maybeSingle();
  const memberNaam =
    (member as { full_name?: string | null } | null)?.full_name ?? "";
  const memberVoornaam = memberNaam.split(" ")[0] || "je contactpersoon";

  const { data: configRij } = await admin
    .from("webinar_config")
    .select("*")
    .eq("id", "standaard")
    .maybeSingle();
  const config = (configRij ?? {}) as {
    titel?: string;
    ondertitel?: string;
    duur_minuten?: number;
    intro_tekst?: string;
    actief?: boolean;
  };

  if (config.actief === false) notFound();

  const slots = bouwSlots();

  return (
    <div className="min-h-screen bg-cm-black text-cm-white">
      <div className="max-w-2xl mx-auto px-5 py-10 space-y-7">
        <div className="text-center space-y-3">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Opgenomen masterclass
          </p>
          <h1 className="text-3xl font-display font-bold leading-tight">
            {config.titel ?? "Masterclass: meer tijd en vrijheid"}
          </h1>
          <p className="text-cm-white/80 leading-relaxed">
            {config.ondertitel ??
              `Een opgenomen masterclass van ongeveer ${config.duur_minuten ?? 45} minuten. Jij kiest wanneer je kijkt.`}
          </p>
        </div>

        {config.intro_tekst && (
          <div className="card">
            <p className="text-cm-white/85 text-sm leading-relaxed whitespace-pre-line">
              {config.intro_tekst}
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
          duurMinuten={config.duur_minuten ?? 45}
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
