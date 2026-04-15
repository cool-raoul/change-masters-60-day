"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Registreer service worker voor push notifications
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("✓ Service Worker geregistreerd:", registration.scope);
        })
        .catch((error) => {
          console.log("Service Worker registratie mislukt:", error);
        });
    }
  }, []);

  return null;
}
