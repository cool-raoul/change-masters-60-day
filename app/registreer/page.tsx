"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function RegistreerPagina() {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [wachtwoordBevestig, setWachtwoordBevestig] = useState("");
  const [laden, setLaden] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegistreren(e: React.FormEvent) {
    e.preventDefault();

    if (wachtwoord !== wachtwoordBevestig) {
      toast.error("Wachtwoorden komen niet overeen.");
      return;
    }

    if (wachtwoord.length < 6) {
      toast.error("Wachtwoord moet minimaal 6 tekens zijn.");
      return;
    }

    setLaden(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: wachtwoord,
      options: {
        data: {
          full_name: naam,
          role: "lid",
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      toast.error("Registratie mislukt: " + error.message);
    } else {
      toast.success("Account aangemaakt! Je wordt doorgestuurd...");
      router.push("/mijn-why");
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
          <p className="text-cm-muted">60 Dagen Run Systeem — Welkom aan boord</p>
        </div>

        {/* Registreer kaart */}
        <div className="card border-gold-subtle">
          <h2 className="text-xl font-semibold text-cm-white mb-6">
            Account aanmaken
          </h2>

          <form onSubmit={handleRegistreren} className="space-y-4">
            <div>
              <label className="block text-sm text-cm-muted mb-1.5">
                Jouw naam
              </label>
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                placeholder="Voornaam Achternaam"
                className="input-cm"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-cm-muted mb-1.5">
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
              <label className="block text-sm text-cm-muted mb-1.5">
                Wachtwoord
              </label>
              <input
                type="password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                placeholder="Minimaal 6 tekens"
                className="input-cm"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-cm-muted mb-1.5">
                Wachtwoord bevestigen
              </label>
              <input
                type="password"
                value={wachtwoordBevestig}
                onChange={(e) => setWachtwoordBevestig(e.target.value)}
                placeholder="Herhaal wachtwoord"
                className="input-cm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={laden}
              className="btn-gold w-full mt-6"
            >
              {laden ? "Account aanmaken..." : "Account aanmaken"}
            </button>
          </form>

          <p className="text-center text-cm-muted text-sm mt-4">
            Al een account?{" "}
            <Link
              href="/login"
              className="text-cm-gold hover:text-cm-gold-light transition-colors"
            >
              Inloggen
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
