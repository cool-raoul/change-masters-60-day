"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

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

export function PushBell() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setIsSupported(supported);
    if (supported) checkSubscription();
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {}
  }

  async function toggle() {
    if (!isSupported) {
      toast.error("Push notifications niet ondersteund door je browser");
      return;
    }
    setIsLoading(true);
    try {
      if (!isSubscribed) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Toestemming geweigerd");
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) return;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
        const response = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        });
        if (!response.ok) throw new Error("Mislukt");
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
    } catch {
      toast.error("Kon push notifications niet wijzigen");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) return null;

  return (
    <button
      onClick={toggle}
      disabled={isLoading}
      title={isSubscribed ? "Push notifications uitschakelen" : "Push notifications inschakelen"}
      className="relative p-2 transition-colors"
    >
      <span className={`text-lg ${isSubscribed ? "opacity-100" : "opacity-40"}`}>
        {isLoading ? "⏳" : "📳"}
      </span>
      {isSubscribed && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-cm-gold rounded-full" />
      )}
    </button>
  );
}
