import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import { DarmForm } from "./darm-form";
import { DarmUitslagWeergave } from "./darm-uitslag-weergave";
import type { DarmUitslag } from "@/lib/zelftest/darm-vragen";
import { getResetPakket } from "@/lib/lifeplus/pakketten";

// ============================================================
// /test/[token]/darm-keuze
// Publieke vervolgvragenlijst voor de prospect: 15 vragen om te
// bepalen of een darmprogramma (basis vs plus) past.
//
// Server component:
//   - laadt productadvies_tests rij op token
//   - als darmvragenlijst_uitslag al gezet is: toon uitslag + advies
//   - anders: render DarmForm
// ============================================================

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data: test } = await supabase
    .from("productadvies_tests")
    .select("prospect_id, member_id")
    .eq("token", token)
    .maybeSingle();

  let prospectVoornaam: string | null = null;
  let memberVoornaam = "iemand";
  if (test?.prospect_id) {
    const { data: prospect } = await supabase
      .from("prospects")
      .select("volledige_naam")
      .eq("id", test.prospect_id)
      .single();
    prospectVoornaam = prospect?.volledige_naam?.split(" ")[0] ?? null;
  }
  if (test?.member_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", test.member_id)
      .single();
    memberVoornaam = profile?.full_name?.split(" ")[0] ?? "iemand";
  }

  const titel = prospectVoornaam
    ? `Korte vervolgvragenlijst voor ${prospectVoornaam}`
    : "Korte vervolgvragenlijst voor jou";
  const beschrijving = `${memberVoornaam} stelt een korte vervolgvragenlijst voor om te bepalen of een darmprogramma bij je past. Duurt zo'n 3 minuten.`;

  return {
    title: titel,
    description: beschrijving,
    openGraph: {
      title: titel,
      description: beschrijving,
      images: [],
    },
    twitter: {
      card: "summary",
      title: titel,
      description: beschrijving,
    },
    icons: { icon: undefined, apple: undefined },
  };
}

export default async function DarmKeuzePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: test, error } = await supabase
    .from("productadvies_tests")
    .select(
      "id, token, status, member_id, prospect_id, darmvragenlijst_uitslag, is_open_template, uitslag",
    )
    .eq("token", token)
    .single();

  if (error || !test) {
    notFound();
  }

  // Templates kunnen geen darmvragenlijst hebben — die volgt op een
  // ingevulde hoofd-vragenlijst van een prospect.
  if (test.is_open_template) {
    notFound();
  }

  // Hoofdadvies-tekst voor de stuur-naar-member knop op de uitslag.
  const hoofdUitslag = test.uitslag as
    | { categorieLabel?: string; niveau?: string }
    | null;
  const hoofdAdviesTekst = hoofdUitslag?.categorieLabel
    ? `${hoofdUitslag.categorieLabel}${hoofdUitslag.niveau ? " " + hoofdUitslag.niveau : ""}`
    : "(nog niet bekend)";

  // Member-naam ophalen
  let memberNaam = "je member";
  if (test.member_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", test.member_id)
      .single();
    memberNaam = profile?.full_name ?? "je member";
  }

  // Prospect-voornaam ophalen
  let prospectVoornaam: string | null = null;
  if (test.prospect_id) {
    const { data: prospect } = await supabase
      .from("prospects")
      .select("volledige_naam")
      .eq("id", test.prospect_id)
      .single();
    prospectVoornaam = prospect?.volledige_naam?.split(" ")[0] ?? null;
  }

  const bestaandeUitslag = test.darmvragenlijst_uitslag as DarmUitslag | null;
  const adviesPakket = bestaandeUitslag?.advies_pakket_key
    ? getResetPakket(bestaandeUitslag.advies_pakket_key as any)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <header className="mb-6 text-center">
          <Link
            href={`/test/${token}/resultaat`}
            className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900 font-medium mb-4"
          >
            ← Terug naar je advies
          </Link>
          <div className="text-emerald-600 text-sm font-medium uppercase tracking-wider">
            Vervolgvragenlijst — darmen & balans
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
            {prospectVoornaam
              ? `${prospectVoornaam}, hoe zit het met je dagelijkse signalen?`
              : "Hoe zit het met je dagelijkse signalen?"}
          </h1>
          <p className="mt-3 text-gray-600">
            15 korte vragen, samen ongeveer 3 minuten. Aan het eind weet je of
            een darmprogramma op dit moment passend is — en zo ja, welke variant.
          </p>
        </header>

        {bestaandeUitslag ? (
          <DarmUitslagWeergave
            uitslag={bestaandeUitslag}
            adviesPakket={adviesPakket}
            memberNaam={memberNaam}
            token={token}
            hoofdAdviesTekst={hoofdAdviesTekst}
          />
        ) : (
          <DarmForm
            token={token}
            memberNaam={memberNaam}
            hoofdAdviesTekst={hoofdAdviesTekst}
          />
        )}

        <footer className="mt-10 text-center text-xs text-gray-400">
          Lifeplus producten zijn voedingssupplementen, geen geneesmiddelen.
          Niet bedoeld om gezondheidsklachten te diagnosticeren, behandelen,
          genezen of voorkomen.
        </footer>
      </div>
    </div>
  );
}
