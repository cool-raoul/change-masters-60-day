"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ServiceWorkerRegister() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Registreer service worker voor push notifications
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("✓ Service Worker geregistreerd:", registration.scope);
      })
      .catch((error) => {
        console.log("Service Worker registratie mislukt:", error);
      });

    // Luister naar postMessage van de service worker. Wanneer er een push
    // binnenkomt terwijl de app open is, krijgt de OS-notificatie minder
    // aandacht (op desktop staat-ie soms in een hoekje, op iOS verschijnt
    // hij niet eens). Met deze toast krijgt de gebruiker IN de app meteen
    // een klikbaar prompt — tap → router.push naar de doel-URL.
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || data.type !== "push-melding") return;

      toast(data.title ?? "Melding", {
        description: data.body,
        duration: 8000,
        action: data.url
          ? {
              label: "Open",
              onClick: () => router.push(data.url),
            }
          : undefined,
      });
    }

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [router]);

  return null;
}
