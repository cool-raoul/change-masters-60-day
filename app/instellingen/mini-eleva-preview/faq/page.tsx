import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { haalPaginaBlokken } from "@/lib/cms/pagina-blokken";
import type { Blok } from "@/lib/cms/pagina-blokken";
import { MiniElevaFaqContent } from "@/app/m/[token]/faq/content";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FounderFaqPreview() {
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

  const blokkenMap = await haalPaginaBlokken(
    supabase,
    "mini-eleva-faq",
    "overzicht",
  );
  const blokkenPerPositie: Record<string, Blok[]> = {};
  blokkenMap.forEach((lijst, positie) => {
    blokkenPerPositie[positie] = lijst;
  });

  return (
    <div className="space-y-4">
      <div className="card border-l-4 border-cm-gold/60 text-sm space-y-1">
        <p className="text-cm-gold font-semibold">
          🛠️ Founder-preview, edit-mode aan
        </p>
        <p className="text-cm-white/70 text-xs">
          De FAQ-pagina voor prospects, gesplitst in product-vragen
          (altijd zichtbaar) en business-vragen (alleen voor business-
          spoor zodra dat veld er is). Per sectie staat een MediaBlokken-
          slot waar je losse video-antwoorden of quote-blokken toe kan
          voegen.
        </p>
        <Link
          href="/instellingen/mini-eleva-preview"
          className="text-cm-gold text-xs hover:underline inline-block mt-1"
        >
          ← Terug naar hub
        </Link>
      </div>
      <MiniElevaFaqContent
        isFounder={true}
        memberNaam="de member"
        sponsorNaam="de sponsor"
        terugHref="/instellingen/mini-eleva-preview"
        blokkenPerPositie={blokkenPerPositie}
        spoor="business"
      />
    </div>
  );
}
