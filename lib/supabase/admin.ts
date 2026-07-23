import { createClient } from "@supabase/supabase-js";

// Service role client, bypast RLS, alleen gebruiken in server-side cron/admin routes
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is niet ingesteld");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // Database-data mag NOOIT uit de Next/Vercel-datacache komen: die
    // cachete supabase-GET's dwars door force-dynamic heen, waardoor
    // pagina's met verouderde klant-data renderden (bug 23 juli: de
    // dag-teller bleef op 1 staan terwijl de database al verder was).
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
