"use client";

import { useEffect } from "react";

// ============================================================
// PresenceHeartbeat, client-side ping naar /api/presence/ping.
//
// Roept elke 60s een POST aan zodat profiles.last_seen_at vers blijft.
// Server schrijft alleen als de member z'n presence-toggle aan heeft
// gezet (anders no-op).
//
// Gemount in AppShell, dus actief op alle ingelogde pagina's.
// Stopt automatisch bij unmount (route-change blijft binnen AppShell
// dus de timer blijft lopen, alleen bij logout/navigation-away verdwijnt 'ie).
// ============================================================

const HEARTBEAT_MS = 60_000;

export function PresenceHeartbeat() {
  useEffect(() => {
    let cancelled = false;

    async function ping() {
      if (cancelled) return;
      try {
        await fetch("/api/presence/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // keepalive zorgt dat de fetch ook bij tab-close nog probeert
          // te verzenden, fijn voor laatste-actief-tracking.
          keepalive: true,
        });
      } catch {
        // Stil falen: heartbeat hoort nooit de gebruiker te storen.
      }
    }

    // Eerste ping direct, daarna elke minuut.
    void ping();
    const interval = setInterval(ping, HEARTBEAT_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return null;
}
