import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { geefLes, alleLessleutels } from "@/lib/academy/trainingen";
import { LesVoltooiKnop } from "@/components/academy/LesVoltooiKnop";

// ============================================================
// /academy/[slug]/les/[sleutel]
//
// Detail van één les. Toont:
//   - Module-context bovenaan
//   - Les-titel + leestijd
//   - Volledige inhoud (Markdown-light naar HTML)
//   - Mini-oefening onderaan
//   - 'Voltooi'-knop (slaat op in DB)
//   - Vorige/Volgende-navigatie
// ============================================================

export const dynamic = "force-dynamic";

export default async function AcademyLesPagina({
  params,
}: {
  params: Promise<{ slug: string; sleutel: string }>;
}) {
  const { slug, sleutel } = await params;
  const gevonden = geefLes(slug, sleutel);
  if (!gevonden) notFound();
  const { training, module, les } = gevonden;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check of deze les voor deze user al voltooid is.
  const { data: bestaande } = await supabase
    .from("training_voortgang")
    .select("id")
    .eq("user_id", user.id)
    .eq("training_slug", slug)
    .eq("les_sleutel", sleutel)
    .maybeSingle();
  const isVoltooid = !!bestaande;

  // Voor de Vorige/Volgende-navigatie: zoek de positie van deze
  // les in de platte volgorde van alle lessen in de training.
  const platteSleutels = alleLessleutels(training);
  const huidigeIndex = platteSleutels.indexOf(sleutel);
  const vorige =
    huidigeIndex > 0 ? platteSleutels[huidigeIndex - 1] : null;
  const volgende =
    huidigeIndex < platteSleutels.length - 1
      ? platteSleutels[huidigeIndex + 1]
      : null;

  // Inhoud is geschreven met dubbele newlines tussen paragrafen +
  // **bold** marks. We renderen 't met simpele paragraph + bold
  // parsing zonder een Markdown-lib (overkill voor wat we hebben).
  const paragrafen = les.inhoud.split(/\n\n+/);

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 space-y-6">
      {/* Terug-knop */}
      <Link
        href={`/academy/${slug}`}
        className="text-cm-white/60 hover:text-cm-white text-sm flex items-center gap-1"
      >
        ← Terug naar {training.titel}
      </Link>

      {/* Module-context */}
      <div className="space-y-1">
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          {training.emoji} {training.titel} · Module {module.nummer} ·{" "}
          {module.titel}
        </p>
        <h1 className="font-serif-warm text-3xl text-cm-white leading-tight">
          {les.titel}
        </h1>
        {les.leestijdMinuten && (
          <p className="text-cm-white/50 text-xs">
            ⏱️ Ongeveer {les.leestijdMinuten} minuten leestijd
          </p>
        )}
      </div>

      {/* Hoofd-inhoud */}
      <article className="card space-y-4">
        {paragrafen.map((para, i) => {
          // Detecteer of de paragraaf met '**' begint en eindigt (= sub-kop)
          const isSubKop =
            para.startsWith("**") && para.includes("**") && !para.includes("\n");
          if (isSubKop && /^\*\*[^*]+\*\*:?$/.test(para.trim())) {
            const tekst = para.replace(/^\*\*|\*\*$|:$/g, "").trim();
            return (
              <h3
                key={i}
                className="text-cm-gold font-semibold text-base mt-2"
              >
                {tekst}
              </h3>
            );
          }
          // Bullet-blok (lijnen die met - of • beginnen)
          if (/^[-•] /.test(para.trim()) || para.includes("\n- ")) {
            const items = para
              .split(/\n/)
              .filter((l) => /^[-•] /.test(l.trim()))
              .map((l) => l.trim().replace(/^[-•] /, ""));
            return (
              <ul key={i} className="space-y-1.5">
                {items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-2 text-cm-white/85 text-sm leading-relaxed"
                  >
                    <span className="text-cm-gold flex-shrink-0">•</span>
                    <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
                  </li>
                ))}
              </ul>
            );
          }
          // Quote-blok (regel begint met '>')
          if (para.trim().startsWith(">")) {
            const inner = para.trim().replace(/^>\s*/, "");
            return (
              <blockquote
                key={i}
                className="border-l-4 border-cm-gold pl-4 py-1 italic text-cm-white/85 text-sm leading-relaxed"
              >
                <span
                  dangerouslySetInnerHTML={{ __html: renderInline(inner) }}
                />
              </blockquote>
            );
          }
          // Normale paragraaf
          return (
            <p
              key={i}
              className="text-cm-white/85 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderInline(para) }}
            />
          );
        })}
      </article>

      {/* Audio-knop (alleen voor lessen met audioZoekLink, zoals
          de Audio-onderweg-training. Plek bewust BOVEN de oefening
          want de oefening hoort meestal NA het luisteren). */}
      {les.audioZoekLink && (
        <div className="rounded-lg border-2 border-cm-gold/40 bg-cm-gold/5 p-4 space-y-3">
          <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
            🎧 Audio onderweg
          </p>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            Beluister deze aflevering op Spotify. Ongeveer 15-20 min,
            perfect voor in de auto, tijdens een wandeling of bij koffie.
          </p>
          <a
            href={les.audioZoekLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-block py-2 px-4 text-sm font-semibold"
          >
            Beluister op Spotify ↗
          </a>
        </div>
      )}

      {/* Oefening-blok */}
      {les.oefening && (
        <div className="card border-l-4 border-emerald-500 space-y-2">
          <h3 className="text-emerald-300 font-semibold text-sm flex items-center gap-2">
            🎯 Mini-oefening
          </h3>
          <p className="text-cm-white/85 text-sm leading-relaxed">
            {les.oefening}
          </p>
        </div>
      )}

      {/* Voltooi-knop (client component voor de actie) */}
      <LesVoltooiKnop
        trainingSlug={slug}
        lesSleutel={sleutel}
        alVoltooid={isVoltooid}
        volgendeSleutel={volgende}
      />

      {/* Vorige / Volgende navigatie */}
      <div className="flex justify-between gap-3 pt-4 border-t border-cm-border">
        {vorige ? (
          <Link
            href={`/academy/${slug}/les/${vorige}`}
            className="text-sm text-cm-white/70 hover:text-cm-white transition-colors"
          >
            ← Vorige les
          </Link>
        ) : (
          <span />
        )}
        {volgende ? (
          <Link
            href={`/academy/${slug}/les/${volgende}`}
            className="text-sm text-cm-gold hover:underline transition-colors"
          >
            Volgende les →
          </Link>
        ) : (
          <Link
            href={`/academy/${slug}`}
            className="text-sm text-cm-gold hover:underline transition-colors"
          >
            Terug naar overzicht →
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Minimale inline-formatter voor **bold** en *italic* binnen een
 * paragraaf. Bewust geen volledige Markdown-lib geladen.
 */
function renderInline(tekst: string): string {
  return tekst
    // Escape HTML eerst
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // **bold**
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-cm-white">$1</strong>')
    // *italic* (alleen losse * niet binnen woorden)
    .replace(/(^|\s)\*([^*]+)\*(?=\s|$|[.,!?])/g, '$1<em class="text-cm-white/75">$2</em>');
}
