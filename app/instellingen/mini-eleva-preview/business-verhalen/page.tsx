import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { MiniElevaBusinessVerhalenContent } from "@/app/m/[token]/business-verhalen/content";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FounderBusinessVerhalenPreview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const isFounder = (profile as { role?: string } | null)?.role === "founder";
  if (!isFounder) redirect("/dashboard");

  const blokkenMap = await haalPaginaBlokken(
    supabase,
    "mini-eleva-business-verhalen",
    "overzicht",
  );
  const blokkenPerPositie: Record<string, Blok[]> = {};
  blokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });

  const voornaam =
    ((profile as { full_name?: string } | null)?.full_name ?? "").split(" ")[0] ||
    "prospect";

  return (
    <div className="space-y-4">
      <div className="card border-l-4 border-cm-gold/60 text-sm space-y-1">
        <p className="text-cm-gold font-semibold">
          🛠️ Founder-preview, edit-mode aan
        </p>
        <p className="text-cm-white/70 text-xs">
          Business-verhalen, alleen zichtbaar voor business-spoor-
          prospects. Acht thema-secties (eerste 3-weg, eerste klanten,
          eerste member, bijverdienste, vrijheid, sponsor, tegenslag,
          doorbraak) met per thema een MediaBlokken-slot voor video-
          ervaringen of quote-blokken.
        </p>
        <Link
          href="/instellingen/mini-eleva-preview"
          className="text-cm-gold text-xs hover:underline inline-block mt-1"
        >
          ← Terug naar hub
        </Link>
      </div>
      <MiniElevaBusinessVerhalenContent
        isFounder={true}
        prospectVoornaam={voornaam}
        memberNaam="de member"
        sponsorNaam="de sponsor"
        terugHref="/instellingen/mini-eleva-preview"
        blokkenPerPositie={blokkenPerPositie}
      />
    </div>
  );
}
