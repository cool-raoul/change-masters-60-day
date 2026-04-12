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
  const [geregistreerd, setGeregistreerd] = useState(false);
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
      setLaden(false);
    } else {
      setGeregistreerd(true);
      setLaden(false);
    }
  }

  // Bevestigingsscherm na registratie
  if (geregistreerd) {
    return (
      <div className="min-h-screen bg-cm-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-gold-gradient mb-2">
              Change Masters
            </h1>
          </div>

          <div className="card border-gold-subtle text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-cm-white mb-3">
              Check je e-mail!
            </h2>
            <p className="text-cm-muted leading-relaxed mb-2">
              We hebben een bevestigingslink gestuurd naar:
            </p>
            <p className="text-cm-gold font-semibold mb-4">
              {email}
            </p>
            <div className="bg-cm-surface-2 rounded-lg p-4 mb-6 text-left space-y-2">
              <p className="text-cm-white text-sm font-medium">Hoe werkt het:</p>
              <ol className="text-cm-muted text-sm space-y-1.5 list-decimal list-inside">
                <li>Open je e-mail (check ook je spam-map)</li>
                <li>Klik op de bevestigingslink in de mail</li>
                <li>Je wordt automatisch doorgestuurd</li>
                <li>Log daarna in met je e-mail en wachtwoord</li>
              </ol>
            </div>
            <Link
              href="/login"
              className="btn-gold w-full block text-center"
            >
              Naar inloggen
            </Link>
            <p className="text-cm-muted text-xs mt-4">
              Geen mail ontvangen?{" "}
              <button
                onClick={() => setGeregistreerd(false)}
                className="text-cm-gold hover:text-cm-gold-light transition-colors underline"
              >
                Probeer opnieuw
              </button>
            </p>
          </div>
        </div>
      </div>
    );
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
