import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

// ============================================================
// /instellingen/mini-eleva-preview, founder-hub om de Mini-ELEVA-
// content te beheren zonder dat 'r een echte invitation nodig is.
//
// Raoul en Gaby openen hier de productcatalogus, verhalen-bibliotheek
// en business-uitleg in edit-mode (MediaBlokken zichtbaar). Wat ze
// hier toevoegen is meteen zichtbaar voor prospects op /m/[token]/*.
// ============================================================

export const dynamic = "force-dynamic";

export default async function MiniElevaPreviewHub() {
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
  if (!isFounder) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Founder-werkplek
        </p>
        <h1 className="font-serif-warm text-2xl text-cm-white leading-tight mt-1">
          Mini-ELEVA content beheren
        </h1>
        <p className="text-cm-white/75 text-sm leading-relaxed mt-3 max-w-xl">
          Hier loop je dezelfde paginas binnen als een prospect, maar dan met
          edit-mode aan zodat je MediaBlokken (filmpjes, foto's, PDFs, quotes)
          kunt toevoegen, herordenen of verwijderen. Wat je hier publiceert
          verschijnt direct op de prospect-paginas op{" "}
          <code className="text-cm-gold">/m/[token]/...</code>.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href="/instellingen/mini-eleva-preview/producten"
          className="card flex items-center gap-3 hover:border-cm-gold-dim transition-colors"
        >
          <span className="text-2xl">🌿</span>
          <div className="flex-1">
            <h2 className="text-cm-white font-semibold text-sm">
              Producten en programma's
            </h2>
            <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
              De productcatalogus voor prospects. Voeg filmpjes en quotes
              toe per categorie (basis, omega, eiwit, metabolisme,
              programma's). Tekst staat al klaar in claim-vrije stem.
            </p>
          </div>
          <span className="text-cm-gold">→</span>
        </Link>

        <Link
          href="/instellingen/mini-eleva-preview/verhalen"
          className="card flex items-center gap-3 hover:border-cm-gold-dim transition-colors"
        >
          <span className="text-2xl">📖</span>
          <div className="flex-1">
            <h2 className="text-cm-white font-semibold text-sm">
              Verhalen van mensen die je voorgingen
            </h2>
            <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
              Acht thema-secties (slaap, energie, hormonen, vel, lichter,
              rust, darmen, business). Voeg per thema video-verhalen of
              quote-blokken toe. Business-sectie zien alleen prospects van
              de business-kant.
            </p>
          </div>
          <span className="text-cm-gold">→</span>
        </Link>

        <Link
          href="/instellingen/mini-eleva-preview/business"
          className="card flex items-center gap-3 hover:border-cm-gold-dim transition-colors"
        >
          <span className="text-2xl">💼</span>
          <div className="flex-1">
            <h2 className="text-cm-white font-semibold text-sm">
              Business-uitleg (business-spoor)
            </h2>
            <p className="text-cm-white/60 text-xs leading-relaxed mt-0.5">
              Verdienmodel, rang-ladder, hoe het werkt. Alleen zichtbaar
              voor prospects die voor de business-kant zijn uitgenodigd.
            </p>
          </div>
          <span className="text-cm-gold">→</span>
        </Link>
      </div>

      <div className="card border-l-4 border-cm-gold/60 space-y-2 text-sm">
        <h3 className="text-cm-gold font-semibold">📝 Hoe het werkt</h3>
        <p className="text-cm-white/80 leading-relaxed">
          Op elke pagina zie je per sectie een{" "}
          <strong className="text-cm-gold">+ media hier</strong>-knop. Klik daarop om
          een filmpje, afbeelding, PDF of quote toe te voegen. Verschijnt
          meteen op de prospect-pagina. Verwijderen of herordenen kan via de
          knoppen die je per blok ziet zodra je in edit-mode bent.
        </p>
        <p className="text-cm-white/70 leading-relaxed">
          De Mentor-kennis (vragen-bibliotheek, train-de-Mentor) zit in een
          aparte bouwronde. De ELEVA-mentor op{" "}
          <code className="text-cm-gold">/m/[token]/mentor</code> heeft sinds
          vandaag wel een veel rijkere kennisbasis: piramide-vragen,
          Herbalife-vergelijking, productnamen, programma-uitleg, alles in
          jullie stem.
        </p>
      </div>
    </div>
  );
}
