import { createClient } from "@/lib/supabase/server";
import { vertaal, Taal } from "./vertalingen";

/**
 * Lees de taal van de ingelogde gebruiker (server-side).
 * Gebruik in alle server components en API routes.
 */
export async function getServerTaal(): Promise<Taal> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return (user?.user_metadata?.taal as Taal) || "nl";
  } catch {
    return "nl";
  }
}

/**
 * Vertaalfunctie voor server components.
 * Gebruik: const taal = await getServerTaal(); dan v("sleutel", taal)
 */
export function v(sleutel: string, taal: Taal): string {
  return vertaal(sleutel, taal);
}
