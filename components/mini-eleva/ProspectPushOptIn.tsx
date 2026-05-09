"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

// ============================================================
// ProspectPushOptIn, vraagt de prospect of 'ie push-meldingen wil
// ontvangen voor antwoorden van member/sponsor.
//
// Token-gebaseerd: prospect heeft geen Supabase-account, dus we
// abonneren via /api/mini-eleva/push-subscribe met het token.
//
// Toont alleen als:
//   - Browser ondersteunt push
//   - Permission is "default" (nog niet beslist)
//   - Niet onlangs geweigerd (3 dagen herhaal-venster via localStorage)
//   - Service worker is geregistreerd (zou bij PWA-install al moeten)
// ============================================================

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const ONTHOUD_KEY_PREFIX = "mini-eleva-prospect-push-laatst-";
const HERHAAL_NA_DAGEN = 3;

type Props = {
  token: string;
  memberNaam: string | null;
};

export function ProspectPushOptIn({ token, memberNaam }: Props) {
  const [zichtbaar, setZichtbaar] = useState(false);
  const [bezig, setBezig] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    if (!supported) return;

    (async () => {
      // Service worker registreren als 'ie er nog niet is. Mini-ELEVA
      // gebruikers komen mogelijk binnen vóór de SW gestart is.
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) {
          await navigator.serviceWorker.register("/service-worker.js");
        }
      } catch {
        return;
      }

      // Niet tonen als al granted + abonnement bestaat
      if (Notification.permission === "granted") {
        try {
          const registration = await navigator.serviceWorker.ready;
          const sub = await registration.pushManager.getSubscription();
          if (sub) return;
        } catch {
          // negeer
        }
      }

      // Niet binnen herhaal-venster opnieuw tonen
      const sleutel = ONTHOUD_KEY_PREFIX + token.substring(0, 8);
      const laatst = localStorage.getItem(sleutel);
      if (laatst) {
        const dagen = (Date.now() - Number(laatst)) / (1000 * 60 * 60 * 24);
        if (dagen < HERHAAL_NA_DAGEN) return;
      }

      setZichtbaar(true);
    })();
  }, [token]);

  function nuNiet() {
    const sleutel = ONTHOUD_KEY_PREFIX + token.substring(0, 8);
    localStorage.setItem(sleutel, String(Date.now()));
    setZichtbaar(false);
  }

  async function aanzetten() {
    if (bezig) return;
    setBezig(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error(
          permission === "denied"
            ? "Geblokkeerd. Open je browser-instellingen om 't alsnog aan te zetten."
            : "Toestemming geweigerd",
        );
        nuNiet();
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        toast.error("Push-key niet ingesteld op de server");
        return;
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const res = await fetch("/api/mini-eleva/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          subscription: subscription.toJSON(),
        }),
      });
      if (!res.ok) throw new Error("Subscribe mislukt");

      toast.success(
        `Meldingen aan ✓ — je krijgt een seintje wanneer ${memberNaam ?? "de member"} reageert`,
      );
      setZichtbaar(false);
    } catch {
      toast.error("Kon meldingen niet aanzetten, probeer 't later");
    } finally {
      setBezig(false);
    }
  }

  if (!zichtbaar) return null;

  const memberDeel = memberNaam ? memberNaam.split(" ")[0] : "de member";

  return (
    <div className="card border-l-4 border-cm-gold/60 mb-4 flex items-start gap-3">
      <span className="text-2xl">🔔</span>
      <div className="flex-1 space-y-2">
        <h3 className="text-cm-gold text-sm font-semibold">
          Krijg een seintje als {memberDeel} reageert
        </h3>
        <p className="text-cm-white/70 text-xs leading-relaxed">
          Je hoeft ELEVA dan niet open te houden. Zodra {memberDeel} of de
          sponsor iets terugstuurt, zie je dat op je telefoon.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={aanzetten}
            disabled={bezig}
            className="btn-gold text-xs disabled:opacity-50"
          >
            {bezig ? "Bezig..." : "Aanzetten"}
          </button>
          <button
            type="button"
            onClick={nuNiet}
            className="btn-secondary text-xs"
          >
            Niet nu
          </button>
        </div>
      </div>
    </div>
  );
}
