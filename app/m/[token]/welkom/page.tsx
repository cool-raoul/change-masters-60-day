import { pakMiniElevaContext, logActiviteit } from "@/lib/mini-eleva/helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { normaliseerNaarEmbed } from "@/lib/films/embed";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";

// ============================================================
// /m/[token]/welkom, persoonlijke kennismaking voor de prospect.
//
// Twee blokken:
//   1. Persoonlijk welkomst-bericht van de member (tekst, warm,
//      gepersonaliseerd met namen). Geen leeg video-vak meer.
//   2. Een echte start-film uit het Films-CMS, passend bij het
//      spoor: product → prospect-4-product-demo, business →
//      prospect-1-introductie. Founder beheert de films via
//      /instellingen/films.
//
// Film-fetch gaat server-side via de admin-client, zoals alle
// mini-ELEVA reads (prospect heeft geen account, dus geen RLS-route).
//
// Een persoonlijke member-video (opnemen/uploaden) blijft een
// latere feature; tot die tijd is dit de pilot-waardige versie.
// ============================================================

export const dynamic = "force-dynamic";

const FILM_SLUG_PER_SOORT: Record<"product" | "business", string> = {
  product: "prospect-4-product-demo",
  business: "prospect-1-introductie",
};

export default async function WelkomPagina({
  params,
}: {
  params: { token: string };
}) {
  const ctx = await pakMiniElevaContext(params.token);
  if (!ctx || ctx.isVerlopen) {
    return (
      <div className="space-y-4 pt-12 text-center">
        <p className="text-cm-white/70">Deze link werkt niet meer.</p>
        <Link href={`/m/${params.token}`} className="text-cm-gold underline">
          Terug naar start
        </Link>
      </div>
    );
  }

  await logActiviteit(ctx.invitationId, "welkom-videos", "welkom-pagina geopend");

  const voornaam = ctx.prospectNaam.split(" ")[0];
  const memberVoornaam = (ctx.memberNaam ?? "je contactpersoon").split(" ")[0];

  // Start-film passend bij het spoor, server-side opgehaald.
  const admin = createAdminClient();
  const { data: film } = await admin
    .from("films")
    .select("slug, titel, beschrijving, video_url, tonen")
    .eq("slug", FILM_SLUG_PER_SOORT[ctx.soort])
    .eq("tonen", true)
    .maybeSingle();

  const embedUrl = film?.video_url ? normaliseerNaarEmbed(film.video_url) : null;

  return (
    <div className="space-y-6 pt-6">
      <Link
        href={`/m/${ctx.token}`}
        className="text-cm-white/60 hover:text-cm-white text-sm flex items-center gap-1"
      >
        ← Terug
      </Link>

      <Reveal herhaal richting="fade">
        <div>
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            Maak even kennis
          </p>
          <h1 className="font-serif-warm text-2xl text-cm-white leading-tight mt-1">
            Welkom, {voornaam}
          </h1>
        </div>
      </Reveal>

      {/* Persoonlijk welkomst-bericht van de member */}
      <Reveal herhaal delay={100}>
      <div className="card space-y-3">
        <h2 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
          👋 Bericht van {ctx.memberNaam ?? "je contactpersoon"}
        </h2>
        <div className="text-cm-white/85 text-sm leading-relaxed space-y-2">
          <p>Hoi {voornaam}, goed dat je er bent.</p>
          <p>
            Deze omgeving is voor jou. Kijk rustig rond op je eigen tempo,
            niets moet en je zit nergens aan vast. Je vindt hier korte films,
            verhalen van mensen die je voorgingen en eerlijke antwoorden op de
            vragen die de meeste mensen als eerste stellen.
          </p>
          <p>
            Loop je ergens tegenaan of ben je gewoon nieuwsgierig? Stel je
            vraag in de chat, dan kijk ik met je mee. Je kunt ook altijd de
            ELEVA-mentor wat vragen, die is er dag en nacht.
          </p>
          <p className="text-cm-white/60">Groetjes, {memberVoornaam}</p>
        </div>
      </div>
      </Reveal>

      {/* Start-film uit het Films-CMS, passend bij het spoor */}
      {embedUrl && film && (
        <Reveal herhaal delay={200} richting="scale">
        <div className="card space-y-3">
          <h2 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
            🎬 Een goed begin: deze korte film
          </h2>
          <div className="aspect-video bg-black rounded-lg overflow-hidden border border-cm-border">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title={film.titel}
            />
          </div>
          {film.beschrijving && (
            <p className="text-cm-white/60 text-xs leading-relaxed">
              {film.beschrijving}
            </p>
          )}
        </div>
        </Reveal>
      )}

      {/* Team-context: prospect weet dat er meer mensen achter staan */}
      {ctx.sponsorNaam && (
        <Reveal herhaal richting="left">
        <div className="card space-y-2">
          <h2 className="text-cm-gold text-sm font-semibold flex items-center gap-2">
            🤝 Je staat er nooit alleen voor
          </h2>
          <p className="text-cm-white/70 text-sm leading-relaxed">
            Achter {memberVoornaam} staat een heel team, met{" "}
            {ctx.sponsorNaam} als mentor. Mocht je vragen hebben waar{" "}
            {memberVoornaam} het antwoord niet op weet, dan staat er altijd
            iemand klaar die het wel weet.
          </p>
        </div>
        </Reveal>
      )}

      <Link
        href={`/m/${ctx.token}`}
        className="block text-center text-cm-gold text-sm hover:underline pt-4"
      >
        ← Terug naar overzicht
      </Link>
    </div>
  );
}
