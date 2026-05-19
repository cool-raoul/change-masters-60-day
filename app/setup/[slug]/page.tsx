import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ITEMS } from "@/lib/setup/admin-items";
import { isReedsVoltooid } from "@/lib/onboarding/voltooiingen";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import { AdminItemAfvinkKnop } from "@/components/setup/AdminItemAfvinkKnop";
import { MediaBlokkenClient } from "@/components/cms/MediaBlokkenClient";

// ============================================================
// /setup/[slug], uitleg-detail-pagina per admin-item.
//
// Toont titel, uitleg-tekst, eventuele film (via FilmInBlok) en
// eventuele externe link. Plus afvink-knop + terugknop naar /setup.
// ============================================================

export const dynamic = "force-dynamic";

export default async function SetupItemPagina({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = ADMIN_ITEMS.find((it) => it.slug === slug);
  if (!item) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const status = await isReedsVoltooid(supabase, user.id, item.slug);

  // Founder-check: laat MediaBlokkenClient z'n upload-UI tonen aan
  // founders zodat zij per admin-item extra films, screenshots of
  // PDFs kunnen plaatsen rondom de uitleg.
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isFounder = (prof as { role?: string | null } | null)?.role === "founder";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <Link
        href="/setup"
        className="text-sm text-cm-white opacity-70 hover:opacity-100 inline-flex items-center gap-1"
      >
        ← Terug naar admin-checklist
      </Link>

      {/* Founder-media bovenaan, per slug eigen placeholder. */}
      <MediaBlokkenClient
        paginaNamespace="setup-item"
        paginaId={item.slug}
        positie="boven-titel"
        isFounder={isFounder}
      />

      <div className="card border-l-4 border-cm-gold space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{item.emoji}</span>
          <h1 className="text-2xl font-display font-bold text-cm-white">
            {item.titel}
          </h1>
        </div>
        <p className="text-cm-white text-sm opacity-80 leading-relaxed">
          {item.uitleg}
        </p>
        {status.voltooid && (
          <p className="text-emerald-300 text-sm font-semibold">
            ✓ Al afgevinkt
          </p>
        )}
      </div>

      {/* Founder-media tussen uitleg en film. */}
      <MediaBlokkenClient
        paginaNamespace="setup-item"
        paginaId={item.slug}
        positie="onder-titel"
        isFounder={isFounder}
      />

      {item.filmSlug && (
        <FilmInBlok slug={item.filmSlug} verbergZonderFilm />
      )}

      {item.externeLink && (
        <Link
          href={item.externeLink}
          className="btn-gold w-full py-3 text-center block font-semibold"
        >
          Open {item.titel.toLowerCase()} pagina →
        </Link>
      )}

      {!status.voltooid && (
        <AdminItemAfvinkKnop slug={item.slug} />
      )}
    </div>
  );
}
