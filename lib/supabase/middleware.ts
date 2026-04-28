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
  ];
  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));

  if (!user && !isPublicRoute && !pathname.startsWith("/api/")) {
    // Niet ingelogd → naar login. Bewaar de oorspronkelijke URL als
    // ?next= zodat de login-pagina na succesvol inloggen direct hierheen
    // kan terugleiden — onmisbaar voor pushmeldingen die op een diepe
    // link wijzen (bv. /namenlijst/[id]).
    const url = request.nextUrl.clone();
    const oorspronkelijk = pathname + (request.nextUrl.search || "");
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(oorspronkelijk)}`;
    return NextResponse.redirect(url);
  }

  const isProtectedRoute =
    user &&
    !isPublicRoute &&
    pathname !== "/mijn-why" &&
    pathname !== "/onboarding" &&
    !pathname.startsWith("/api/");

  if (isProtectedRoute) {
    // Controleer of onboarding klaar is
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_klaar")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();

    if (profile && !profile.onboarding_klaar) {
      url.pathname = "/mijn-why";
      return NextResponse.redirect(url);
    }

    // Onboarding klaar maar stappen nog niet afgerond → naar /onboarding
    if (profile?.onboarding_klaar) {
      const onboardingStap = user.user_metadata?.onboarding_stap;
      if (onboardingStap !== undefined && onboardingStap !== null && Number(onboardingStap) < 99) {
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
