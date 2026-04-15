"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<"default" | "granted" | "denied">("default");

  useEffect(() => {
    // Check browser support
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;

    setIsSupported(supported);

    if (supported) {
      // Check current permission
      setPermission(Notification.permission as any);

      // Check if already subscribed
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  }

  async function togglePushNotifications() {
    if (!isSupported) {
      toast.error("Push notifications worden niet ondersteund door je browser");
      return;
    }

    setIsLoading(true);

    try {
      // Vraag toestemming
      if (permission !== "granted") {
        const permission = await Notification.requestPermission();
        setPermission(permission);

        if (permission !== "granted") {
          toast.error("Toestemming geweigerd");
          setIsLoading(false);
          return;
        }
      }

      // Zet push aan
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

        // Stuur subscription naar server
        const response = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        });

        if (!response.ok) throw new Error("Subscription mislukt");

        setIsSubscribed(true);
        toast.success("Push notifications ingeschakeld ✓");
      } else {
        // Zet push uit
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

  if (!isSupported) {
    return (
      <div className="p-3 bg-cm-surface-2 rounded-lg border border-cm-border">
        <p className="text-xs text-cm-white opacity-60">
          ⚠️ Push notifications worden niet ondersteund door je browser
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
              ? "Ingeschakeld — je ontvangt meldingen"
              : "Uitgeschakeld"}
          </p>
        </div>
        <button
          onClick={togglePushNotifications}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            isSubscribed
              ? "bg-cm-gold text-cm-black hover:bg-cm-gold-light disabled:opacity-50"
              : "bg-cm-surface border border-cm-border text-cm-white hover:border-cm-gold-dim disabled:opacity-50"
          }`}
        >
          {isLoading ? "..." : isSubscribed ? "Uit" : "Aan"}
        </button>
      </div>

      {permission === "denied" && (
        <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-xs text-red-400">
            💻 Je hebt notificaties geweigerd. Je kunt dit wijzigen in je browser instellingen.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function om VAPID key om te zetten
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
