// ============================================================
// WAV-recorder, vervangt MediaRecorder voor mini-ELEVA spraakberichten.
//
// Reden: MediaRecorder produceert webm-blobs zonder duration in de
// EBML-header, browsers stoppen daardoor met afspelen na ~4 seconden.
// fix-webm-duration als externe lib werkte niet betrouwbaar genoeg.
//
// In plaats daarvan: tap direct in de microfoon-stream via Web Audio
// API, verzamel raw PCM-samples, en bouw aan het einde een WAV-blob.
// WAV heeft duration ingebakken in de header (RIFF/data-chunk), dus
// elke browser kan 'm correct afspelen tot het einde.
//
// Sample-rate: native (meestal 44.1k of 48k), mono. Voor onze 5MB-
// limit met WAV is dat ~60 sec max. We dekken een max-duur in de
// caller af (MAX_DUUR_MS).
// ============================================================

export class WavRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private silentGain: GainNode | null = null;
  private samples: Float32Array[] = [];
  private startWallTime = 0;
  private opnemen = false;

  /** Start opname. Werpt error als microfoon-toestemming wordt geweigerd. */
  async start(): Promise<void> {
    if (this.opnemen) return;
    this.samples = [];

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    type CtxCtor = typeof AudioContext;
    const Ctor =
      (window as unknown as { AudioContext?: CtxCtor }).AudioContext ??
      (window as unknown as { webkitAudioContext?: CtxCtor })
        .webkitAudioContext;
    if (!Ctor) throw new Error("Geen AudioContext beschikbaar");
    this.audioContext = new Ctor();

    // iOS / autoplay-policy: context begint mogelijk in 'suspended'-staat
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.source = this.audioContext.createMediaStreamSource(this.stream);

    // ScriptProcessorNode is deprecated maar werkt overal; voor PCM
    // tap is dit het simpelste. AudioWorklet vereist een aparte file
    // en complexere setup, niet de moeite waard voor onze use-case.
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e: AudioProcessingEvent) => {
      // Mono kanaal-0 ophalen, kopiëren want input-buffer wordt
      // hergebruikt door browser
      const ch = e.inputBuffer.getChannelData(0);
      this.samples.push(new Float32Array(ch));
    };

    // Connect via silent gain naar destination zodat de processor
    // gaat lopen, maar zonder feedback (microfoon → speaker).
    this.silentGain = this.audioContext.createGain();
    this.silentGain.gain.value = 0;
    this.source.connect(this.processor);
    this.processor.connect(this.silentGain);
    this.silentGain.connect(this.audioContext.destination);

    this.startWallTime = Date.now();
    this.opnemen = true;
  }

  /** Stop opname en geef een WAV-blob + gemeten duur in seconden. */
  async stop(): Promise<{ blob: Blob; duurSeconden: number }> {
    if (!this.opnemen || !this.audioContext) {
      return {
        blob: new Blob([], { type: "audio/wav" }),
        duurSeconden: 0,
      };
    }

    // Disconnect alles
    try {
      this.processor?.disconnect();
      this.silentGain?.disconnect();
      this.source?.disconnect();
    } catch {
      // negeer
    }
    this.stream?.getTracks().forEach((t) => t.stop());

    const sampleRate = this.audioContext.sampleRate;
    const duurSeconden = Math.round((Date.now() - this.startWallTime) / 1000);

    // Concat alle sample-chunks
    const totaalSamples = this.samples.reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
    const samples = new Float32Array(totaalSamples);
    let offset = 0;
    for (const chunk of this.samples) {
      samples.set(chunk, offset);
      offset += chunk.length;
    }

    const blob = encodeWav(samples, sampleRate);

    // Cleanup
    try {
      await this.audioContext.close();
    } catch {
      // negeer
    }
    this.audioContext = null;
    this.source = null;
    this.processor = null;
    this.silentGain = null;
    this.stream = null;
    this.samples = [];
    this.opnemen = false;

    return { blob, duurSeconden };
  }

  /** Annuleer zonder blob te genereren. */
  annuleer(): void {
    if (!this.opnemen) return;
    try {
      this.processor?.disconnect();
      this.silentGain?.disconnect();
      this.source?.disconnect();
    } catch {
      // negeer
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.audioContext?.close();
    this.audioContext = null;
    this.source = null;
    this.processor = null;
    this.silentGain = null;
    this.stream = null;
    this.samples = [];
    this.opnemen = false;
  }
}

/** Encode mono Float32 samples + sample-rate naar een WAV-blob. */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataLength = samples.length * 2; // 16-bit PCM
  const totalLength = dataLength + 44; // 44 = WAV-header grootte

  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  schrijfTekst(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  schrijfTekst(view, 8, "WAVE");

  // fmt sub-chunk
  schrijfTekst(view, 12, "fmt ");
  view.setUint32(16, 16, true); // sub-chunk size voor PCM
  view.setUint16(20, 1, true); // audio format = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  schrijfTekst(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // PCM-samples (Float32 → Int16)
  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    let s = samples[i];
    if (s > 1) s = 1;
    else if (s < -1) s = -1;
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function schrijfTekst(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
