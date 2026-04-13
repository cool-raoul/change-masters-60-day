"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Suspense } from "react";
import { TAAL_OPTIES, vertaal, Taal } from "@/lib/i18n/vertalingen";

function RegistreerFormulier() {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [wachtwoordBevestig, setWachtwoordBevestig] = useState("");
  const [taal, setTaal] = useState<Taal>("nl");
  const [laden, setLaden] = useState(false);
  const [geregistreerd, setGeregistreerd] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  const supabase = createClient();

  function v(sleutel: string) {
    return vertaal(sleutel, taal);
  }

  async function handleRegistreren(e: React.FormEvent) {
    e.preventDefault();

    if (wachtwoord !== wachtwoordBevestig) {
      toast.error(v("registreer.wachtwoorden_niet_gelijk"));
      return;
    }

    if (wachtwoord.length < 6) {
      toast.error(v("registreer.wachtwoord_te_kort"));
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
          invited_by: teamId || null,
          taal: taal,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback${teamId ? `?team=${teamId}` : ""}`,
      },
    });

    if (error) {
      toast.error(v("registreer.mislukt") + error.message);
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
            <img src="/eleva-icon.png" alt="ELEVA" className="h-16 w-16 mx-auto mb-3" />
            <h1 className="text-4xl eleva-brand mb-2">
              ELEVA
            </h1>
          </div>

          <div className="card border-gold-subtle text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-cm-white mb-3">
              {v("bevestig.titel")}
            </h2>
            <p className="text-cm-white leading-relaxed mb-2">
              {v("bevestig.gestuurd")}
            </p>
            <p className="text-cm-gold font-semibold mb-4">
              {email}
            </p>
            <div className="bg-cm-surface-2 rounded-lg p-4 mb-6 text-left space-y-2">
              <p className="text-cm-white text-sm font-medium">{v("bevestig.hoe")}</p>
              <ol className="text-cm-white text-sm space-y-1.5 list-decimal list-inside">
                <li>{v("bevestig.stap1")}</li>
                <li>{v("bevestig.stap2")}</li>
                <li>{v("bevestig.stap3")}</li>
                <li>{v("bevestig.stap4")}</li>
              </ol>
            </div>
            <Link
              href="/login"
              className="btn-gold w-full block text-center"
            >
              {v("bevestig.naar_login")}
            </Link>
            <p className="text-cm-white text-xs mt-4">
              {v("bevestig.geen_mail")}{" "}
              <button
                onClick={() => setGeregistreerd(false)}
                className="text-cm-gold hover:text-cm-gold-light transition-colors underline"
              >
                {v("bevestig.opnieuw")}
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
        {/* Taalkeuze */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {TAAL_OPTIES.map((optie) => (
            <button
              key={optie.code}
              onClick={() => setTaal(optie.code)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                taal === optie.code
                  ? "bg-cm-gold text-cm-black font-semibold"
                  : "bg-cm-surface border border-cm-border text-cm-white hover:text-cm-white"
              }`}
            >
              {optie.vlag} {optie.label}
            </button>
          ))}
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/eleva-icon.png" alt="ELEVA" className="h-16 w-16 mx-auto mb-3" />
          <h1 className="text-4xl eleva-brand mb-2">
            ELEVA
          </h1>
          <p className="text-cm-white">{v("registreer.welkom")}</p>
        </div>

        {/* Uitgenodigd banner */}
        {teamId && (
          <div className="bg-gold-subtle border border-gold-subtle rounded-xl p-4 mb-4 text-center">
            <p className="text-cm-gold text-sm font-semibold">
              {v("registreer.uitgenodigd")}
            </p>
          </div>
        )}

        {/* Registreer kaart */}
        <div className="card border-gold-subtle">
          <h2 className="text-xl font-semibold text-cm-white mb-6">
            {v("registreer.titel")}
          </h2>

          <form onSubmit={handleRegistreren} className="space-y-4">
            <div>
              <label className="block text-sm text-cm-white mb-1.5">
                {v("registreer.naam")}
              </label>
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                placeholder={v("registreer.naam_placeholder")}
                className="input-cm"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-cm-white mb-1.5">
                {v("registreer.email")}
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
                {v("registreer.wachtwoord")}
              </label>
              <input
                type="password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                placeholder={v("registreer.wachtwoord_min")}
                className="input-cm"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-cm-white mb-1.5">
                {v("registreer.wachtwoord_bevestig")}
              </label>
              <input
                type="password"
                value={wachtwoordBevestig}
                onChange={(e) => setWachtwoordBevestig(e.target.value)}
                placeholder={v("registreer.wachtwoord_herhaal")}
                className="input-cm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={laden}
              className="btn-gold w-full mt-6"
            >
              {laden ? v("registreer.knop_laden") : v("registreer.knop")}
            </button>
          </form>

          <p className="text-center text-cm-white text-sm mt-4">
            {v("registreer.al_account")}{" "}
            <Link
              href="/login"
              className="text-cm-gold hover:text-cm-gold-light transition-colors"
            >
              {v("registreer.inloggen")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegistreerPagina() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cm-black flex items-center justify-center">
        <div className="text-cm-white">Laden...</div>
      </div>
    }>
      <RegistreerFormulier />
    </Suspense>
  );
}
