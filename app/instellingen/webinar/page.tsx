import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";
import { haalWebinars, tokenVoor, haalBestellinks } from "@/lib/webinar/data";
import { WebinarKaart } from "./webinar-kaart";
import { NieuwWebinarKnop } from "./nieuw-webinar-knop";

// ============================================================
// /instellingen/webinar — de webinar-bibliotheek.
//
// Elk webinar is een eigen blok. Per blok zie je je persoonlijke
// deel-link, je eigen bestellinks en je aanmeldingen. De founder ziet
// daar bovenop de instellingen (video, teksten, aan/uit) en kan met de
// plus-knop een nieuw webinar openen. Zodra hij die op actief zet,
// verschijnt hij bij iedereen in het team met een eigen link.
// ============================================================

export const dynamic = "force-dynamic";

export default async function WebinarInstellingen() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isFounder = (prof as { role?: string | null } | null)?.role === "founder";

  // Founder ziet ook de concepten (nog niet actief), de rest alleen wat
  // vrijgegeven is.
  const webinars = await haalWebinars(!isFounder);
  const admin = createAdminClient();

  const blokken = await Promise.all(
    webinars.map(async (w) => {
      const token = await tokenVoor(w.id, user.id);
      const bestellinks = await haalBestellinks(w.id, user.id);
      const { data: inschrijvingen } = await admin
        .from("webinar_inschrijvingen")
        .select("id, naam, slot_start, status")
        .eq("member_id", user.id)
        .eq("webinar_id", w.id)
        .order("created_at", { ascending: false })
        .limit(15);
      return {
        webinar: w,
        token,
        bestellinks,
        inschrijvingen: (inschrijvingen ?? []) as {
          id: string;
          naam: string;
          slot_start: string;
          status: string;
        }[],
      };
    }),
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <Link
        href="/instellingen"
        className="text-sm text-cm-white opacity-70 hover:opacity-100"
      >
        ← Terug naar instellingen
      </Link>

      <div>
        <h1 className="text-2xl font-display font-bold text-cm-white">
          🎥 Webinars
        </h1>
        <p className="text-cm-white/70 text-sm mt-1 leading-relaxed">
          Opgenomen webinars die je kunt delen. Mensen kiezen zelf een moment,
          krijgen een herinnering, en verschijnen bij jou in de namenlijst. Zet
          er je eigen bestellinks onder, dan kunnen ze direct bij jou bestellen.
        </p>
      </div>

      {isFounder && <NieuwWebinarKnop />}

      {blokken.length === 0 ? (
        <div className="card text-center space-y-2">
          <p className="text-3xl">🎬</p>
          <p className="text-cm-white/70 text-sm">
            Er staan nog geen webinars klaar. Zodra er één wordt vrijgegeven,
            verschijnt hij hier met jouw eigen deel-link.
          </p>
        </div>
      ) : (
        blokken.map((b) => (
          <WebinarKaart
            key={b.webinar.id}
            webinar={b.webinar}
            url={`${SITE_URL}/webinar/${b.token}`}
            bestellinks={b.bestellinks}
            inschrijvingen={b.inschrijvingen}
            isFounder={isFounder}
          />
        ))
      )}
    </div>
  );
}
