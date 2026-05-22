// File: app/instellingen/freebies/page.tsx
//
// Founder-CMS shell voor de Freebies-toolkit. Toont bestaande freebies
// uit DB, plus de PLACEHOLDER-templates uit voorbeeld-toolkit.ts.
// Founder kan hier morgen claim-vrije content invullen.
//
// NB: deze route bestaat alleen voor founders (role check). Komt nog
// geen edit-knoppen, alleen lees-overzicht voor pilot. Edit in latere Fase.

import { createClient } from "@/lib/supabase/server";
import { VOORBEELD_TOOLKIT } from "@/lib/freebies/voorbeeld-toolkit";
import type { Freebie } from "@/lib/freebies/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FreebiesAdminPagina() {
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

  // Vrolijke fallback als tabel nog niet bestaat (SQL niet gedraaid).
  let bestaandeFreebies: Freebie[] = [];
  try {
    const { data } = await supabase
      .from("freebies")
      .select("id, slug, titel, ondertitel, vorm, onderwerp, beschrijving, inhoud_template, duur_minuten, actief")
      .order("titel");
    bestaandeFreebies = ((data ?? []) as Array<{
      id: string;
      slug: string;
      titel: string;
      ondertitel: string | null;
      vorm: Freebie["vorm"];
      onderwerp: string;
      beschrijving: string;
      inhoud_template: string | null;
      duur_minuten: number | null;
      actief: boolean;
    }>).map((r) => ({
      id: r.id,
      slug: r.slug,
      titel: r.titel,
      ondertitel: r.ondertitel ?? undefined,
      vorm: r.vorm,
      onderwerp: r.onderwerp,
      beschrijving: r.beschrijving,
      inhoudTemplate: r.inhoud_template ?? undefined,
      duurMinuten: r.duur_minuten ?? undefined,
      actief: r.actief,
    }));
  } catch {
    bestaandeFreebies = [];
  }

  const placeholderTeImporteren = VOORBEELD_TOOLKIT.filter(
    (v) => !bestaandeFreebies.some((b) => b.slug === v.slug),
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-slate-100">
      <h1 className="text-2xl font-semibold">🎁 Freebies-toolkit (founder)</h1>
      <p className="mt-2 text-sm text-slate-400">
        Pilot-shell. Edit-knoppen komen in latere Fase. Hier zie je nu de status
        van de toolkit: welke freebies live staan in de DB, en welke PLACEHOLDER-
        templates in code wachten op claim-vrije inhoud van Raoul en Gaby.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Live in DB ({bestaandeFreebies.length})</h2>
        {bestaandeFreebies.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Nog geen freebies in de database. De SQL-migratie (
            <code className="bg-slate-800 px-1">supabase/migrations/2026-05-22-05-freebies.sql</code>)
            ligt klaar. Draai hem in de Supabase SQL Editor en daarna kunnen jullie
            via insert-statements de templates uitrollen.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {bestaandeFreebies.map((f) => (
              <li
                key={f.id}
                className="rounded-md border border-slate-700 bg-slate-900/40 p-3"
              >
                <div className="text-sm font-medium">
                  {f.titel}{" "}
                  <span className="text-xs text-slate-500">
                    ({f.vorm}, {f.onderwerp})
                  </span>
                </div>
                {f.ondertitel && (
                  <div className="text-xs text-slate-400">{f.ondertitel}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">
          PLACEHOLDER-templates in code ({placeholderTeImporteren.length})
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Deze staan in <code className="bg-slate-800 px-1">lib/freebies/voorbeeld-toolkit.ts</code>.
          TODO-GABY: claim-vrije inhoud invullen, daarna importeren naar DB.
        </p>
        <ul className="mt-3 space-y-2">
          {placeholderTeImporteren.map((v) => (
            <li
              key={v.slug}
              className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3"
            >
              <div className="text-sm font-medium text-amber-100">
                {v.titel}{" "}
                <span className="text-xs text-amber-300/80">
                  ({v.vorm}, {v.onderwerp})
                </span>
              </div>
              {v.ondertitel && (
                <div className="text-xs text-amber-200/80">{v.ondertitel}</div>
              )}
              <div className="mt-1 text-xs text-amber-200/60">{v.beschrijving}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
