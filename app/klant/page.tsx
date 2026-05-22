// File: app/klant/page.tsx
//
// Klantomgeving entry, K2-anti-overwhelm: één tegel-perspectief uitgewerkt
// tot lijst-overzicht. Toont klanten van de huidige member met aantal nieuwe
// signalen per klant (geaggregeerd, AVG Keuze A).

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isCoreV6Actief } from "@/lib/feature-flags/core-v6";

export const dynamic = "force-dynamic";

export default async function KlantOverviewPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const v6Actief = await isCoreV6Actief(user.id);
  if (!v6Actief) {
    // Feature-flag default false. Klantomgeving onzichtbaar tot we klaar zijn.
    redirect("/dashboard");
  }

  // Vrolijke fallback als tabel nog niet bestaat.
  let klanten: Array<{
    id: string;
    klant_naam: string;
    status: string;
    laatste_activiteit: string;
  }> = [];
  try {
    const { data } = await supabase
      .from("klantomgeving_klanten")
      .select("id, klant_naam, status, laatste_activiteit")
      .eq("member_id", user.id)
      .order("laatste_activiteit", { ascending: false });
    klanten = (data ?? []) as typeof klanten;
  } catch {
    klanten = [];
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Mijn klanten</h1>
      <p className="mt-2 text-sm text-slate-400">
        Hier staan de klanten die je via je webshop hebt opgebouwd. ELEVA stuurt
        de pulse-momenten in hun klantomgeving zelf, jij krijgt seintjes wanneer
        menselijk contact natuurlijk past.
      </p>

      {klanten.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-400">
          Nog geen klanten in beeld. Zodra je eerste prospect bestelt via je
          eigen webshop, verschijnt hij hier.
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {klanten.map((k) => (
            <li
              key={k.id}
              className="rounded-md border border-slate-700 bg-slate-900/40 p-3"
            >
              <div className="text-sm font-medium">{k.klant_naam}</div>
              <div className="text-xs text-slate-400">
                Status: {k.status} · Laatste activiteit:{" "}
                {new Date(k.laatste_activiteit).toLocaleDateString("nl-NL")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
