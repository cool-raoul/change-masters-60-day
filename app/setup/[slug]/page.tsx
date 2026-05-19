import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ITEMS } from "@/lib/setup/admin-items";
import { isReedsVoltooid } from "@/lib/onboarding/voltooiingen";
import { FilmInBlok } from "@/components/film/FilmInBlok";
import { AdminItemAfvinkKnop } from "@/components/setup/AdminItemAfvinkKnop";
import { MediaBlokkenClient } from "@/components/cms/MediaBlokkenClient";
import { EditableTekst, EditableBlok } from "@/components/cms/EditableTekst";
import { haalTekstOverrides } from "@/lib/cms/tekst-overrides";
import { normaliseerNaarEmbed } from "@/lib/films/embed";

// ============================================================
// /setup/[slug], uitleg-detail-pagina per administratieve stap.
//
// Toont titel, uitleg, film en eventuele externe link. Plus afvink-
// knop + terugknop naar /setup.
//
// Founder kan op deze pagina:
//   - titel + uitleg per item bewerken (EditableTekst + EditableBlok)
//   - eigen film-URL plakken (Vimeo of YouTube), die wint van filmSlug
//   - extra uitleg-tekst boven de film toevoegen (film-uitleg)
//   - los daarvan extra media (PDF, afbeelding, audio, quote) plaatsen
//     via MediaBlokkenClient (boven-titel + onder-titel)
//
// Member ziet niets van de founder-edit-knoppen, alleen de gerenderde
// content.
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

  const overrides = await haalTekstOverrides(supabase, "setup-item");

  // Eigen film-URL en film-uitleg uitlezen uit de overrides. Als er
  // een geldige URL is ingevuld door founder, gebruiken we die ipv
  // de hardcoded filmSlug + FilmInBlok-flow.
  const eigenFilmUrlRaw = overrides[`${item.slug}.eigen-film-url`]?.trim();
  const eigenFilmEmbed = normaliseerNaarEmbed(eigenFilmUrlRaw);
  const filmUitleg = overrides[`${item.slug}.film-uitleg`]?.trim();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <Link
        href="/setup"
        className="text-sm text-cm-white opacity-70 hover:opacity-100 inline-flex items-center gap-1"
      >
        ← Terug naar administratieve stappen
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
          <EditableTekst
            namespace="setup-item"
            sleutel={`${item.slug}.titel`}
            standaard={item.titel}
            overrides={overrides}
            isFounder={isFounder}
            as="h1"
            className="text-2xl font-display font-bold text-cm-white"
            hint="Titel van dit administratieve item."
          />
        </div>
        <EditableBlok
          namespace="setup-item"
          sleutel={`${item.slug}.uitleg`}
          standaard={item.uitleg}
          overrides={overrides}
          isFounder={isFounder}
          as="p"
          className="text-cm-white text-sm opacity-80 leading-relaxed"
          rows={4}
          hint="Uitleg-tekst boven de instructiefilm."
        />
        {status.voltooid && (
          <p className="text-emerald-300 text-sm font-semibold">
            ✓ Al afgevinkt
          </p>
        )}
      </div>

      {/* Founder-only: film-instellingen. Member ziet hier NIETS, alleen
          de gerenderde film + uitleg hieronder. Edit-pencil verschijnt
          pas wanneer founder bewerk-modus aanzet (✏️ in top-strip). */}
      {isFounder && (
        <div className="card border-l-4 border-purple-500/60 bg-purple-950/20 space-y-3">
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider">
            👑 Founder, film-instellingen voor dit item
          </p>
          <div className="space-y-1">
            <p className="text-cm-white/70 text-xs">
              Eigen film-URL (YouTube of Vimeo). Leeg laten = standaard-
              film via slug {item.filmSlug ? `"${item.filmSlug}"` : "(geen standaard-slug ingesteld)"}.
            </p>
            <div className="text-cm-white text-sm bg-cm-surface-2 px-3 py-2 rounded break-all min-h-[2.25rem] flex items-center">
              <EditableTekst
                namespace="setup-item"
                sleutel={`${item.slug}.eigen-film-url`}
                standaard=""
                overrides={overrides}
                isFounder={isFounder}
                as="span"
                className="flex-1"
                hint="Plak hier de volledige YouTube- of Vimeo-URL. Voorbeelden: https://youtu.be/abc123 of https://vimeo.com/123456789"
              />
            </div>
            {eigenFilmUrlRaw && !eigenFilmEmbed && (
              <p className="text-red-300 text-xs">
                URL niet herkend als YouTube of Vimeo. Check de link.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-cm-white/70 text-xs">
              Extra uitleg boven de film (optioneel)
            </p>
            <EditableBlok
              namespace="setup-item"
              sleutel={`${item.slug}.film-uitleg`}
              standaard=""
              overrides={overrides}
              isFounder={isFounder}
              as="p"
              className="text-cm-white text-sm opacity-90 leading-relaxed bg-cm-surface-2 px-3 py-2 rounded min-h-[2.25rem]"
              rows={3}
              hint="Korte tekst die boven de instructiefilm verschijnt voor members. Leeg laten betekent geen extra tekst."
            />
          </div>
        </div>
      )}

      {/* Founder-media tussen uitleg en film. */}
      <MediaBlokkenClient
        paginaNamespace="setup-item"
        paginaId={item.slug}
        positie="onder-titel"
        isFounder={isFounder}
      />

      {/* Film-uitleg voor alle members als founder 'm heeft ingevuld. */}
      {filmUitleg && (
        <p className="text-cm-white text-sm opacity-85 leading-relaxed italic">
          {filmUitleg}
        </p>
      )}

      {/* Film, eerst eigen URL, anders FilmInBlok-via-slug. */}
      {eigenFilmEmbed ? (
        <div className="rounded-xl overflow-hidden bg-cm-black border border-cm-border">
          <div className="relative aspect-video w-full">
            <iframe
              src={eigenFilmEmbed}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title={item.titel}
            />
          </div>
        </div>
      ) : item.filmSlug ? (
        <FilmInBlok slug={item.filmSlug} verbergZonderFilm />
      ) : null}

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
