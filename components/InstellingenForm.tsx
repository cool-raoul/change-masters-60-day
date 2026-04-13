"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/supabase/types";

export function InstellingenForm({ profile, email }: { profile: Profile | null; email: string }) {
  const [naam, setNaam] = useState(profile?.full_name || "");
  const [laden, setLaden] = useState(false);
  const [wachtwoord, setWachtwoord] = useState("");
  const [wachtwoordBevestig, setWachtwoordBevestig] = useState("");
  const [resendKey, setResendKey] = useState((profile as any)?.resend_api_key || "");
  const [notificatieEmail, setNotificatieEmail] = useState((profile as any)?.notificatie_email || "");
  const [resendLaden, setResendLaden] = useState(false);
  const [resendTesten, setResendTesten] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function slaProfielOp(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: naam })
      .eq("id", profile?.id);

    if (error) {
      toast.error("Kon profiel niet opslaan");
    } else {
      toast.success("Profiel bijgewerkt!");
      router.refresh();
    }
    setLaden(false);
  }

  async function wijzigWachtwoord(e: React.FormEvent) {
    e.preventDefault();
    if (wachtwoord !== wachtwoordBevestig) {
      toast.error("Wachtwoorden komen niet overeen");
      return;
    }
    if (wachtwoord.length < 6) {
      toast.error("Wachtwoord moet minimaal 6 tekens zijn");
      return;
    }
    setLaden(true);
    const { error } = await supabase.auth.updateUser({ password: wachtwoord });
    if (error) {
      toast.error("Kon wachtwoord niet wijzigen");
    } else {
      toast.success("Wachtwoord gewijzigd!");
      setWachtwoord("");
      setWachtwoordBevestig("");
    }
    setLaden(false);
  }

  async function slaResendKeyOp(e: React.FormEvent) {
    e.preventDefault();
    setResendLaden(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        resend_api_key: resendKey || null,
        notificatie_email: notificatieEmail || null,
      })
      .eq("id", profile?.id);

    if (error) {
      toast.error("Kon e-mail instelling niet opslaan");
    } else {
      toast.success("E-mail instelling opgeslagen!");
      router.refresh();
    }
    setResendLaden(false);
  }

  async function testResendKey() {
    if (!resendKey) {
      toast.error("Vul eerst een API key in");
      return;
    }
    setResendTesten(true);

    const stuurNaar = notificatieEmail || email;

    const response = await fetch("/api/reminders/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resendKey, email: stuurNaar }),
    });

    if (response.ok) {
      toast.success("Testmail verstuurd! Check je inbox.");
    } else {
      toast.error("API key werkt niet. Controleer of je hem goed hebt gekopieerd.");
    }
    setResendTesten(false);
  }

  return (
    <div className="space-y-6">
      {/* Profiel */}
      <form onSubmit={slaProfielOp} className="card space-y-4">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          Profiel
        </h2>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">Naam</label>
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            className="input-cm"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">E-mailadres</label>
          <input
            type="email"
            value={email}
            disabled
            className="input-cm opacity-50 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">Rol</label>
          <input
            type="text"
            value={profile?.role === "leider" ? "Teamleider" : "Teamlid"}
            disabled
            className="input-cm opacity-50 cursor-not-allowed"
          />
        </div>
        <button type="submit" disabled={laden} className="btn-gold">
          {laden ? "Opslaan..." : "Profiel opslaan"}
        </button>
      </form>

      {/* E-mail herinneringen via Resend */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            E-mail herinneringen
          </h2>
          <p className="text-cm-white text-xs mt-1">
            Koppel je eigen gratis e-mailaccount zodat je elke ochtend een herinnering krijgt van openstaande taken.
          </p>
        </div>

        {/* Uitleg stappen */}
        <div className="bg-cm-surface-2 rounded-lg p-4 space-y-3">
          <p className="text-cm-white text-sm font-medium">Hoe stel je dit in? (2 minuten)</p>
          <ol className="text-cm-white text-sm space-y-2">
            <li className="flex gap-2">
              <span className="text-cm-gold font-bold flex-shrink-0">1.</span>
              <span>Ga naar <span className="text-cm-gold font-medium">resend.com</span> en maak een gratis account aan (100 mails per dag, gratis)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cm-gold font-bold flex-shrink-0">2.</span>
              <span>Klik na het inloggen op <span className="text-cm-white font-medium">API Keys</span> in het menu links</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cm-gold font-bold flex-shrink-0">3.</span>
              <span>Klik op <span className="text-cm-white font-medium">Create API Key</span>, geef hem een naam en kopieer de key</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cm-gold font-bold flex-shrink-0">4.</span>
              <span>Plak de key hieronder en klik op opslaan</span>
            </li>
          </ol>
        </div>

        <form onSubmit={slaResendKeyOp} className="space-y-3">
          <div>
            <label className="block text-sm text-cm-white mb-1.5">
              E-mailadres voor herinneringen
            </label>
            <input
              type="email"
              value={notificatieEmail}
              onChange={(e) => setNotificatieEmail(e.target.value)}
              placeholder={email + " (laat leeg om je aanmeld e-mail te gebruiken)"}
              className="input-cm"
            />
            <p className="text-cm-white text-xs mt-1">
              Vul hier een ander e-mailadres in als je de herinneringen ergens anders wilt ontvangen.
            </p>
          </div>
          <div>
            <label className="block text-sm text-cm-white mb-1.5">
              Resend API Key
            </label>
            <input
              type="password"
              value={resendKey}
              onChange={(e) => setResendKey(e.target.value)}
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="input-cm font-mono text-sm"
            />
            <p className="text-cm-white text-xs mt-1">
              Je key wordt versleuteld opgeslagen. Niemand anders kan hem zien.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={resendLaden}
              className="btn-gold flex-1"
            >
              {resendLaden ? "Opslaan..." : "Opslaan"}
            </button>
            {resendKey && (
              <button
                type="button"
                onClick={testResendKey}
                disabled={resendTesten}
                className="btn-secondary px-4"
              >
                {resendTesten ? "Testen..." : "Testmail sturen"}
              </button>
            )}
          </div>
        </form>

        {(profile as any)?.resend_api_key && (
          <div className="flex items-center gap-2 text-[#4ACB6A] text-sm">
            <span>✓</span>
            <span>E-mail herinneringen zijn actief. Je krijgt elke ochtend om 07:00 een mail als je openstaande herinneringen hebt.</span>
          </div>
        )}
      </div>

      {/* Wachtwoord */}
      <form onSubmit={wijzigWachtwoord} className="card space-y-4">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          Wachtwoord wijzigen
        </h2>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">Nieuw wachtwoord</label>
          <input
            type="password"
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            placeholder="Minimaal 6 tekens"
            className="input-cm"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">Bevestig wachtwoord</label>
          <input
            type="password"
            value={wachtwoordBevestig}
            onChange={(e) => setWachtwoordBevestig(e.target.value)}
            placeholder="Herhaal nieuw wachtwoord"
            className="input-cm"
          />
        </div>
        <button type="submit" disabled={laden} className="btn-secondary">
          {laden ? "Wijzigen..." : "Wachtwoord wijzigen"}
        </button>
      </form>
    </div>
  );
}
