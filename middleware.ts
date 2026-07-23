import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // service-worker.js en manifest.json zijn publieke systeembestanden:
    // de auth-middleware stuurde ze voor niet-ingelogde bezoekers naar de
    // login-pagina, waardoor push-seintjes op klant-links nooit konden
    // registreren ("Script load failed", bug Raoul 23 juli).
    "/((?!_next/static|_next/image|favicon.ico|service-worker\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
