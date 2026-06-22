"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useTaal } from "@/lib/i18n/TaalContext";
import { SITE_URL } from "@/lib/site";

// Stap 1 van wachtwoord-herstel: gebruiker vult e-mail in en Supabase Auth
// stuurt een herstel-mail met een link naar /wachtwoord-herstellen.
export default function WachtwoordVergetenPagina() {
  const { v } = useTaal();
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState("");
  const [laden, setLaden] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);

  async function handleVerstuur(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/wachtwoord-herstellen`,
    });
    setLaden(false);
    if (error) {
      toast.error(v("herstel.vraag_fout"));
      return;
    }
    // Geen account-enumeratie: ook als het e-mailadres niet bestaat tonen we
    // dezelfde bevestiging.
    setVerstuurd(true);
  }

  return (
    <div className="min-h-screen bg-cm-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/eleva-icon.png" alt="ELEVA" className="h-16 w-16 mx-auto mb-3" />
          <h1 className="text-4xl eleva-brand mb-3">ELEVA</h1>
        </div>

        <div className="card border-gold-subtle glow-gold-soft">
          <h2 className="font-serif-warm text-xl text-cm-white mb-6">
            {v("herstel.vraag_titel")}
          </h2>

          {verstuurd ? (
            <div className="space-y-6">
              <p className="text-cm-white/80 text-sm leading-relaxed">
                {v("herstel.vraag_gelukt")}
              </p>
              <Link href="/login" className="btn-gold w-full block text-center">
                {v("herstel.terug_naar_login")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleVerstuur} className="space-y-4">
              <p className="text-cm-white/70 text-sm leading-relaxed">
                {v("herstel.vraag_intro")}
              </p>
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
              <button type="submit" disabled={laden} className="btn-gold w-full mt-6">
                {laden ? v("herstel.vraag_knop_laden") : v("herstel.vraag_knop")}
              </button>
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-cm-white/60 hover:text-cm-white"
                >
                  {v("herstel.terug_naar_login")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
