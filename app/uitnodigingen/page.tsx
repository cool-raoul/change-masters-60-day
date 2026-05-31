import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UitnodigingenWizard } from "./wizard";
import { parseISO, formatDistanceToNow, format } from "date-fns";
import { nl } from "date-fns/locale";
import Link from "next/link";

// ============================================================
// /uitnodigingen, hub voor Mini-ELEVA-uitnodigingen.
//
// Sinds 2026-05-31: members kunnen vanuit hier een nieuwe uitnodiging
// maken (eerst kant kiezen, dan prospect), en ze zien hier hun lopende
// en verlopen uitnodigingen op een rij. Voorheen was dit alleen te
// bereiken via de klantenkaart van een specifieke prospect.
// ============================================================

export const dynamic = "force-dynamic";

export default async function UitnodigingenHubPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Prospects van deze member ophalen voor de picker.
  const { data: prospectsRaw } = await supabase
    .from("prospects")
    .select("id, volledige_naam, pipeline_fase")
    .eq("user_id", user.id)
    .eq("gearchiveerd", false)
    .order("volledige_naam", { ascending: true });

  const prospects = (
    (prospectsRaw as Array<{
      id: string;
      volledige_naam: string;
      pipeline_fase: string;
    }>) || []
  ).map((p) => ({
    id: p.id,
    naam: p.volledige_naam,
    fase: p.pipeline_fase,
  }));

  // Bestaande uitnodigingen ophalen. Probeer met soort-kolom, fallback
  // zonder als migratie nog niet gedraaid is.
  type InvRow = {
    id: string;
    prospect_id: string;
    token: string;
    status: string;
    expires_at: string;
    laatste_activiteit_op: string | null;
    soort?: string | null;
  };

  let bestaandeRaw: InvRow[] = [];
  {
    const eerstePoging = await supabase
      .from("prospect_invitations")
      .select(
        "id, prospect_id, token, status, expires_at, laatste_activiteit_op, soort",
      )
      .eq("member_user_id", user.id)
      .order("expires_at", { ascending: false });
    if (!eerstePoging.error && eerstePoging.data) {
      bestaandeRaw = eerstePoging.data as unknown as InvRow[];
    } else if (eerstePoging.error?.code === "42703") {
      const tweedePoging = await supabase
        .from("prospect_invitations")
        .select(
          "id, prospect_id, token, status, expires_at, laatste_activiteit_op",
        )
        .eq("member_user_id", user.id)
        .order("expires_at", { ascending: false });
      if (tweedePoging.data) {
        bestaandeRaw = tweedePoging.data as unknown as InvRow[];
      }
    }
  }

  const prospectNaamMap = new Map<string, string>();
  for (const p of prospects) prospectNaamMap.set(p.id, p.naam);

  const nu = Date.now();
  const bestaande = bestaandeRaw.map((inv) => {
    const verloopMs = parseISO(inv.expires_at).getTime();
    const isVerlopen = inv.status === "verlopen" || verloopMs < nu;
    return {
      id: inv.id,
      prospectId: inv.prospect_id,
      prospectNaam: prospectNaamMap.get(inv.prospect_id) ?? "Onbekende prospect",
      token: inv.token,
      status: inv.status,
      soort:
        inv.soort === "product"
          ? ("product" as const)
          : inv.soort === "business"
            ? ("business" as const)
            : inv.token.startsWith("p-")
              ? ("product" as const)
              : ("business" as const),
      expiresAt: inv.expires_at,
      verlooptOver: isVerlopen
        ? null
        : formatDistanceToNow(parseISO(inv.expires_at), {
            locale: nl,
            addSuffix: false,
          }),
      verlopenOp: isVerlopen
        ? format(parseISO(inv.expires_at), "d MMM yyyy", { locale: nl })
        : null,
      laatsteActiviteit: inv.laatste_activiteit_op
        ? formatDistanceToNow(parseISO(inv.laatste_activiteit_op), {
            locale: nl,
            addSuffix: true,
          })
        : null,
      isVerlopen,
    };
  });

  const actief = bestaande.filter((i) => !i.isVerlopen);
  const verlopen = bestaande.filter((i) => i.isVerlopen);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Mini-ELEVA
        </p>
        <h1 className="font-serif-warm text-2xl text-cm-white leading-tight mt-1">
          Uitnodigingen
        </h1>
        <p className="text-cm-white/75 text-sm leading-relaxed mt-3 max-w-xl">
          Stuur een nieuwe Mini-ELEVA-uitnodiging naar iemand uit je
          namenlijst, of bekijk je lopende uitnodigingen. Je kunt
          uitnodigingen ook nog steeds maken vanaf de klantenkaart van
          een specifieke prospect.
        </p>
      </div>

      {/* Wizard voor nieuwe uitnodiging */}
      <UitnodigingenWizard prospects={prospects} />

      {/* Actieve uitnodigingen */}
      <section className="space-y-3">
        <h2 className="text-cm-gold text-sm font-semibold uppercase tracking-wider">
          Lopende uitnodigingen ({actief.length})
        </h2>
        {actief.length === 0 ? (
          <p className="text-cm-white/55 text-sm italic">
            Nog geen lopende uitnodigingen. Maak er hierboven een aan.
          </p>
        ) : (
          <div className="space-y-2">
            {actief.map((inv) => (
              <div
                key={inv.id}
                className="card flex items-start gap-3"
              >
                <span className="text-2xl flex-shrink-0">
                  {inv.soort === "product" ? "🌿" : "💼"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-cm-white font-semibold text-sm">
                    {inv.prospectNaam}
                  </p>
                  <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
                    {inv.soort === "product"
                      ? "Product-kant"
                      : "Business + product"}
                    {" · "}verloopt over{" "}
                    <span className="text-cm-gold">{inv.verlooptOver}</span>
                    {inv.laatsteActiviteit
                      ? ` · laatste activiteit ${inv.laatsteActiviteit}`
                      : " · nog geen activiteit"}
                  </p>
                  <p className="text-cm-white/40 text-[10px] mt-1 break-all">
                    /m/{inv.token}
                  </p>
                </div>
                <Link
                  href={`/namenlijst/${inv.prospectId}#mini-eleva`}
                  className="text-cm-gold text-xs hover:underline flex-shrink-0"
                >
                  Beheer →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verlopen */}
      {verlopen.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-cm-white/55 text-sm font-semibold uppercase tracking-wider">
            Verlopen ({verlopen.length})
          </h2>
          <div className="space-y-2">
            {verlopen.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                className="card opacity-60 flex items-start gap-3"
              >
                <span className="text-xl flex-shrink-0">
                  {inv.soort === "product" ? "🌿" : "💼"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-cm-white text-sm">{inv.prospectNaam}</p>
                  <p className="text-cm-white/50 text-xs">
                    Verlopen op {inv.verlopenOp}
                  </p>
                </div>
                <Link
                  href={`/namenlijst/${inv.prospectId}#mini-eleva`}
                  className="text-cm-gold/70 text-xs hover:underline flex-shrink-0"
                >
                  Opnieuw →
                </Link>
              </div>
            ))}
            {verlopen.length > 5 && (
              <p className="text-cm-white/40 text-xs italic">
                {verlopen.length - 5} oudere verlopen uitnodigingen niet
                getoond.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
