"use client";

import { useEffect, useRef, useState } from "react";

// ============================================================
// /diagnose - Push + Voice diagnose-pagina
//
// Toont alle relevante state in real-time + test-knoppen die de
// volledige error trace dumpen in de UI (geen toast). Doel: precies
// zien wat 'r mis is bij Raoul + Gaby zonder console-graverij.
// ============================================================

type DiagnoseStaat = {
  label: string;
  waarde: string;
  ok: boolean | "info";
};

export default function DiagnosePagina() {
  return (
    <div className="space-y-6 pt-6 pb-20">
      <div>
        <p className="text-cm-gold text-xs font-semibold uppercase tracking-wider">
          Diagnose
        </p>
        <h1 className="font-serif-warm text-3xl text-cm-white leading-tight">
          Push + Voice debugging
        </h1>
        <p className="text-cm-white/60 text-sm mt-1 max-w-2xl">
          Alle relevante info over je browser, service worker, push-state en
          microfoon. Druk op de test-knoppen onderaan elke sectie om gericht
          te testen wat 'r mis is.
        </p>
      </div>

      <PushSectie />
      <VoiceSectie />
    </div>
  );
}

// ============================================================
// PUSH-SECTIE
// ============================================================

function PushSectie() {
  const [staten, setStaten] = useState<DiagnoseStaat[]>([]);
  const [bezig, setBezig] = useState(false);
  const [testLog, setTestLog] = useState<string[]>([]);

  useEffect(() => {
    void verzamel();
  }, []);

  function log(regel: string) {
    setTestLog((l) => [...l, regel]);
    console.log("[diagnose-push]", regel);
  }

  async function verzamel() {
    const nieuw: DiagnoseStaat[] = [];

    // Browser support
    nieuw.push({
      label: "Browser ondersteunt service worker",
      waarde: "serviceWorker" in navigator ? "ja" : "NEE",
      ok: "serviceWorker" in navigator,
    });
    nieuw.push({
      label: "Browser ondersteunt PushManager",
      waarde: "PushManager" in window ? "ja" : "NEE",
      ok: "PushManager" in window,
    });
    nieuw.push({
      label: "Browser ondersteunt Notification API",
      waarde: "Notification" in window ? "ja" : "NEE",
      ok: "Notification" in window,
    });

    // Standalone PWA?
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS-property
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    nieuw.push({
      label: "Draait als geïnstalleerde PWA",
      waarde: standalone ? "ja" : "nee (browser-tab)",
      ok: standalone ? true : "info",
    });

    // Permission
    if ("Notification" in window) {
      nieuw.push({
        label: "Notificatie-permission",
        waarde: Notification.permission,
        ok: Notification.permission === "granted",
      });
    }

    // VAPID public key
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    nieuw.push({
      label: "VAPID public key in env aanwezig",
      waarde: vapidKey ? `${vapidKey.substring(0, 20)}...` : "ONTBREEKT",
      ok: !!vapidKey,
    });

    // Service worker registration
    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        nieuw.push({
          label: "Service worker geregistreerd",
          waarde: reg ? "ja, scope: " + reg.scope : "NEE",
          ok: !!reg,
        });
        if (reg) {
          nieuw.push({
            label: "Service worker actief",
            waarde: reg.active
              ? "actief (state: " + reg.active.state + ")"
              : "INACTIEF",
            ok: !!reg.active,
          });
        }
      } catch (e) {
        nieuw.push({
          label: "Service worker check",
          waarde: "FOUT: " + String(e),
          ok: false,
        });
      }
    }

    // Browser-side subscription. iOS Safari (browser-tab) heeft geen
    // pushManager — daar moet ELEVA als PWA op het home screen staan.
    try {
      const reg = await navigator.serviceWorker.ready;
      if (!reg.pushManager) {
        nieuw.push({
          label: "PushManager op service worker",
          waarde: "NIET BESCHIKBAAR (waarschijnlijk iOS Safari browser-tab)",
          ok: false,
        });
        nieuw.push({
          label: "→ Oplossing voor iOS",
          waarde: "Zet ELEVA als PWA op je beginscherm via Safari deel-icoon",
          ok: "info",
        });
      } else {
        const sub = await reg.pushManager.getSubscription();
        nieuw.push({
          label: "Browser heeft push-subscription",
          waarde: sub
            ? `ja, endpoint: ${sub.endpoint.substring(0, 50)}...`
            : "NEE",
          ok: !!sub,
        });
        if (sub) {
          const json = sub.toJSON();
          nieuw.push({
            label: "Browser-endpoint",
            waarde: json.endpoint?.substring(0, 80) + "..." || "?",
            ok: "info",
          });
        }
      }
    } catch (e) {
      nieuw.push({
        label: "Browser-subscription check",
        waarde: "FOUT: " + String(e),
        ok: false,
      });
    }

    // Server-side status
    try {
      const res = await fetch("/api/push/status");
      const data = await res.json();
      nieuw.push({
        label: "Server kent actieve subscription",
        waarde: data.hasActive
          ? `ja, endpoint: ${(data.endpoint || "").substring(0, 50)}...`
          : "NEE",
        ok: !!data.hasActive,
      });
    } catch (e) {
      nieuw.push({
        label: "Server-status check",
        waarde: "FOUT: " + String(e),
        ok: false,
      });
    }

    setStaten(nieuw);
  }

  async function testPush() {
    setBezig(true);
    setTestLog([]);
    log("Start test-push...");
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      log(`Response status: ${res.status}`);
      const data = await res.json().catch(() => ({}));
      log(`Response body: ${JSON.stringify(data, null, 2)}`);
      if (!res.ok || data?.success === false) {
        log(`❌ FAALDE. Reden: ${data?.reason || data?.error || "onbekend"}`);
      } else {
        log("✅ Server zegt: gelukt. Check nu je telefoon voor de melding.");
      }
    } catch (e) {
      log(`❌ FETCH FOUT: ${String(e)}`);
    } finally {
      setBezig(false);
      void verzamel();
    }
  }

  async function forceerSync() {
    setBezig(true);
    setTestLog([]);
    log("Start force-sync van push-subscription...");
    try {
      const reg = await navigator.serviceWorker.ready;
      log("Service worker ready ✓");

      // iOS Safari (browser-tab) heeft geen pushManager. Vroeg detecteren
      // zodat we 'n duidelijke uitleg kunnen geven i.p.v. een TypeError.
      if (!reg.pushManager) {
        log("❌ pushManager NIET beschikbaar op deze service worker.");
        log("   Op iOS werkt push ALLEEN binnen een PWA op het home screen,");
        log("   niet in een gewone Safari-tab. Voeg ELEVA toe aan je begin-");
        log("   scherm via Safari → deel-icoon → 'Zet op beginscherm', en");
        log("   open daarna de app vanaf het home screen.");
        return;
      }

      const oude = await reg.pushManager.getSubscription();
      if (oude) {
        log("Oude subscription gevonden, unsubscribe browser...");
        try {
          await oude.unsubscribe();
          log("Browser-unsubscribe ✓");
        } catch (e) {
          log("Browser-unsubscribe fout: " + String(e));
        }
      }
      log("DELETE server-subscription...");
      try {
        await fetch("/api/push/subscribe", { method: "DELETE" });
        log("Server-DELETE ✓");
      } catch (e) {
        log("Server-DELETE fout: " + String(e));
      }

      log("Permission check...");
      if (Notification.permission !== "granted") {
        log("Permission niet granted, vraag opnieuw...");
        const perm = await Notification.requestPermission();
        log("Permission: " + perm);
        if (perm !== "granted") {
          log("❌ Permission geweigerd, kan niet door");
          return;
        }
      }

      log("Nieuwe subscription maken...");
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        log("❌ VAPID-key ontbreekt in env");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      log("Browser-subscription ✓: " + sub.endpoint.substring(0, 50) + "...");

      const tijdzone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), tijdzone }),
      });
      log(`POST /api/push/subscribe status: ${res.status}`);
      if (!res.ok) {
        const body = await res.text();
        log("❌ Server-fout: " + body);
        return;
      }
      log("✅ Force-sync voltooid. Probeer nu Test-Push.");
    } catch (e) {
      log(`❌ Sync-fout: ${String(e)}`);
      const err = e as { name?: string; message?: string };
      if (err.name) log("Error.name: " + err.name);
      if (err.message) log("Error.message: " + err.message);
    } finally {
      setBezig(false);
      void verzamel();
    }
  }

  return (
    <div className="card border-l-4 border-cm-gold/60 space-y-4">
      <h2 className="text-cm-gold font-semibold text-lg">🔔 Push-diagnose</h2>

      <div className="space-y-1">
        {staten.map((s, i) => (
          <StatusRegel key={i} staat={s} />
        ))}
      </div>

      <div className="border-t border-cm-white/10 pt-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void verzamel()}
            disabled={bezig}
            className="btn-secondary text-xs"
          >
            🔄 Refresh status
          </button>
          <button
            type="button"
            onClick={() => void testPush()}
            disabled={bezig}
            className="btn-gold text-xs disabled:opacity-50"
          >
            🧪 Test-push sturen
          </button>
          <button
            type="button"
            onClick={() => void forceerSync()}
            disabled={bezig}
            className="btn-secondary text-xs"
          >
            🔧 Force resync (clean install)
          </button>
        </div>

        {testLog.length > 0 && (
          <div className="bg-cm-surface-2 rounded p-3 font-mono text-[11px] text-cm-white/80 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
            {testLog.join("\n")}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// VOICE-SECTIE
// ============================================================

function VoiceSectie() {
  const [staten, setStaten] = useState<DiagnoseStaat[]>([]);
  const [opnemen, setOpnemen] = useState(false);
  const [tijd, setTijd] = useState(0);
  const [samplesVerzameld, setSamplesVerzameld] = useState(0);
  const [resultaat, setResultaat] = useState<{
    blobSize: number;
    mimeType: string;
    duurSeconden: number;
    audioUrl: string;
    sampleRate: number;
    eerste40bytes: string;
    isWavRiff: boolean;
  } | null>(null);
  const [testLog, setTestLog] = useState<string[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const samplesRef = useRef<Float32Array[]>([]);
  const startRef = useRef<number>(0);
  const tijdInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    void verzamel();
  }, []);

  function log(regel: string) {
    setTestLog((l) => [...l, regel]);
    console.log("[diagnose-voice]", regel);
  }

  async function verzamel() {
    const nieuw: DiagnoseStaat[] = [];

    nieuw.push({
      label: "navigator.mediaDevices",
      waarde: navigator.mediaDevices ? "beschikbaar" : "NIET beschikbaar",
      ok: !!navigator.mediaDevices,
    });
    const heeftGUM =
      typeof navigator.mediaDevices?.getUserMedia === "function";
    nieuw.push({
      label: "getUserMedia",
      waarde: heeftGUM ? "beschikbaar" : "NIET",
      ok: heeftGUM,
    });

    type CtxCtor = typeof AudioContext;
    const Ctor =
      (window as unknown as { AudioContext?: CtxCtor }).AudioContext ??
      (window as unknown as { webkitAudioContext?: CtxCtor })
        .webkitAudioContext;
    nieuw.push({
      label: "AudioContext beschikbaar",
      waarde: Ctor ? Ctor.name || "ja" : "NIET",
      ok: !!Ctor,
    });

    nieuw.push({
      label: "MediaRecorder",
      waarde: typeof MediaRecorder !== "undefined" ? "beschikbaar" : "NIET",
      ok: typeof MediaRecorder !== "undefined",
    });

    // Permission state (als ondersteund)
    if ("permissions" in navigator) {
      try {
        const p = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        nieuw.push({
          label: "Microfoon-permission",
          waarde: p.state,
          ok: p.state === "granted" ? true : "info",
        });
      } catch {
        // niet alle browsers ondersteunen 'microphone' query
      }
    }

    setStaten(nieuw);
  }

  async function startTest() {
    if (opnemen) return;
    setTestLog([]);
    setResultaat(null);
    setSamplesVerzameld(0);
    log("Start opname-test...");

    try {
      log("getUserMedia opvragen...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      log(`Stream ✓, tracks: ${stream.getAudioTracks().length}`);

      type CtxCtor = typeof AudioContext;
      const Ctor =
        (window as unknown as { AudioContext?: CtxCtor }).AudioContext ??
        (window as unknown as { webkitAudioContext?: CtxCtor })
          .webkitAudioContext;
      if (!Ctor) {
        log("❌ Geen AudioContext beschikbaar");
        return;
      }
      const ctx = new Ctor();
      audioContextRef.current = ctx;
      log(`AudioContext ✓, state: ${ctx.state}, sampleRate: ${ctx.sampleRate}`);

      if (ctx.state === "suspended") {
        log("Resume context...");
        await ctx.resume();
        log(`State na resume: ${ctx.state}`);
      }

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      log("MediaStreamSource ✓");

      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      log("ScriptProcessor ✓ (4096 buffer)");

      samplesRef.current = [];
      let chunkTeller = 0;
      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        const ch = e.inputBuffer.getChannelData(0);
        samplesRef.current.push(new Float32Array(ch));
        chunkTeller++;
        if (chunkTeller % 5 === 0) {
          const totaal = samplesRef.current.reduce(
            (s, a) => s + a.length,
            0,
          );
          setSamplesVerzameld(totaal);
        }
      };

      const silentGain = ctx.createGain();
      silentGain.gain.value = 0;
      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(ctx.destination);
      log("Audio-graph aangesloten met silent gain");

      startRef.current = Date.now();
      setOpnemen(true);
      setTijd(0);

      tijdInterval.current = setInterval(() => {
        setTijd(Math.round((Date.now() - startRef.current) / 1000));
      }, 250);

      log("✅ Opname loopt. Praat nu in je microfoon...");
    } catch (e) {
      log(`❌ Start-fout: ${String(e)}`);
      const err = e as { name?: string; message?: string };
      if (err.name) log("Error.name: " + err.name);
      if (err.message) log("Error.message: " + err.message);
    }
  }

  async function stopTest() {
    if (!opnemen) return;
    if (tijdInterval.current) clearInterval(tijdInterval.current);
    setOpnemen(false);
    log("Stop opname...");

    try {
      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const ctx = audioContextRef.current!;
      const sampleRate = ctx.sampleRate;
      const duurMs = Date.now() - startRef.current;
      const duurSec = Math.round(duurMs / 1000);
      log(`Duur gemeten: ${duurMs}ms (${duurSec}s)`);

      const totaal = samplesRef.current.reduce((s, a) => s + a.length, 0);
      log(`Totaal samples verzameld: ${totaal}`);
      log(`Verwacht bij ${sampleRate}Hz × ${duurSec}s ≈ ${sampleRate * duurSec}`);

      if (totaal === 0) {
        log("❌ GEEN samples verzameld. ScriptProcessor heeft niet gedraaid.");
        return;
      }

      // Concat
      const samples = new Float32Array(totaal);
      let offset = 0;
      for (const chunk of samplesRef.current) {
        samples.set(chunk, offset);
        offset += chunk.length;
      }

      // Maak WAV
      const wavBuffer = encodeWav(samples, sampleRate);
      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      log(`WAV-blob aangemaakt, size: ${blob.size} bytes`);

      // Inspectie
      const arrBuf = await blob.slice(0, 40).arrayBuffer();
      const bytes = new Uint8Array(arrBuf);
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
      const ascii = Array.from(bytes)
        .map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : "."))
        .join("");
      log(`Eerste 40 bytes: ${ascii}`);
      log(`Hex: ${hex}`);
      const isWav =
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x41 &&
        bytes[10] === 0x56 &&
        bytes[11] === 0x45;
      log(`RIFF/WAVE-header valid: ${isWav ? "✓" : "❌"}`);

      const url = URL.createObjectURL(blob);
      setResultaat({
        blobSize: blob.size,
        mimeType: blob.type,
        duurSeconden: duurSec,
        audioUrl: url,
        sampleRate,
        eerste40bytes: ascii,
        isWavRiff: isWav,
      });

      try {
        await ctx.close();
      } catch {
        // negeer
      }
      audioContextRef.current = null;
      log("✅ Klaar. Probeer 'm nu af te spelen onder Resultaat.");
    } catch (e) {
      log(`❌ Stop-fout: ${String(e)}`);
    }
  }

  return (
    <div className="card border-l-4 border-cm-gold/60 space-y-4">
      <h2 className="text-cm-gold font-semibold text-lg">🎤 Voice-diagnose</h2>

      <div className="space-y-1">
        {staten.map((s, i) => (
          <StatusRegel key={i} staat={s} />
        ))}
      </div>

      <div className="border-t border-cm-white/10 pt-3 space-y-2">
        <p className="text-cm-white/70 text-xs">
          Druk op start, praat ~5-10 sec in je microfoon, druk dan op stop. Je
          krijgt direct feedback over wat er is opgenomen.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void verzamel()}
            disabled={opnemen}
            className="btn-secondary text-xs"
          >
            🔄 Refresh
          </button>
          {!opnemen ? (
            <button
              type="button"
              onClick={() => void startTest()}
              className="btn-gold text-xs"
            >
              ⏺ Start opname
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void stopTest()}
              className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs px-3 py-2 rounded-lg"
            >
              ⏹ Stop ({tijd}s · {samplesVerzameld.toLocaleString()} samples)
            </button>
          )}
        </div>

        {opnemen && (
          <div className="text-cm-gold text-xs">
            🎙️ Aan het opnemen... {tijd} sec, {samplesVerzameld.toLocaleString()} samples
          </div>
        )}

        {resultaat && (
          <div className="bg-cm-surface-2 rounded p-3 space-y-2 text-xs">
            <p className="font-semibold text-cm-gold">📊 Resultaat</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] text-cm-white/80">
              <div>Blob-size:</div>
              <div>{resultaat.blobSize.toLocaleString()} bytes</div>
              <div>MIME-type:</div>
              <div>{resultaat.mimeType}</div>
              <div>Duur:</div>
              <div>{resultaat.duurSeconden} sec</div>
              <div>Sample-rate:</div>
              <div>{resultaat.sampleRate} Hz</div>
              <div>RIFF-header:</div>
              <div className={resultaat.isWavRiff ? "text-green-400" : "text-red-400"}>
                {resultaat.isWavRiff ? "✓ valid" : "❌ invalid"}
              </div>
              <div>Eerste 40 bytes:</div>
              <div className="break-all">{resultaat.eerste40bytes}</div>
            </div>
            <div className="border-t border-cm-white/10 pt-2">
              <p className="text-cm-white/70 mb-1">Probeer af te spelen:</p>
              <audio src={resultaat.audioUrl} controls className="w-full" />
            </div>
          </div>
        )}

        {testLog.length > 0 && (
          <div className="bg-cm-surface-2 rounded p-3 font-mono text-[11px] text-cm-white/80 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
            {testLog.join("\n")}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function StatusRegel({ staat }: { staat: DiagnoseStaat }) {
  const kleur =
    staat.ok === true
      ? "text-green-400"
      : staat.ok === false
        ? "text-red-400"
        : "text-cm-white/60";
  const icoon = staat.ok === true ? "✓" : staat.ok === false ? "❌" : "ℹ";
  return (
    <div className="flex items-start gap-2 text-xs leading-relaxed">
      <span className={`shrink-0 ${kleur}`}>{icoon}</span>
      <span className="text-cm-white/70 shrink-0 min-w-[200px]">
        {staat.label}:
      </span>
      <span className={`font-mono ${kleur} break-all`}>{staat.waarde}</span>
    </div>
  );
}

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

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataLength = samples.length * 2;
  const totalLength = dataLength + 44;

  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  schrijfTekst(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  schrijfTekst(view, 8, "WAVE");
  schrijfTekst(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  schrijfTekst(view, 36, "data");
  view.setUint32(40, dataLength, true);

  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    let s = samples[i];
    if (s > 1) s = 1;
    else if (s < -1) s = -1;
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return buffer;
}

function schrijfTekst(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
