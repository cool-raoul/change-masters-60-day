"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/supabase/types";
import { useTaal } from "@/lib/i18n/TaalContext";
import { PushInstellingenKaart } from "@/components/pwa/PushInstellingenKaart";

export function InstellingenForm({ profile, email }: { profile: Profile | null; email: string }) {
  const { v } = useTaal();
  const [naam, setNaam] = useState(profile?.full_name || "");
  const [laden, setLaden] = useState(false);
  const [wachtwoord, setWachtwoord] = useState("");
  const [wachtwoordBevestig, setWachtwoordBevestig] = useState("");
  const [resendKey, setResendKey] = useState((profile as any)?.resend_api_key || "");
  const [notificatieEmail, setNotificatieEmail] = useState((profile as any)?.notificatie_email || "");
  const [resendLaden, setResendLaden] = useState(false);
  const [resendTesten, setResendTesten] = useState(false);

  // De push-kaart beheert z'n eigen staat via props + Supabase. We passen
  // alleen de initiële waardes mee zodat de UI meteen klopt zonder flicker.
  const initieelPushUur = profile?.dagelijkse_push_uur ?? 7;
  const initieelPushAan = profile?.dagelijkse_push_aan ?? true;

  // Stilte-reminder toggles. Deze zitten op de cron achter de bestaande
  // dagelijkse-push-flow, dus alleen relevant als push überhaupt aanstaat.
  const [stilteAan, setStilteAan] = useState(
    (profile as any)?.stilte_reminder_aan ?? true,
  );
  const [sponsorStilteAan, setSponsorStilteAan] = useState(
    (profile as any)?.sponsor_stilte_push_aan ?? true,
  );
  const [stilteLaden, setStilteLaden] = useState(false);

  async function bewaarStilteToggle(
    veld: "stilte_reminder_aan" | "sponsor_stilte_push_aan",
    waarde: boolean,
  ) {
    setStilteLaden(true);
    const { error } = await supabase
      .from("profiles")
      .update({ [veld]: waarde })
      .eq("id", profile?.id);
    if (error) {
      toast.error("Opslaan mislukt");
      // Roll back lokale state
      if (veld === "stilte_reminder_aan") setStilteAan(!waarde);
      else setSponsorStilteAan(!waarde);
    } else {
      toast.success("Voorkeur bewaard");
    }
    setStilteLaden(false);
  }

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
      toast.error(v("actie.fout"));
    } else {
      toast.success(v("instellingen.profiel") + " " + v("algemeen.opslaan").toLowerCase() + "d!");
      router.refresh();
    }
    setLaden(false);
  }

  async function wijzigWachtwoord(e: React.FormEvent) {
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
    const { error } = await supabase.auth.updateUser({ password: wachtwoord });
    if (error) {
      toast.error(v("actie.fout"));
    } else {
      toast.success(v("instellingen.wachtwoord_wijzigen") + "d!");
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
      toast.error(v("actie.fout"));
    } else {
      toast.success(v("instellingen.email_herinneringen") + " " + v("algemeen.opslaan").toLowerCase() + "d!");
      router.refresh();
    }
    setResendLaden(false);
  }

  async function testResendKey() {
    if (!resendKey) {
      toast.error(v("instellingen.resend_key"));
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
      toast.success(v("instellingen.testmail") + " ✓");
    } else {
      toast.error(v("actie.fout"));
    }
    setResendTesten(false);
  }

  return (
    <div className="space-y-6">
      {/* Profiel */}
      <form onSubmit={slaProfielOp} className="card space-y-4">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          {v("instellingen.profiel")}
        </h2>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">{v("instellingen.naam")}</label>
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            className="input-cm"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">{v("registreer.email")}</label>
          <input
            type="email"
            value={email}
            disabled
            className="input-cm opacity-50 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">{v("instellingen.rol")}</label>
          <input
            type="text"
            value={profile?.role === "leider" ? v("instellingen.leider") : v("instellingen.lid")}
            disabled
            className="input-cm opacity-50 cursor-not-allowed"
          />
        </div>
        <button type="submit" disabled={laden} className="btn-gold">
          {laden ? v("algemeen.laden") : v("instellingen.profiel_opslaan")}
        </button>
      </form>

      {/* E-mail herinneringen via Resend */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            {v("instellingen.email_herinneringen")}
          </h2>
          <p className="text-cm-white text-xs mt-1">
            {v("instellingen.email_subtitel")}
          </p>
        </div>

        {/* Uitleg stappen */}
        <div className="bg-cm-surface-2 rounded-lg p-4 space-y-3">
          <p className="text-cm-white text-sm font-medium">{v("instellingen.hoe_stap")}</p>
          <ol className="text-cm-white text-sm space-y-2">
            <li className="flex gap-2">
              <span className="text-cm-gold font-bold flex-shrink-0">1.</span>
              <span>{v("instellingen.stap1")}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cm-gold font-bold flex-shrink-0">2.</span>
              <span>{v("instellingen.stap2")}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cm-gold font-bold flex-shrink-0">3.</span>
              <span>{v("instellingen.stap3")}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cm-gold font-bold flex-shrink-0">4.</span>
              <span>{v("instellingen.stap4")}</span>
            </li>
          </ol>
        </div>

        <form onSubmit={slaResendKeyOp} className="space-y-3">
          <div>
            <label className="block text-sm text-cm-white mb-1.5">
              {v("instellingen.notificatie_email")}
            </label>
            <input
              type="email"
              value={notificatieEmail}
              onChange={(e) => setNotificatieEmail(e.target.value)}
              placeholder={email}
              className="input-cm"
            />
            <p className="text-cm-white text-xs mt-1">
              {v("instellingen.notificatie_uitleg")}
            </p>
          </div>
          <div>
            <label className="block text-sm text-cm-white mb-1.5">
              {v("instellingen.resend_key")}
            </label>
            <input
              type="password"
              value={resendKey}
              onChange={(e) => setResendKey(e.target.value)}
              placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="input-cm font-mono text-sm"
            />
            <p className="text-cm-white text-xs mt-1">
              {v("instellingen.key_uitleg")}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={resendLaden}
              className="btn-gold flex-1"
            >
              {resendLaden ? v("algemeen.laden") : v("algemeen.opslaan")}
            </button>
            {resendKey && (
              <button
                type="button"
                onClick={testResendKey}
                disabled={resendTesten}
                className="btn-secondary px-4"
              >
                {resendTesten ? v("instellingen.testen") : v("instellingen.testmail")}
              </button>
            )}
          </div>
        </form>

        {(profile as any)?.resend_api_key && (
          <div className="flex items-center gap-2 text-[#4ACB6A] text-sm">
            <span>✓</span>
            <span>{v("instellingen.actief")}</span>
          </div>
        )}
      </div>

      {/* Pushnotificaties — één master-kaart: browser-subscribe + dagelijkse bundel */}
      <PushInstellingenKaart
        initieelUur={initieelPushUur}
        initieelAan={initieelPushAan}
      />

      {/* Stilte-nudges (vriendelijke reminders bij inactiviteit in playbook) */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
            🛎️ Stilte-nudges
          </h2>
          <p className="text-cm-white opacity-60 text-sm mt-1">
            Vriendelijke reminders als er een dag of langer geen activiteit
            is in je 21-daagse playbook. Komt op je gekozen ochtenduur, max
            1× per dag.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={stilteAan}
            disabled={stilteLaden}
            onChange={(e) => {
              setStilteAan(e.target.checked);
              bewaarStilteToggle("stilte_reminder_aan", e.target.checked);
            }}
            className="w-5 h-5 mt-0.5 accent-cm-gold flex-shrink-0"
          />
          <div>
            <p className="text-cm-white text-sm font-medium">
              Stuur mij een nudge bij stilte
            </p>
            <p className="text-cm-white opacity-60 text-xs">
              1 dag stilte = vriendelijke prik. 2+ dagen = warmere prikkel.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={sponsorStilteAan}
            disabled={stilteLaden}
            onChange={(e) => {
              setSponsorStilteAan(e.target.checked);
              bewaarStilteToggle(
                "sponsor_stilte_push_aan",
                e.target.checked,
              );
            }}
            className="w-5 h-5 mt-0.5 accent-cm-gold flex-shrink-0"
          />
          <div>
            <p className="text-cm-white text-sm font-medium">
              Waarschuw mij als één van mijn members stil valt
            </p>
            <p className="text-cm-white opacity-60 text-xs">
              Bij 2+ dagen geen activiteit krijg je een push (max 1× per
              3 dagen per member). Alleen relevant als je teamleden hebt.
            </p>
          </div>
        </label>
      </div>

      {/* Wachtwoord */}
      <form onSubmit={wijzigWachtwoord} className="card space-y-4">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          {v("instellingen.wachtwoord")}
        </h2>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">{v("instellingen.nieuw_wachtwoord")}</label>
          <input
            type="password"
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            placeholder={v("instellingen.wachtwoord_placeholder")}
            className="input-cm"
          />
        </div>
        <div>
          <label className="block text-sm text-cm-white mb-1.5">{v("instellingen.bevestig_wachtwoord")}</label>
          <input
            type="password"
            value={wachtwoordBevestig}
            onChange={(e) => setWachtwoordBevestig(e.target.value)}
            placeholder={v("instellingen.herhaal_placeholder")}
            className="input-cm"
          />
        </div>
        <button type="submit" disabled={laden} className="btn-secondary">
          {laden ? v("instellingen.wijzigen_laden") : v("instellingen.wachtwoord_wijzigen")}
        </button>
      </form>
    </div>
  );
}
