"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPagina() {
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleInloggen(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: wachtwoord,
    });

    if (error) {
      toast.error("Inloggen mislukt. Controleer je e-mail en wachtwoord.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }

    setLaden(false);
  }

  return (
    <div className="min-h-screen bg-cm-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gold-gradient mb-2">
            Change Masters
          </h1>
          <p className="text-cm-white">60 Dagen Run Systeem</p>
        </div>

        {/* Login kaart */}
        <div className="card border-gold-subtle">
          <h2 className="text-xl font-semibold text-cm-white mb-6">
            Inloggen
          </h2>

          <form onSubmit={handleInloggen} className="space-y-4">
            <div>
              <label className="block text-sm text-cm-white mb-1.5">
                E-mailadres
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
                Wachtwoord
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
              {laden ? "Inloggen..." : "Inloggen"}
            </button>
          </form>

          <p className="text-center text-cm-white text-sm mt-4">
            Nog geen account?{" "}
            <Link
              href="/registreer"
              className="text-cm-gold hover:text-cm-gold-light transition-colors"
            >
              Registreer hier
            </Link>
          </p>
        </div>

        {/* Motivatie quote */}
        <p className="text-center text-cm-white text-xs mt-6 italic">
          "Success is not owned, it's rented — and rent is due every day."
          <br />
          — Rory Vaden
        </p>
      </div>
    </div>
  );
}
