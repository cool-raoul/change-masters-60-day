"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTaal } from "@/lib/i18n/TaalContext";

// Eén kaart in /instellingen die zowel de browser-subscription als de
// bundel-voorkeuren beheert. Anti-overwhelm: één master-toggle doet
// "alles aan" of "alles uit". Tijd kies je apart, alleen zichtbaar als
// 'r push aan is.
//
// Design-keuzes:
// - Als browser niet subscribed is: toggle staat uit, klikken op aan triggert
//   de hele subscribe-flow (permission prompt + VAPID + /api/push/subscribe).
// - Dat endpoint zet ook profile.dagelijkse_push_aan=true en tijdzone/uur
//   defaults, dus na subscribe is alles direct goed.
// - Uur opslaan gebeurt direct in Supabase; tijdzone wordt op dat moment
//   ook uit de browser gehaald zodat 'ie meeschuift als de user verhuist.

type Props = {
  initieelUur: number;
  initieelAan: boolean;
};

export function PushInstellingenKaart({ initieelUur, initieelAan }: Props) {
  const { v } = useTaal();
  const router = useRouter();
  const supabase = createClient();

  // Browser-kant status
  const [isSupported, setIsSupported] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<"default" | "granted" | "denied">("default");

  // Profiel-kant status
  const [pushUur, setPushUur] = useState<number>(initieelUur);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Loading states
  const [toggleLaden, setToggleLaden] = useState(false);
  const [uurLaden, setUurLaden] = useState(false);
  const [testLaden, setTestLaden] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setIsSupported(supported);

    const standalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true);
    setIsStandalone(standalone);

    if (supported) {
      setPermission(Notification.permission as any);
      (async () => {
        try {
          const registration = await navigator.serviceWorker.ready;
          const sub = await registration.pushManager.getSubscription();
          setIsSubscribed(!!sub);
        } catch {
          // Geen fatal — tonen als uit
        }
        setInitialLoaded(true);
      })();
    } else {
      setInitialLoaded(true);
    }
  }, []);

  // De master-toggle: we beschouwen "aan" als: browser subscribed + profile aan.
  // Als één van die twee uit is, tonen we de toggle als uit.
  const effectiefAan = isSubscribed && initieelAan;

  async function toggleMaster() {
    if (!isSupported) {
      toast.error(v("actie.fout"));
      return;
    }
    setToggleLaden(true);
    try {
      if (!effectiefAan) {
        // AAN: subscribe flow
        if (permission !== "granted") {
          const perm = await Notification.requestPermission();
          setPermission(perm as any);
          if (perm !== "granted") {
            toast.error(v("push.toestemming_geweigerd"));
            return;
          }
        }

        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
          if (!vapidPublicKey) {
            toast.error(v("push.niet_geconfigureerd"));
            return;
          }
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          });
        }

        // Tijdzone meesturen zodat 't endpoint 'm als default kan opslaan
        let tijdzone = "Europe/Amsterdam";
        try {
          const gedetecteerd = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (gedetecteerd) tijdzone = gedetecteerd;
        } catch {}

        const response = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            tijdzone,
          }),
        });

        if (!response.ok) {
          toast.error(v("push.subscribe_mislukt"));
          return;
        }

        setIsSubscribed(true);
        toast.success(v("push.aangezet"));
        router.refresh();
      } else {
        // UIT: unsubscribe flow
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
        await fetch("/api/push/subscribe", { method: "DELETE" });
        setIsSubscribed(false);
        toast.success(v("push.uitgezet"));
        router.refresh();
      }
    } catch (err: any) {
      console.error("Push toggle fout:", err);
      toast.error(v("actie.fout"));
    } finally {
      setToggleLaden(false);
    }
  }

  async function slaUurOp() {
    setUurLaden(true);
    let tijdzone = "Europe/Amsterdam";
    try {
      const gedetecteerd = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (gedetecteerd) tijdzone = gedetecteerd;
    } catch {}

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error(v("actie.fout"));
      setUurLaden(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        dagelijkse_push_uur: pushUur,
        tijdzone,
      })
      .eq("id", user.id);

    if (error) {
      toast.error(v("actie.fout"));
    } else {
      toast.success(v("instellingen.push_opgeslagen"));
      router.refresh();
    }
    setUurLaden(false);
  }

  async function stuurTestPush() {
    setTestLaden(true);
    try {
      const response = await fetch("/api/push/test", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        const reden = data?.reason || data?.error || `HTTP ${response.status}`;
        toast.error(v("push.test_mislukt") + ": " + reden);
        return;
      }
      toast.success(v("push.test_verstuurd"));
    } catch (err: any) {
      toast.error(v("actie.fout"));
    } finally {
      setTestLaden(false);
    }
  }

  // Niet-ondersteunde browser: simpele uitleg, geen toggle.
  if (!isSupported) {
    return (
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          {v("instellingen.push_titel")}
        </h2>
        <p className="text-cm-white text-xs opacity-70">
          {v("push.niet_ondersteund")}
        </p>
      </div>
    );
  }

  // Geen PWA-install: user moet eerst installeren. Tonen als info-kaart.
  if (!isStandalone && !isSubscribed) {
    return (
      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          {v("instellingen.push_titel")}
        </h2>
        <div className="p-3 bg-amber-900/20 border border-amber-600/30 rounded-xl">
          <p className="text-amber-300 font-semibold text-sm mb-1">
            📱 {v("push.installeer_eerst_titel")}
          </p>
          <p className="text-cm-white text-xs leading-relaxed opacity-80">
            {v("push.installeer_eerst_uitleg")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-cm-white uppercase tracking-wider">
          {v("instellingen.push_titel")}
        </h2>
        <p className="text-cm-white text-xs mt-1 opacity-70">
          {v("instellingen.push_subtitel")}
        </p>
      </div>

      {/* Master toggle */}
      <div className="flex items-center justify-between gap-3 p-3 bg-cm-surface-2 rounded-lg border border-cm-border">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-cm-white">
            🔔 {v("push.master_label")}
          </p>
          <p className="text-xs text-cm-white opacity-60 mt-0.5">
            {effectiefAan
              ? v("push.master_aan")
              : v("push.master_uit")}
          </p>
        </div>
        <button
          onClick={toggleMaster}
          disabled={toggleLaden || !initialLoaded}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 ${
            effectiefAan
              ? "bg-cm-gold text-cm-black hover:bg-cm-gold-light disabled:opacity-50"
              : "bg-cm-surface border border-cm-border text-cm-white hover:border-cm-gold disabled:opacity-50"
          }`}
        >
          {toggleLaden
            ? "..."
            : effectiefAan
              ? v("push.knop_uit")
              : v("push.knop_aan")}
        </button>
      </div>

      {/* Permission denied waarschuwing */}
      {permission === "denied" && (
        <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-xs text-red-400">
            {v("push.permission_geweigerd_uitleg")}
          </p>
        </div>
      )}

      {/* Uur + test — alleen als master aan staat */}
      {effectiefAan && (
        <>
          <div>
            <label className="block text-sm text-cm-white mb-1.5">
              {v("instellingen.push_uur_label")}
            </label>
            <div className="flex gap-2">
              <select
                value={pushUur}
                onChange={(e) => setPushUur(parseInt(e.target.value, 10))}
                className="input-cm flex-1"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={slaUurOp}
                disabled={uurLaden || pushUur === initieelUur}
                className="btn-gold px-4 disabled:opacity-50"
              >
                {uurLaden ? v("algemeen.laden") : v("algemeen.opslaan")}
              </button>
            </div>
            <p className="text-cm-white text-xs mt-1 opacity-60">
              {v("instellingen.push_tijdzone_auto")}
            </p>
          </div>

          <button
            type="button"
            onClick={stuurTestPush}
            disabled={testLaden}
            className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-cm-surface border border-cm-border text-cm-white hover:border-cm-gold transition-colors disabled:opacity-50"
          >
            {testLaden ? v("algemeen.laden") : "🧪 " + v("push.test_knop")}
          </button>
        </>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
