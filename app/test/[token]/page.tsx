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

  // Test ophalen + prospect-naam + member-naam (voor pre-fill en uitleg)
  const { data: test, error } = await supabase
    .from("productadvies_tests")
    .select(
      `
      id, token, status, member_id, prospect_id,
      prospects ( volledige_naam ),
      profiles!productadvies_tests_member_id_fkey ( full_name )
    `,
    )
    .eq("token", token)
    .single();

  if (error || !test) {
    notFound();
  }

  if (test.status === "ingevuld") {
    redirect(`/test/${token}/resultaat`);
  }

  // Naam-extractie (Supabase joint-syntaxis kan array of object teruggeven)
  const prospectNaam =
    (Array.isArray(test.prospects) ? test.prospects[0]?.volledige_naam : (test.prospects as any)?.volledige_naam) ??
    null;
  const memberNaam =
    (Array.isArray(test.profiles) ? test.profiles[0]?.full_name : (test.profiles as any)?.full_name) ??
    "je member";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <div className="text-center">
            <div className="text-emerald-600 text-sm font-medium uppercase tracking-wider">
              Productadvies-test
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
              {prospectNaam ? `Hé ${prospectNaam.split(" ")[0]}` : "Welkom"}
            </h1>
            <p className="mt-3 text-gray-600">
              Fijn dat je deze test invult. Dit duurt ongeveer 3 minuten.
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
