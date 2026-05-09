"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [permission, setPermission] = useState<"default" | "granted" | "denied">("default");
  // Mismatch-staat: browser denkt subscribed maar server heeft 'm niet
  // (of een andere endpoint). Wordt gezet door de status-check, en de
  // UI biedt dan een 'Synchroniseer'-knop aan om 't recht te trekken.
  const [needsResync, setNeedsResync] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;

    setIsSupported(supported);

    // Detect if running as installed PWA
    const standalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true);
    setIsStandalone(standalone);

    if (supported) {
      setPermission(Notification.permission as any);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      const browserSub = !!subscription;
      setIsSubscribed(browserSub);

      // Mismatch-detectie: vergelijk browser-state met server-state
      // zodat we weten of 'r een resync nodig is. Dit lost op wanneer
      // we VAPID-keys hebben verwisseld of een DB-reset is gedaan
      // terwijl de browser nog 'n oude subscription gecached heeft.
      try {
        const res = await fetch("/api/push/status");
        if (res.ok) {
          const data = await res.json();
          const serverEndpoint = data.endpoint as string | null;
          const browserEndpoint = subscription?.endpoint ?? null;
          // Mismatch als browser zegt 'subscribed' maar:
          //  - server heeft géén actieve, OF
          //  - server-endpoint matcht niet met browser-endpoint
          const mismatch =
            (browserSub && !data.hasActive) ||
            (browserSub &&
              serverEndpoint &&
              browserEndpoint &&
              serverEndpoint !== browserEndpoint);
          setNeedsResync(!!mismatch);
        }
      } catch {
        // negeer transient errors
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  }

  async function synchroniseer() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      // Stap 1: oude subscription weghalen (browser + server)
      const oude = await registration.pushManager.getSubscription();
      if (oude) {
        try {
          await oude.unsubscribe();
        } catch {
          // negeer
        }
      }
      try {
        await fetch("/api/push/subscribe", { method: "DELETE" });
      } catch {
        // negeer
      }

      // Stap 2: vraag opnieuw permission als nodig
      if (Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        setPermission(perm as typeof permission);
        if (perm !== "granted") {
          toast.error("Toestemming geweigerd");
          setIsSubscribed(false);
          setNeedsResync(false);
          return;
        }
      }

      // Stap 3: nieuwe subscription maken met huidige VAPID-key
      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
      if (!vapidPublicKey) {
        toast.error("Push-key niet ingesteld");
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      let tijdzone = "Europe/Amsterdam";
      try {
        const gedetecteerd = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (gedetecteerd) tijdzone = gedetecteerd;
      } catch {}

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON(), tijdzone }),
      });
      if (!res.ok) throw new Error("Subscribe naar server mislukt");

      setIsSubscribed(true);
      setNeedsResync(false);
      toast.success("Push-meldingen opnieuw gesynchroniseerd ✓");
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "onbekend";
      toast.error("Sync mislukt: " + msg);
    } finally {
      setIsLoading(false);
    }
  }

  async function togglePushNotifications() {
    if (!isSupported) {
      toast.error("Push notifications worden niet ondersteund door je browser");
      return;
    }

    setIsLoading(true);

    try {
      if (permission !== "granted") {
        const perm = await Notification.requestPermission();
        setPermission(perm as any);
        if (perm !== "granted") {
          toast.error("Toestemming geweigerd");
          setIsLoading(false);
          return;
        }
      }

      if (!isSubscribed) {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();

        if (!vapidPublicKey) {
          toast.error("Push notifications niet geconfigureerd");
          setIsLoading(false);
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Browser-tijdzone meesturen zodat het endpoint 'm direct als default
        // kan opslaan, anders zou onboarding-user Europe/Amsterdam krijgen.
        let tijdzone = "Europe/Amsterdam";
        try {
          const gedetecteerd = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (gedetecteerd) tijdzone = gedetecteerd;
        } catch {}

        const response = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: subscription.toJSON(), tijdzone }),
        });

        if (!response.ok) throw new Error("Subscription mislukt");

        setIsSubscribed(true);
        toast.success("Push notifications ingeschakeld ✓");
      } else {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await fetch("/api/push/subscribe", { method: "DELETE" });
          setIsSubscribed(false);
          toast.success("Push notifications uitgeschakeld");
        }
      }
    } catch (error: any) {
      console.error("Push toggle error:", error);
      toast.error("Fout: " + (error?.message || String(error)));
    } finally {
      setIsLoading(false);
    }
  }

  async function stuurTestPush() {
    setIsTesting(true);
    try {
      const response = await fetch("/api/push/test", { method: "POST" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        const reden = data?.reason || data?.error || `HTTP ${response.status}`;
        toast.error("Test mislukt: " + reden);
        return;
      }

      toast.success("Test verstuurd \u2014 check je meldingen");
    } catch (error: any) {
      console.error("Test push error:", error);
      toast.error("Fout: " + (error?.message || String(error)));
    } finally {
      setIsTesting(false);
    }
  }

  // Not in PWA mode, show install instruction
  if (!isStandalone && !isSubscribed) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-amber-900/20 border border-amber-600/30 rounded-xl">
          <p className="text-amber-300 font-semibold text-sm mb-2">📱 Installeer de app eerst</p>
          <p className="text-cm-white text-xs leading-relaxed opacity-80">
            Push meldingen werken alleen vanuit de geïnstalleerde app. Volg de installatie-instructies hierboven, open daarna de app vanuit je beginscherm en kom terug naar deze pagina om meldingen in te schakelen.
          </p>
        </div>
        {isSupported && (
          <button
            onClick={togglePushNotifications}
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-cm-surface border border-cm-border text-cm-white hover:border-cm-gold transition-colors disabled:opacity-50"
          >
            {isLoading ? "Bezig..." : "Toch proberen (al geïnstalleerd)"}
          </button>
        )}
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="p-3 bg-cm-surface-2 rounded-lg border border-cm-border">
        <p className="text-xs text-cm-white opacity-60">
          ⚠️ Push notifications worden niet ondersteund door je browser. Gebruik Safari op iPhone of Chrome op Android.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-cm-surface-2 rounded-lg border border-cm-border">
        <div>
          <p className="text-sm font-semibold text-cm-white">🔔 Push Notifications</p>
          <p className="text-xs text-cm-white opacity-60 mt-0.5">
            {isSubscribed
              ? "✅ Ingeschakeld, je ontvangt meldingen"
              : "Uitgeschakeld"}
          </p>
        </div>
        <button
          onClick={togglePushNotifications}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isSubscribed
              ? "bg-cm-gold text-cm-black hover:bg-cm-gold-light disabled:opacity-50"
              : "bg-cm-surface border border-cm-border text-cm-white hover:border-cm-gold disabled:opacity-50"
          }`}
        >
          {isLoading ? "..." : isSubscribed ? "Uit" : "Aan"}
        </button>
      </div>

      {permission === "denied" && (
        <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-xs text-red-400">
            Je hebt notificaties geweigerd. Ga naar Instellingen → Safari/Chrome → Meldingen om dit te wijzigen.
          </p>
        </div>
      )}

      {isSubscribed && needsResync && (
        <div className="p-3 bg-amber-900/20 border border-amber-600/30 rounded-xl space-y-2">
          <p className="text-amber-300 text-sm font-semibold">
            ⚠ Push-meldingen niet gesynchroniseerd
          </p>
          <p className="text-cm-white/80 text-xs leading-relaxed">
            Je browser denkt dat push aan staat, maar onze server kent
            jouw apparaat (nog) niet. Klik hieronder om opnieuw aan te
            melden, dan werkt 't weer.
          </p>
          <button
            onClick={synchroniseer}
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-amber-600/30 border border-amber-500 text-amber-100 hover:bg-amber-600/40 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Bezig..." : "🔄 Synchroniseer push opnieuw"}
          </button>
        </div>
      )}
      {isSubscribed && (
        <button
          onClick={stuurTestPush}
          disabled={isTesting}
          className="w-full px-4 py-2 rounded-lg text-sm font-semibold bg-cm-surface border border-cm-border text-cm-white hover:border-cm-gold transition-colors disabled:opacity-50"
        >
          {isTesting ? "Bezig met versturen..." : "🧪 Stuur test-melding"}
        </button>
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
