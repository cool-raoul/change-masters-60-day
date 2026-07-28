import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  markeerVoltooid,
  isReedsVoltooid,
  type Modus,
} from "@/lib/onboarding/voltooiingen";
import { sendPushToUser } from "@/lib/push/sendPush";
import { logTeamSeintje } from "@/lib/team/seintjes";

// Resultaat-taal per setup-stap voor het sponsor-seintje (feedback
// Raoul 28 juli: de sponsor wil weten wat er specifiek is gedaan).
const SETUP_RESULTAAT: Record<string, string> = {
  "webshop-aangemaakt": "{n} heeft de eigen webshop aangemaakt 🛒",
  "kredietformulier-ingevuld": "{n} heeft het kredietformulier ingevuld ✅",
  "teams-admin-ingericht": "{n} heeft het administratiesysteem ingericht 📋",
  "bestellinks-gekoppeld": "{n} heeft de bestellinks aan ELEVA gekoppeld 🔗",
  "productadvies-test-gedaan": "{n} heeft de productadvies-test gedaan 🧪",
};

// ============================================================
// POST /api/setup/markeer
// Body: { slug }
// Schrijft een admin-item als voltooid in onboarding_voltooiingen
// onder de huidige user-modus.
// ============================================================

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "niet ingelogd" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { slug } = body as { slug?: string };
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug ontbreekt" }, { status: 400 });
  }

  const { data: prof } = await supabase
    .from("profiles")
    .select("modus, full_name, sponsor_id")
    .eq("id", user.id)
    .maybeSingle();
  const modus = ((prof as { modus?: string | null } | null)?.modus ?? "sprint") as Modus;

  // Eerste keer? Dan straks een resultaat-seintje naar de sponsor
  // (her-afvinken geeft geen ruis).
  const alGedaan = (await isReedsVoltooid(supabase, user.id, slug)).voltooid;
  await markeerVoltooid(supabase, user.id, slug, modus, { via: "setup" });

  if (!alGedaan && SETUP_RESULTAAT[slug]) {
    try {
      const sponsorId = (prof as { sponsor_id?: string | null } | null)
        ?.sponsor_id;
      const naam =
        ((prof as { full_name?: string | null } | null)?.full_name ?? "") ||
        "Een teamlid";
      if (sponsorId) {
        const titel = SETUP_RESULTAAT[slug].replaceAll("{n}", naam);
        await sendPushToUser(sponsorId, {
          title: titel,
          body: "Tik om de voortgang te bekijken.",
          url: `/team?lid=${user.id}`,
          tag: `setup-${user.id}-${slug}`,
        });
        await logTeamSeintje(sponsorId, user.id, titel, null);
      }
    } catch (e) {
      console.warn("setup-seintje mislukt (niet fataal):", e);
    }
  }
  return NextResponse.json({ ok: true });
}
