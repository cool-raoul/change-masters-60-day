import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MentorKennisLijst } from "./lijst";

// ============================================================
// /instellingen/mentor-kennis
//
// Founder-only validatie-UI voor de Lifeplus product-ervaringskennis
// (2017-CSV, Dr. McKee + jarenlange teamervaring). Founders gaan rij
// voor rij door de 127 ingelezen aandoeningen, valideren of de
// combinatie nog steeds klopt voor 2026, passen tekst aan, en zetten
// 'gevalideerd' aan zodra een regel klaar is voor ELEVA Mentor-gebruik.
//
// Alleen gevalideerde regels mogen later door de Mentor worden geraad-
// pleegd (in een aparte aanpassing van de coach-prompt). Tot die tijd
// is de tabel puur founder-data.
// ============================================================

export const dynamic = "force-dynamic";

type Rij = {
  id: string;
  oorspronkelijke_term: string;
  zoekterm: string;
  basis_advies: string | null;
  aanvullende_producten: string[];
  leefstijl_tip: string | null;
  rauwe_bron_tekst: string | null;
  bron_jaar: number;
  gevalideerd: boolean;
  notitie: string | null;
};

export default async function MentorKennisPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profiel } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isFounder =
    (profiel as { role?: string } | null)?.role === "founder";
  if (!isFounder) redirect("/dashboard");

  const { data: rijenData } = await supabase
    .from("mentor_kennis_supplementen")
    .select(
      "id, oorspronkelijke_term, zoekterm, basis_advies, aanvullende_producten, leefstijl_tip, rauwe_bron_tekst, bron_jaar, gevalideerd, notitie",
    )
    .order("oorspronkelijke_term", { ascending: true });

  const rijen = (rijenData as Rij[] | null) ?? [];
  const aantalGevalideerd = rijen.filter((r) => r.gevalideerd).length;
  const aantalTotaal = rijen.length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Founder-kennisbank
        </p>
        <h1 className="font-serif-warm text-2xl sm:text-3xl text-cm-white leading-tight mt-1">
          Mentor product-kennis (intern)
        </h1>
        <p className="text-cm-white/70 text-sm mt-3 leading-relaxed">
          Bron: 2017-database met jarenlange ervaring + adviezen Dr. Dwight
          McKee. Loop ze rij voor rij door en zet alleen{" "}
          <strong className="text-cm-white">gevalideerd</strong> aan als de
          combinatie nu (2026) ook nog steeds klopt. ELEVA Mentor gebruikt
          alléén gevalideerde regels — en dan claim-vrij geformuleerd, nooit
          ziektenamen direct in publieke uitingen.
        </p>
      </div>

      {/* Voortgangsbalk */}
      <div className="card border-gold-subtle">
        <div className="flex items-center justify-between mb-2">
          <p className="text-cm-white text-sm font-medium">
            Voortgang validatie
          </p>
          <p className="text-cm-gold font-semibold text-sm">
            {aantalGevalideerd} / {aantalTotaal}
          </p>
        </div>
        <div className="h-2 bg-cm-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-gold rounded-full transition-all"
            style={{
              width: `${aantalTotaal > 0 ? (aantalGevalideerd / aantalTotaal) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/40 bg-amber-900/20 px-4 py-3 text-sm text-amber-100/90">
        <p className="font-semibold mb-1">⚠ Gevoelige data</p>
        <p className="leading-relaxed text-xs">
          Deze inhoud is intern-only. Niet delen buiten ELEVA-team. Wat je
          hier valideert wordt later door de Mentor gebruikt — altijd in
          claim-vrije taal, met disclaimers, en zonder ziektenamen in
          publieke uitingen.
        </p>
      </div>

      <MentorKennisLijst rijen={rijen} />
    </div>
  );
}
