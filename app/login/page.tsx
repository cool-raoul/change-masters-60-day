"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTaal } from "@/lib/i18n/TaalContext";

// Next.js 14 vereist een Suspense boundary om useSearchParams in een
// client component dat niet dynamisch is gerenderd. Zonder de wrapper
// faalt de productie-build met 'missing-suspense-with-csr-bailout'.
export default function LoginPagina() {
  return (
    <Suspense fallback={null}>
      <LoginInhoud />
    </Suspense>
  );
}

function LoginInhoud() {
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { v } = useTaal();

  // Na login terug naar de oorspronkelijke URL als die bekend is. Dit gebeurt
  // bv. wanneer een member op een pushmelding klikt terwijl de app niet
  // ingelogd is — middleware zet dan ?next=/namenlijst/[id] zodat we hier
  // direct na inloggen op de juiste prospect-kaart belanden i.p.v. /dashboard.
  // Veiligheid: alleen relatieve paden accepteren, geen open-redirect.
  function bepaalRedirect(): string {
    const next = searchParams?.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      return next;
    }
    return "/dashboard";
  }

  async function handleInloggen(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: wachtwoord,
    });

    if (error) {
      toast.error(v("login.mislukt"));
    } else {
      router.push(bepaalRedirect());
      router.refresh();
    }

    setLaden(false);
  }

  return (
    <div className="min-h-screen bg-cm-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/eleva-icon.png" alt="ELEVA" className="h-16 w-16 mx-auto mb-3" />
          <h1 className="text-4xl eleva-brand mb-2">
            ELEVA
          </h1>
          <p className="text-cm-white">{v("login.subtitel")}</p>
        </div>

        {/* Login kaart */}
        <div className="card border-gold-subtle">
          <h2 className="text-xl font-semibold text-cm-white mb-6">
            {v("login.titel")}
          </h2>

          <form onSubmit={handleInloggen} className="space-y-4">
            <div>
              <label className="block text-sm text-cm-white mb-1.5">
                {v("login.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@email.nl"
                className="input-cm"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-cm-white mb-1.5">
                {v("login.wachtwoord")}
              </label>
              <input
                type="password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                placeholder="••••••••"
                className="input-cm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={laden}
              className="btn-gold w-full mt-6"
            >
              {laden ? v("login.knop_laden") : v("login.knop")}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
