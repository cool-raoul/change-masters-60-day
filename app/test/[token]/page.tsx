import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { TestForm } from "./test-form";

// ============================================================
// Publieke productadvies-test pagina (geen auth nodig)
// URL: /test/[token]
//
// Server component:
//   - laadt test + prospect-naam + member-naam op token
//   - bij status='ingevuld' redirect naar /resultaat
//   - rendert client form met uitspraken
// ============================================================

export const dynamic = "force-dynamic";

export default async function TestPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Test ophalen (zonder joins — joins werken hier niet door cross-schema FK's)
  const { data: test, error } = await supabase
    .from("productadvies_tests")
    .select("id, token, status, member_id, prospect_id")
    .eq("token", token)
    .single();

  if (error || !test) {
    notFound();
  }

  if (test.status === "ingevuld") {
    redirect(`/test/${token}/resultaat`);
  }

  // Prospect-naam apart ophalen
  let prospectNaam: string | null = null;
  if (test.prospect_id) {
    const { data: prospect } = await supabase
      .from("prospects")
      .select("volledige_naam")
      .eq("id", test.prospect_id)
      .single();
    prospectNaam = prospect?.volledige_naam ?? null;
  }

  // Member-naam apart ophalen via profiles
  let memberNaam = "je member";
  if (test.member_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", test.member_id)
      .single();
    memberNaam = profile?.full_name ?? "je member";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <div className="text-center">
            <div className="text-emerald-600 text-sm font-medium uppercase tracking-wider">
              Productadvies-vragenlijst
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
              {prospectNaam ? `Hé ${prospectNaam.split(" ")[0]}` : "Welkom"}
            </h1>
            <p className="mt-3 text-gray-600">
              Fijn dat je deze vragenlijst invult. Dit duurt ongeveer 3 minuten.
              <br />
              Aan het eind krijg je een advies dat past bij wat jij aangeeft.
            </p>
          </div>
        </header>

        <TestForm
          token={token}
          prospectNaam={prospectNaam}
          memberNaam={memberNaam}
        />

        <footer className="mt-10 text-center text-xs text-gray-400">
          Lifeplus producten zijn voedingssupplementen, geen geneesmiddelen.
          Niet bedoeld om gezondheidsklachten te diagnosticeren, behandelen,
          genezen of voorkomen.
        </footer>
      </div>
    </div>
  );
}
