// File: app/instellingen/standaardvragen/page.tsx
//
// Founder-CMS shell voor Train-de-Mentor Laag 1 (standaardvragen-bibliotheek).
// Lees-overzicht voor pilot. Edit-knoppen komen in latere Fase.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Standaardvraag = {
  id: string;
  vraag_patroon: string;
  trefwoorden: string[];
  antwoord: string;
  categorie: "bezwaar" | "product" | "business" | "praktisch" | "persoonlijk";
  modus: string[];
  actief: boolean;
};

export default async function StandaardvragenAdminPagina() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder = (profile as { role?: string } | null)?.role === "founder";
  if (!isFounder) redirect("/instellingen");

  let vragen: Standaardvraag[] = [];
  try {
    const { data } = await supabase
      .from("standaardvragen")
      .select("id, vraag_patroon, trefwoorden, antwoord, categorie, modus, actief")
      .order("categorie");
    vragen = (data ?? []) as Standaardvraag[];
  } catch {
    vragen = [];
  }

  const perCategorie = vragen.reduce<Record<string, Standaardvraag[]>>((acc, v) => {
    if (!acc[v.categorie]) acc[v.categorie] = [];
    acc[v.categorie].push(v);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-semibold">🧠 Standaardvragen (Mentor Laag 1)</h1>
      <p className="mt-2 text-sm text-slate-400">
        Pilot-shell. Lees-overzicht. Edit + toevoegen komt in latere Fase.
        Inhoud staat in tabel <code className="bg-slate-800 px-1">standaardvragen</code>.
        Draai eerst de SQL-migratie (
        <code className="bg-slate-800 px-1">supabase/migrations/2026-05-22-03-standaardvragen.sql</code>).
      </p>

      {vragen.length === 0 ? (
        <div className="mt-6 rounded-md border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-400">
          Nog geen standaardvragen in DB. Bibliotheek bouwen jullie morgen met
          de eerste 20 tot 30 vragen uit pilot-feedback.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Object.entries(perCategorie).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="text-lg font-medium capitalize">{cat}</h2>
              <ul className="mt-2 space-y-2">
                {items.map((v) => (
                  <li
                    key={v.id}
                    className="rounded-md border border-slate-700 bg-slate-900/40 p-3"
                  >
                    <div className="text-sm font-medium">{v.vraag_patroon}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      Trefwoorden: {v.trefwoorden.join(", ")}
                    </div>
                    <div className="mt-2 text-xs text-slate-300">{v.antwoord}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Modus: {v.modus.join(" + ")} · {v.actief ? "actief" : "uit"}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
