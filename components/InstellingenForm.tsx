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

  return (
    <div className="space-y-6">
      {/* Profiel */}
      <form onSubmit={slaProfielOp} className="card space-y-4">
        <h2 className="text-sm font-semibold text-cm-muted uppercase tracking-wider">
          Profiel
        </h2>
        <div>
          <label className="block text-sm text-cm-muted mb-1.5">Naam</label>
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            className="input-cm"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-muted mb-1.5">E-mailadres</label>
          <input
            type="email"
            value={email}
            disabled
            className="input-cm opacity-50 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-muted mb-1.5">Rol</label>
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

      {/* Wachtwoord */}
      <form onSubmit={wijzigWachtwoord} className="card space-y-4">
        <h2 className="text-sm font-semibold text-cm-muted uppercase tracking-wider">
          Wachtwoord wijzigen
        </h2>
        <div>
          <label className="block text-sm text-cm-muted mb-1.5">Nieuw wachtwoord</label>
          <input
            type="password"
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            placeholder="Minimaal 6 tekens"
            className="input-cm"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-muted mb-1.5">Bevestig wachtwoord</label>
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
