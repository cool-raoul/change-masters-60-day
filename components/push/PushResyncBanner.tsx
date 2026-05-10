"use client";

import { useEffect, useState } from "react";

// ============================================================
// PushResyncBanner
//
// Slimme banner die zichzelf alleen toont als 'r een push-mismatch is
// tussen browser en server (gevolg van VAPID-key wissel of ander
// onderhoud waardoor bestaande subscriptions ineens niet meer werken).
//
// Detectie:
//   - permission moet 'granted' zijn (anders is 't gewoon "nog niet aangezet",
//     niet onze taak om dat hier af te dwingen — dat doet de normale toggle)
//   - browser-sub bestaat ✓ + server-sub bestaat ✗  →  resync nodig
//   - server-sub bestaat ✓ + browser-sub bestaat ✗  →  resync nodig
//   - beide bestaan maar endpoints verschillen      →  resync nodig
//
// Eén knop: "Activeer je meldingen opnieuw". Onder de motorkap dezelfde
// dans als /diagnose's Force resync, maar zonder log-spam.
//
// Bij falen: tweede knop "Stuur Raoul een hulpmail" met pre-ingevulde
// mailto: zodat de gebruiker niet zelf hoeft uit te leggen wat er stuk is.
// ============================================================

type Toestand =
  | "checking"
  | "ok"
  | "needs-resync"
  | "resyncing"
  | "success"
  | "error";

const RAOUL_HULP_EMAIL = "raoulzeewijk@hotmail.com";

export function PushResyncBanner() {
  const [toestand, setToestand] = useState<Toestand>("checking");
  const [foutMelding, setFoutMelding] = useState<string | null>(null);

  useEffect(() => {
    void detecteer();
  }, []);

  // Auto-dismiss "success" na 4 seconden zodat de banner niet blijft hangen
  // als 'r nooit meer een mismatch is. Dan weer naar 'ok' = niets renderen.
  useEffect(() => {
    if (toestand !== "success") return;
    const t = setTimeout(() => setToestand("ok"), 4000);
    return () => clearTimeout(t);
  }, [toestand]);

  async function detecteer() {
    try {
      // Browser-support check. Op heel oude browsers gewoon stil zijn.
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setToestand("ok");
        return;
      }

      // Permission default/denied → "nog niet aangezet". De normale push-
      // toggle in instellingen handelt dat af; banner mengt zich niet.
      if (Notification.permission !== "granted") {
        setToestand("ok");
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      // iOS Safari-tab: geen pushManager. Geen herstel-actie mogelijk vanaf
      // hier. Apart pad voor PWA-installatie loopt elders.
      if (!reg.pushManager) {
        setToestand("ok");
        return;
      }

      const browserSub = await reg.pushManager.getSubscription();
      const statusRes = await fetch("/api/push/status").catch(() => null);
      if (!statusRes || !statusRes.ok) {
        setToestand("ok");
        return;
      }
      const status = (await statusRes.json()) as {
        hasActive: boolean;
        endpoint: string | null;
      };

      const browserHeeft = !!browserSub;
      const serverHeeft = status.hasActive === true;
      const endpointsMismatch =
        browserHeeft &&
        serverHeeft &&
        typeof status.endpoint === "string" &&
        status.endpoint !== browserSub!.endpoint;

      const moetResync =
        (browserHeeft && !serverHeeft) ||
        (!browserHeeft && serverHeeft) ||
        endpointsMismatch;

      setToestand(moetResync ? "needs-resync" : "ok");
    } catch {
      // Bij twijfel: niet tonen. Liever stil dan vals alarm.
      setToestand("ok");
    }
  }

  async function activeerOpnieuw() {
    setToestand("resyncing");
    setFoutMelding(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (!reg.pushManager) {
        setFoutMelding(
          "Op iPhone werkt push alleen als ELEVA op je beginscherm staat. Voeg ELEVA toe via Safari → deel-icoon → 'Zet op beginscherm', open daarna ELEVA via dat icoontje en probeer opnieuw.",
        );
        setToestand("error");
        return;
      }

      // 1) Browser-unsubscribe (silent als 'r geen oude is)
      try {
        const oude = await reg.pushManager.getSubscription();
        if (oude) await oude.unsubscribe();
      } catch {
        // negeer — gaan toch verse subscribe doen
      }

      // 2) Server-DELETE (silent als 'r niks staat)
      try {
        await fetch("/api/push/subscribe", { method: "DELETE" });
      } catch {
        // negeer
      }

      // 3) Permission check (zou granted moeten zijn, maar voor de zekerheid)
      if (Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setFoutMelding(
            "Je hebt toestemming voor meldingen geweigerd. Zet 'm aan via Instellingen → ELEVA → Meldingen, en probeer opnieuw.",
          );
          setToestand("error");
          return;
        }
      }

      // 4) Verse subscribe
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setFoutMelding("Server-config ontbreekt (VAPID-key niet geladen).");
        setToestand("error");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const tijdzone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), tijdzone }),
      });
      if (!res.ok) {
        setFoutMelding("Server kon de nieuwe subscription niet opslaan.");
        setToestand("error");
        return;
      }
      setToestand("success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setFoutMelding(msg || "Onbekende fout bij activeren.");
      setToestand("error");
    }
  }

  function maakHulpMail() {
    const onderwerp = encodeURIComponent("ELEVA: meldingen activeren lukt niet");
    const body = encodeURIComponent(
      [
        "Hoi Raoul,",
        "",
        "ELEVA vraagt me om mijn meldingen opnieuw te activeren, maar dat lukt niet.",
        "",
        foutMelding ? `Foutmelding die ik krijg:\n${foutMelding}` : "",
        "",
        "Kun je me helpen?",
        "",
        "—",
        `Browser: ${typeof navigator !== "undefined" ? navigator.userAgent : "onbekend"}`,
        `Tijd: ${new Date().toLocaleString("nl-NL")}`,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    return `mailto:${RAOUL_HULP_EMAIL}?subject=${onderwerp}&body=${body}`;
  }

  if (toestand === "ok" || toestand === "checking") return null;

  // Render. Zacht-gouden banner, geen rode alarmkleur — 't is een vriendelijk
  // verzoek, niet een fout van de gebruiker.
  return (
    <div className="rounded-xl border border-cm-gold/40 bg-cm-gold/5 p-4 mb-4">
      {toestand === "needs-resync" && (
        <>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🔔</span>
            <div className="flex-1">
              <h3 className="text-cm-gold font-semibold text-sm mb-1">
                ELEVA-meldingen even opnieuw aanzetten
              </h3>
              <p className="text-cm-white/80 text-sm">
                We hebben push-meldingen verbeterd. Eén klik op de knop
                hieronder en je ontvangt voortaan alle ELEVA-meldingen weer.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void activeerOpnieuw()}
              className="btn-gold text-sm"
            >
              ✓ Activeer meldingen opnieuw
            </button>
          </div>
        </>
      )}

      {toestand === "resyncing" && (
        <div className="flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">⏳</span>
          <p className="text-cm-white/80 text-sm">
            Even bezig met activeren — duurt 2 seconden...
          </p>
        </div>
      )}

      {toestand === "success" && (
        <div className="flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">✅</span>
          <p className="text-cm-white text-sm">
            Gelukt! Je ELEVA-meldingen zijn weer actief.
          </p>
        </div>
      )}

      {toestand === "error" && (
        <>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">😕</span>
            <div className="flex-1">
              <h3 className="text-cm-white font-semibold text-sm mb-1">
                Activeren lukte niet
              </h3>
              {foutMelding && (
                <p className="text-cm-white/80 text-sm mb-2">{foutMelding}</p>
              )}
              <p className="text-cm-white/60 text-xs">
                Geen zorg — Raoul helpt je verder. Klik op de knop hieronder, dan
                opent je mail-app met een kant-en-klare hulpvraag.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void activeerOpnieuw()}
              className="btn-secondary text-sm"
            >
              🔄 Probeer opnieuw
            </button>
            <a href={maakHulpMail()} className="btn-gold text-sm">
              ✉️ Stuur Raoul een hulpmail
            </a>
          </div>
        </>
      )}
    </div>
  );
}

// Standaard helper om een base64-VAPID-key naar Uint8Array te zetten.
// Identiek aan de versie in /diagnose; bewust gedupliceerd zodat dit
// component zonder andere imports zelfstandig werkt.
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
