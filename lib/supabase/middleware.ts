import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Publieke routes die geen auth vereisen.
  // /test/[token] en /test/[token]/resultaat zijn voor prospects zonder account.
  // /sandbox is een debug-tool zonder DB-koppeling.
  const publicRoutes = [
    "/login",
    "/registreer",
    "/auth/callback",
    "/test/",
    "/sandbox",
    // Prospect ziet hier de film via share-token, geen login nodig.
    "/prospect-film/",
    // Pro-uitnodiging-one-pager voor professionele ondernemers
    // (coaches, therapeuten, beauty-pro's). Deelbaar via WhatsApp
    // of e-mail-link, geen account nodig.
    "/pro-uitnodiging",
    // Project Meer Tijd en Vrijheid one-pager voor bouwers om te delen
    // via WhatsApp/socials. Geen account nodig.
    "/60-day-run",
    // Holistic Reset persoonlijke check — landing voor podcast/socials,
    // redirect naar /bot/reset-check/<founder-token>.
    "/reset-check",
    // Per-member token-routes voor de score-bots (energie-en-focus,
    // hormonen-en-overgang, reset-check). Prospects vullen 'm in zonder
    // account, lead komt in pijplijn van de member.
    "/bot/",
  ];
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));

  if (!user && !isPublicRoute && !pathname.startsWith("/api/")) {
    // Niet ingelogd → naar login. Bewaar de oorspronkelijke URL als
    // ?next= zodat de login-pagina na succesvol inloggen direct hierheen
    // kan terugleiden, onmisbaar voor pushmeldingen die op een diepe
    // link wijzen (bv. /namenlijst/[id]).
    const url = request.nextUrl.clone();
    const oorspronkelijk = pathname + (request.nextUrl.search || "");
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(oorspronkelijk)}`;
    return NextResponse.redirect(url);
  }

  // Welkom-routes mogen los van /mijn-why/onboarding bezocht worden.
  // Anders krijgen Pro-leden en nieuwe gebruikers redirect-loops.
  const welkomRoutes = [
    "/welkom-keuze",
    "/welkom-pro",
    "/welkom-core",
    "/welkom",
  ];
  const isWelkomRoute = welkomRoutes.some((r) => pathname.startsWith(r));

  const isProtectedRoute =
    user &&
    !isPublicRoute &&
    !isWelkomRoute &&
    pathname !== "/mijn-why" &&
    pathname !== "/onboarding" &&
    !pathname.startsWith("/api/");

  if (isProtectedRoute) {
    // Controleer of onboarding klaar is + welke modus
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_klaar, modus")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();

    if (profile && !profile.onboarding_klaar) {
      const profModus = (profile as { modus?: string | null }).modus;
      // Drie scenario's per 2026-05-19:
      // 1. Modus nog NULL → /welkom-keuze (modus-keuze EERST, geen
      //    impliciete WHY-flow voor wie 't niet wil zoals Pro).
      // 2. Modus=pro → /welkom-pro (eigen 14-stappen pad).
      // 3. Modus=sprint/core → /onboarding (pre-day-1 doet de WHY-stap
      //    netjes als onderdeel van stap 2, niet als losse pagina vooraf).
      if (!profModus) {
        url.pathname = "/welkom-keuze";
      } else if (profModus === "pro") {
        url.pathname = "/welkom-pro";
      } else {
        url.pathname = "/onboarding";
      }
      return NextResponse.redirect(url);
    }

    // Onboarding klaar maar stappen nog niet afgerond → naar /onboarding
    if (profile?.onboarding_klaar) {
      const onboardingStap = user.user_metadata?.onboarding_stap;
      if (
        onboardingStap !== undefined &&
        onboardingStap !== null &&
        Number(onboardingStap) < 99
      ) {
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
